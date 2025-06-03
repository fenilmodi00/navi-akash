import { createOpenAI } from '@ai-sdk/openai';
import type {
  ModelTypeName,
  ObjectGenerationParams,
  Plugin,
  TextEmbeddingParams,
} from '@elizaos/core';
import {
  type DetokenizeTextParams,
  type GenerateTextParams,
  ModelType,
  type TokenizeTextParams,
  logger,
  VECTOR_DIMS,
} from '@elizaos/core';
import { generateObject, generateText } from 'ai';
import { type TiktokenModel, encodingForModel } from 'js-tiktoken';
import { PerformanceCache } from './lib/performance-cache';
import { performanceMonitor } from './lib/performance-monitor';

/**
 * Runtime interface for the AkashChat plugin
 */
interface Runtime {
  getSetting(key: string): string | undefined;
  character: {
    system?: string;
  };
  fetch?: typeof fetch;
  hasModelHandler?: (modelType: ModelTypeName) => boolean;
}

// Cache for API clients to avoid recreating them
const clientCache = new Map<string, ReturnType<typeof createOpenAI>>();

// Cache for tokenizers to avoid recreating them
const tokenizerCache = new Map<string, any>();

// Performance caches with different TTLs
const embeddingCache = new PerformanceCache<number[]>(500, 4 * 60 * 60 * 1000); // 4 hours
const textCache = new PerformanceCache<string>(200, 1 * 60 * 60 * 1000); // 1 hour

/**
 * Helper function to get settings with fallback to process.env
 */
function getSetting(runtime: any, key: string, defaultValue?: string): string | undefined {
  return runtime.getSetting(key) ?? process.env[key] ?? defaultValue;
}

/**
 * Helper function to get the base URL for AkashChat API
 */
function getBaseURL(): string {
  return 'https://chatapi.akash.network/api/v1';
}

/**
 * Helper function to get the API key for AkashChat
 */
function getApiKey(runtime: any): string | undefined {
  return getSetting(runtime, 'AKASH_CHAT_API_KEY');
}

/**
 * Gets the API URL to use, with Cloudflare Gateway support if enabled
 */
function getApiURL(runtime: Runtime): string {
  try {
    const isCloudflareEnabled = runtime.getSetting('CLOUDFLARE_GW_ENABLED') === 'true';
    if (!isCloudflareEnabled) {
      return getBaseURL();
    }

    const cloudflareAccountId = runtime.getSetting('CLOUDFLARE_AI_ACCOUNT_ID');
    const cloudflareGatewayId = runtime.getSetting('CLOUDFLARE_AI_GATEWAY_ID');
    
    if (!cloudflareAccountId || !cloudflareGatewayId) {
      return getBaseURL();
    }
    
    return `https://gateway.ai.cloudflare.com/v1/${cloudflareAccountId}/${cloudflareGatewayId}/akashchat`;
  } catch (error) {
    return getBaseURL();
  }
}

/**
 * Check if a model type is supported in the current ElizaOS version
 */
function isModelTypeSupported(runtime: any, modelType: ModelTypeName): boolean {
  try {
    // Try to access the model handler registry to see if this type is registered
    return runtime.hasModelHandler?.(modelType as any) ?? 
           // Fallback check for older versions
           Object.values(ModelType).includes(modelType as any);
  } catch (error) {
    // If there's an error, assume it's not supported
    return false;
  }
}

/**
 * Get or create an API client for Akash Chat
 */
function getAkashChatClient(runtime: Runtime): ReturnType<typeof createOpenAI> {
  const baseURL = getApiURL(runtime);
  const apiKey = getApiKey(runtime);
  
  // Create a cache key based on the API URL and key
  const cacheKey = `${baseURL}:${apiKey}`;
  
  // Return cached client if available
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }
  
  // Create new client
  const client = createOpenAI({
    apiKey: apiKey!,
    fetch: runtime.fetch,
    baseURL,
  });
  
  // Cache the client
  clientCache.set(cacheKey, client);
  return client;
}

/**
 * Optimized model selection for ElizaOS model types
 */
function getModelName(runtime: Runtime, modelType: ModelTypeName): string {
  // Cache model mappings for performance
  const modelMappings = {
    [ModelType.TEXT_SMALL]: getSetting(runtime, 'AKASH_CHAT_SMALL_MODEL') || 'Meta-Llama-3-1-8B-Instruct-FP8',
    [ModelType.TEXT_LARGE]: getSetting(runtime, 'AKASH_CHAT_LARGE_MODEL') || 'Meta-Llama-3-3-70B-Instruct'
  };
  
  return modelMappings[modelType as keyof typeof modelMappings] || modelMappings[ModelType.TEXT_LARGE];
}

/**
 * Get a tokenizer for the specified model, with caching
 */
function getTokenizer(modelName: string) {
  if (tokenizerCache.has(modelName)) {
    return tokenizerCache.get(modelName);
  }
  
  const encoding = encodingForModel(modelName as TiktokenModel);
  tokenizerCache.set(modelName, encoding);
  return encoding;
}

/**
 * Tokenizes text using the specified model
 */
async function tokenizeText(runtime: Runtime, model: ModelTypeName, prompt: string) {
  try {
    const modelName = getModelName(runtime, model);
    const encoding = getTokenizer(modelName);
    return encoding.encode(prompt);
  } catch (error) {
    logger.error('Error in tokenizeText:', error);
    return [];
  }
}

/**
 * Detokenize a sequence of tokens back into text using the specified model
 */
async function detokenizeText(runtime: Runtime, model: ModelTypeName, tokens: number[]) {
  try {
    const modelName = getModelName(runtime, model);
    const encoding = getTokenizer(modelName);
    return encoding.decode(tokens);
  } catch (error) {
    logger.error('Error in detokenizeText:', error);
    return '';
  }
}

/**
 * Optimized rate limit handling with intelligent backoff
 */
async function handleRateLimitError(error: Error, retryFn: () => Promise<unknown>, retryCount = 0) {
  if (!error.message.includes('Rate limit')) throw error;
  
  // Maximum 2 retries for efficiency
  if (retryCount >= 2) {
    logger.error('Max retries reached for rate limit');
    throw new Error('Service temporarily unavailable due to rate limits');
  }
  
  // Smart delay calculation
  const delayMatch = error.message.match(/try again in (\d+\.?\d*)s/i);
  const retryDelay = delayMatch?.[1] 
    ? Math.ceil(Number.parseFloat(delayMatch[1]) * 1000) + 200  // API suggested delay + buffer
    : Math.min(5000 * Math.pow(2, retryCount), 30000);         // Exponential: 5s, 10s, 30s max
  
  logger.info(`Rate limit hit. Retrying in ${retryDelay}ms (attempt ${retryCount + 1}/2)`);
  await new Promise(resolve => setTimeout(resolve, retryDelay));
  
  try {
    return await retryFn();
  } catch (retryError: any) {
    return handleRateLimitError(retryError, retryFn, retryCount + 1);
  }
}

/**
 * Optimized text generation with streamlined error handling and caching
 */
async function generateAkashChatText(
  akashchat: ReturnType<typeof createOpenAI>,
  model: string,
  params: {
    prompt: string;
    system?: string;
    temperature: number;
    maxTokens: number;
    frequencyPenalty: number;
    presencePenalty: number;
    stopSequences: string[];
  }
) {
  const startTime = Date.now();
  
  // Generate cache key from parameters
  const cacheKey = `text:${model}:${JSON.stringify(params)}`;
  
  // Check cache first for deterministic requests (low temperature)
  if (params.temperature < 0.3) {
    const cachedResult = textCache.get(cacheKey);
    if (cachedResult) {
      logger.info('Cache hit for text generation');
      performanceMonitor.recordCacheHit();
      return cachedResult;
    }
  }

  try {
    const { text } = await generateText({
      model: akashchat.languageModel(model),
      prompt: params.prompt,
      system: params.system,
      temperature: Math.min(params.temperature, 1.0), // Ensure valid range
      maxTokens: Math.min(params.maxTokens, 8192),    // Optimize token usage
      frequencyPenalty: params.frequencyPenalty,
      presencePenalty: params.presencePenalty,
      stopSequences: params.stopSequences.slice(0, 4), // Limit stop sequences
    });
    
    // Cache result if temperature is low (deterministic)
    if (params.temperature < 0.3) {
      textCache.set(cacheKey, text);
      logger.info('Cached text generation result');
    }
    
    // Record performance metrics
    const latency = Date.now() - startTime;
    performanceMonitor.recordRequest(latency, false);
    
    return text;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return handleRateLimitError(error, () => 
        generateAkashChatText(akashchat, model, params)
      ) as Promise<string>;
    }
    
    logger.error('Text generation failed:', error);
    return 'I encountered an error generating a response. Please try asking again.';
  }
}

/**
 * Generate object using AkashChat API with optimized handling
 */
async function generateAkashChatObject(
  akashchat: ReturnType<typeof createOpenAI>,
  model: string,
  params: ObjectGenerationParams
) {
  try {
    const { object } = await generateObject({
      model: akashchat.languageModel(model),
      output: params.schema as any || 'no-schema',
      prompt: params.prompt,
      temperature: params.temperature,
    });
    return object;
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Rate limit')) {
      return handleRateLimitError(error, () => 
        generateAkashChatObject(akashchat, model, params)
      );
    }
    
    logger.error('Error generating object:', error);
    return {};
  }
}

export const akashchatPlugin: Plugin = {
  name: 'akashchat',
  description: 'AkashChat API plugin for language model capabilities via Akash Network',
  
  config: {
    AKASH_CHAT_API_KEY: process.env.AKASH_CHAT_API_KEY,
    AKASH_CHAT_SMALL_MODEL: process.env.AKASH_CHAT_SMALL_MODEL || 'Meta-Llama-3-1-8B-Instruct-FP8',
    AKASH_CHAT_LARGE_MODEL: process.env.AKASH_CHAT_LARGE_MODEL || 'Meta-Llama-3-3-70B-Instruct',
    AKASHCHAT_EMBEDDING_MODEL: process.env.AKASHCHAT_EMBEDDING_MODEL || 'BAAI-bge-large-en-v1-5',
    AKASHCHAT_EMBEDDING_DIMENSIONS: process.env.AKASHCHAT_EMBEDDING_DIMENSIONS || '1024',
  },
  
  async init(config: Record<string, string>, runtime: any) {
    const apiKey = getApiKey(runtime);
    if (!apiKey) {
      throw Error('Missing AKASH_CHAT_API_KEY in environment variables or settings');
    }
    
    // Pre-warm the client cache
    getAkashChatClient(runtime);
    
    // Validate API key
    try {
      const baseURL = getBaseURL();
      const response = await fetch(`${baseURL}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      
      if (!response.ok) {
        logger.warn(`API key validation failed: ${response.status} ${response.statusText}`);
      } else {
        const data = await response.json();
        logger.info(`✅ Akash Chat API connected successfully. Models available: ${(data as any)?.data?.length || 0}`);
      }
    } catch (error) {
      logger.warn('Could not validate Akash Chat API key:', error);
    }
  },
  
  models: {
    [ModelType.TEXT_EMBEDDING]: async (
      runtime,
      params: TextEmbeddingParams | string | null
    ): Promise<number[]> => {
      const embeddingDimension = parseInt(
        getSetting(runtime, 'AKASHCHAT_EMBEDDING_DIMENSIONS', '1024')
      ) as (typeof VECTOR_DIMS)[keyof typeof VECTOR_DIMS];
      
      // Optimized embedding dimension validation
      const validDimensions = Object.values(VECTOR_DIMS);
      if (!validDimensions.includes(embeddingDimension)) {
        logger.error(`Invalid embedding dimension: ${embeddingDimension}. Valid: ${validDimensions.join(', ')}`);
        throw new Error(`Invalid embedding dimension: ${embeddingDimension}`);
      }
      
      // Fast path for initialization
      if (params === null) {
        return Array(embeddingDimension).fill(0).map((_, i) => i === 0 ? 0.1 : 0);
      }
      
      // Efficient text extraction
      const text = typeof params === 'string' ? params : params?.text || '';
      
      // Quick return for empty text
      if (!text.trim()) {
        return Array(embeddingDimension).fill(0).map((_, i) => i === 0 ? 0.2 : 0);
      }
      
      // Check cache first
      const cacheKey = `embedding:${text}:${embeddingDimension}`;
      const cachedEmbedding = embeddingCache.get(cacheKey);
      if (cachedEmbedding) {
        logger.info('Cache hit for embedding generation');
        performanceMonitor.recordCacheHit();
        return cachedEmbedding;
      }
      
      const startTime = Date.now();
      
      try {
        const baseURL = getBaseURL();
        const response = await fetch(`${baseURL}/embeddings`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getApiKey(runtime)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: getSetting(runtime, 'AKASHCHAT_EMBEDDING_MODEL', 'BAAI-bge-large-en-v1-5'),
            input: text,
          }),
        });
        
        if (!response.ok) {
          const errorVector = Array(embeddingDimension).fill(0);
          errorVector[0] = 0.4;
          return errorVector;
        }
        
        const data = (await response.json()) as { data: [{ embedding: number[] }] };
        
        if (!data?.data?.[0]?.embedding) {
          const errorVector = Array(embeddingDimension).fill(0);
          errorVector[0] = 0.5;
          return errorVector;
        }
        
        const embedding = data.data[0].embedding;
        
        // Cache the successful result
        embeddingCache.set(cacheKey, embedding);
        logger.info('Cached embedding result');
        
        // Record performance metrics
        const latency = Date.now() - startTime;
        performanceMonitor.recordRequest(latency, false);
        
        return embedding;
      } catch (error) {
        logger.error('Error generating embedding:', error);
        const errorVector = Array(embeddingDimension).fill(0);
        errorVector[0] = 0.6;
        return errorVector;
      }
    },
    
    [ModelType.TEXT_TOKENIZER_ENCODE]: async (
      runtime,
      { prompt, modelType = ModelType.TEXT_LARGE }: TokenizeTextParams
    ) => {
      return tokenizeText(runtime, modelType ?? ModelType.TEXT_LARGE, prompt);
    },
    
    [ModelType.TEXT_TOKENIZER_DECODE]: async (
      runtime,
      { tokens, modelType = ModelType.TEXT_LARGE }: DetokenizeTextParams
    ) => {
      return detokenizeText(runtime, modelType ?? ModelType.TEXT_LARGE, tokens);
    },
    
    [ModelType.TEXT_SMALL]: async (runtime, { 
      prompt, 
      stopSequences = [],
      maxTokens = 8192,
      temperature =  0.7,
      frequencyPenalty = 0.7,
      presencePenalty = 0.7,
    }: GenerateTextParams) => {
      const akashchat = getAkashChatClient(runtime);
      const model = getModelName(runtime, ModelType.TEXT_SMALL);
      
      return generateAkashChatText(akashchat, model, {
        prompt,
        system: runtime.character.system,
        temperature,
        maxTokens,
        frequencyPenalty,
        presencePenalty,
        stopSequences,
      });
    },
    
    [ModelType.TEXT_LARGE]: async (
      runtime,
      {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7,
      }: GenerateTextParams
    ) => {
      const akashchat = getAkashChatClient(runtime);
      const model = getModelName(runtime, ModelType.TEXT_LARGE);
      
      return generateAkashChatText(akashchat, model, {
        prompt,
        system: runtime.character.system,
        temperature,
        maxTokens,
        frequencyPenalty,
        presencePenalty,
        stopSequences,
      });
    },
    
    [ModelType.OBJECT_SMALL]: async (runtime, params: ObjectGenerationParams) => {
      const akashchat = getAkashChatClient(runtime);
      const model = getModelName(runtime, ModelType.TEXT_SMALL);
      
      return generateAkashChatObject(akashchat, model, params);
    },
    
    [ModelType.OBJECT_LARGE]: async (runtime, params: ObjectGenerationParams) => {
      const akashchat = getAkashChatClient(runtime);
      const model = getModelName(runtime, ModelType.TEXT_LARGE);
      
      return generateAkashChatObject(akashchat, model, params);
    },
  },
  
  tests: [
    {
      name: 'akashchat_plugin_tests',
      tests: [
        {
          name: 'akashchat_test_url_and_api_key_validation',
          fn: async (runtime) => {
            try {
              const baseURL = getBaseURL();
              const response = await fetch(`${baseURL}/models`, {
                headers: {
                  Authorization: `Bearer ${runtime.getSetting('AKASH_CHAT_API_KEY')}`,
                },
              });
              
              if (!response.ok) {
                logger.error(`Failed to validate Akash Chat API key: ${response.statusText}`);
                return;
              }
              
              const data = await response.json();
              logger.log('Models Available:', (data as { data: unknown[] })?.data?.length);
            } catch (error) {
              logger.error('Error in akashchat_test_url_and_api_key_validation:', error);
            }
          },
        },
        {
          name: 'akashchat_test_text_embedding',
          fn: async (runtime) => {
            try {
              const embedding = await runtime.useModel(ModelType.TEXT_EMBEDDING, {
                text: 'Hello, world!',
              });
              logger.log('Embedding generated with length:', embedding.length);
            } catch (error) {
              logger.error('Error in test_text_embedding:', error);
            }
          },
        },
        {
          name: 'akashchat_test_text_large',
          fn: async (runtime) => {
            try {
              const text = await runtime.useModel(ModelType.TEXT_LARGE, {
                prompt: 'What is the nature of reality in 10 words?',
              });
              logger.log('Generated with test_text_large:', text);
            } catch (error) {
              logger.error('Error in test_text_large:', error);
            }
          },
        },
        {
          name: 'akashchat_test_text_small',
          fn: async (runtime) => {
            try {
              const text = await runtime.useModel(ModelType.TEXT_SMALL, {
                prompt: 'What is the nature of reality in 10 words?',
              });
              logger.log('Generated with test_text_small:', text);
            } catch (error) {
              logger.error('Error in test_text_small:', error);
            }
          },
        },
      ],
    },
  ],
};

export default akashchatPlugin;
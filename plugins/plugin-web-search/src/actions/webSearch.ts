import {
    type Action,
    type HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
    elizaLogger
} from "@elizaos/core";
import { encodingForModel, type TiktokenModel } from "js-tiktoken";
import { WebSearchService } from "../services/webSearchService";
import type { SearchResult } from "../types";

const DEFAULT_MAX_WEB_SEARCH_TOKENS = 4000;
const DEFAULT_MODEL_ENCODING = "gpt-4-turbo";

function getTotalTokensFromString(
    str: string,
    encodingName: TiktokenModel = DEFAULT_MODEL_ENCODING
) {
    const encoding = encodingForModel(encodingName);
    return encoding.encode(str).length;
}

function MaxTokens(
    data: string,
    maxTokens: number = DEFAULT_MAX_WEB_SEARCH_TOKENS
): string {
    if (getTotalTokensFromString(data) >= maxTokens) {
        return data.slice(0, maxTokens);
    }
    return data;
}

// Check if a URL is from Twitter/X
const isTwitterSource = (url: string): boolean => {
    return url.includes('twitter.com') || url.includes('x.com');
};

// Check if a URL is from a special topic (curated content)
const isSpecialTopicURL = (url: string): boolean => {
    // These URLs correspond to the curated links in AKASH_SPECIAL_TOPICS
    const specialURLs = [
        // Accelerate
        'akash.network/accelerate/',
        'akash.network/blog/akash-accelerate',
        'github.com/akash-network/community/tree/main/sig-events/akash-accelerate',
        
        // Supercloud
        'akash.network/docs/deployments/akash-console/',
        'akash.network/blog/ai-supercloud/',
        
        // GPU
        'akash.network/docs/deployments/akash-console/gpu-deployment/',
        'akash.network/docs/providers/gpu-providers/',
        'akash.network/marketplace/',
        
        // Pricing
        'akash.network/pricing/',
        'akash.network/about/cloud-cost-calculator/',
        
        // Provider
        'akash.network/docs/providers/',
        'akash.network/docs/providers/build-a-cloud-provider/',
        'akash.network/docs/providers/provider-rewards/',
        
        // Mainnet
        'akash.network/docs/mainnet/',
        'github.com/akash-network/node/releases',
        
        // Validator
        'akash.network/docs/validators/',
        'akash.network/docs/validators/validator-deployment-guide/'
    ];
    return specialURLs.some(specialURL => url.includes(specialURL));
};

// Optimized helper function to format search results efficiently
function formatSearchResults(results: SearchResult[]): string {
    if (!results?.length) return "No relevant information found.";
    
    // Pre-categorize results for efficient processing
    const categories = {
        official: results.filter(r => isSpecialTopicURL(r.url)),
        social: results.filter(r => isTwitterSource(r.url) && !isSpecialTopicURL(r.url)),
        other: results.filter(r => !isTwitterSource(r.url) && !isSpecialTopicURL(r.url))
    };
    
    let output = '';
    
    // Official docs first (highest priority)
    if (categories.official.length) {
        output += "### 📋 Official Documentation\n\n";
        categories.official.forEach(result => {
            output += `**[${result.title}](${result.url})**\n${result.content.substring(0, 150)}...\n\n`;
        });
    }
    
    // Recent updates from social media
    if (categories.social.length) {
        output += "### 🐦 Latest Updates\n\n";
        categories.social.forEach(result => {
            const username = result.url.match(/(?:twitter\.com|x\.com)\/([^\/]+)/)?.[1] || 'akashnet_';
            // Clean up tweet content
            let content = result.content
                .replace(/http[s]?:\/\/t\.co\/\w+/g, '') // Remove t.co links
                .replace(/(\d+) replies (\d+) reposts (\d+) likes/gi, '') // Remove metrics
                .trim();
            
            if (content.length > 200) {
                content = content.substring(0, 200).trim() + '...';
            }
            
            output += `**[@${username}](${result.url})**\n${content}\n\n`;
        });
    }
    
    // Other relevant results
    if (categories.other.length) {
        output += "### 🔍 Additional Resources\n\n";
        categories.other.slice(0, 3).forEach((result, index) => {
            const domain = new URL(result.url).hostname;
            const content = result.content.substring(0, 150).trim() + '...';
            output += `**${index + 1}. [${result.title}](${result.url})** (${domain})\n${content}\n\n`;
        });
    }
    
    return MaxTokens(output, DEFAULT_MAX_WEB_SEARCH_TOKENS);
}

// Optimized trigger condition for web search
const shouldTriggerWebSearch = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    
    // Fast path: common trigger phrases
    const triggerPhrases = [
        'search for', 'find', 'look up', 'what is', 'tell me about',
        'latest', 'recent', 'current', 'new', 'update', 'news',
        'how to', 'guide', 'tutorial', 'documentation'
    ];
    
    const hasTriggerPhrase = triggerPhrases.some(phrase => lowerText.includes(phrase));
    
    // Enhanced Akash-specific triggers
    const akashTerms = [
        'akash network', 'akash', 'akt token', 'provider', 'deployment',
        'supercloud', 'gpu', 'pricing', 'validator', 'mainnet'
    ];
    
    const hasAkashTerm = akashTerms.some(term => lowerText.includes(term));
    
    // Trigger if has trigger phrase OR (has Akash term AND question-like)
    const isQuestion = lowerText.includes('?') || lowerText.startsWith('what') || 
                      lowerText.startsWith('how') || lowerText.startsWith('when') ||
                      lowerText.startsWith('where') || lowerText.startsWith('why');
    
    return hasTriggerPhrase || (hasAkashTerm && isQuestion);
};

export const webSearch: Action = {
    name: "WEB_SEARCH",
    similes: [
        "SEARCH_WEB",
        "INTERNET_SEARCH",
        "LOOKUP",
        "QUERY_WEB",
        "FIND_ONLINE",
        "SEARCH_ENGINE",
        "WEB_LOOKUP",
        "ONLINE_SEARCH",
        "FIND_INFORMATION",
    ],
    suppressInitialMessage: true,
    description:
        "Perform a web search to find information related to the message.",
    // eslint-disable-next-line
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        const tavilyApiKeyOk = !!runtime.getSetting("TAVILY_API_KEY");
        const shouldTrigger = shouldTriggerWebSearch(message.content.text);
        
        return tavilyApiKeyOk && shouldTrigger;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options: any,
        callback: HandlerCallback
    ) => {
        elizaLogger.log("Composing state for message:", message);
        state = (await runtime.composeState(message)) as State;
        const userId = runtime.agentId;
        elizaLogger.log("User ID:", userId);

        const webSearchPrompt = message.content.text;
        elizaLogger.log("web search prompt received:", webSearchPrompt);

        const webSearchService = new WebSearchService();
        await webSearchService.initialize(runtime);
        
        try {
            const searchResponse = await webSearchService.search(
                webSearchPrompt,
            );
            
            if (searchResponse && searchResponse.results.length) {
                // Check if we have an answer from the API
                const answer = searchResponse.answer 
                    ? `${searchResponse.answer}\n\n` 
                    : "Here's what I found about your query:\n\n";
                
                // Format the results in a readable way
                const formattedResults = formatSearchResults(searchResponse.results);
                
                // Check if we have Twitter results
                const hasTwitterResults = searchResponse.results.some(result => 
                    isTwitterSource(result.url)
                );
                
                // Combine the answer and results
                let disclaimer = "This information is based on web search results and may need verification from official Akash sources.";
                if (hasTwitterResults) {
                    disclaimer += " Tweet content is from the official Akash Network Twitter account.";
                }
                
                const responseText = `${answer}${formattedResults}\n\n${disclaimer}`;
                
                callback({
                    text: MaxTokens(responseText, DEFAULT_MAX_WEB_SEARCH_TOKENS),
                });
            } else {
                elizaLogger.error("search failed or returned no data.");
                callback({
                    text: "I couldn't find any relevant information about your query. Please try rephrasing your question or ask about a different topic related to Akash Network."
                });
            }
        } catch (error) {
            elizaLogger.error("Error during web search:", error);
            callback({
                text: "I encountered an error while searching for information. Please try again later or rephrase your question."
            });
        }
    },
    examples: [
        [
            {
                name: '{{name1}}',
                content: {
                    text: "Find the latest news about SpaceX launches.",
                },
            },
            {
                name: '{{name2}}',
                content: {
                    text: "Here is the latest news about SpaceX launches:",
                    actions: ["WEB_SEARCH"],
                },
            },
        ],
        [
            {
                name: '{{name1}}',
                content: {
                    text: "Can you find details about the iPhone 16 release?",
                },
            },
            {
                name: '{{name2}}',
                content: {
                    text: "Here are the details I found about the iPhone 16 release:",
                    actions: ["WEB_SEARCH"],
                },
            },
        ],
        [
            {
                name: '{{name1}}',
                content: {
                    text: "What is the schedule for the next FIFA World Cup?",
                },
            },
            {
                name: '{{name2}}',
                content: {
                    text: "Here is the schedule for the next FIFA World Cup:",
                    actions: ["WEB_SEARCH"],
                },
            },
        ],
        [
            {
                name: '{{name1}}',
                content: { text: "Check the latest stock price of Tesla." },
            },
            {
                name: '{{name2}}',
                content: {
                    text: "Here is the latest stock price of Tesla I found:",
                    actions: ["WEB_SEARCH"],
                },
            },
        ],
        [
            {
                name: '{{name1}}',
                content: {
                    text: "What are the current trending movies in the US?",
                },
            },
            {
                name: '{{name2}}',
                content: {
                    text: "Here are the current trending movies in the US:",
                    actions: ["WEB_SEARCH"],
                },
            },
        ],
        [
            {
                name: '{{name1}}',
                content: {
                    text: "What is the latest score in the NBA finals?",
                },
            },
            {
                name: '{{name2}}',
                content: {
                    text: "Here is the latest score from the NBA finals:",
                    actions: ["WEB_SEARCH"],
                },
            },
        ],
        [
            {
                name: '{{name1}}',
                content: { text: "When is the next Apple keynote event?" },
            },
            {
                name: '{{name2}}',
                content: {
                    text: "Here is the information about the next Apple keynote event:",
                    actions: ["WEB_SEARCH"],
                },
            },
        ],
        [
            {
                name: '{{name1}}',
                content: { text: "What are the latest updates about Akash Network?" },
            },
            {
                name: '{{name2}}',
                content: {
                    text: "Let me search for the latest Akash Network updates for you:",
                    actions: ["WEB_SEARCH"],
                },
            },
        ],
        [
            {
                name: '{{name1}}',
                content: { text: "What is Akash Network tweeting about lately?" },
            },
            {
                name: '{{name2}}',
                content: {
                    text: "Let me check the recent tweets from Akash Network:",
                    actions: ["WEB_SEARCH"],
                },
            },
        ],
    ],
} as Action;
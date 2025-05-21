import type { IAgentRuntime, Memory, Provider } from '@elizaos/core';
import { addHeader, logger } from '@elizaos/core';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    logger.warn(`Retrying after error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}

/**
 * Represents a knowledge provider that retrieves knowledge from the knowledge base.
 * @type {Provider}
 * @property {string} name - The name of the knowledge provider.
 * @property {string} description - The description of the knowledge provider.
 * @property {boolean} dynamic - Indicates if the knowledge provider is dynamic or static.
 * @property {Function} get - Asynchronously retrieves knowledge from the knowledge base.
 * @param {IAgentRuntime} runtime - The agent runtime object.
 * @param {Memory} message - The message containing the query for knowledge retrieval.
 * @returns {Object} An object containing the retrieved knowledge data, values, and text.
 */
export const knowledgeProvider: Provider = {
  name: 'KNOWLEDGE',
  description:
    'Knowledge from the knowledge base that the agent knows, retrieved whenever the agent needs to answer a question about their expertise.',
  get: async (runtime: IAgentRuntime, message: Memory) => {
    console.log('*** RETRIEVING KNOWLEDGE ***');
    
    const knowledgeData = await retryWithBackoff(async () => {
      try {
        return await runtime.getKnowledge(message);
      } catch (error) {
        logger.error('Error retrieving knowledge:', error);
        throw error;
      }
    });

    const firstFiveKnowledgeItems = knowledgeData?.slice(0, 5);

    let knowledge =
      (firstFiveKnowledgeItems && firstFiveKnowledgeItems.length > 0
        ? addHeader(
            '# Knowledge',
            firstFiveKnowledgeItems.map((knowledge) => `- ${knowledge.content.text}`).join('\n')
          )
        : '') + '\n';

    const tokenLength = 3.5;

    console.log('*** knowledge', knowledge);

    if (knowledge.length > 4000 * tokenLength) {
      knowledge = knowledge.slice(0, 4000 * tokenLength);
    }

    console.log('*** KNOWLEDGE RETRIEVED, LENGTH: ', knowledge.length, ' ***');

    return {
      data: {
        knowledge,
      },
      values: {
        knowledge,
      },
      text: knowledge,
    };
  },
};

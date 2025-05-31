// Test script for special topics functionality
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { WebSearchService } from './plugins/plugin-web-search/src/services/webSearchService.js';

dotenv.config();

// Define the test special topics to check
const testQueries = [
  "Tell me about Akash Accelerate events",
  "How do I deploy GPUs on Akash?",
  "What is Akash Supercloud?",
  "How much does Akash cost?",
  "How do I become an Akash provider?",
  "When is the next mainnet upgrade?",
  "How do I set up an Akash validator?"
];

async function testSpecialTopicsSearch() {
  console.log("Testing special topics search functionality...");
  console.log("TAVILY_API_KEY:", process.env.TAVILY_API_KEY ? "✓ Found" : "✗ Missing");
  
  if (!process.env.TAVILY_API_KEY) {
    console.error("Error: TAVILY_API_KEY is required in .env file");
    process.exit(1);
  }
  
  // Create a mock runtime with the API key
  const mockRuntime = {
    getSetting: (key) => {
      if (key === "TAVILY_API_KEY") return process.env.TAVILY_API_KEY;
      return null;
    }
  };
  
  // Initialize the WebSearchService
  const webSearchService = new WebSearchService();
  await webSearchService.initialize(mockRuntime);
  
  // Run tests for each query
  for (const query of testQueries) {
    console.log(`\n------------------------------`);
    console.log(`Testing query: "${query}"`);
    
    try {
      const result = await webSearchService.search(query);
      
      // Check if special topic content is included
      const hasSpecialTopicContent = result.results.some(r => {
        const isSpecial = r.url.includes('akash.network/') || r.url.includes('github.com/akash-network/');
        if (isSpecial) {
          console.log(`✓ Found special topic result: ${r.title}`);
          console.log(`  URL: ${r.url}`);
        }
        return isSpecial;
      });
      
      if (!hasSpecialTopicContent) {
        console.log("✗ No special topic content found in results");
      }
      
      // Check if answer mentions the special topic
      const queryLower = query.toLowerCase();
      const specialTopics = [
        "accelerate", "gpu", "supercloud", "pricing", "provider", "mainnet", "validator"
      ];
      
      const matchedTopic = specialTopics.find(topic => queryLower.includes(topic));
      if (matchedTopic && result.answer.includes(matchedTopic)) {
        console.log(`✓ Answer mentions the special topic "${matchedTopic}"`);
      } else if (matchedTopic) {
        console.log(`✗ Answer does not mention the special topic "${matchedTopic}"`);
      }
      
      console.log(`Total results: ${result.results.length}`);
      
    } catch (error) {
      console.error(`Error testing query "${query}":`, error);
    }
  }
}

testSpecialTopicsSearch().catch(console.error); 
// Simple test script to verify Tavily API is working correctly
// Run with: node test-web-search.js

require('dotenv').config();
const axios = require('axios');

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!TAVILY_API_KEY) {
  console.error('Error: TAVILY_API_KEY is not set in environment variables');
  process.exit(1);
}

async function testTavilySearch() {
  console.log('Testing Tavily API with a search query...');
  
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: TAVILY_API_KEY,
        query: 'latest Akash Network updates',
        search_depth: 'basic',
        include_domains: ['akash.network', 'docs.akash.network', 'github.com/akash-network'],
        include_answer: true,
        include_images: false,
        max_results: 5
      }
    );
    
    console.log('Search successful! Response:');
    console.log('------------------------');
    console.log('Answer:', response.data.answer);
    console.log('------------------------');
    console.log('Results:');
    
    response.data.results.forEach((result, index) => {
      console.log(`\n[${index + 1}] ${result.title}`);
      console.log(`URL: ${result.url}`);
      console.log(`Content snippet: ${result.content.substring(0, 150)}...`);
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing Tavily API:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testTavilySearch(); 
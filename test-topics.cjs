// Test script for special topics functionality using CommonJS
require('dotenv').config();

// Define the test special topics to check
const testQueries = [
  "Tell me about Akash Accelerate events",
  "How do I deploy GPUs on Akash?",
  "What is Akash Supercloud?",
  "How much does Akash cost and pricing?",
  "How do I become an Akash provider?",
  "When is the next mainnet upgrade?",
  "How do I set up an Akash validator?"
];

// Special topics we've defined
const AKASH_SPECIAL_TOPICS = {
  "accelerate": {
      name: "Akash Accelerate",
      links: [
          {
              title: "Akash Accelerate Event Page",
              url: "https://akash.network/accelerate/",
              description: "Official event page for Akash Accelerate with details about upcoming events, speakers, and registration."
          },
          {
              title: "Akash Accelerate 2024 Recap",
              url: "https://akash.network/blog/akash-accelerate-2024-recap/",
              description: "A comprehensive recap of the Akash Accelerate 2024 event, including presentations, announcements, and highlights."
          },
          {
              title: "Akash Accelerate GitHub Resources",
              url: "https://github.com/akash-network/community/tree/main/sig-events/akash-accelerate",
              description: "GitHub repository with resources, slides, and materials from previous Akash Accelerate events."
          }
      ]
  },
  "supercloud": {
      name: "Akash Supercloud",
      links: [
          {
              title: "Akash Supercloud Documentation",
              url: "https://akash.network/docs/deployments/akash-console/",
              description: "Official documentation for Akash Supercloud features and deployment options."
          },
          {
              title: "Akash AI Supercloud Blog",
              url: "https://akash.network/blog/ai-supercloud/",
              description: "Blog post explaining the Akash AI Supercloud concept and its benefits."
          }
      ]
  },
  "gpu": {
      name: "Akash GPU",
      links: [
          {
              title: "GPU Deployments on Akash",
              url: "https://akash.network/docs/deployments/akash-console/gpu-deployment/",
              description: "Official documentation for deploying GPU workloads on Akash Network."
          },
          {
              title: "GPU Provider Operations",
              url: "https://akash.network/docs/providers/gpu-providers/",
              description: "Documentation for GPU providers on Akash Network."
          },
          {
              title: "Akash GPU Marketplace",
              url: "https://akash.network/marketplace/",
              description: "Akash GPU marketplace for finding available GPU providers and pricing."
          }
      ]
  },
  "pricing": {
      name: "Akash Pricing",
      links: [
          {
              title: "Akash Network Pricing",
              url: "https://akash.network/pricing/",
              description: "Official pricing information for Akash Network services."
          },
          {
              title: "Akash Network Cost Calculator",
              url: "https://akash.network/about/cloud-cost-calculator/",
              description: "Tool to calculate and compare costs between Akash and traditional cloud providers."
          }
      ]
  },
  "provider": {
      name: "Akash Providers",
      links: [
          {
              title: "Provider Documentation",
              url: "https://akash.network/docs/providers/",
              description: "Comprehensive documentation for Akash Network providers."
          },
          {
              title: "Provider Setup Guide",
              url: "https://akash.network/docs/providers/build-a-cloud-provider/",
              description: "Step-by-step guide for setting up and running an Akash provider."
          },
          {
              title: "Provider Rewards",
              url: "https://akash.network/docs/providers/provider-rewards/",
              description: "Information about the provider rewards program on Akash Network."
          }
      ]
  },
  "mainnet": {
      name: "Akash Mainnet",
      links: [
          {
              title: "Mainnet Documentation",
              url: "https://akash.network/docs/mainnet/",
              description: "Official documentation for Akash Mainnet including upgrade information."
          },
          {
              title: "Mainnet Release Notes",
              url: "https://github.com/akash-network/node/releases",
              description: "Release notes and changelog for Akash Network mainnet versions."
          }
      ]
  },
  "validator": {
      name: "Akash Validators",
      links: [
          {
              title: "Validator Documentation",
              url: "https://akash.network/docs/validators/",
              description: "Comprehensive documentation for Akash Network validators."
          },
          {
              title: "Validator Setup Guide",
              url: "https://akash.network/docs/validators/validator-deployment-guide/",
              description: "Step-by-step guide for setting up and running an Akash validator."
          }
      ]
  }
};

// Helper function to check if a query is about a special topic
const getSpecialTopicFromQuery = (query) => {
  const queryLower = query.toLowerCase();
  
  for (const [key, value] of Object.entries(AKASH_SPECIAL_TOPICS)) {
      if (queryLower.includes(key)) {
          return value;
      }
  }
  
  return null;
};

async function testSpecialTopicsMatching() {
  console.log("Testing special topics matching functionality...");
  
  // Test each query against our special topics function
  for (const query of testQueries) {
    console.log(`\n------------------------------`);
    console.log(`Testing query: "${query}"`);
    
    const specialTopic = getSpecialTopicFromQuery(query);
    
    if (specialTopic) {
      console.log(`✓ Matched special topic: "${specialTopic.name}"`);
      console.log("Links:");
      specialTopic.links.forEach((link, index) => {
        console.log(`  ${index+1}. ${link.title}`);
        console.log(`     URL: ${link.url}`);
      });
    } else {
      console.log("✗ No special topic matched");
    }
  }
}

testSpecialTopicsMatching().catch(console.error); 
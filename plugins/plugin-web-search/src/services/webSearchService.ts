import {
    Service,
    type IAgentRuntime,
    ServiceType,
    elizaLogger
} from "@elizaos/core";
import { tavily } from "@tavily/core";
import type { IWebSearchService, SearchOptions, SearchResponse } from "../types";

export type TavilyClient = ReturnType<typeof tavily>; // declaring manually because original package does not export its types

// List of official Akash Network documentation and community sites
const AKASH_OFFICIAL_DOMAINS = [
    'docs.akash.network',
    'akash.network',
    'github.com/akash-network',
    'forum.akash.network',
    'awesome.akash.network',
    'x.com/akashnet_',
    'twitter.com/akashnet_'
];

// List of social media domains to check for
const SOCIAL_MEDIA_DOMAINS = [
    'twitter.com',
    'x.com',
    'medium.com'
];

// Special events/topics with dedicated documentation links
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

// Helper function to check if a URL is from an official Akash source
const isAkashOfficialSource = (url: string): boolean => {
    return AKASH_OFFICIAL_DOMAINS.some(domain => url.includes(domain));
};

// Helper function to check if a URL is from social media
const isSocialMediaSource = (url: string): boolean => {
    return SOCIAL_MEDIA_DOMAINS.some(domain => url.includes(domain));
};

// Helper function to enhance query with Akash-specific terms
const enhanceAkashQuery = (query: string): string => {
    // Check if query already mentions Akash
    const containsAkash = query.toLowerCase().includes('akash');
    
    // If query doesn't explicitly mention Akash, add it
    if (!containsAkash) {
        return `${query} Akash Network`;
    }
    
    return query;
};

// Helper function to determine if a query is about recent updates or news
const isRecentUpdatesQuery = (query: string): boolean => {
    const updateTerms = [
        'latest', 'recent', 'news', 'update', 'announcement', 
        'today', 'this week', 'this month', 'new', 'latest',
        'twitter', 'tweet', 'social media', 'announcement'
    ];
    
    const queryLower = query.toLowerCase();
    return updateTerms.some(term => queryLower.includes(term));
};

// Helper function to check if a query is about a special topic
const getSpecialTopicFromQuery = (query: string): {name: string, links: any[]} | null => {
    const queryLower = query.toLowerCase();
    
    // Special cases for common synonyms and related terms
    if (queryLower.includes("cost") || queryLower.includes("price") || 
        queryLower.includes("expensive") || queryLower.includes("cheap") ||
        queryLower.includes("budget") || queryLower.includes("fee")) {
        return AKASH_SPECIAL_TOPICS["pricing"];
    }
    
    if (queryLower.includes("graphic") || queryLower.includes("cuda") || 
        queryLower.includes("video card") || queryLower.includes("nvidia") ||
        queryLower.includes("amd") || queryLower.includes("ml") || 
        queryLower.includes("machine learning") || queryLower.includes("ai compute")) {
        return AKASH_SPECIAL_TOPICS["gpu"];
    }
    
    if (queryLower.includes("become provider") || queryLower.includes("run provider") ||
        queryLower.includes("set up provider") || queryLower.includes("create provider") ||
        queryLower.includes("hosting provider") || queryLower.includes("provide resources")) {
        return AKASH_SPECIAL_TOPICS["provider"];
    }
    
    if (queryLower.includes("run validator") || queryLower.includes("become validator") ||
        queryLower.includes("validator node") || queryLower.includes("staking") ||
        queryLower.includes("validate")) {
        return AKASH_SPECIAL_TOPICS["validator"];
    }
    
    // Standard matching against topics
    for (const [key, value] of Object.entries(AKASH_SPECIAL_TOPICS)) {
        if (queryLower.includes(key)) {
            return value;
        }
    }
    
    return null;
};

export class WebSearchService extends Service implements IWebSearchService {
    public tavilyClient: TavilyClient;
    private static _instance: WebSearchService;

    // Required implementation for Service
    public capabilityDescription = "Search the web for information";
    
    // Required implementation for Service
    public async stop(): Promise<void> {
        // Nothing to clean up
    }

    async initialize(_runtime: IAgentRuntime): Promise<void> {
        const apiKey = _runtime.getSetting("TAVILY_API_KEY") as string;
        if (!apiKey) {
            throw new Error("TAVILY_API_KEY is not set");
        }
        this.tavilyClient = tavily({ apiKey });
    }

    getInstance(): IWebSearchService {
        if (!WebSearchService._instance) {
            WebSearchService._instance = new WebSearchService();
        }
        return WebSearchService._instance;
    }

    static get serviceType(): string {
        return ServiceType.WEB_SEARCH;
    }

    async search(
        query: string,
        options?: SearchOptions,
    ): Promise<SearchResponse> {
        try {
            // Check if this query is about a special topic
            const specialTopic = getSpecialTopicFromQuery(query);
            
            // Enhance query with Akash-specific terms if needed
            const enhancedQuery = enhanceAkashQuery(query);
            elizaLogger.log(`Original query: "${query}" | Enhanced query: "${enhancedQuery}"`);
            
            // Check if this is a query about recent updates
            const isUpdateQuery = isRecentUpdatesQuery(query);
            
            // First try searching with site-specific query for docs
            const docsQuery = `site:docs.akash.network ${query}`;
            elizaLogger.log(`Trying docs-specific search: "${docsQuery}"`);
            
            let docsResponse;
            try {
                docsResponse = await this.tavilyClient.search(docsQuery, {
                    includeAnswer: options?.includeAnswer || true,
                    maxResults: 3,
                    topic: options?.type || "general",
                    searchDepth: "advanced",
                    includeImages: false,
                    days: 30, // Expand to 30 days for documentation
                });
            } catch (error) {
                elizaLogger.error("Docs-specific search failed:", error);
                docsResponse = { results: [] };
            }
            
            // If this is an update query, also do a Twitter-specific search
            let twitterResponse = { results: [] };
            if (isUpdateQuery) {
                const twitterQuery = `site:twitter.com OR site:x.com akashnet_ ${query}`;
                elizaLogger.log(`Trying Twitter-specific search: "${twitterQuery}"`);
                
                try {
                    twitterResponse = await this.tavilyClient.search(twitterQuery, {
                        includeAnswer: false,
                        maxResults: 3,
                        topic: "general",
                        searchDepth: "advanced",
                        includeImages: false,
                        days: 7, // Last 7 days for social media
                    });
                } catch (error) {
                    elizaLogger.error("Twitter-specific search failed:", error);
                }
            }
            
            // Now do a general search
            const generalResponse = await this.tavilyClient.search(enhancedQuery, {
                includeAnswer: options?.includeAnswer || true,
                maxResults: options?.limit || 5,
                topic: options?.type || "general",
                searchDepth: options?.searchDepth || "advanced",
                includeImages: options?.includeImages || false,
                days: options?.days || 7,
            });
            
            // Create special topic results if applicable
            let specialTopicResults: any[] = [];
            if (specialTopic) {
                specialTopicResults = specialTopic.links.map(link => ({
                    title: link.title,
                    url: link.url,
                    content: link.description,
                    score: 1.0, // Give these results high score
                    publishedDate: new Date().toISOString() // Current date since these are curated
                }));
            }
            
            // Combine and prioritize results
            const combinedResults = this.combineAndPrioritizeResults(
                specialTopicResults,
                docsResponse.results || [],
                twitterResponse.results || [],
                generalResponse.results || [],
                isUpdateQuery
            );
            
            // For social media focused queries, provide a more tailored answer
            let answer = generalResponse.answer || "";
            
            // If it's a special topic, enhance the answer
            if (specialTopic) {
                answer = `${answer}\n\nI've included official documentation links for ${specialTopic.name} below.`;
            }
            
            // If it's an update query with Twitter results, enhance the answer
            if (isUpdateQuery && twitterResponse.results && twitterResponse.results.length > 0) {
                // Include Twitter info in the answer even without dates
                const tweetCount = twitterResponse.results.length;
                
                // Find most recent topic if possible
                const tweetContent = twitterResponse.results.map(result => result.content).join(" ");
                
                // Extract potential topics from the content
                const topics = [
                    "Akash Accelerate", "decentralized compute", "AI infrastructure", 
                    "open-source AI", "Overclock Labs", "cloud computing",
                    "GPU", "deployment", "Akash provider"
                ];
                
                const foundTopics = topics.filter(topic => 
                    tweetContent.toLowerCase().includes(topic.toLowerCase())
                );
                
                if (foundTopics.length > 0) {
                    answer += `\n\nRecent Twitter updates from the official Akash Network account discuss ${foundTopics.slice(0, 3).join(", ")}.`;
                } else {
                    answer += "\n\nRecent Twitter updates from the official Akash Network account are included in the results below.";
                }
            }
            
            return {
                ...generalResponse,
                answer,
                results: combinedResults
            };
        } catch (error) {
            elizaLogger.error("Web search error:", error);
            throw error;
        }
    }
    
    // Helper method to combine and prioritize results from different searches
    private combineAndPrioritizeResults(
        specialTopicResults: any[], 
        docsResults: any[], 
        twitterResults: any[], 
        generalResults: any[],
        isUpdateQuery: boolean = false
    ): any[] {
        // Create a map to track URLs we've already included
        const includedUrls = new Map();
        const combinedResults = [];
        
        // Special topic results have the highest priority
        for (const result of specialTopicResults) {
            includedUrls.set(result.url, true);
            combinedResults.push(result);
        }
        
        // For update queries, prioritize Twitter results next
        if (isUpdateQuery && twitterResults.length > 0) {
            for (const result of twitterResults) {
                if (!includedUrls.has(result.url)) {
                    includedUrls.set(result.url, true);
                    combinedResults.push(result);
                }
            }
        }
        
        // Then add docs results
        for (const result of docsResults) {
            if (!includedUrls.has(result.url)) {
                includedUrls.set(result.url, true);
                combinedResults.push(result);
            }
        }
        
        // If not an update query, add social media results next
        if (!isUpdateQuery) {
            for (const result of generalResults) {
                if (!includedUrls.has(result.url) && isSocialMediaSource(result.url)) {
                    includedUrls.set(result.url, true);
                    combinedResults.push(result);
                }
            }
        }
        
        // Then add other official Akash sources from general results
        for (const result of generalResults) {
            if (!includedUrls.has(result.url) && isAkashOfficialSource(result.url)) {
                includedUrls.set(result.url, true);
                combinedResults.push(result);
            }
        }
        
        // Finally add other results until we reach the limit
        for (const result of generalResults) {
            if (!includedUrls.has(result.url)) {
                includedUrls.set(result.url, true);
                combinedResults.push(result);
            }
            
            // Limit to 8 total results
            if (combinedResults.length >= 8) {
                break;
            }
        }
        
        return combinedResults;
    }
}

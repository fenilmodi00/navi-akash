/**
 * Performance monitoring and metrics collection for Akash agent optimization
 */

export interface PerformanceMetrics {
  webSearchRequests: number;
  webSearchCacheHits: number;
  webSearchLatency: number[];
  textGenerationRequests: number;
  textGenerationCacheHits: number;
  textGenerationLatency: number[];
  embeddingRequests: number;
  embeddingCacheHits: number;
  embeddingLatency: number[];
  responseTime: number[];
  memoryUsage: number[];
  lastUpdated: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      webSearchRequests: 0,
      webSearchCacheHits: 0,
      webSearchLatency: [],
      textGenerationRequests: 0,
      textGenerationCacheHits: 0,
      textGenerationLatency: [],
      embeddingRequests: 0,
      embeddingCacheHits: 0,
      embeddingLatency: [],
      responseTime: [],
      memoryUsage: [],
      lastUpdated: Date.now()
    };
  }

  // Web Search Metrics
  recordWebSearchRequest(latency: number) {
    this.metrics.webSearchRequests++;
    this.metrics.webSearchLatency.push(latency);
    this.trimArray(this.metrics.webSearchLatency, 100);
    this.metrics.lastUpdated = Date.now();
  }

  recordWebSearchCacheHit() {
    this.metrics.webSearchCacheHits++;
    this.metrics.lastUpdated = Date.now();
  }

  // Text Generation Metrics
  recordTextGenerationRequest(latency: number) {
    this.metrics.textGenerationRequests++;
    this.metrics.textGenerationLatency.push(latency);
    this.trimArray(this.metrics.textGenerationLatency, 100);
    this.metrics.lastUpdated = Date.now();
  }

  recordTextGenerationCacheHit() {
    this.metrics.textGenerationCacheHits++;
    this.metrics.lastUpdated = Date.now();
  }

  // Embedding Metrics
  recordEmbeddingRequest(latency: number) {
    this.metrics.embeddingRequests++;
    this.metrics.embeddingLatency.push(latency);
    this.trimArray(this.metrics.embeddingLatency, 100);
    this.metrics.lastUpdated = Date.now();
  }

  recordEmbeddingCacheHit() {
    this.metrics.embeddingCacheHits++;
    this.metrics.lastUpdated = Date.now();
  }

  // Response Time Metrics
  recordResponseTime(time: number) {
    this.metrics.responseTime.push(time);
    this.trimArray(this.metrics.responseTime, 100);
    this.metrics.lastUpdated = Date.now();
  }

  // Memory Usage Metrics
  recordMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      this.metrics.memoryUsage.push(usage.heapUsed / 1024 / 1024); // MB
      this.trimArray(this.metrics.memoryUsage, 100);
      this.metrics.lastUpdated = Date.now();
    }
  }

  // Helper method to trim arrays to keep only recent entries
  private trimArray(arr: number[], maxLength: number) {
    if (arr.length > maxLength) {
      arr.splice(0, arr.length - maxLength);
    }
  }

  // Calculate average for an array
  private calculateAverage(arr: number[]): number {
    return arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0;
  }

  // Calculate percentile
  private calculatePercentile(arr: number[], percentile: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  // Get performance summary
  getPerformanceSummary() {
    const uptime = (Date.now() - this.startTime) / 1000; // seconds

    return {
      uptime,
      webSearch: {
        totalRequests: this.metrics.webSearchRequests,
        cacheHits: this.metrics.webSearchCacheHits,
        cacheHitRate: this.metrics.webSearchRequests > 0 
          ? ((this.metrics.webSearchCacheHits / this.metrics.webSearchRequests) * 100).toFixed(1) + '%'
          : '0%',
        avgLatency: this.calculateAverage(this.metrics.webSearchLatency).toFixed(2) + 'ms',
        p95Latency: this.calculatePercentile(this.metrics.webSearchLatency, 95).toFixed(2) + 'ms'
      },
      textGeneration: {
        totalRequests: this.metrics.textGenerationRequests,
        cacheHits: this.metrics.textGenerationCacheHits,
        cacheHitRate: this.metrics.textGenerationRequests > 0 
          ? ((this.metrics.textGenerationCacheHits / this.metrics.textGenerationRequests) * 100).toFixed(1) + '%'
          : '0%',
        avgLatency: this.calculateAverage(this.metrics.textGenerationLatency).toFixed(2) + 'ms',
        p95Latency: this.calculatePercentile(this.metrics.textGenerationLatency, 95).toFixed(2) + 'ms'
      },
      embeddings: {
        totalRequests: this.metrics.embeddingRequests,
        cacheHits: this.metrics.embeddingCacheHits,
        cacheHitRate: this.metrics.embeddingRequests > 0 
          ? ((this.metrics.embeddingCacheHits / this.metrics.embeddingRequests) * 100).toFixed(1) + '%'
          : '0%',
        avgLatency: this.calculateAverage(this.metrics.embeddingLatency).toFixed(2) + 'ms',
        p95Latency: this.calculatePercentile(this.metrics.embeddingLatency, 95).toFixed(2) + 'ms'
      },
      responseTime: {
        average: this.calculateAverage(this.metrics.responseTime).toFixed(2) + 'ms',
        p95: this.calculatePercentile(this.metrics.responseTime, 95).toFixed(2) + 'ms'
      },
      memory: {
        current: this.metrics.memoryUsage.length > 0 
          ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1].toFixed(2) + 'MB'
          : 'N/A',
        average: this.calculateAverage(this.metrics.memoryUsage).toFixed(2) + 'MB',
        peak: this.metrics.memoryUsage.length > 0 
          ? Math.max(...this.metrics.memoryUsage).toFixed(2) + 'MB'
          : 'N/A'
      }
    };
  }

  // Reset all metrics
  resetMetrics() {
    this.metrics = {
      webSearchRequests: 0,
      webSearchCacheHits: 0,
      webSearchLatency: [],
      textGenerationRequests: 0,
      textGenerationCacheHits: 0,
      textGenerationLatency: [],
      embeddingRequests: 0,
      embeddingCacheHits: 0,
      embeddingLatency: [],
      responseTime: [],
      memoryUsage: [],
      lastUpdated: Date.now()
    };
    this.startTime = Date.now();
  }

  // Start periodic memory monitoring
  startMemoryMonitoring(intervalMs: number = 30000) { // 30 seconds default
    setInterval(() => {
      this.recordMemoryUsage();
    }, intervalMs);
  }

  // Get raw metrics for detailed analysis
  getRawMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

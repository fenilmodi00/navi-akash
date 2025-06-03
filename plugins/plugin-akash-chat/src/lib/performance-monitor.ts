// Performance monitoring for Akash chat plugin
export interface PerformanceMetrics {
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    totalLatency: number;
    avgLatency: number;
    maxLatency: number;
    minLatency: number;
    memoryUsage: number;
    peakMemoryUsage: number;
    lastUpdated: number;
    responseTimes: number[];
}

export class PerformanceMonitor {
    private metrics: PerformanceMetrics = {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        totalLatency: 0,
        avgLatency: 0,
        maxLatency: 0,
        minLatency: Infinity,
        memoryUsage: 0,
        peakMemoryUsage: 0,
        lastUpdated: Date.now(),
        responseTimes: []
    };

    private maxResponseTimeHistory = 100; // Keep last 100 response times

    recordRequest(latency: number, cacheHit: boolean = false): void {
        this.metrics.totalRequests++;
        
        if (cacheHit) {
            this.metrics.cacheHits++;
        } else {
            this.metrics.cacheMisses++;
        }

        this.metrics.totalLatency += latency;
        this.metrics.avgLatency = this.metrics.totalLatency / this.metrics.totalRequests;
        this.metrics.maxLatency = Math.max(this.metrics.maxLatency, latency);
        this.metrics.minLatency = Math.min(this.metrics.minLatency, latency);

        // Track response times for percentile calculations
        this.metrics.responseTimes.push(latency);
        if (this.metrics.responseTimes.length > this.maxResponseTimeHistory) {
            this.metrics.responseTimes.shift();
        }

        this.updateMemoryUsage();
        this.metrics.lastUpdated = Date.now();
    }

    recordCacheHit(): void {
        this.metrics.cacheHits++;
        this.metrics.totalRequests++;
        this.metrics.lastUpdated = Date.now();
    }

    recordCacheMiss(): void {
        this.metrics.cacheMisses++;
        this.metrics.totalRequests++;
        this.metrics.lastUpdated = Date.now();
    }

    private updateMemoryUsage(): void {
        if (typeof process !== 'undefined' && process.memoryUsage) {
            this.metrics.memoryUsage = process.memoryUsage().heapUsed;
            this.metrics.peakMemoryUsage = Math.max(
                this.metrics.peakMemoryUsage,
                this.metrics.memoryUsage
            );
        }
    }

    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    getCacheHitRate(): number {
        const total = this.metrics.cacheHits + this.metrics.cacheMisses;
        return total > 0 ? (this.metrics.cacheHits / total) * 100 : 0;
    }

    getPercentile(percentile: number): number {
        if (this.metrics.responseTimes.length === 0) return 0;
        
        const sorted = [...this.metrics.responseTimes].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    getSummary(): string {
        const cacheHitRate = this.getCacheHitRate();
        const p95 = this.getPercentile(95);
        const p99 = this.getPercentile(99);
        
        return `Performance Summary:
- Total Requests: ${this.metrics.totalRequests}
- Cache Hit Rate: ${cacheHitRate.toFixed(2)}%
- Avg Latency: ${this.metrics.avgLatency.toFixed(2)}ms
- P95 Latency: ${p95.toFixed(2)}ms
- P99 Latency: ${p99.toFixed(2)}ms
- Peak Memory: ${(this.metrics.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB`;
    }

    reset(): void {
        this.metrics = {
            totalRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            totalLatency: 0,
            avgLatency: 0,
            maxLatency: 0,
            minLatency: Infinity,
            memoryUsage: 0,
            peakMemoryUsage: 0,
            lastUpdated: Date.now(),
            responseTimes: []
        };
    }
}

// Global instance for Akash chat plugin
export const performanceMonitor = new PerformanceMonitor();

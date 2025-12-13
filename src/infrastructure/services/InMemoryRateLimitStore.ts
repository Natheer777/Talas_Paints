import { IRateLimitStore , RateLimitInfo } from '../../domian/interfaces/IRateLimitStore';


export class InMemoryRateLimitStore implements IRateLimitStore {
    private store: Map<string, RateLimitInfo>;
    private cleanupInterval: NodeJS.Timeout | null;

    constructor(cleanupIntervalMs: number = 60000) {
        this.store = new Map();
        this.cleanupInterval = null;
        this.startCleanup(cleanupIntervalMs);
    }

    async increment(key: string, windowMs: number): Promise<RateLimitInfo> {
        const now = Date.now();
        const existing = this.store.get(key);

        if (!existing) {
            // First request
            const info: RateLimitInfo = {
                count: 1,
                resetTime: now + windowMs,
                firstRequestTime: now,
            };
            this.store.set(key, info);
            return info;
        }

        // Check if window has expired
        if (now >= existing.resetTime) {
            // Reset window
            const info: RateLimitInfo = {
                count: 1,
                resetTime: now + windowMs,
                firstRequestTime: now,
            };
            this.store.set(key, info);
            return info;
        }

        // Increment within window
        const info: RateLimitInfo = {
            count: existing.count + 1,
            resetTime: existing.resetTime,
            firstRequestTime: existing.firstRequestTime,
        };
        this.store.set(key, info);
        return info;
    }

    async get(key: string): Promise<RateLimitInfo | null> {
        const info = this.store.get(key);
        if (!info) {
            return null;
        }

        // Check if expired
        if (Date.now() >= info.resetTime) {
            this.store.delete(key);
            return null;
        }

        return info;
    }

    async reset(key: string): Promise<void> {
        this.store.delete(key);
    }

    async cleanup(): Promise<void> {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, info] of this.store.entries()) {
            if (now >= info.resetTime) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.store.delete(key));
    }

    private startCleanup(intervalMs: number): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanup().catch(err => {
                console.error('Rate limit cleanup error:', err);
            });
        }, intervalMs);
    }

    public stopCleanup(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

   
    public getSize(): number {
        return this.store.size;
    }


    public clear(): void {
        this.store.clear();
    }
}

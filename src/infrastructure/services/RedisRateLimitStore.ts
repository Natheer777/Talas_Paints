import { IRateLimitStore, RateLimitInfo } from '../../domian/interfaces/IRateLimitStore';

export class RedisRateLimitStore implements IRateLimitStore {
    private client: any; 

    constructor(redisClient?: any) {
        if (redisClient) {
            this.client = redisClient;
        } else {
            throw new Error('Redis client not configured. Please provide a Redis client or configure default connection.');
        }
    }

    async increment(key: string, windowMs: number): Promise<RateLimitInfo> {
        const now = Date.now();
        const redisKey = `ratelimit:${key}`;
        const ttlSeconds = Math.ceil(windowMs / 1000);

        const pipeline = this.client.pipeline();

        const existing = await this.client.get(redisKey);

        if (!existing) {
            // First request
            const info: RateLimitInfo = {
                count: 1,
                resetTime: now + windowMs,
                firstRequestTime: now,
            };

            await this.client.setex(redisKey, ttlSeconds, JSON.stringify(info));
            return info;
        }

        const parsedInfo: RateLimitInfo = JSON.parse(existing);

        // Check if window has expired
        if (now >= parsedInfo.resetTime) {
            // Reset window
            const info: RateLimitInfo = {
                count: 1,
                resetTime: now + windowMs,
                firstRequestTime: now,
            };

            await this.client.setex(redisKey, ttlSeconds, JSON.stringify(info));
            return info;
        }

      
        const info: RateLimitInfo = {
            count: parsedInfo.count + 1,
            resetTime: parsedInfo.resetTime,
            firstRequestTime: parsedInfo.firstRequestTime,
        };

        const remainingTtl = Math.ceil((parsedInfo.resetTime - now) / 1000);
        await this.client.setex(redisKey, remainingTtl, JSON.stringify(info));

        return info;
    }

    async get(key: string): Promise<RateLimitInfo | null> {
        const redisKey = `ratelimit:${key}`;
        const data = await this.client.get(redisKey);

        if (!data) {
            return null;
        }

        const info: RateLimitInfo = JSON.parse(data);

        // Check if expired
        if (Date.now() >= info.resetTime) {
            await this.client.del(redisKey);
            return null;
        }

        return info;
    }

    async reset(key: string): Promise<void> {
        const redisKey = `ratelimit:${key}`;
        await this.client.del(redisKey);
    }

    async cleanup(): Promise<void> {
 }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.quit();
        }
    }
}

import { IRateLimitStore } from '../../domian/interfaces/IRateLimitStore';
import { RateLimitConfig } from '../../domian/value-objects/RateLimitConfig';
import { Request } from 'express';


export class RateLimitService {
    constructor(private readonly store: IRateLimitStore) { }

 
    async checkRateLimit(
        key: string,
        config: RateLimitConfig
    ): Promise<RateLimitResult> {
        const info = await this.store.increment(key, config.windowMs);

        const isAllowed = info.count <= config.maxRequests;
        const remaining = Math.max(0, config.maxRequests - info.count);
        const retryAfter = isAllowed ? 0 : Math.ceil((info.resetTime - Date.now()) / 1000);

        return {
            isAllowed,
            limit: config.maxRequests,
            remaining,
            resetTime: info.resetTime,
            retryAfter,
            current: info.count,
        };
    }

 
    async resetLimit(key: string): Promise<void> {
        await this.store.reset(key);
    }

    async getStatus(key: string, config?: RateLimitConfig): Promise<RateLimitResult | null> {
        const info = await this.store.get(key);

        if (!info) {
            return null;
        }

        // If config is provided, we can calculate proper remaining and isAllowed
        if (config) {
            const isAllowed = info.count <= config.maxRequests;
            const remaining = Math.max(0, config.maxRequests - info.count);
            const retryAfter = isAllowed ? 0 : Math.ceil((info.resetTime - Date.now()) / 1000);

            return {
                isAllowed,
                limit: config.maxRequests,
                remaining,
                resetTime: info.resetTime,
                retryAfter,
                current: info.count,
            };
        }

        // Without config, return basic info
        return {
            isAllowed: true,
            limit: 0,
            remaining: 0,
            resetTime: info.resetTime,
            retryAfter: 0,
            current: info.count,
        };
    }

  
    static generateKey(req: Request, prefix: string = 'global'): string {
        // Try to get real IP from various headers (for proxy/load balancer scenarios)
        // x-forwarded-for can contain multiple IPs, take the first one (original client)
        const forwardedFor = req.headers['x-forwarded-for'];
        const ip = forwardedFor
            ? (typeof forwardedFor === 'string' ? forwardedFor : forwardedFor[0])?.split(',')[0]?.trim()
            : (req.headers['x-real-ip'] as string) ||
              req.socket.remoteAddress ||
              'unknown';

        return `${prefix}:${ip}`;
    }


    static generateUserKey(userId: string, prefix: string = 'user'): string {
        return `${prefix}:${userId}`;
    }

 
    static generateApiKeyKey(apiKey: string, prefix: string = 'apikey'): string {
        return `${prefix}:${apiKey}`;
    }
}


export interface RateLimitResult {
    isAllowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
    retryAfter: number; // Seconds until retry is allowed
    current: number;
}

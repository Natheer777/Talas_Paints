export class RateLimitConfig {
    public readonly windowMs: number;
    public readonly maxRequests: number;
    public readonly message: string;
    public readonly statusCode: number;
    public readonly skipSuccessfulRequests: boolean;
    public readonly skipFailedRequests: boolean;
    public readonly keyGenerator?: (req: any) => string;

    constructor(config: {
        windowMs: number;
        maxRequests: number;
        message?: string;
        statusCode?: number;
        skipSuccessfulRequests?: boolean;
        skipFailedRequests?: boolean;
        keyGenerator?: (req: any) => string;
    }) {
        if (config.windowMs <= 0) {
            throw new Error('windowMs must be greater than 0');
        }
        if (config.maxRequests <= 0) {
            throw new Error('maxRequests must be greater than 0');
        }

        this.windowMs = config.windowMs;
        this.maxRequests = config.maxRequests;
        this.message = config.message || 'Too many requests, please try again later.';
        this.statusCode = config.statusCode || 429;
        this.skipSuccessfulRequests = config.skipSuccessfulRequests || false;
        this.skipFailedRequests = config.skipFailedRequests || false;
        this.keyGenerator = config.keyGenerator;
    }

  
    static createStrictConfig(): RateLimitConfig {
        return new RateLimitConfig({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100,
            message: 'Too many requests from this IP, please try again later.',
        });
    }

    static createModerateConfig(): RateLimitConfig {
        return new RateLimitConfig({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 500,
        });
    }

    static createLenientConfig(): RateLimitConfig {
        return new RateLimitConfig({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 1000,
        });
    }

    static createAuthConfig(): RateLimitConfig {
        return new RateLimitConfig({
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 5, // Strict limit for auth endpoints
            message: 'Too many authentication attempts, please try again later.',
        });
    }

    static createWriteOperationConfig(): RateLimitConfig {
        return new RateLimitConfig({
            windowMs: 60 * 1000, // 1 minute
            maxRequests: 10, // 10 writes per minute
            message: 'Too many write operations, please slow down.',
        });
    }
}

import { Request, Response, NextFunction } from 'express';
import { RateLimitService } from '../../application/services/RateLimitService';
import { RateLimitConfig } from '../../domian/value-objects/RateLimitConfig';

export class RateLimitMiddleware {
    constructor(
        private readonly rateLimitService: RateLimitService,
        private readonly config: RateLimitConfig
    ) { }

    public handle() {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const key = this.config.keyGenerator
                    ? this.config.keyGenerator(req)
                    : RateLimitService.generateKey(req, this.getRoutePrefix(req));

                const result = await this.rateLimitService.checkRateLimit(key, this.config);

                res.setHeader('X-RateLimit-Limit', result.limit.toString());
                res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
                res.setHeader('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

                if (!result.isAllowed) {
                    res.setHeader('Retry-After', result.retryAfter.toString());

                    res.status(this.config.statusCode).json({
                        success: false,
                        message: this.config.message,
                        error: {
                            code: 'RATE_LIMIT_EXCEEDED',
                            limit: result.limit,
                            remaining: result.remaining,
                            resetTime: new Date(result.resetTime).toISOString(),
                            retryAfter: result.retryAfter,
                        },
                    });
                    return;
                }

                if (this.config.skipSuccessfulRequests || this.config.skipFailedRequests) {
                    const originalSend = res.send;
                    res.send = function (data: any): Response {
                        const statusCode = res.statusCode;

                   
                        return originalSend.call(this, data);
                    };
                }

                next();
            } catch (error) {
                console.error('Rate limit middleware error:', error);
               next();
            }
        };
    }


    private getRoutePrefix(req: Request): string {
        const route = req.route?.path || req.path;
        const method = req.method.toLowerCase();
        return `${method}:${route}`;
    }

 
    static createStrict(rateLimitService: RateLimitService): RateLimitMiddleware {
        return new RateLimitMiddleware(
            rateLimitService,
            RateLimitConfig.createStrictConfig()
        );
    }

 
    static createModerate(rateLimitService: RateLimitService): RateLimitMiddleware {
        return new RateLimitMiddleware(
            rateLimitService,
            RateLimitConfig.createModerateConfig()
        );
    }

    static createLenient(rateLimitService: RateLimitService): RateLimitMiddleware {
        return new RateLimitMiddleware(
            rateLimitService,
            RateLimitConfig.createLenientConfig()
        );
    }


    static createAuth(rateLimitService: RateLimitService): RateLimitMiddleware {
        return new RateLimitMiddleware(
            rateLimitService,
            RateLimitConfig.createAuthConfig()
        );
    }

   
    static createWriteOperation(rateLimitService: RateLimitService): RateLimitMiddleware {
        return new RateLimitMiddleware(
            rateLimitService,
            RateLimitConfig.createWriteOperationConfig()
        );
    }

    static createCustom(
        rateLimitService: RateLimitService,
        config: RateLimitConfig
    ): RateLimitMiddleware {
        return new RateLimitMiddleware(rateLimitService, config);
    }
}

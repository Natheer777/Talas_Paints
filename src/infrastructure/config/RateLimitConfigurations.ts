import { RateLimitConfig } from '../../domian/value-objects/RateLimitConfig';


export class RateLimitConfigurations {

    static readonly GLOBAL = new RateLimitConfig({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 900,
        message: 'Too many requests from this IP, please try again later.',
    });

    static readonly STRICT = new RateLimitConfig({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        message: 'Rate limit exceeded. Please try again later.',
    });

    static readonly AUTH = new RateLimitConfig({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        message: 'Too many authentication attempts. Please try again later.',
    });

    static readonly WRITE_OPERATIONS = new RateLimitConfig({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
        message: 'Too many write operations. Please slow down.',
    });

    static readonly CREATE_PRODUCT = new RateLimitConfig({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
        message: 'Too many product creation requests. Please wait before creating more products.',
    });

    static readonly FILE_UPLOAD = new RateLimitConfig({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
        message: 'Too many file uploads. Please wait before uploading more files.',
    });

    static readonly SEARCH = new RateLimitConfig({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
        message: 'Too many search requests. Please slow down.',
    });

   
    static readonly READ_OPERATIONS = new RateLimitConfig({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 1000,
        message: 'Too many read requests. Please try again later.',
    });


    static readonly ORDER_OPERATIONS = new RateLimitConfig({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
        message: 'Too many order operations. Please slow down.',
    });

  
    static readonly DELETE_OPERATIONS = new RateLimitConfig({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
        message: 'Too many delete operations. Please wait before deleting more items.',
    });

   
    static readonly PUBLIC = new RateLimitConfig({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 2000,
        message: 'Rate limit exceeded. Please try again later.',
    });

    static readonly ADMIN = new RateLimitConfig({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 200,
        message: 'Admin rate limit exceeded. Please try again later.',
    });
}

export interface IRateLimitStore {
 
    increment(key: string, windowMs: number): Promise<RateLimitInfo>;
    get(key: string): Promise<RateLimitInfo | null>;
    reset(key: string): Promise<void>;
    cleanup(): Promise<void>;
}

export interface RateLimitInfo {
    count: number;
    resetTime: number; 
    firstRequestTime: number; 
}

/**
 * دليل سريع: كيف تطبق الحد من الطلبات على الراوترات
 * Quick Reference: Applying Rate Limits to Your Routes
 * 
 * هذا الدليل يوضح لك كيف تطبق الحد من الطلبات على أي راوتر في التطبيق
 * This guide shows you how to apply rate limiting to any router in your application.
 */

import { Router, Request, Response, NextFunction } from "express";
import { RateLimitMiddleware } from "../presentation/middleware/RateLimitMiddleware";
import { RateLimitConfigurations } from "../infrastructure/config/RateLimitConfigurations";
import { RateLimitConfig } from "../domian/value-objects/RateLimitConfig";
import { RateLimitService } from "../application/services/RateLimitService";
import Container from "../infrastructure/di/container";

/**
 * الخطوة 1: احصل على خدمة الحد من الطلبات من الحاوية
 * STEP 1: Get the Rate Limit Service from Container
 */
const rateLimitService = Container.getRateLimitService();

/**
 * الخطوة 2: اختر استراتيجية الحد من الطلبات
 * STEP 2: Choose Your Rate Limiting Strategy
 * 
 * الخيار أ: استخدم الاستراتيجيات المعدة مسبقاً
 * Option A: Use Pre-configured Strategies
 */

// حد صارم (100 طلب / 15 دقيقة)
// Strict rate limiting (100 requests / 15 minutes)
const strictLimit = RateLimitMiddleware.createStrict(rateLimitService);

// حد متوسط (500 طلب / 15 دقيقة)
// Moderate rate limiting (500 requests / 15 minutes)
const moderateLimit = RateLimitMiddleware.createModerate(rateLimitService);

// حد متساهل (1000 طلب / 15 دقيقة)
// Lenient rate limiting (1000 requests / 15 minutes)
const lenientLimit = RateLimitMiddleware.createLenient(rateLimitService);

// نقاط تسجيل الدخول (5 طلبات / 15 دقيقة)
// Authentication endpoints (5 requests / 15 minutes)
const authLimit = RateLimitMiddleware.createAuth(rateLimitService);

// عمليات الكتابة (20 طلب / دقيقة)
// Write operations (20 requests / minute)
const writeLimit = RateLimitMiddleware.createWriteOperation(rateLimitService);

/**
 * الخيار ب: استخدم الإعدادات المركزية
 * Option B: Use Centralized Configurations
 */
const createProductLimit = RateLimitMiddleware.createCustom(
    rateLimitService,
    RateLimitConfigurations.CREATE_PRODUCT
);

const searchLimit = RateLimitMiddleware.createCustom(
    rateLimitService,
    RateLimitConfigurations.SEARCH
);

const deleteLimit = RateLimitMiddleware.createCustom(
    rateLimitService,
    RateLimitConfigurations.DELETE_OPERATIONS
);

const fileUploadLimit = RateLimitMiddleware.createCustom(
    rateLimitService,
    RateLimitConfigurations.FILE_UPLOAD
);


const customConfig = new RateLimitConfig({
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'طلبات كثيرة جداً لهذه النقطة / Too many requests for this endpoint',
    statusCode: 429,
});

const customLimit = RateLimitMiddleware.createCustom(
    rateLimitService,
    customConfig
);


const router1 = Router();
router1.get(
    "/items",
    moderateLimit.handle(), 
    (req: Request, res: Response) => {
        res.json({ items: [] });
    }
);


router1.post(
    "/items",
    createProductLimit.handle(), 
    (req: Request, res: Response) => {
        res.json({ success: true });
    }
);


router1.delete(
    "/items/:id",
    deleteLimit.handle(), 
    (req: Request, res: Response) => {
        res.json({ success: true });
    }
);

router1.get(
    "/items/search",
    searchLimit.handle(), 
    (req: Request, res: Response) => {
        res.json({ results: [] });
    }
);


router1.post(
    "/items/upload",
    fileUploadLimit.handle(), 
    (req: Request, res: Response) => {
        res.json({ success: true });
    }
);


const userBasedConfig = new RateLimitConfig({
    windowMs: 15 * 60 * 1000, 
    maxRequests: 200,
    keyGenerator: (req) => {
        const userId = (req as any).user?.id || 'anonymous';
        return `user:${userId}`;
    },
});

const userBasedLimit = RateLimitMiddleware.createCustom(
    rateLimitService,
    userBasedConfig
);

router1.get(
    "/profile",
    userBasedLimit.handle(), 
    (req: Request, res: Response) => {
        res.json({ profile: {} });
    }
);

const apiKeyConfig = new RateLimitConfig({
    windowMs: 60 * 60 * 1000, 
    maxRequests: 1000,
    keyGenerator: (req) => {
        const apiKey = req.headers['x-api-key'] as string || 'no-key';
        return `apikey:${apiKey}`;
    },
});

const apiKeyLimit = RateLimitMiddleware.createCustom(
    rateLimitService,
    apiKeyConfig
);
router1.post(
    "/critical-operation",
    moderateLimit.handle(),      
    userBasedLimit.handle(),      
    (req: Request, res: Response) => {
        res.json({ success: true });
    }
);


export function createExampleRouter() {
    const router = Router();
    const rateLimitService = Container.getRateLimitService();

    const readLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.READ_OPERATIONS
    );

    const writeLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.WRITE_OPERATIONS
    );

    const deleteLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.DELETE_OPERATIONS
    );

    router.get("/items", readLimit.handle(), (req: Request, res: Response) => {
        res.json({ items: [] });
    });

    router.post("/items", writeLimit.handle(), (req: Request, res: Response) => {
        res.json({ success: true });
    });

    router.put("/items/:id", writeLimit.handle(), (req: Request, res: Response) => {
        res.json({ success: true });
    });

    router.delete("/items/:id", deleteLimit.handle(), (req: Request, res: Response) => {
        res.json({ success: true });
    });

    return router;
}


export function addRateLimitMonitoring(router: Router) {
    router.get("/rate-limit-status", async (req: Request, res: Response) => {
        const rateLimitService = Container.getRateLimitService();
        const key = RateLimitService.generateKey(req, 'global');

        const status = await rateLimitService.getStatus(key);

        res.json({
            key,
            status: status || { message: 'لا توجد بيانات حد الطلبات / No rate limit data' },
        });
    });
}

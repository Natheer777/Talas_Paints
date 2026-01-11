import { Router, Request, Response } from 'express';
import { NotificationController } from '../controller/NotificationController';
import {
    validateRegisterFcmToken,
    handleValidationResult
} from '../validation/notificationValidation';
import { RateLimitMiddleware } from '../middleware/RateLimitMiddleware';
import { RateLimitConfigurations } from '../../infrastructure/config/RateLimitConfigurations';
import Container from '../../infrastructure/di/container';

export function createNotificationRouter(notificationController: NotificationController) {
    const router = Router();

    // Get rate limit service from container
    const rateLimitService = Container.getRateLimitService();

    // Create rate limiter for notification operations
    const notificationLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.ORDER_OPERATIONS // Reuse order operations rate limit config
    );

    // Register FCM token
    router.post(
        '/notifications/register-token',
        notificationLimit.handle(),
        validateRegisterFcmToken,
        handleValidationResult,
        (req: Request, res: Response) => notificationController.registerFcmToken(req, res)
    );

    return router;
}


import { Router, Request, Response } from 'express';
import { PaymentMethodController } from '../controller/PaymentMethodController';
import {
    validateCreatePaymentMethod,
    validateUpdatePaymentMethod,
    validateGetPaymentMethod,
    validateDeletePaymentMethod,
    handleValidationResult
} from '../validation/paymentMethodValidation';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { uploadQRCode } from '../middleware/UploadMiddleware';
import { RateLimitMiddleware } from '../middleware/RateLimitMiddleware';
import { RateLimitConfigurations } from '../../infrastructure/config/RateLimitConfigurations';
import Container from '../../infrastructure/di/container';


export function createPaymentMethodRouter(paymentMethodController: PaymentMethodController) {
    const router = Router();

    // Get rate limit service from container
    const rateLimitService = Container.getRateLimitService();

    // Create rate limiters for different operations
    const fileUploadLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.FILE_UPLOAD
    );

    const writeLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.WRITE_OPERATIONS
    );

    const deleteLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.DELETE_OPERATIONS
    );

    // Get auth middleware from container
    const authMiddleware = Container.getAuthMiddleware();

    router.post(
        '/payment-methods',
        authMiddleware.handle(), // Only admins can create payment methods
        fileUploadLimit.handle(),
        uploadQRCode,
        validateCreatePaymentMethod,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => paymentMethodController.create(req, res)
    );

    router.get(
        '/payment-methods',
        (req: Request, res: Response) => paymentMethodController.getAll(req, res)
    );

    router.get(
        '/payment-methods/visible',
        (req: Request, res: Response) => paymentMethodController.getVisible(req, res)
    );

    router.get(
        '/payment-methods/:id',
        validateGetPaymentMethod,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => paymentMethodController.getById(req, res)
    );

    router.put(
        '/payment-methods/:id',
        authMiddleware.handle(), // Only admins can update payment methods
        writeLimit.handle(),
        uploadQRCode,
        validateUpdatePaymentMethod,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => paymentMethodController.update(req, res)
    );

    router.delete(
        '/payment-methods/:id',
        authMiddleware.handle(), // Only admins can delete payment methods
        deleteLimit.handle(),
        validateDeletePaymentMethod,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => paymentMethodController.delete(req, res)
    );

    return router;
}

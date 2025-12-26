import { Router, Request, Response } from 'express';
import { AdsCardController } from '../controller/AdsCardController';
import {
    validateCreateAdsCard,
    validateUpdateAdsCard,
    validateGetAdsCard,
    validateDeleteAdsCard,
    handleValidationResult
} from '../validation/adsCardValidation';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { uploadSingle } from '../middleware/UploadMiddleware';
import { RateLimitMiddleware } from '../middleware/RateLimitMiddleware';
import { RateLimitConfigurations } from '../../infrastructure/config/RateLimitConfigurations';
import Container from '../../infrastructure/di/container';

export function createAdsCardRouter(adsCardController: AdsCardController) {
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
        '/ads-cards',
        authMiddleware.handle(), // Only admins can create ads cards
        fileUploadLimit.handle(),
        uploadSingle,
        validateCreateAdsCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => adsCardController.create(req, res)
    );

    router.get(
        '/ads-cards',
        (req: Request, res: Response) => adsCardController.getAll(req, res)
    );

    router.get(
        '/ads-cards/active',
        (req: Request, res: Response) => adsCardController.getActive(req, res)
    );

    router.get(
        '/ads-cards/:id',
        validateGetAdsCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => adsCardController.getById(req, res)
    );

    router.put(
        '/ads-cards/:id',
        authMiddleware.handle(), // Only admins can update ads cards
        writeLimit.handle(),
        uploadSingle,
        validateUpdateAdsCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => adsCardController.update(req, res)
    );

    router.delete(
        '/ads-cards/:id',
        authMiddleware.handle(), // Only admins can delete ads cards
        deleteLimit.handle(),
        validateDeleteAdsCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => adsCardController.delete(req, res)
    );

    return router;
}








import { Router, Request, Response } from 'express';
import { VideoCardController } from '../controller/VideoCardController';
import {
    validateCreateVideoCard,
    validateUpdateVideoCard,
    validateGetVideoCard,
    validateDeleteVideoCard,
    handleValidationResult
} from '../validation/videoCardValidation';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { uploadVideo } from '../middleware/UploadMiddleware';
import { RateLimitMiddleware } from '../middleware/RateLimitMiddleware';
import { RateLimitConfigurations } from '../../infrastructure/config/RateLimitConfigurations';
import Container from '../../infrastructure/di/container';


export function createVideoCardRouter(videoCardController: VideoCardController) {
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

    // Create new video card
    router.post(
        '/video-cards',
        fileUploadLimit.handle(), 
        uploadVideo,
        validateCreateVideoCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => videoCardController.create(req, res)
    );

   
    router.get(
        '/video-cards',
        (req: Request, res: Response) => videoCardController.getAll(req, res)
    );

    
    router.get(
        '/video-cards/visible',
        (req: Request, res: Response) => videoCardController.getVisible(req, res)
    );

   
    router.get(
        '/video-cards/:id',
        validateGetVideoCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => videoCardController.getById(req, res)
    );

    router.put(
        '/video-cards/:id',
        writeLimit.handle(), 
        uploadVideo,
        validateUpdateVideoCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => videoCardController.update(req, res)
    );


    router.delete(
        '/video-cards/:id',
        deleteLimit.handle(), 
        validateDeleteVideoCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => videoCardController.delete(req, res)
    );

    return router;
}

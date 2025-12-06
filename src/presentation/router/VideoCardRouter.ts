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


export function createVideoCardRouter(videoCardController: VideoCardController) {
    const router = Router();

    // Create new video card
    router.post(
        '/video-cards',
        uploadVideo,
        validateCreateVideoCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => videoCardController.create(req, res)
    );

    // Get all video cards (admin)
    router.get(
        '/video-cards',
        (req: Request, res: Response) => videoCardController.getAll(req, res)
    );

    // Get visible video cards (public)
    router.get(
        '/video-cards/visible',
        (req: Request, res: Response) => videoCardController.getVisible(req, res)
    );

    // Get video card by ID
    router.get(
        '/video-cards/:id',
        validateGetVideoCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => videoCardController.getById(req, res)
    );

    // Update video card
    router.put(
        '/video-cards/:id',
        uploadVideo,
        validateUpdateVideoCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => videoCardController.update(req, res)
    );

    // Delete video card
    router.delete(
        '/video-cards/:id',
        validateDeleteVideoCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => videoCardController.delete(req, res)
    );

    return router;
}

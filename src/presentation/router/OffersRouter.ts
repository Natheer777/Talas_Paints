import { Router, Request, Response } from 'express';
import { OffersController } from '../controller/OffersController';
import {
    validateCreateOffer,
    validateUpdateOffer,
    validateGetOffer,
    validateDeleteOffer,
    handleValidationResult
} from '../validation/offerValidation';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';
import { uploadNone } from '../middleware/UploadMiddleware';
import { RateLimitMiddleware } from '../middleware/RateLimitMiddleware';
import { RateLimitConfigurations } from '../../infrastructure/config/RateLimitConfigurations';
import Container from '../../infrastructure/di/container';


export function createOffersRouter(offersController: OffersController) {
    const router = Router();

    // Get rate limit service from container
    const rateLimitService = Container.getRateLimitService();

    // Create rate limiters for different operations
    const writeLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.WRITE_OPERATIONS
    );

    const deleteLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.DELETE_OPERATIONS
    );


    router.post(
        '/offers',
        writeLimit.handle(), 
        uploadNone,
        validateCreateOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.create(req, res)
    );


    router.get(
        '/offers/details',
        (req: Request, res: Response) => offersController.getAllWithDetailsPaginated(req, res)
    );

    router.get(
        '/offers',
        (req: Request, res: Response) => offersController.getAll(req, res)
    );

    router.get(
        '/offers/:id',
        validateGetOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.getById(req, res)
    );

    router.put(
        '/offers/:id',
        writeLimit.handle(), 
        uploadNone,
        validateUpdateOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.update(req, res)
    );

    router.delete(
        '/offers/:id',
        deleteLimit.handle(),
        validateDeleteOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.delete(req, res)
    );

    return router;
}


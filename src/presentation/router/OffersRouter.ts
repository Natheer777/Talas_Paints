import { Router, Request, Response } from 'express';
import { OffersController } from '../controller/OffersController';
import {
    validateCreateOffer,
    validateUpdateOffer,
    validateGetOffer,
    validateDeleteOffer,
    validateGetActiveOffersByProductId,
    validateCalculateOffer,
    handleValidationResult
} from '../validation/offerValidation';
import { ValidationMiddleware } from '../middleware/ValidationMiddleware';


export function createOffersRouter(offersController: OffersController) {
    const router = Router();

    // Calculate offer for a product (must be before /:id route)
    router.post(
        '/offers/calculate',
        validateCalculateOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.calculateOffer(req, res)
    );

    // Get active offers by product ID
    router.get(
        '/offers/product/:productId',
        validateGetActiveOffersByProductId,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.getActiveOffersByProductId(req, res)
    );

    // Create a new offer
    router.post(
        '/offers',
        validateCreateOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.create(req, res)
    );

    // Get all offers
    router.get(
        '/offers',
        (req: Request, res: Response) => offersController.getAll(req, res)
    );

    // Get offer by ID
    router.get(
        '/offers/:id',
        validateGetOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.getById(req, res)
    );

    // Update an offer
    router.put(
        '/offers/:id',
        validateUpdateOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.update(req, res)
    );

    // Delete an offer
    router.delete(
        '/offers/:id',
        validateDeleteOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.delete(req, res)
    );

    return router;
}

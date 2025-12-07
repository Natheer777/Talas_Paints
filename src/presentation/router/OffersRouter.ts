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


export function createOffersRouter(offersController: OffersController) {
    const router = Router();


    router.post(
        '/offers',
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
        uploadNone,
        validateUpdateOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.update(req, res)
    );

    router.delete(
        '/offers/:id',
        validateDeleteOffer,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => offersController.delete(req, res)
    );

    return router;
}


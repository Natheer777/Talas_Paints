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

export function createAdsCardRouter(adsCardController: AdsCardController) {
    const router = Router();

    router.post(
        '/ads-cards',
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
        uploadSingle,
        validateUpdateAdsCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => adsCardController.update(req, res)
    );

    router.delete(
        '/ads-cards/:id',
        validateDeleteAdsCard,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => adsCardController.delete(req, res)
    );

    return router;
}








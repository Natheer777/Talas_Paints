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


export function createPaymentMethodRouter(paymentMethodController: PaymentMethodController) {
    const router = Router();

    router.post(
        '/payment-methods',
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
        uploadQRCode,
        validateUpdatePaymentMethod,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => paymentMethodController.update(req, res)
    );

    router.delete(
        '/payment-methods/:id',
        validateDeletePaymentMethod,
        handleValidationResult,
        ValidationMiddleware.handleValidationErrors(),
        (req: Request, res: Response) => paymentMethodController.delete(req, res)
    );

    return router;
}

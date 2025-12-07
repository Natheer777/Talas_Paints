import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { PaymentMethodStatus } from '@/domian/entities/PaymentMethod';

export const validateCreatePaymentMethod: ValidationChain[] = [
    body('status')
        .optional()
        .isString()
        .isIn(Object.values(PaymentMethodStatus))
        .withMessage(`الحالة يجب أن تكون واحدة من: ${Object.values(PaymentMethodStatus).join(', ')}`)
];

export const validateUpdatePaymentMethod: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف طريقة الدفع غير صحيح'),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(PaymentMethodStatus))
        .withMessage(`الحالة يجب أن تكون واحدة من: ${Object.values(PaymentMethodStatus).join(', ')}`)
];

export const validateGetPaymentMethod: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف طريقة الدفع غير صحيح')
];

export const validateDeletePaymentMethod: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف طريقة الدفع غير صحيح')
];

export function handleValidationResult(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
}

import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { PaymentMethodType } from '@/domian/entities/Cart';

export const validateAddToCart: ValidationChain[] = [
    body('productId')
        .isUUID()
        .withMessage('معرف المنتج مطلوب ويجب أن يكون بتنسيق صحيح'),

    body('quantity')
        .isInt({ min: 1 })
        .withMessage('الكمية يجب أن تكون رقماً صحيحاً أكبر من صفر'),

    body('customerName')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('اسم العميل أو الشركة مطلوب'),

    body('phoneNumber')
        .notEmpty()
        .isLength({ min: 7, max: 15 })
        .withMessage('رقم الهاتف مطلوب ويجب أن يكون بتنسيق صحيح (مثال: +1234567890 أو 1234567890)'),

    body('areaName')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('اسم المنطقة مطلوب'),

    body('streetName')
        .optional()
        .isString()
        .trim()
        .withMessage('اسم الشارع يجب أن يكون نصاً'),

    body('buildingNumber')
        .optional()
        .isString()
        .trim()
        .withMessage('رقم المبنى أو المحل يجب أن يكون نصاً'),

    body('additionalNotes')
        .optional()
        .isString()
        .trim()
        .withMessage('الملاحظات الإضافية يجب أن تكون نصاً'),

    body('paymentMethod')
        .isString()
        .isIn(Object.values(PaymentMethodType))
        .withMessage(`طريقة الدفع يجب أن تكون واحدة من: ${Object.values(PaymentMethodType).join(', ')}`)
];

export const validateUpdateCartItem: ValidationChain[] = [
    body('phoneNumber')
        .notEmpty()
        .isLength({ min: 7, max: 15 })
        .withMessage('رقم الهاتف مطلوب ويجب أن يكون بتنسيق صحيح (مثال: +1234567890 أو 1234567890)'),

    body('cartItemId')
        .isUUID()
        .withMessage('معرف عنصر السلة مطلوب ويجب أن يكون بتنسيق صحيح'),

    body('quantity')
        .isInt({ min: 1 })
        .withMessage('الكمية يجب أن تكون رقماً صحيحاً أكبر من صفر')
];

export const validateGetCart: ValidationChain[] = [
    query('phoneNumber')
        .notEmpty()
        .isLength({ min: 7, max: 15 })
        .withMessage('رقم الهاتف مطلوب ويجب أن يكون بتنسيق صحيح (مثال: +1234567890 أو 1234567890)')
];

export const validateRemoveFromCart: ValidationChain[] = [
    body('phoneNumber')
        .notEmpty()
        .isLength({ min: 7, max: 15 })
        .withMessage('رقم الهاتف مطلوب ويجب أن يكون بتنسيق صحيح (مثال: +1234567890 أو 1234567890)'),

    body('cartItemId')
        .isUUID()
        .withMessage('معرف عنصر السلة مطلوب ويجب أن يكون بتنسيق صحيح')
];

export const validateClearCart: ValidationChain[] = [
    body('phoneNumber')
        .notEmpty()
        .isLength({ min: 7, max: 15 })
        .withMessage('رقم الهاتف مطلوب ويجب أن يكون بتنسيق صحيح (مثال: +1234567890 أو 1234567890)')
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

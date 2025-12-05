import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { OfferType, OfferStatus } from '@/domian/entities/Offer';


export const validateCreateOffer: ValidationChain[] = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage('الاسم مطلوب')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('الاسم يجب أن يكون بين 2 و 255 حرفاً'),

    body('description')
        .isString()
        .notEmpty()
        .withMessage('الوصف مطلوب ويجب أن يكون نصاً')
        .trim(),

    body('type')
        .isString()
        .notEmpty()
        .withMessage('النوع مطلوب')
        .isIn(Object.values(OfferType))
        .withMessage(`النوع يجب أن يكون واحد من: ${Object.values(OfferType).join(', ')}`),

    body('product_id')
        .isString()
        .notEmpty()
        .withMessage('معرف المنتج مطلوب')
        .isUUID()
        .withMessage('معرف المنتج يجب أن يكون UUID صحيح'),

    body('discount_percentage')
        .optional()
        .isFloat({ min: 0.01, max: 100 })
        .withMessage('نسبة الخصم يجب أن تكون بين 0.01 و 100'),

    body('buy_quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('كمية الشراء يجب أن تكون رقماً صحيحاً موجباً'),

    body('get_quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('كمية الحصول يجب أن تكون رقماً صحيحاً موجباً'),

    body('status')
        .isString()
        .notEmpty()
        .withMessage('الحالة مطلوبة')
        .isIn(Object.values(OfferStatus))
        .withMessage(`الحالة يجب أن تكون واحدة من: ${Object.values(OfferStatus).join(', ')}`),

    body('discount_percentage')
        .custom((value, { req }) => {
            if (req.body.type === OfferType.PERCENTAGE_DISCOUNT) {
                if (value === undefined || value === null) {
                    throw new Error('نسبة الخصم مطلوبة لعروض الخصم النسبي');
                }
                if (value <= 0 || value > 100) {
                    throw new Error('نسبة الخصم يجب أن تكون بين 1 و 100');
                }
            }
            return true;
        }),
    body('buy_quantity')
        .custom((value, { req }) => {
            if (req.body.type === OfferType.BUY_X_GET_Y_FREE) {
                if (!value || value <= 0) {
                    throw new Error('كمية الشراء مطلوبة ويجب أن تكون أكبر من 0 لهذا النوع من العروض');
                }
            }
            return true;
        }),
    body('get_quantity')
        .custom((value, { req }) => {
            if (req.body.type === OfferType.BUY_X_GET_Y_FREE) {
                if (!value || value <= 0) {
                    throw new Error('كمية الحصول مطلوبة ويجب أن تكون أكبر من 0 لهذا النوع من العروض');
                }
            }
            return true;
        })
];


export const validateUpdateOffer: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف العرض غير صحيح'),

    body('name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('الاسم يجب أن يكون بين 2 و 255 حرفاً'),

    body('description')
        .optional()
        .isString()
        .trim(),

    body('type')
        .optional()
        .isString()
        .isIn(Object.values(OfferType))
        .withMessage(`النوع يجب أن يكون واحد من: ${Object.values(OfferType).join(', ')}`),

    body('product_id')
        .optional()
        .isString()
        .isUUID()
        .withMessage('معرف المنتج يجب أن يكون UUID صحيح'),

    body('discount_percentage')
        .optional()
        .isFloat({ min: 0.01, max: 100 })
        .withMessage('نسبة الخصم يجب أن تكون بين 0.01 و 100'),

    body('buy_quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('كمية الشراء يجب أن تكون رقماً صحيحاً موجباً'),

    body('get_quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('كمية الحصول يجب أن تكون رقماً صحيحاً موجباً'),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(OfferStatus))
        .withMessage(`الحالة يجب أن تكون واحدة من: ${Object.values(OfferStatus).join(', ')}`)
];


export const validateGetOffer: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف العرض غير صحيح')
];


export const validateDeleteOffer: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف العرض غير صحيح')
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

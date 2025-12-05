import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AdsCardStatus } from '@/domian/entities/AdsCard';

export const validateCreateAdsCard: ValidationChain[] = [
    body('title')
        .isString()
        .notEmpty()
        .withMessage('العنوان مطلوب')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('العنوان يجب أن يكون بين 2 و 255 حرفاً'),

    body('text')
        .isString()
        .notEmpty()
        .withMessage('النص مطلوب')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('النص يجب أن يكون بين 10 و 1000 حرفاً'),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(AdsCardStatus))
        .withMessage(`الحالة يجب أن تكون واحدة من: ${Object.values(AdsCardStatus).join(', ')}`)
];

export const validateUpdateAdsCard: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف بطاقة الإعلان غير صحيح'),

    body('title')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('العنوان يجب أن يكون بين 2 و 255 حرفاً'),

    body('text')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('النص يجب أن يكون بين 10 و 1000 حرفاً'),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(AdsCardStatus))
        .withMessage(`الحالة يجب أن تكون واحدة من: ${Object.values(AdsCardStatus).join(', ')}`)
];

export const validateGetAdsCard: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف بطاقة الإعلان غير صحيح')
];

export const validateDeleteAdsCard: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف بطاقة الإعلان غير صحيح')
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


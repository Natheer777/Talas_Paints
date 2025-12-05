import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateCreateCategory: ValidationChain[] = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage('الاسم مطلوب ويجب أن يكون نصاً')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('الاسم يجب أن يكون بين 2 و 100 حرفاً'),
];

export const validateUpdateCategory: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف الفئة غير صحيح'),

    body('name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('الاسم يجب أن يكون بين 2 و 100 حرفاً'),
];

export const validateGetCategory: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف الفئة غير صحيح'),
];

export const validateDeleteCategory: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف الفئة غير صحيح'),
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

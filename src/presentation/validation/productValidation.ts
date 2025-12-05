import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export function parseMultipartArrays(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.body.sizes && typeof req.body.sizes === 'string') {
            try {
                req.body.sizes = JSON.parse(req.body.sizes);
            } catch (e) {
                return next();
            }
        }
        if (req.body.colors && typeof req.body.colors === 'string') {
            try {
                req.body.colors = JSON.parse(req.body.colors);
            } catch (e) {
                if (req.body.colors.includes(',')) {
                    req.body.colors = req.body.colors.split(',').map((c: string) => c.trim()).filter((c: string) => c);
                } else {
                    req.body.colors = [req.body.colors.trim()];
                }
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}

export const validateCreateProduct: ValidationChain[] = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage('الاسم مطلوب ويجب أن يكون نصاً')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('الاسم يجب أن يكون بين 2 و 255 حرفاً'),

    body('description')
        .isString()
        .notEmpty()
        .withMessage('الوصف مطلوب ويجب أن يكون نصاً')
        .trim(),

    body('category')
        .customSanitizer((value) => {
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                return undefined;
            }
            return typeof value === 'string' ? value.trim() : value;
        })
        .isString()
        .notEmpty()
        .withMessage('الفئة مطلوبة ويجب أن تكون نصاً')
        .isLength({ min: 2, max: 100 })
        .withMessage('الفئة يجب أن تكون بين 2 و 100 حرفاً'),

    body('colors')
        .optional()
        .custom((value) => {
            if (value === undefined || value === null || value === '') {
                return true;
            }
            if (!Array.isArray(value)) {
                return false;
            }
            if (value.length > 0 && !value.every((color: any) => typeof color === 'string' && color.trim() !== '')) {
                return false;
            }
            return true;
        })
        .withMessage('الألوان يجب أن تكون مصفوفة من النصوص'),

    body('sizes')
        .notEmpty()
        .withMessage('الأحجام مطلوبة')
        .isArray({ min: 1 })
        .withMessage('يجب وجود حجم واحد على الأقل'),

    body('sizes.*.size')
        .isString()
        .notEmpty()
        .withMessage('اسم الحجم مطلوب ويجب أن يكون نصاً'),

    body('sizes.*.price')
        .isFloat({ gt: 0 })
        .withMessage('سعر الحجم يجب أن يكون رقماً موجباً'),

    body('status')
        .notEmpty()
        .withMessage('الحالة مطلوبة')
        .isIn(['visible', 'hidden'])
        .withMessage('الحالة يجب أن تكون إما "visible" أو "hidden"'),
];

export const validateUpdateProduct: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف المنتج غير صحيح'),

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

    body('category')
        .optional()
        .customSanitizer((value) => {
            // Handle empty string or undefined
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                return undefined;
            }
            return typeof value === 'string' ? value.trim() : value;
        })
        .optional()
        .isString()
        .isLength({ min: 2, max: 100 })
        .withMessage('الفئة يجب أن تكون بين 2 و 100 حرفاً'),

    body('colors')
        .optional()
        .custom((value) => {
            // If not provided, it's optional
            if (value === undefined || value === null || value === '') {
                return true;
            }
            // Must be an array after parsing
            if (!Array.isArray(value)) {
                return false;
            }
            // Each element must be a non-empty string
            if (value.length > 0 && !value.every((color: any) => typeof color === 'string' && color.trim() !== '')) {
                return false;
            }
            return true;
        })
        .withMessage('الألوان يجب أن تكون مصفوفة من النصوص'),

    body('sizes')
        .optional()
        .isArray({ min: 1 })
        .withMessage('يجب وجود حجم واحد على الأقل عند تحديث الأحجام'),

    body('sizes.*.size')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('اسم الحجم مطلوب ويجب أن يكون نصاً'),

    body('sizes.*.price')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('سعر الحجم يجب أن يكون رقماً موجباً'),

    body('status')
        .optional()
        .isIn(['visible', 'hidden'])
        .withMessage('الحالة يجب أن تكون إما "visible" أو "hidden"'),

    body('keepExistingImages')
        .optional()
        .isString()
        .isIn(['true', 'false'])
        .withMessage('keepExistingImages يجب أن يكون "true" أو "false"'),
];

export const validateGetProduct: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف المنتج غير صحيح'),
];

export const validateDeleteProduct: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف المنتج غير صحيح'),
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

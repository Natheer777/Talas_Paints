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
        .withMessage('Name is required and must be a string')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Name must be between 2 and 255 characters'),

    body('description')
        .isString()
        .notEmpty()
        .withMessage('Description is required and must be a string')
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
        .withMessage('Category is required and must be a string')
        .isLength({ min: 2, max: 100 })
        .withMessage('Category must be between 2 and 100 characters'),

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
        .withMessage('Colors must be an array of strings'),

    body('sizes')
        .notEmpty()
        .withMessage('Sizes are required')
        .isArray({ min: 1 })
        .withMessage('At least one size is required'),

    body('sizes.*.size')
        .isString()
        .notEmpty()
        .withMessage('Size name is required and must be a string'),

    body('sizes.*.price')
        .isFloat({ gt: 0 })
        .withMessage('Size price must be a positive number'),

    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['visible', 'hidden'])
        .withMessage('Status must be either "visible" or "hidden"'),
];

export const validateUpdateProduct: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid product ID format'),

    body('name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Name must be between 2 and 255 characters'),

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
        .withMessage('Category must be between 2 and 100 characters'),

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
        .withMessage('Colors must be an array of strings'),

    body('sizes')
        .optional()
        .isArray({ min: 1 })
        .withMessage('At least one size is required when updating sizes'),

    body('sizes.*.size')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('Size name is required and must be a string'),

    body('sizes.*.price')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('Size price must be a positive number'),

    body('status')
        .optional()
        .isIn(['visible', 'hidden'])
        .withMessage('Status must be either "visible" or "hidden"'),

    body('keepExistingImages')
        .optional()
        .isString()
        .isIn(['true', 'false'])
        .withMessage('keepExistingImages must be "true" or "false"'),
];

export const validateGetProduct: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid product ID format'),
];

export const validateDeleteProduct: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid product ID format'),
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

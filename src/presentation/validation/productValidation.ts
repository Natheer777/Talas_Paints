import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

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
        .isString()
        .notEmpty()
        .withMessage('Category is required and must be a string')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category must be between 2 and 100 characters'),

    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ gt: 0 })
        .withMessage('Price must be a positive number'),
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
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category must be between 2 and 100 characters'),

    body('price')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('Price must be a positive number'),

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

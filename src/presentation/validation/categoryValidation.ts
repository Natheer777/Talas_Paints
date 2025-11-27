import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateCreateCategory: ValidationChain[] = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage('Name is required and must be a string')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
];

export const validateUpdateCategory: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid category ID format'),

    body('name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
];

export const validateGetCategory: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid category ID format'),
];

export const validateDeleteCategory: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid category ID format'),
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

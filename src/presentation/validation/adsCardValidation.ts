import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AdsCardStatus } from '@/domian/entities/AdsCard';

export const validateCreateAdsCard: ValidationChain[] = [
    body('title')
        .isString()
        .notEmpty()
        .withMessage('Title is required')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Title must be between 2 and 255 characters'),

    body('text')
        .isString()
        .notEmpty()
        .withMessage('Text is required')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Text must be between 10 and 1000 characters'),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(AdsCardStatus))
        .withMessage(`Status must be one of: ${Object.values(AdsCardStatus).join(', ')}`)
];

export const validateUpdateAdsCard: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid ads card ID format'),

    body('title')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Title must be between 2 and 255 characters'),

    body('text')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Text must be between 10 and 1000 characters'),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(AdsCardStatus))
        .withMessage(`Status must be one of: ${Object.values(AdsCardStatus).join(', ')}`)
];

export const validateGetAdsCard: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid ads card ID format')
];

export const validateDeleteAdsCard: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid ads card ID format')
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

import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { OfferType, OfferStatus } from '@/domian/entities/Offer';


export const validateCreateOffer: ValidationChain[] = [
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

    body('type')
        .isString()
        .notEmpty()
        .withMessage('Type is required')
        .isIn(Object.values(OfferType))
        .withMessage(`Type must be one of: ${Object.values(OfferType).join(', ')}`),

    body('product_id')
        .isString()
        .notEmpty()
        .withMessage('Product ID is required')
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),

    body('discount_percentage')
        .optional()
        .isFloat({ min: 0.01, max: 100 })
        .withMessage('Discount percentage must be between 0.01 and 100'),

    body('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date')
        .toDate(),

    body('end_date')
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
        .toDate()
        .custom((value, { req }) => {
            const startDate = new Date(req.body.start_date);
            const endDate = new Date(value);
            if (endDate <= startDate) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),

    body('status')
        .isString()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(Object.values(OfferStatus))
        .withMessage(`Status must be one of: ${Object.values(OfferStatus).join(', ')}`)
        .withMessage('Name must be between 2 and 255 characters'),

    body('description')
        .optional()
        .isString()
        .trim(),

    body('type')
        .optional()
        .isString()
        .isIn(Object.values(OfferType))
        .withMessage(`Type must be one of: ${Object.values(OfferType).join(', ')}`),

    body('product_id')
        .optional()
        .isString()
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),

    body('discount_percentage')
        .optional()
        .isFloat({ min: 0.01, max: 100 })
        .withMessage('Discount percentage must be between 0.01 and 100'),

    body('start_date')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date')
        .toDate(),

    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
        .toDate(),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(OfferStatus))
        .withMessage(`Status must be one of: ${Object.values(OfferStatus).join(', ')}`)
];

export const validateUpdateOffer: ValidationChain[]=[
    param('id')
        .isUUID()
        .withMessage('Invalid offer ID format'),
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
    body('type')
        .isString()
        .notEmpty()
        .withMessage('Type is required')
        .isIn(Object.values(OfferType))
        .withMessage(`Type must be one of: ${Object.values(OfferType).join(', ')}`),
    body('product_id')
        .isString()
        .notEmpty()
        .withMessage('Product ID is required')
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),
    body('discount_percentage')
        .optional()
        .isFloat({ min: 0.01, max: 100 })
        .withMessage('Discount percentage must be between 0.01 and 100'),
    body('start_date')
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date')
        .toDate(),
    body('end_date')
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date')
        .toDate()
        .custom((value, { req }) => {
            const startDate = new Date(req.body.start_date);
            const endDate = new Date(value);
            if (endDate <= startDate) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    body('status')
        .isString()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(Object.values(OfferStatus))
        .withMessage(`Status must be one of: ${Object.values(OfferStatus).join(', ')}`) 
]

export const validateGetOffer: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid offer ID format')
];


export const validateDeleteOffer: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid offer ID format')
];


export const validateGetActiveOffersByProductId: ValidationChain[] = [
    param('productId')
        .isUUID()
        .withMessage('Invalid product ID format')
];


export const validateCalculateOffer: ValidationChain[] = [
    body('productId')
        .isString()
        .notEmpty()
        .withMessage('Product ID is required')
        .isUUID()
        .withMessage('Product ID must be a valid UUID'),

    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ gt: 0 })
        .withMessage('Price must be a positive number'),

    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer')
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

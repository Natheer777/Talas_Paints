import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { OfferType, OfferStatus } from '@/domian/entities/Offer';

/**
 * Validation for creating an offer
 */
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

    body('buy_quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Buy quantity must be a positive integer'),

    body('get_quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Get quantity must be a positive integer'),

    body('status')
        .isString()
        .notEmpty()
        .withMessage('Status is required')
        .isIn(Object.values(OfferStatus))
        .withMessage(`Status must be one of: ${Object.values(OfferStatus).join(', ')}`),

    body('discount_percentage')
        .custom((value, { req }) => {
            if (req.body.type === OfferType.PERCENTAGE_DISCOUNT) {
                if (value === undefined || value === null) {
                    throw new Error('Discount percentage is required for percentage discount offers');
                }
                if (value <= 0 || value > 100) {
                    throw new Error('Discount percentage must be between 1 and 100');
                }
            }
            return true;
        }),
    body('buy_quantity')
        .custom((value, { req }) => {
            if (req.body.type === OfferType.BUY_X_GET_Y_FREE) {
                if (!value || value <= 0) {
                    throw new Error('Buy quantity is required and must be greater than 0 for this offer type');
                }
            }
            return true;
        }),
    body('get_quantity')
        .custom((value, { req }) => {
            if (req.body.type === OfferType.BUY_X_GET_Y_FREE) {
                if (!value || value <= 0) {
                    throw new Error('Get quantity is required and must be greater than 0 for this offer type');
                }
            }
            return true;
        })
];


export const validateUpdateOffer: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('Invalid offer ID format'),

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

    body('buy_quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Buy quantity must be a positive integer'),

    body('get_quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Get quantity must be a positive integer'),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(OfferStatus))
        .withMessage(`Status must be one of: ${Object.values(OfferStatus).join(', ')}`)
];


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

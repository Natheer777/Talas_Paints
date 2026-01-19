import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '@/domian/entities/Order';

export const validateCreateOrder: ValidationChain[] = [
    body('phoneNumber')
        .notEmpty()
        .isLength({ min: 7, max: 15 })
        .withMessage('Phone number is required and must be in valid format'),
    body('customerName')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Customer name is required'),
    body('areaName')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Area name is required'),
    body('streetName')
        .optional()
        .isString()
        .trim()
        .withMessage('Street name must be a string'),
    body('buildingNumber')
        .optional()
        .isString()
        .trim()
        .withMessage('Building number must be a string'),
    body('additionalNotes')
        .optional()
        .isString()
        .trim()
        .withMessage('Additional notes must be a string'),
    body('deliveryAgentName')
        .isString()
        .trim()
        .notEmpty()
        .isIn(['ابو بسام', 'ابو حسام', 'ابو ماجد', 'ابو ليث', 'مؤسسة طلس'])
        .withMessage('Delivery agent name must be one of: ابو بسام, ابو حسام, ابو ماجد, ابو ليث, مؤسسة طلس'),
    body('paymentMethod')
        .isString()
        .isIn(['cash_on_delivery', 'electronic_payment'])
        .withMessage('Payment method must be either cash_on_delivery or electronic_payment'),
    // Support both formats: items array OR productId/quantity arrays
    body('items')
        .optional()
        .custom((value) => {
            if (value && !Array.isArray(value)) {
                throw new Error('Items must be an array');
            }
            return true;
        }),
    body('items.*.productId')
        .optional()
        .isUUID()
        .withMessage('Each item must have a valid product ID'),
    body('items.*.quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Each item must have a quantity greater than 0'),
    body('items.*.color')
        .optional()
        .isString()
        .trim()
        .withMessage('Color must be a string'),
    body('items.*.size')
        .optional()
        .isString()
        .trim()
        .withMessage('Size must be a string'),
    body('items.*.price')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('Price must be a positive number'),
    // Validate productId and quantity arrays (for multipart/form-data format)
    body('productId')
        .optional()
        .custom((value, { req }) => {
            // If productId is provided, quantity must also be provided
            if (value && !req.body.quantity) {
                throw new Error('quantity is required when productId is provided');
            }
            // If both are arrays, they must have same length
            if (Array.isArray(value) && Array.isArray(req.body.quantity)) {
                if (value.length !== req.body.quantity.length) {
                    throw new Error('productId and quantity arrays must have the same length');
                }
            }
            return true;
        }),
    body('productId.*')
        .optional()
        .isUUID()
        .withMessage('Each productId must be a valid UUID'),
    body('quantity')
        .optional()
        .custom((value, { req }) => {
            // If quantity is provided, productId must also be provided
            if (value && !req.body.productId) {
                throw new Error('productId is required when quantity is provided');
            }
            return true;
        }),
    body('quantity.*')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Each quantity must be greater than 0'),
    body('color')
        .optional()
        .custom((value) => {
            if (value && !Array.isArray(value) && typeof value !== 'string') {
                throw new Error('color must be an array or a comma-separated string');
            }
            return true;
        }),
    body('size')
        .optional()
        .custom((value) => {
            if (value && !Array.isArray(value) && typeof value !== 'string') {
                throw new Error('size must be an array or a comma-separated string');
            }
            return true;
        }),
    body('price')
        .optional()
        .custom((value) => {
            if (value && !Array.isArray(value) && typeof value !== 'string') {
                throw new Error('price must be an array or a comma-separated string');
            }
            return true;
        }),
    // Ensure at least one format is provided
    body()
        .custom((value) => {
            const hasItems = value.items && Array.isArray(value.items) && value.items.length > 0;
            const hasProductIdQuantity = value.productId && value.quantity;

            if (!hasItems && !hasProductIdQuantity) {
                throw new Error('Either items array or productId/quantity must be provided');
            }
            return true;
        })
];

export const validateGetOrder: ValidationChain[] = [
    param('orderId')
        .isUUID()
        .withMessage('Order ID must be a valid UUID')
];

export const validateGetOrdersByPhoneNumber: ValidationChain[] = [
    query('phoneNumber')
        .notEmpty()
        .isLength({ min: 7, max: 15 })
        .withMessage('Phone number is required and must be in valid format')
];

export const validateUpdateOrderStatus: ValidationChain[] = [
    param('orderId')
        .isUUID()
        .withMessage('Order ID must be a valid UUID'),
    body('status')
        .isString()
        .isIn(Object.values(OrderStatus))
        .withMessage(`Status must be one of: ${Object.values(OrderStatus).join(', ')}`)
];

export const validateGetOrdersForAdmin: ValidationChain[] = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('Limit must be an integer between 1 and 1000')
];

export const validateDeleteOrder: ValidationChain[] = [
    param('orderId')
        .isUUID()
        .withMessage('Order ID must be a valid UUID')
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


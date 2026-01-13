import { body, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRegisterFcmToken: ValidationChain[] = [
    body()
        .custom((body) => {
            const hasPhone = body.phone_number && body.phone_number.trim();
            const hasAdminEmail = body.admin_email && body.admin_email.trim();

            if (!hasPhone && !hasAdminEmail) {
                throw new Error('Either phone_number (for customers) or admin_email (for admins) must be provided');
            }

            if (hasPhone && hasAdminEmail) {
                throw new Error('Cannot provide both phone_number and admin_email. Choose one based on user type');
            }

            return true;
        }),

    body('phone_number')
        .optional()
        .isLength({ min: 7, max: 20 })
        .withMessage('Phone number must be between 7 and 20 characters')
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('Phone number must contain only numbers and allowed characters'),

    body('admin_email')
        .optional()
        .isEmail()
        .withMessage('Admin email must be a valid email address')
        .normalizeEmail(),

    body('token')
        .notEmpty()
        .withMessage('FCM token is required')
        .isString()
        .withMessage('FCM token must be a string')
        .trim()
        .isLength({ min: 1 })
        .withMessage('FCM token cannot be empty'),

    body('device_type')
        .optional()
        .isString()
        .withMessage('Device type must be a string')
        .isIn(['android', 'ios', 'web', 'other'])
        .withMessage('Device type must be one of: android, ios, web, other')
        .default('web')
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
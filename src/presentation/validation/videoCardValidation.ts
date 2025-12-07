import { body, param, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { VideoStatus } from '@/domian/entities/VideoCard';

export const validateCreateVideoCard: ValidationChain[] = [
    body('title')
        .isString()
        .notEmpty()
        .withMessage('عنوان الفيديو مطلوب')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('العنوان يجب أن يكون بين 2 و 255 حرفاً'),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(VideoStatus))
        .withMessage(`الحالة يجب أن تكون واحدة من: ${Object.values(VideoStatus).join(', ')}`)
];

export const validateUpdateVideoCard: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف بطاقة الفيديو غير صحيح'),

    body('title')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('العنوان يجب أن يكون بين 2 و 255 حرفاً'),

    body('status')
        .optional()
        .isString()
        .isIn(Object.values(VideoStatus))
        .withMessage(`الحالة يجب أن تكون واحدة من: ${Object.values(VideoStatus).join(', ')}`)
];

export const validateGetVideoCard: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف بطاقة الفيديو غير صحيح')
];

export const validateDeleteVideoCard: ValidationChain[] = [
    param('id')
        .isUUID()
        .withMessage('تنسيق معرف بطاقة الفيديو غير صحيح')
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

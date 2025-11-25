import { body, ValidationChain, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateCreateProduct: ValidationChain[] = [
    body('name').isString().notEmpty(),
    body('description').isString().notEmpty(),
    body('category').isString().notEmpty(),
    body('price').isFloat({ gt: 0 }),
    body('images').optional().isArray(),
    body('images.*').optional().isURL(),
];
export const vliadateDeleteProduct: ValidationChain[]=[
    body('id').isUUID()
]

export function handleValidationResult(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
    
}

import { Request, Response } from 'express';
import {
    CreatePaymentMethodUseCase,
    UpdatePaymentMethodUseCase,
    DeletePaymentMethodUseCase,
    GetAllPaymentMethodsUseCase,
    GetPaymentMethodByIdUseCase,
    GetVisiblePaymentMethodsUseCase
} from '@/application/use-cases/PaymentMethod/index';

export class PaymentMethodController {
    constructor(
        private createPaymentMethodUseCase: CreatePaymentMethodUseCase,
        private updatePaymentMethodUseCase: UpdatePaymentMethodUseCase,
        private deletePaymentMethodUseCase: DeletePaymentMethodUseCase,
        private getAllPaymentMethodsUseCase: GetAllPaymentMethodsUseCase,
        private getPaymentMethodByIdUseCase: GetPaymentMethodByIdUseCase,
        private getVisiblePaymentMethodsUseCase: GetVisiblePaymentMethodsUseCase
    ) { }

    async create(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const qrCodeFile = req.file as Express.Multer.File;

            if (!qrCodeFile) {
                return res.status(400).json({
                    success: false,
                    message: 'QR code image file is required'
                });
            }

            const result = await this.createPaymentMethodUseCase.execute({
                status,
                qrCodeFile
            });

            return res.status(201).json({
                success: true,
                data: result,
                message: 'Payment method created successfully'
            });
        } catch (error: any) {
            console.error('Create Payment Method Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not create payment method'
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const qrCodeFile = req.file as Express.Multer.File | undefined;

            const result = await this.updatePaymentMethodUseCase.execute(id, {
                status,
                qrCodeFile
            });

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment method not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: result,
                message: 'Payment method updated successfully'
            });
        } catch (error: any) {
            console.error('Update Payment Method Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not update payment method'
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.deletePaymentMethodUseCase.execute(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment method not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Payment method deleted successfully'
            });
        } catch (error: any) {
            console.error('Delete Payment Method Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not delete payment method'
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const result = await this.getAllPaymentMethodsUseCase.execute();

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length
            });
        } catch (error: any) {
            console.error('Get All Payment Methods Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Could not retrieve payment methods'
            });
        }
    }

    async getVisible(req: Request, res: Response) {
        try {
            const result = await this.getVisiblePaymentMethodsUseCase.execute();

            return res.status(200).json({
                success: true,
                data: result,
                count: result.length
            });
        } catch (error: any) {
            console.error('Get Visible Payment Methods Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Could not retrieve visible payment methods'
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await this.getPaymentMethodByIdUseCase.execute(id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment method not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error: any) {
            console.error('Get Payment Method By ID Error:', error);
            return res.status(404).json({
                success: false,
                message: error.message || 'Payment method not found'
            });
        }
    }
}

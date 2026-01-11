import { Request, Response } from 'express';
import { RegisterFcmTokenUseCase } from '@/application/use-cases/Notification/RegisterFcmTokenUseCase';

export class NotificationController {
    constructor(
        private registerFcmTokenUseCase: RegisterFcmTokenUseCase
    ) { }

    async registerFcmToken(req: Request, res: Response) {
        try {
            const { phone_number, token, device_type } = req.body;

            const result = await this.registerFcmTokenUseCase.execute({
                phone_number,
                token,
                device_type
            });

            return res.status(200).json({
                success: true,
                data: result,
                message: 'FCM token registered successfully'
            });
        } catch (error: any) {
            console.error('Register FCM Token Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not register FCM token'
            });
        }
    }
}


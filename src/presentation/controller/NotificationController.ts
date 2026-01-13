import { Request, Response } from 'express';
import { RegisterFcmTokenUseCase } from '@/application/use-cases/Notification/RegisterFcmTokenUseCase';

export class NotificationController {
    constructor(
        private registerFcmTokenUseCase: RegisterFcmTokenUseCase
    ) { }

    async registerFcmToken(req: Request, res: Response) {
        try {
            const { phone_number, admin_email, token, device_type } = req.body;

            console.log(`📱 Registering FCM token for: ${phone_number ? `Customer ${phone_number}` : `Admin ${admin_email}`}`);

            const result = await this.registerFcmTokenUseCase.execute({
                phone_number,
                admin_email,
                token,
                device_type: device_type || 'web'
            });

            const userType = phone_number ? 'Customer' : 'Admin';
            const identifier = phone_number || admin_email;

            console.log(`✅ FCM token registered successfully for ${userType}: ${identifier}`);

            return res.status(200).json({
                success: true,
                data: result,
                message: `${userType} FCM token registered successfully for ${identifier}`
            });
        } catch (error: any) {
            console.error('❌ Register FCM Token Error:', error.message);
            return res.status(400).json({
                success: false,
                message: error.message || 'Could not register FCM token'
            });
        }
    }
}
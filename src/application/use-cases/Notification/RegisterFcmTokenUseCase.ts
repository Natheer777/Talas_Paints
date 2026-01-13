import { IFcmTokenRepository } from '@/domian/repository/IFcmTokenRepository';
import { FcmToken } from '@/domian/entities/FcmToken';

export interface RegisterFcmTokenDTO {
    phone_number?: string;
    admin_email?: string;
    token: string;
    device_type?: string;
}

export class RegisterFcmTokenUseCase {
    constructor(private fcmTokenRepository: IFcmTokenRepository) { }

    async execute(dto: RegisterFcmTokenDTO): Promise<FcmToken> {
        const { phone_number, admin_email, token, device_type } = dto;

        // Validate that exactly one of phone_number or admin_email is provided
        if (!phone_number && !admin_email) {
            throw new Error('Either phone_number (for customers) or admin_email (for admins) must be provided');
        }

        if (phone_number && admin_email) {
            throw new Error('Cannot provide both phone_number and admin_email. Choose one based on user type');
        }

        // Validate phone number format if provided
        if (phone_number) {
            if (phone_number.length < 7 || phone_number.length > 20) {
                throw new Error('Invalid phone number format - must be 7-20 characters');
            }
            if (!/^[0-9+\-\s()]+$/.test(phone_number)) {
                throw new Error('Invalid phone number format - must contain only numbers and valid characters');
            }
        }

        // Validate admin email format if provided
        if (admin_email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(admin_email)) {
                 throw new Error('Invalid admin email format');
            }
        }

        // Validate token
        if (!token || token.trim().length === 0) {
            throw new Error('FCM token is required');
        }

        // Validate device type
        const validDeviceTypes = ['android', 'ios', 'web', 'other'];
        if (device_type && !validDeviceTypes.includes(device_type)) {
            throw new Error(`Invalid device type. Must be one of: ${validDeviceTypes.join(', ')}`);
        }

        // Save or update the token
        const fcmToken = await this.fcmTokenRepository.save({
            phone_number,
            admin_email,
            token: token.trim(),
            device_type: device_type || 'web'
        });

        console.log(`📱 FCM token saved for ${phone_number ? `customer ${phone_number}` : `admin ${admin_email}`}`);
        return fcmToken;
    }
}
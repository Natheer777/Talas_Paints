import { IFcmTokenRepository } from '@/domian/repository/IFcmTokenRepository';
import { FcmToken } from '@/domian/entities/FcmToken';

export interface RegisterFcmTokenDTO {
    phone_number: string;
    token: string;
    device_type?: string;
}

export class RegisterFcmTokenUseCase {
    constructor(private fcmTokenRepository: IFcmTokenRepository) { }

    async execute(dto: RegisterFcmTokenDTO): Promise<FcmToken> {
        const { phone_number, token, device_type } = dto;

        // Validate phone number format
        if (!phone_number || phone_number.length < 7 || phone_number.length > 20) {
            throw new Error('Invalid phone number format');
        }

        // Validate token
        if (!token || token.trim().length === 0) {
            throw new Error('FCM token is required');
        }

        // Save or update the token
        return await this.fcmTokenRepository.save({
            phone_number,
            token: token.trim(),
            device_type: device_type || undefined
        });
    }
}


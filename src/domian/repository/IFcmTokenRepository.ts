import { FcmToken } from '../entities/FcmToken';

export interface IFcmTokenRepository {
    save(token: Omit<FcmToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<FcmToken>;
    findByPhoneNumber(phoneNumber: string): Promise<FcmToken[]>;
    findByAdminEmail(adminEmail: string): Promise<FcmToken[]>;
    findByToken(token: string): Promise<FcmToken | null>;
    delete(token: string): Promise<void>;
    deleteByToken(token: string): Promise<void>;
    deleteByPhoneNumber(phoneNumber: string): Promise<void>;
}


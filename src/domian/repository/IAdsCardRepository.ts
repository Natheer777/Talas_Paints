import { AdsCard } from '../entities/AdsCard';

export interface IAdsCardRepository {
    create(adsCard: AdsCard): Promise<AdsCard>;
    update(id: string, adsCard: Partial<AdsCard>): Promise<AdsCard | null>;
    delete(id: string): Promise<boolean>;
    getById(id: string): Promise<AdsCard | null>;
    getAll(): Promise<AdsCard[]>;
    getActive(): Promise<AdsCard[]>;
}



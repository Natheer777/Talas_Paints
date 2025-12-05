export enum AdsCardStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface AdsCard {
    id: string;
    title: string;
    text: string;
    imageUrl: string;
    status: AdsCardStatus;
    createdAt: Date;
    updatedAt: Date;
}
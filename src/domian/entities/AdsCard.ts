export enum AdsCardStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export enum MediaType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO'
}

export interface AdsCard {
    id: string;
    title: string;
    text: string;
    mediaUrl: string;
    mediaType: MediaType;
    status: AdsCardStatus;
    createdAt: Date;
    updatedAt: Date;
}
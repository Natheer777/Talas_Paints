export enum VideoStatus {
    VISIBLE = 'visible',
    HIDDEN = 'hidden'
}

export interface VideoCard {
    id: string;
    title: string;
    videoUrl: string;
    status: VideoStatus;
    createdAt: Date;
    updatedAt: Date;
}

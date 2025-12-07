export enum PaymentMethodStatus {
    VISIBLE = 'visible',
    HIDDEN = 'hidden'
}

export interface PaymentMethod {
    id: string;
    qrCodeUrl: string;
    status: PaymentMethodStatus;
    createdAt: Date;
    updatedAt: Date;
}


export enum OfferType {
    PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
    BUY_X_GET_Y_FREE = 'BUY_X_GET_Y_FREE'
}

export enum OfferStatus {
    VISIBLE = 'VISIBLE',
    HIDDEN = 'HIDDEN'
}

export interface Offer {
    id?: string;
    name: string;
    description: string;
    type: OfferType;
    product_id: string;
    discount_percentage?: number;
    buy_quantity?: number;
    get_quantity?: number;
    status: OfferStatus;
    createdAt: Date;
    updatedAt: Date;
}


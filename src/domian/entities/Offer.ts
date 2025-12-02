
export enum OfferType {
    PERCENTAGE_DISCOUNT = 'PERCENTAGE_DISCOUNT',
    BUY_X_GET_Y_FREE = 'BUY_X_GET_Y_FREE'
}

export enum OfferStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    EXPIRED = 'EXPIRED'
}

export interface Offer {
    id?: string;
    name: string;
    description: string;
    type: OfferType;
    product_id: string;

    // For percentage discount
    discount_percentage?: number;

    // For Buy X Get Y Free
    buy_quantity?: number;
    get_quantity?: number;

    // Status
    status: OfferStatus;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}


export interface OfferCalculationResult {
    original_price: number;
    discount_amount: number;
    final_price: number;
    offer_applied: boolean;
    offer_details: {
        offer_id: string;
        offer_name: string;
        offer_type: OfferType;
    };
}

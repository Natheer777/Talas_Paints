import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { IOfferRepository } from '@/domian/repository/IOfferRepository';
import { OfferType } from '@/domian/entities/Offer';

export interface CartItemDTO {
    productId: string;
    offerId?: string;
    quantity: number;
    color?: string;
    size?: string;
}

export interface CalculatedItem {
    productId: string;
    productName: string;
    quantity: number;
    basePrice: number;
    finalPrice: number;
    lineTotal: number;
    appliedOfferId: string | null;
    appliedOfferName: string | null;
    color?: string;
    size?: string;
    error?: string;
}

export interface CalculationResult {
    items: CalculatedItem[];
    totalAmount: number;
}

export class PriceCalculatorService {
    constructor(
        private productsRepository: IProductsRepository,
        private offerRepository: IOfferRepository
    ) { }

    async calculate(items: CartItemDTO[]): Promise<CalculationResult> {
        let totalAmount = 0;
        const calculatedItems: CalculatedItem[] = [];

        for (const item of items) {
            try {
                if (item.quantity <= 0) {
                    throw new Error(`Invalid quantity for item. Quantity must be greater than 0.`);
                }

                let currentProductId = item.productId;
                let appliedOfferId = null;
                let appliedOfferName = null;
                let offer = null;

                // Handle offer if provided, or auto-discover active offer
                if (item.offerId) {
                    offer = await this.offerRepository.getById(item.offerId);
                    if (!offer) {
                        throw new Error(`Offer ${item.offerId} not found`);
                    }

                    if (offer.status !== 'VISIBLE') {
                        throw new Error(`Offer ${offer.name} is no longer available`);
                    }

                    appliedOfferId = offer.id;
                    appliedOfferName = offer.name;

                    if (!currentProductId) {
                        currentProductId = offer.product_id;
                    } else if (offer.product_id !== currentProductId) {
                        throw new Error(`Offer ${offer.name} is not valid for the specified product`);
                    }
                } else if (currentProductId) {
                    offer = await this.offerRepository.findActiveByProductId(currentProductId);
                    if (offer) {
                        appliedOfferId = offer.id;
                        appliedOfferName = offer.name;
                    }
                }

                if (!currentProductId) {
                    throw new Error('Product ID is required for each item');
                }

                const product = await this.productsRepository.findById(currentProductId);
                if (!product) {
                    throw new Error(`Product ${currentProductId} not found`);
                }

                if (product.status !== 'visible') {
                    throw new Error(`Product ${product.name} is not available`);
                }

                // Get base price from size
                let basePrice = 0;
                const hasSizes = product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0;

                if (hasSizes) {
                    if (item.size) {
                        const sizeInfo = product.sizes.find((s: any) =>
                            typeof s === 'object' && s.size.trim() === item.size?.trim()
                        );

                        if (sizeInfo && typeof sizeInfo === 'object' && 'price' in sizeInfo) {
                            basePrice = sizeInfo.price;
                        } else {
                            throw new Error(`Size '${item.size}' not found for product '${product.name}'`);
                        }
                    } else {
                        if (product.sizes.length > 1) {
                            throw new Error(`Please specify a size for product '${product.name}'`);
                        }
                        const firstSize = product.sizes[0];
                        if (typeof firstSize === 'object' && 'price' in firstSize) {
                            basePrice = firstSize.price;
                        }
                    }
                } else {
                    // Fallback to product base price if no sizes defined (if applicable to your DB schema)
                    // basePrice = product.price; 
                    // Based on CreateOrderUseCase, it seems it relies on sizes.
                }

                let lineTotal = basePrice * item.quantity;

                if (offer) {
                    if (offer.type === OfferType.PERCENTAGE_DISCOUNT && offer.discount_percentage) {
                        lineTotal = (basePrice * item.quantity) * (1 - offer.discount_percentage / 100);
                    } else if (offer.type === OfferType.BUY_X_GET_Y_FREE && offer.buy_quantity && offer.get_quantity) {
                        const buy = offer.buy_quantity;
                        const get = offer.get_quantity;
                        const totalCycle = buy + get;
                        const payableQuantity = Math.floor(item.quantity / totalCycle) * buy + (item.quantity % totalCycle);
                        lineTotal = payableQuantity * basePrice;
                    }
                }

                lineTotal = Math.round(lineTotal * 100) / 100;
                let finalPrice: number;
                if (offer && offer.type === OfferType.BUY_X_GET_Y_FREE) {
                    finalPrice = Math.round(basePrice * 100) / 100;
                } else {
                    finalPrice = Math.round((lineTotal / item.quantity) * 100) / 100;
                }

                totalAmount += lineTotal;

                calculatedItems.push({
                    productId: currentProductId,
                    productName: product.name,
                    quantity: item.quantity,
                    basePrice: basePrice,
                    finalPrice: finalPrice,
                    lineTotal: lineTotal,
                    appliedOfferId: appliedOfferId || null,
                    appliedOfferName: appliedOfferName || null,
                    color: item.color || undefined,
                    size: item.size || undefined
                });

            } catch (error: any) {
                calculatedItems.push({
                    productId: item.productId,
                    productName: 'Unknown',
                    quantity: item.quantity,
                    basePrice: 0,
                    finalPrice: 0,
                    lineTotal: 0,
                    appliedOfferId: null,
                    appliedOfferName: null,
                    error: error.message
                });
            }
        }

        return {
            items: calculatedItems,
            totalAmount: parseFloat(totalAmount.toFixed(2))
        };
    }
}

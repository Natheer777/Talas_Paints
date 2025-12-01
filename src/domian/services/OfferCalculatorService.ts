import { Offer, OfferType, OfferCalculationResult } from '../entities/Offer';

export interface IOfferCalculationStrategy {
    calculate(offer: Offer, price: number, quantity: number): OfferCalculationResult;
    canApply(offer: Offer): boolean;
}

export class PercentageDiscountStrategy implements IOfferCalculationStrategy {
    canApply(offer: Offer): boolean {
        return offer.type === OfferType.PERCENTAGE_DISCOUNT &&
            offer.discount_percentage !== undefined &&
            offer.discount_percentage > 0 &&
            offer.discount_percentage <= 100;
    }

    calculate(offer: Offer, price: number, quantity: number): OfferCalculationResult {
        if (!this.canApply(offer)) {
            return this.noDiscountResult(offer, price, quantity);
        }

        const discountPercentage = offer.discount_percentage!;
        const originalPrice = price * quantity;
        const discountAmount = (originalPrice * discountPercentage) / 100;
        const finalPrice = originalPrice - discountAmount;

        return {
            original_price: originalPrice,
            discount_amount: discountAmount,
            final_price: finalPrice,
            offer_applied: true,
            offer_details: {
                offer_id: offer.id!,
                offer_name: offer.name,
                offer_type: offer.type
            }
        };
    }

    private noDiscountResult(offer: Offer, price: number, quantity: number): OfferCalculationResult {
        const originalPrice = price * quantity;
        return {
            original_price: originalPrice,
            discount_amount: 0,
            final_price: originalPrice,
            offer_applied: false,
            offer_details: {
                offer_id: offer.id!,
                offer_name: offer.name,
                offer_type: offer.type
            }
        };
    }
}


export class BuyXGetYFreeStrategy implements IOfferCalculationStrategy {
    canApply(offer: Offer): boolean {
        return offer.type === OfferType.BUY_X_GET_Y_FREE &&
            offer.buy_quantity !== undefined &&
            offer.get_quantity !== undefined &&
            offer.buy_quantity > 0 &&
            offer.get_quantity > 0;
    }

    calculate(offer: Offer, price: number, quantity: number): OfferCalculationResult {
        if (!this.canApply(offer)) {
            return this.noDiscountResult(offer, price, quantity);
        }

        const buyQty = offer.buy_quantity!;
        const getQty = offer.get_quantity!;
        const cycleSize = buyQty + getQty; // Total items in one cycle (e.g., 5+1=6)

        const originalPrice = price * quantity;

        // Calculate how many full cycles fit in the quantity
        const fullCycles = Math.floor(quantity / cycleSize);

        // Items remaining after full cycles
        const remainder = quantity % cycleSize;

        // In each full cycle, you get 'getQty' free items
        let freeItems = fullCycles * getQty;

        if (remainder > buyQty) {
            freeItems += Math.min(remainder - buyQty, getQty);
        }

        const discountAmount = freeItems * price;
        const finalPrice = originalPrice - discountAmount;

        return {
            original_price: originalPrice,
            discount_amount: discountAmount,
            final_price: finalPrice,
            offer_applied: true,
            offer_details: {
                offer_id: offer.id!,
                offer_name: offer.name,
                offer_type: offer.type
            }
        };
    }

    private noDiscountResult(offer: Offer, price: number, quantity: number): OfferCalculationResult {
        const originalPrice = price * quantity;
        return {
            original_price: originalPrice,
            discount_amount: 0,
            final_price: originalPrice,
            offer_applied: false,
            offer_details: {
                offer_id: offer.id!,
                offer_name: offer.name,
                offer_type: offer.type
            }
        };
    }
}


export class OfferCalculatorService {
    private strategies: Map<OfferType, IOfferCalculationStrategy>;

    constructor() {
        this.strategies = new Map<OfferType, IOfferCalculationStrategy>();
        this.registerStrategies();
    }

    private registerStrategies(): void {
        this.strategies.set(OfferType.PERCENTAGE_DISCOUNT, new PercentageDiscountStrategy());
        this.strategies.set(OfferType.BUY_X_GET_Y_FREE, new BuyXGetYFreeStrategy());
    }

    /**
     * @param offers - Array of active offers for the product
     * @param price - Product price
     * @param quantity - Quantity to purchase
     * @returns The best offer calculation result
     */
    calculateBestOffer(offers: Offer[], price: number, quantity: number): OfferCalculationResult | null {
        if (offers.length === 0) {
            return null;
        }

        let bestResult: OfferCalculationResult | null = null;
        let maxDiscount = 0;

        for (const offer of offers) {
            const strategy = this.strategies.get(offer.type);
            if (!strategy) {
                continue;
            }

            const result = strategy.calculate(offer, price, quantity);

            if (result.offer_applied && result.discount_amount > maxDiscount) {
                maxDiscount = result.discount_amount;
                bestResult = result;
            }
        }

        return bestResult;
    }

    calculateOffer(offer: Offer, price: number, quantity: number): OfferCalculationResult {
        const strategy = this.strategies.get(offer.type);
        if (!strategy) {
            throw new Error(`No strategy found for offer type: ${offer.type}`);
        }

        return strategy.calculate(offer, price, quantity);
    }
}

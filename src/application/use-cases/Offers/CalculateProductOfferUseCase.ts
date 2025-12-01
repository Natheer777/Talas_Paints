import { OfferCalculationResult } from '../../../domian/entities/Offer';
import { IOfferRepository } from '../../../domian/repository/IOfferRepository';
import { OfferCalculatorService } from '../../../domian/services/OfferCalculatorService';


export class CalculateProductOfferUseCase {
    private offerCalculator: OfferCalculatorService;

    constructor(private offerRepository: IOfferRepository) {
        this.offerCalculator = new OfferCalculatorService();
    }

    async execute(productId: string, price: number, quantity: number): Promise<OfferCalculationResult | null> {
        // Validate inputs
        if (!productId || productId.trim().length === 0) {
            throw new Error('Product ID is required');
        }

        if (price <= 0) {
            throw new Error('Price must be greater than 0');
        }

        if (quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }

        const activeOffers = await this.offerRepository.getActiveOffersByProductId(productId);

        if (activeOffers.length === 0) {
            return null;
        }

        return this.offerCalculator.calculateBestOffer(activeOffers, price, quantity);
    }
}

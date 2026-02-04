import { PriceCalculatorService, CartItemDTO, CalculationResult } from '@/application/services/PriceCalculatorService';

export class CalculateCartUseCase {
    constructor(
        private priceCalculatorService: PriceCalculatorService
    ) { }

    async execute(items: CartItemDTO[]): Promise<CalculationResult> {
        if (!items || items.length === 0) {
            return {
                items: [],
                totalAmount: 0
            };
        }

        return await this.priceCalculatorService.calculate(items);
    }
}

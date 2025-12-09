import { ICartRepository } from "@/domian/repository/ICartRepository";
import { Cart, CartItemResponse } from "@/domian/entities/Cart";

interface GetCartDTO {
    phoneNumber: string;
}

export class GetCartUseCase {
    constructor(private cartRepository: ICartRepository) { }

    async execute(dto: GetCartDTO): Promise<Cart> {
        const { phoneNumber } = dto;

        const items = await this.cartRepository.getItemsByPhoneNumber(phoneNumber);

        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Extract customer information from the first item if items exist
        const customerInfo = items.length > 0 ? {
            customer_name: items[0].customer_name,
            area_name: items[0].area_name,
            street_name: items[0].street_name,
            building_number: items[0].building_number,
            additional_notes: items[0].additional_notes,
            payment_method: items[0].payment_method
        } : {};

        // Remove customer information from individual items since it's now at cart level
        const itemsWithoutCustomerInfo: CartItemResponse[] = items.map(item => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt
        }));

        return {
            phone_number: phoneNumber,
            ...customerInfo,
            items: itemsWithoutCustomerInfo,
            totalAmount: parseFloat(totalAmount.toFixed(2))
        };
    }
}

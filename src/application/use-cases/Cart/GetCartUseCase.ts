import { ICartRepository } from "@/domian/repository/ICartRepository";
import { Cart } from "@/domian/entities/Cart";

interface GetCartDTO {
    phoneNumber: string;
}

export class GetCartUseCase {
    constructor(private cartRepository: ICartRepository) { }

    async execute(dto: GetCartDTO): Promise<Cart | null> {
        const { phoneNumber } = dto;

        const items = await this.cartRepository.getItemsByPhoneNumber(phoneNumber);

        if (items.length === 0) {
            return null;
        }

        const totalAmount = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        return {
            phone_number: phoneNumber,
            items,
            totalAmount: parseFloat(totalAmount.toFixed(2))
        };
    }
}

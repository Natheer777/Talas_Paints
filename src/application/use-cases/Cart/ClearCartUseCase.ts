import { ICartRepository } from "@/domian/repository/ICartRepository";

interface ClearCartDTO {
    phoneNumber: string;
}

export class ClearCartUseCase {
    constructor(private cartRepository: ICartRepository) { }

    async execute(dto: ClearCartDTO): Promise<void> {
        const { phoneNumber } = dto;
        await this.cartRepository.clearCart(phoneNumber);
    }
}

import { ICartRepository } from "@/domian/repository/ICartRepository";
import { IProductsRepository } from "@/domian/repository/IProductsRepository";
import { CartItem, PaymentMethodType } from "@/domian/entities/Cart";
import { v4 as uuidv4 } from 'uuid';

interface AddToCartDTO {
    phoneNumber: string;
    productId: string;
    quantity: number;
    customerName: string;
    areaName: string;
    streetName?: string;
    buildingNumber?: string;
    additionalNotes?: string;
    paymentMethod: string;
}

export class AddToCartUseCase {
    constructor(
        private cartRepository: ICartRepository,
        private productsRepository: IProductsRepository
    ) { }

    async execute(dto: AddToCartDTO): Promise<CartItem> {
        const { phoneNumber, productId, quantity, customerName, areaName, streetName, buildingNumber, additionalNotes, paymentMethod } = dto;

        const product = await this.productsRepository.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }

        const existingItem = await this.cartRepository.findItemByProduct(phoneNumber, productId);

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            return this.cartRepository.updateItemQuantity(existingItem.id, newQuantity);
        } else {
            const newItem: Omit<CartItem, 'createdAt' | 'updatedAt'> = {
                id: uuidv4(),
                phone_number: phoneNumber,
                product_id: productId,
                quantity: quantity,
                price: product.sizes[0].price,
                customer_name: customerName,
                area_name: areaName,
                street_name: streetName,
                building_number: buildingNumber,
                additional_notes: additionalNotes,
                payment_method: paymentMethod as PaymentMethodType
            };

            return this.cartRepository.addItem(newItem);
        }
    }
}

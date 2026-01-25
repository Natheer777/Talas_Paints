import { IOrderRepository } from '@/domian/repository/IOrderRepository';
import { IProductsRepository } from '@/domian/repository/IProductsRepository';
import { IOfferRepository } from '@/domian/repository/IOfferRepository';
import { IAdminRepository } from '@/domian/repository/IAdminRepository';
import { Order, OrderStatus, PaymentMethodType } from '@/domian/entities/Order';
import { INotificationService } from '@/application/services/NotificationService';
import { OfferType } from '@/domian/entities/Offer';
import { v4 as uuidv4 } from 'uuid';

interface OrderItemDTO {
    productId: string;
    offerId?: string;
    quantity: number;
    color?: string;
    size?: string;
    price?: number;
}

interface CreateOrderDTO {
    phoneNumber: string;
    customerName: string;
    areaName: string;
    streetName?: string;
    buildingNumber?: string;
    additionalNotes?: string;
    deliveryAgentName: string;
    paymentMethod: PaymentMethodType;
    items: OrderItemDTO[];
}

export class CreateOrderUseCase {
    constructor(
        private orderRepository: IOrderRepository,
        private productsRepository: IProductsRepository,
        private notificationService: INotificationService,
        private adminRepository: IAdminRepository,
        private offerRepository: IOfferRepository
    ) { }

    async execute(dto: CreateOrderDTO): Promise<{ order: Order; hasFcmToken: boolean }> {
        const {
            phoneNumber,
            customerName,
            areaName,
            streetName,
            buildingNumber,
            additionalNotes,
            deliveryAgentName,
            paymentMethod,
            items
        } = dto;

        if (!items || items.length === 0) {
            throw new Error('Order must contain at least one item.');
        }

        // Validate and calculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            if (item.quantity <= 0) {
                throw new Error(`Invalid quantity for item. Quantity must be greater than 0.`);
            }

            let currentProductId = item.productId;
            let appliedOfferId = null;
            let offer = null;

            // Handle offer if provided
            if (item.offerId) {
                offer = await this.offerRepository.getById(item.offerId);
                if (!offer) {
                    throw new Error(`Offer ${item.offerId} not found`);
                }

                if (offer.status !== 'VISIBLE') {
                    throw new Error(`Offer ${offer.name} is no longer available`);
                }

                appliedOfferId = offer.id;

                // If productId was not provided, use the one from the offer
                if (!currentProductId) {
                    currentProductId = offer.product_id;
                } else if (offer.product_id !== currentProductId) {
                    throw new Error(`Offer ${offer.name} is not valid for the specified product`);
                }
            }

            if (!currentProductId) {
                throw new Error('Product ID is required for each item (either directly or via an offer)');
            }

            const product = await this.productsRepository.findById(currentProductId);
            if (!product) {
                throw new Error(`Product ${currentProductId} not found`);
            }

            // Check if product is visible
            if (product.status !== 'visible') {
                throw new Error(`Product ${product.name} is not available for ordering`);
            }

            // Validate color if provided
            if (item.color && product.colors && !product.colors.includes(item.color)) {
                throw new Error(`Color ${item.color} is not available for product ${product.name}`);
            }

            // Get base price from size if provided, otherwise use first size price
            let basePrice = 0;
            if (item.size && product.sizes && Array.isArray(product.sizes)) {
                const sizeInfo = product.sizes.find(s => typeof s === 'object' && s.size === item.size);
                if (sizeInfo && typeof sizeInfo === 'object' && 'price' in sizeInfo) {
                    basePrice = sizeInfo.price;
                } else {
                    throw new Error(`Size ${item.size} not found for product ${product.name}`);
                }
            } else if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
                // Use first size price if no size specified
                const firstSize = product.sizes[0];
                if (typeof firstSize === 'object' && 'price' in firstSize) {
                    basePrice = firstSize.price;
                }
            }

            let finalPrice = basePrice;

            if (offer) {
                if (offer.type === OfferType.PERCENTAGE_DISCOUNT && offer.discount_percentage) {
                    finalPrice = basePrice * (1 - offer.discount_percentage / 100);
                } else if (offer.type === OfferType.BUY_X_GET_Y_FREE && offer.buy_quantity && offer.get_quantity) {
                    const buy = offer.buy_quantity;
                    const get = offer.get_quantity;
                    const totalCycle = buy + get;
                    const payableQuantity = Math.floor(item.quantity / totalCycle) * buy + (item.quantity % totalCycle);

                    // Calculate average price per item to reach the correct total
                    finalPrice = (payableQuantity * basePrice) / item.quantity;
                }
            }

            // Use provided price if available (might be used by admin or for custom pricing), 
            // otherwise use calculated finalPrice
            const priceToStore = item.price !== undefined ? item.price : finalPrice;

            // Validate color
            if (item.color) {
                if (!product.colors || product.colors.length === 0) {
                    throw new Error(`Product '${product.name}' does not support color selection.`);
                }
                if (!product.colors.includes(item.color)) {
                    const availableColors = product.colors.join(', ');
                    throw new Error(`Color '${item.color}' is not available for product '${product.name}'. Available colors: ${availableColors}`);
                }
            } else if (product.colors && product.colors.length > 0) {
                // If the product has colors, one must be selected
                throw new Error(`Please specify a color for product '${product.name}'.`);
            }

            totalAmount += priceToStore * item.quantity;
            orderItems.push({
                product_id: currentProductId,
                offer_id: appliedOfferId,
                quantity: item.quantity,
                price: priceToStore,
                color: item.color,
                size: item.size
            });
        }

        // Create order
        const orderId = uuidv4();
        const order = await this.orderRepository.create(
            {
                id: orderId,
                phone_number: phoneNumber,
                customer_name: customerName,
                area_name: areaName,
                street_name: streetName,
                building_number: buildingNumber,
                additional_notes: additionalNotes,
                delivery_agent_name: deliveryAgentName,
                payment_method: paymentMethod,
                status: OrderStatus.PENDING,
                total_amount: parseFloat(totalAmount.toFixed(2))
                // orderNumber is auto-generated by the database
            },
            orderItems
        );

        // Fetch the order with product details populated
        const orderWithDetails = await this.orderRepository.findById(order.id);
        if (!orderWithDetails) {
            throw new Error('Failed to retrieve created order');
        }

        // Check if user has FCM token
        const hasFcmToken = await this.notificationService.hasFcmToken(phoneNumber);

        // Notify admin about new order
        console.log(`🚀 Triggering admin notification for new order: ${orderWithDetails.id}`);

        // Fetch all admin emails to send notifications to all of them
        const admins = await this.adminRepository.findAll();
        const adminEmails = admins.map(admin => admin.email);

        console.log(`📱 Sending notifications to ${adminEmails.length} admin(s): ${adminEmails.join(', ')}`);

        // Send notification to all admin emails
        await this.notificationService.notifyAdminNewOrder(orderWithDetails, adminEmails);

        return { order: orderWithDetails, hasFcmToken };
    }
}
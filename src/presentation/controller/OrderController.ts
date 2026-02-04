import { Request, Response } from "express";
import {
    CreateOrderUseCase,
    GetOrderUseCase,
    GetOrdersByPhoneNumberUseCase,
    UpdateOrderStatusUseCase,
    GetOrdersForAdminUseCase,
    DeleteOrderUseCase,
    CalculateCartUseCase
} from "@/application/use-cases/Order/index";

export class OrderController {
    constructor(
        private createOrderUseCase: CreateOrderUseCase,
        private getOrderUseCase: GetOrderUseCase,
        private getOrdersByPhoneNumberUseCase: GetOrdersByPhoneNumberUseCase,
        private updateOrderStatusUseCase: UpdateOrderStatusUseCase,
        private getOrdersForAdminUseCase: GetOrdersForAdminUseCase,
        private deleteOrderUseCase: DeleteOrderUseCase,
        private calculateCartUseCase: CalculateCartUseCase
    ) { }

    async createOrder(req: Request, res: Response) {
        try {
            const {
                phoneNumber,
                customerName,
                areaName,
                streetName,
                buildingNumber,
                additionalNotes,
                deliveryAgentName,
                paymentMethod,
                productId,
                offerId,
                quantity,
                color,
                size,
                price,
                items
            } = req.body;

            // Handle multipart/form-data format: productId and quantity can be arrays or single values
            let orderItems;
            if (items && Array.isArray(items)) {
                // If items is already an array (from JSON or parsed form data)
                orderItems = items;
            } else if ((productId || offerId) && quantity) {
                // Convert productId and quantity arrays/values to items array
                let productIds = productId;
                let offerIds = offerId;
                let quantities = quantity;
                let colors = color;
                let sizes = size;
                let prices = price;

                // Handle comma-separated strings
                if (typeof productIds === 'string' && productIds.includes(',')) {
                    productIds = productIds.split(',').map((id: string) => id.trim());
                }
                if (typeof offerIds === 'string' && offerIds.includes(',')) {
                    offerIds = offerIds.split(',').map((id: string) => id.trim());
                }
                if (typeof quantities === 'string' && quantities.includes(',')) {
                    quantities = quantities.split(',').map((q: string) => q.trim());
                }
                if (typeof colors === 'string' && colors.includes(',')) {
                    colors = colors.split(',').map((c: string) => c.trim());
                }
                if (typeof sizes === 'string' && sizes.includes(',')) {
                    sizes = sizes.split(',').map((s: string) => s.trim());
                }
                if (typeof prices === 'string' && prices.includes(',')) {
                    prices = prices.split(',').map((p: string) => p.trim());
                }

                productIds = productIds ? (Array.isArray(productIds) ? productIds : [productIds]) : [];
                offerIds = offerIds ? (Array.isArray(offerIds) ? offerIds : [offerIds]) : [];
                quantities = Array.isArray(quantities) ? quantities : [quantities];

                // Ensure colors, sizes and prices are arrays if they exist
                if (colors) {
                    colors = Array.isArray(colors) ? colors : [colors];
                }
                if (sizes) {
                    sizes = Array.isArray(sizes) ? sizes : [sizes];
                }
                if (prices) {
                    prices = Array.isArray(prices) ? prices : [prices];
                }

                orderItems = quantities.map((q: string, index: number) => ({
                    productId: (productIds[index] && productIds[index].trim() !== '') ? productIds[index] : undefined,
                    offerId: (offerIds[index] && offerIds[index].trim() !== '') ? offerIds[index] : undefined,
                    quantity: parseInt(q, 10),
                    color: colors ? colors[index] : undefined,
                    size: sizes ? sizes[index] : undefined,
                    price: prices ? parseFloat(prices[index]) : undefined
                }));
            } else {
                throw new Error('يجب توفير إما مصفوفة العناصر أو (معرف المنتج/العرض) والكمية');
            }

            const { order, hasFcmToken } = await this.createOrderUseCase.execute({
                phoneNumber,
                customerName,
                areaName,
                streetName,
                buildingNumber,
                additionalNotes,
                deliveryAgentName,
                paymentMethod,
                items: orderItems
            });

            return res.status(201).json({
                success: true,
                data: {
                    ...order,
                    hasFcmToken
                },
                message: "تم إنشاء الطلب بنجاح",
            });
        } catch (error: any) {
            console.error('خطأ في إنشاء الطلب:', error);
            return res.status(400).json({
                success: false,
                message: error.message || "لا يمكن إنشاء الطلب",
            });
        }
    }

    async getOrder(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            const result = await this.getOrderUseCase.execute({ orderId });

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            return res.status(404).json({
                success: false,
                message: error.message || "الطلب غير موجود",
            });
        }
    }

    async getOrdersByPhoneNumber(req: Request, res: Response) {
        try {
            const { phoneNumber } = req.query as { phoneNumber: string };

            const result = await this.getOrdersByPhoneNumberUseCase.execute({ phoneNumber });

            return res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "لا يمكن استرجاع الطلبات",
            });
        }
    }

    async updateOrderStatus(req: Request, res: Response) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            const result = await this.updateOrderStatusUseCase.execute({
                orderId,
                status
            });

            return res.status(200).json({
                success: true,
                data: result,
                message: "تم تحديث حالة الطلب بنجاح",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "لا يمكن تحديث حالة الطلب",
            });
        }
    }

    async getOrdersForAdmin(req: Request, res: Response) {
        try {
            const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

            const result = await this.getOrdersForAdminUseCase.execute({ page, limit });

            return res.status(200).json({
                success: true,
                data: result.orders,
                pagination: {
                    total: result.total,
                    page: page || 1,
                    limit: limit || result.total,
                    totalPages: Math.ceil(result.total / (limit || result.total)),
                    hasNextPage: page ? (page * (limit || result.total)) < result.total : false,
                    hasPrevPage: page ? page > 1 : false
                }
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "لا يمكن استرجاع الطلبات",
            });
        }
    }

    async deleteOrder(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            await this.deleteOrderUseCase.execute({ orderId });

            return res.status(200).json({
                success: true,
                message: "تم حذف الطلب بنجاح",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "لا يمكن حذف الطلب",
            });
        }
    }

    async calculateCart(req: Request, res: Response) {
        try {
            const { items } = req.body;

            if (!items || !Array.isArray(items)) {
                return res.status(400).json({
                    success: false,
                    message: "يجب توفير مصفوفة العناصر (items)"
                });
            }

            const result = await this.calculateCartUseCase.execute(items);

            return res.status(200).json({
                success: true,
                data: result,
                message: "تم حساب السلة بنجاح"
            });
        } catch (error: any) {
            console.error('خطأ في حساب السلة:', error);
            return res.status(400).json({
                success: false,
                message: error.message || "لا يمكن حساب السلة",
            });
        }
    }
}


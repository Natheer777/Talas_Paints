import { Request, Response } from "express";
import {
    CreateOrderUseCase,
    GetOrderUseCase,
    GetOrdersByPhoneNumberUseCase,
    UpdateOrderStatusUseCase,
    GetOrdersForAdminUseCase,
    DeleteOrderUseCase
} from "@/application/use-cases/Order/index";

export class OrderController {
    constructor(
        private createOrderUseCase: CreateOrderUseCase,
        private getOrderUseCase: GetOrderUseCase,
        private getOrdersByPhoneNumberUseCase: GetOrdersByPhoneNumberUseCase,
        private updateOrderStatusUseCase: UpdateOrderStatusUseCase,
        private getOrdersForAdminUseCase: GetOrdersForAdminUseCase,
        private deleteOrderUseCase: DeleteOrderUseCase
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
            } else if (productId && quantity) {
                // Convert productId and quantity arrays/values to items array
                let productIds = productId;
                let quantities = quantity;
                let colors = color;
                let sizes = size;
                let prices = price;

                // Handle comma-separated strings
                if (typeof productIds === 'string' && productIds.includes(',')) {
                    productIds = productIds.split(',').map((id: string) => id.trim());
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

                productIds = Array.isArray(productIds) ? productIds : [productIds];
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

                if (productIds.length !== quantities.length) {
                    throw new Error('يجب أن تكون مصفوفات معرف المنتج والكمية بنفس الطول');
                }

                orderItems = productIds.map((pid: string, index: number) => ({
                    productId: pid,
                    quantity: parseInt(quantities[index], 10),
                    color: colors ? colors[index] : undefined,
                    size: sizes ? sizes[index] : undefined,
                    price: prices ? parseFloat(prices[index]) : undefined
                }));
            } else {
                throw new Error('يجب توفير إما مصفوفة العناصر أو معرف المنتج والكمية');
            }

            const result = await this.createOrderUseCase.execute({
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
                data: result,
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
}


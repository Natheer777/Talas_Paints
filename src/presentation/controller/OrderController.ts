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
                paymentMethod,
                productId,
                quantity,
                items
            } = req.body;

            // Handle multipart/form-data format: productId and quantity can be arrays or single values
            let orderItems;
            if (items && Array.isArray(items)) {
                // If items is already an array (from JSON or parsed form data)
                orderItems = items;
            } else if (productId && quantity) {
                // Convert productId and quantity arrays/values to items array
                const productIds = Array.isArray(productId) ? productId : [productId];
                const quantities = Array.isArray(quantity) ? quantity : [quantity];
                
                if (productIds.length !== quantities.length) {
                    throw new Error('productId and quantity arrays must have the same length');
                }

                orderItems = productIds.map((pid: string, index: number) => ({
                    productId: pid,
                    quantity: parseInt(quantities[index], 10)
                }));
            } else {
                throw new Error('Either items array or productId/quantity must be provided');
            }

            const result = await this.createOrderUseCase.execute({
                phoneNumber,
                customerName,
                areaName,
                streetName,
                buildingNumber,
                additionalNotes,
                paymentMethod,
                items: orderItems
            });

            return res.status(201).json({
                success: true,
                data: result,
                message: "Order created successfully",
            });
        } catch (error: any) {
            console.error('Create Order Error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || "Could not create order",
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
                message: error.message || "Order not found",
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
                message: error.message || "Could not retrieve orders",
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
                message: "Order status updated successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not update order status",
            });
        }
    }

    async getOrdersForAdmin(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
            const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined;

            const result = await this.getOrdersForAdminUseCase.execute({ limit, offset });

            return res.status(200).json({
                success: true,
                data: result.orders,
                pagination: {
                    total: result.total,
                    limit: limit || result.total,
                    offset: offset || 0
                }
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Could not retrieve orders",
            });
        }
    }

    async deleteOrder(req: Request, res: Response) {
        try {
            const { orderId } = req.params;

            await this.deleteOrderUseCase.execute({ orderId });

            return res.status(200).json({
                success: true,
                message: "Order deleted successfully",
            });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not delete order",
            });
        }
    }
}


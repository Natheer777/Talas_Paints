import { Router, Request, Response } from "express";
import { OrderController } from "../controller/OrderController";
import {
    validateCreateOrder,
    validateGetOrder,
    validateGetOrdersByPhoneNumber,
    validateUpdateOrderStatus,
    validateGetOrdersForAdmin,
    validateDeleteOrder,
    handleValidationResult
} from "../validation/orderValidation";
import { uploadNone } from "../middleware/UploadMiddleware";
import { RateLimitMiddleware } from "../middleware/RateLimitMiddleware";
import { RateLimitConfigurations } from "../../infrastructure/config/RateLimitConfigurations";
import Container from "../../infrastructure/di/container";

export function createOrderRouter(orderController: OrderController) {
    const router = Router();

    // Get rate limit service from container
    const rateLimitService = Container.getRateLimitService();

    // Create rate limiter for order operations
    const orderLimit = RateLimitMiddleware.createCustom(
        rateLimitService,
        RateLimitConfigurations.ORDER_OPERATIONS
    );

    // Get auth middleware from container (used for admin routes)
    const authMiddleware = Container.getAuthMiddleware();

    // Calculate cart (Preview)
    router.post(
        "/orders/calculate",
        orderLimit.handle(),
        uploadNone,
        (req: Request, res: Response) => orderController.calculateCart(req, res)
    );

    // Create order
    router.post(
        "/orders",
        orderLimit.handle(),
        uploadNone,
        validateCreateOrder,
        handleValidationResult,
        (req: Request, res: Response) => orderController.createOrder(req, res)
    );

    // Get order by ID (must come before GET /orders to avoid route conflicts)
    router.get(
        "/orders/:orderId",
        orderLimit.handle(),
        validateGetOrder,
        handleValidationResult,
        (req: Request, res: Response) => orderController.getOrder(req, res)
    );

    // Get orders by phone number
    router.get(
        "/orders",
        orderLimit.handle(),
        validateGetOrdersByPhoneNumber,
        handleValidationResult,
        (req: Request, res: Response) => orderController.getOrdersByPhoneNumber(req, res)
    );

    // Update order status (Admin only - you may want to add auth middleware)
    router.patch(
        "/orders/:orderId/status",
        orderLimit.handle(),
        uploadNone,
        validateUpdateOrderStatus,
        handleValidationResult,
        (req: Request, res: Response) => orderController.updateOrderStatus(req, res)
    );

    // Get all orders for admin
    router.get(
        "/admin/orders",
        authMiddleware.handle(),
        orderLimit.handle(),
        validateGetOrdersForAdmin,
        handleValidationResult,
        (req: Request, res: Response) => orderController.getOrdersForAdmin(req, res)
    );

    // Delete order (Admin only - you may want to add auth middleware)
    router.delete(
        "/orders/:orderId",
        orderLimit.handle(),
        validateDeleteOrder,
        handleValidationResult,
        (req: Request, res: Response) => orderController.deleteOrder(req, res)
    );

    return router;
}


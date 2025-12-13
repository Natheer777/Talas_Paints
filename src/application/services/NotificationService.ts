import { Server as SocketIOServer } from 'socket.io';
import { Order, OrderStatus } from '@/domian/entities/Order';

export interface INotificationService {
    notifyAdminNewOrder(order: Order): void;
    notifyUserOrderStatusChange(phoneNumber: string, order: Order): void;
}

export class NotificationService implements INotificationService {
    constructor(private io: SocketIOServer | null) { }

    notifyAdminNewOrder(order: Order): void {
        if (!this.io) {
            console.warn('Socket.IO not initialized, skipping admin notification');
            return;
        }

        try {
            this.io.to('admin').emit('new_order', {
                order: {
                    id: order.id,
                    phone_number: order.phone_number,
                    customer_name: order.customer_name,
                    area_name: order.area_name,
                    total_amount: order.total_amount,
                    status: order.status,
                    payment_method: order.payment_method,
                    createdAt: order.createdAt
                }
            });
        } catch (error) {
            console.error('Error sending admin notification:', error);
        }
    }

    notifyUserOrderStatusChange(phoneNumber: string, order: Order): void {
        if (!this.io) {
            console.warn('Socket.IO not initialized, skipping user notification');
            return;
        }

        try {
            this.io.to(`user_${phoneNumber}`).emit('order_status_changed', {
                orderId: order.id,
                status: order.status,
                message: `Your order #${order.id.substring(0, 8)} status has been updated to ${order.status}`
            });
        } catch (error) {
            console.error('Error sending user notification:', error);
        }
    }
}


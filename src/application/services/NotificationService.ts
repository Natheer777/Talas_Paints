import { Server as SocketIOServer } from 'socket.io';
import { Order, OrderStatus } from '@/domian/entities/Order';
import { FirebasePushNotificationService } from '@/infrastructure/services/FirebasePushNotificationService';

export interface INotificationService {
    notifyAdminNewOrder(order: Order, adminEmails?: string[]): Promise<void>;
    notifyUserOrderStatusChange(phoneNumber: string, order: Order): Promise<void>;
}

export class NotificationService implements INotificationService {
    constructor(
        private io: SocketIOServer | null,
        private firebasePushService?: FirebasePushNotificationService
    ) { }

    async notifyAdminNewOrder(order: Order, adminEmails?: string[]): Promise<void> {
        console.log(`🔔 Sending admin notification for new order: ${order.id}`);

        // Send Socket.IO notification
        if (this.io) {
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
                console.log(`📡 Admin notification sent via Socket.IO for order: ${order.id}`);
            } catch (error) {
                console.error('❌ Error sending admin socket notification:', error);
            }
        } else {
            console.warn('⚠️  Socket.IO not available, skipping socket notification');
        }

        // Send Firebase Push notification
        if (this.firebasePushService && this.firebasePushService.isInitialized()) {
            try {
                const targetEmails = adminEmails || [];

                // If specific emails provided, send to those admins only
                if (targetEmails.length > 0) {
                    console.log(`📱 Sending targeted push notifications to ${targetEmails.length} admin(s)`);
                    for (const adminEmail of targetEmails) {
                        try {
                            console.log(`📱 Sending Firebase push notification to admin: ${adminEmail}`);
                            await this.firebasePushService.sendToAdminEmail(adminEmail, {
                                title: 'طلب جديد 🆕',
                                body: `طلب جديد من ${order.customer_name} - ${order.area_name}`,
                                data: {
                                    type: 'new_order',
                                    orderId: order.id,
                                    customerName: order.customer_name,
                                    totalAmount: order.total_amount.toString(),
                                    area: order.area_name,
                                    phoneNumber: order.phone_number
                                }
                            });
                        } catch (error) {
                            console.error(`❌ Error sending push notification to admin ${adminEmail}:`, error);
                            // Continue with other admins
                        }
                    }
                } else {
                    // If no specific emails provided, send to default admin email from env
                    const defaultAdminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'test@gmail.com'; // Default for testing
                    console.log(`📱 No specific admin emails provided, sending to default admin: ${defaultAdminEmail}`);

                    try {
                        await this.firebasePushService.sendToAdminEmail(defaultAdminEmail, {
                            title: 'طلب جديد 🆕',
                            body: `طلب جديد من ${order.customer_name} - ${order.area_name}`,
                            data: {
                                type: 'new_order',
                                orderId: order.id,
                                customerName: order.customer_name,
                                totalAmount: order.total_amount.toString(),
                                area: order.area_name,
                                phoneNumber: order.phone_number
                            }
                        });
                        console.log(`✅ Push notification sent to default admin: ${defaultAdminEmail}`);
                    } catch (error) {
                        console.error(`❌ Error sending push notification to default admin ${defaultAdminEmail}:`, error);
                    }
                }
            } catch (error) {
                console.error('❌ Error in admin push notification process:', error);
            }
        } else {
            console.warn('⚠️  Firebase not available, skipping push notification');
        }
    }

    async notifyUserOrderStatusChange(phoneNumber: string, order: Order): Promise<void> {
        console.log(`🔔 Sending user notification for order ${order.id} status change to: ${order.status}`);

        // Send Socket.IO notification
        if (this.io) {
            try {
                this.io.to(`user_${phoneNumber}`).emit('order_status_changed', {
                    orderId: order.id,
                    status: order.status,
                    message: `Your order #${order.id.substring(0, 8)} status has been updated to ${order.status}`
                });
                console.log(`📡 Socket.IO notification sent to user ${phoneNumber} for order: ${order.id}`);
            } catch (error) {
                console.error('❌ Error sending socket notification:', error);
            }
        } else {
            console.warn('⚠️  Socket.IO not available, skipping socket notification');
        }

        // Send Firebase Push notification
        if (this.firebasePushService && this.firebasePushService.isInitialized()) {
            try {
                const statusMessages: Record<OrderStatus, string> = {
                    [OrderStatus.PENDING]: 'تم استلام طلبك',
                    [OrderStatus.ACCEPTED]: 'تم قبول طلبك',
                    [OrderStatus.ORDERED]: 'تم تأكيد طلبك',
                    [OrderStatus.REJECTED]: 'تم رفض طلبك',
                    [OrderStatus.IN_PROGRESS]: 'جاري معالجة طلبك'
                };

                console.log(`📱 Sending Firebase push notification to phone: ${phoneNumber}`);
                await this.firebasePushService.sendToPhoneNumber(phoneNumber, {
                    title: 'تحديث حالة الطلب',
                    body: statusMessages[order.status] || `تم تحديث حالة طلبك إلى ${order.status}`,
                    data: {
                        type: 'order_status_changed',
                        orderId: order.id,
                        status: order.status
                    }
                });
            } catch (error) {
                console.error('❌ Error sending push notification:', error);
                // Don't throw - we want socket notifications to still work even if push fails
            }
        } else {
            console.warn('⚠️  Firebase not available, skipping push notification');
        }
    }
}
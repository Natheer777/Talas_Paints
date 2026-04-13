import { Server as SocketIOServer } from 'socket.io';
import { Order, OrderStatus } from '@/domian/entities/Order';
import { FirebasePushNotificationService } from '@/infrastructure/services/FirebasePushNotificationService';

export interface INotificationService {
    notifyAdminNewOrder(order: Order, adminEmails?: string[]): Promise<void>;
    notifyUserOrderStatusChange(phoneNumber: string, order: Order): Promise<void>;
    hasFcmToken(phoneNumber: string): Promise<boolean>;
}

export class NotificationService implements INotificationService {
    constructor(
        private io: SocketIOServer | null,
        private firebasePushService?: FirebasePushNotificationService
    ) { }

    async hasFcmToken(phoneNumber: string): Promise<boolean> {
        if (!this.firebasePushService) {
            return false;
        }
        return this.firebasePushService.hasToken(phoneNumber);
    }

    async notifyAdminNewOrder(order: Order, adminEmails?: string[]): Promise<void> {
        console.log(`🔔 Sending admin notification for new order: ${order.id}`);

        if (this.io) {
            try {
                this.io.to('admin').emit('new_order', {
                    order: order
                });
                console.log(`📡 Admin notification sent via Socket.IO for order: ${order.id}`);
            } catch (error) {
                console.error('❌ Error sending admin socket notification:', error);
            }
        } else {
            console.warn('⚠️  Socket.IO not available, skipping socket notification');
        }

        if (this.firebasePushService && this.firebasePushService.isInitialized()) {
            try {
                const targetEmails = [...new Set(adminEmails || [])].filter(email => !!email);

                if (targetEmails.length > 0) {
                    console.log(`📱 Sending targeted push notifications to ${targetEmails.length} admin(s)`);
                    try {
                        await this.firebasePushService.sendToAdminEmails(targetEmails, {
                            title: 'طلب جديد 🆕',
                            body: `طلب جديد رقم #${order.orderNumber} من ${order.customer_name} - ${order.area_name}`,
                            data: {
                                type: 'new_order',
                                orderId: String(order.id)
                            }
                        });
                    } catch (error) {
                        console.error(`❌ Error sending push notification to admins:`, error);
                    }
                } else {

                    const defaultAdminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'test@gmail.com'; 
                    console.log(`📱 No specific admin emails provided, sending to default admin: ${defaultAdminEmail}`);

                    try {
                        await this.firebasePushService.sendToAdminEmail(defaultAdminEmail, {
                            title: 'طلب جديد 🆕',
                            body: `طلب جديد رقم #${order.orderNumber} من ${order.customer_name} - ${order.area_name}`,
                            data: {
                                type: 'new_order',
                                orderId: String(order.id)
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

        if (this.io) {
            try {
                this.io.to(`user_${phoneNumber}`).emit('order_status_changed', {
                    order: order,
                    message: `Your order #${order.orderNumber} status has been updated to ${order.status}`
                });
                console.log(`📡 Socket.IO notification sent to user ${phoneNumber} for order: ${order.id}`);
            } catch (error) {
                console.error('❌ Error sending socket notification:', error);
            }
        } else {
            console.warn('⚠️  Socket.IO not available, skipping socket notification');
        }

        if (this.firebasePushService && this.firebasePushService.isInitialized()) {
            try {
                const statusMessages: Record<OrderStatus, string> = {
                    [OrderStatus.PENDING]: 'تم استلام طلبك',
                    [OrderStatus.ACCEPTED]: 'تم قبول طلبك',
                    [OrderStatus.ORDERED]: 'تم توصيل طلبك',
                    [OrderStatus.REJECTED]: 'تم رفض طلبك',
                    [OrderStatus.IN_PROGRESS]: 'جاري معالجة طلبك'
                };

                console.log(`📱 Sending Firebase push notification to phone: ${phoneNumber}`);
                await this.firebasePushService.sendToPhoneNumber(phoneNumber, {
                    title: 'تحديث حالة الطلب',
                    body: `${statusMessages[order.status] || 'تم تحديث حالة طلبك'} للطلب رقم #${order.orderNumber}`,
                    data: {
                        type: 'order_status_changed',
                        orderId: String(order.id)
                    }
                });
            } catch (error) {
                console.error('❌ Error sending push notification:', error);
            }
        } else {
            console.warn('⚠️  Firebase not available, skipping push notification');
        }
    }
}
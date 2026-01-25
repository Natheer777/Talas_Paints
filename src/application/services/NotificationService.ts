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

        // Send Socket.IO notification
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
                                    order: JSON.stringify({
                                        id: order.id,
                                        phone_number: order.phone_number,
                                        customer_name: order.customer_name,
                                        area_name: order.area_name,
                                        street_name: order.street_name,
                                        building_number: order.building_number,
                                        additional_notes: order.additional_notes,
                                        delivery_agent_name: order.delivery_agent_name,
                                        payment_method: order.payment_method,
                                        status: order.status,
                                        total_amount: order.total_amount,
                                        items: order.items,
                                        createdAt: order.createdAt.toISOString(),
                                        updatedAt: order.updatedAt.toISOString()
                                    })
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
                                order: JSON.stringify({
                                    id: order.id,
                                    phone_number: order.phone_number,
                                    customer_name: order.customer_name,
                                    area_name: order.area_name,
                                    street_name: order.street_name,
                                    building_number: order.building_number,
                                    additional_notes: order.additional_notes,
                                    delivery_agent_name: order.delivery_agent_name,
                                    payment_method: order.payment_method,
                                    status: order.status,
                                    total_amount: order.total_amount,
                                    items: order.items,
                                    createdAt: order.createdAt.toISOString(),
                                    updatedAt: order.updatedAt.toISOString()
                                })
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
                    order: order,
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
                    [OrderStatus.ORDERED]: 'تم توصيل طلبك',
                    [OrderStatus.REJECTED]: 'تم رفض طلبك',
                    [OrderStatus.IN_PROGRESS]: 'جاري معالجة طلبك'
                };

                console.log(`📱 Sending Firebase push notification to phone: ${phoneNumber}`);
                await this.firebasePushService.sendToPhoneNumber(phoneNumber, {
                    title: 'تحديث حالة الطلب',
                    body: statusMessages[order.status] || `تم تحديث حالة طلبك إلى ${order.status}`,
                    data: {
                        type: 'order_status_changed',
                        order: JSON.stringify({
                            id: order.id,
                            phone_number: order.phone_number,
                            customer_name: order.customer_name,
                            area_name: order.area_name,
                            street_name: order.street_name,
                            building_number: order.building_number,
                            additional_notes: order.additional_notes,
                            delivery_agent_name: order.delivery_agent_name,
                            payment_method: order.payment_method,
                            status: order.status,
                            total_amount: order.total_amount,
                            items: order.items,
                            createdAt: order.createdAt.toISOString(),
                            updatedAt: order.updatedAt.toISOString()
                        })
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
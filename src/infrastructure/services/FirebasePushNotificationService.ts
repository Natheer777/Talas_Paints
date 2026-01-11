import * as admin from 'firebase-admin';
import { IFcmTokenRepository } from '@/domian/repository/IFcmTokenRepository';

export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
}

export class FirebasePushNotificationService {
    private app: admin.app.App | null = null;

    constructor(private fcmTokenRepository: IFcmTokenRepository) {
        this.initializeFirebase();
    }

    private initializeFirebase(): void {
        try {
            // Check if Firebase is already initialized
            if (admin.apps.length > 0) {
                this.app = admin.apps[0];
                return;
            }

            const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
            
            // Option 2: Using service account JSON file path
            const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

            if (serviceAccountJson) {
                try {
                    let jsonString = serviceAccountJson.trim();
                    if ((jsonString.startsWith('"') && jsonString.endsWith('"')) ||
                        (jsonString.startsWith("'") && jsonString.endsWith("'"))) {
                        jsonString = jsonString.slice(1, -1);
                    }
                    // Remove line breaks and extra whitespace for multiline JSON
                    jsonString = jsonString.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                    const serviceAccount = JSON.parse(jsonString);
                    this.app = admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                } catch (parseError: any) {
                    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', parseError.message);
                    console.error('Please check that the JSON is valid. It should be a valid JSON object.');
                    console.error('Tip: If using multiline JSON, make sure it\'s properly formatted or use FIREBASE_SERVICE_ACCOUNT_PATH instead.');
                    console.error('Example format: {"type":"service_account","project_id":"..."}');
                    throw parseError;
                }
            } else if (serviceAccountPath) {
                // Use file path (requires fs to read)
                try {
                    const fs = require('fs');
                    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
                    const serviceAccount = JSON.parse(fileContent);
                    this.app = admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                } catch (fileError: any) {
                    console.error('❌ Failed to read/parse Firebase service account file:', fileError.message);
                    console.error(`File path: ${serviceAccountPath}`);
                    throw fileError;
                }
            } else {
                console.warn('⚠️  Firebase not configured. Push notifications will be disabled.');
                console.warn('Set FIREBASE_SERVICE_ACCOUNT_JSON (JSON string) or FIREBASE_SERVICE_ACCOUNT_PATH (file path) environment variable');
                return;
            }

            console.log('✅ Firebase Admin SDK initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Firebase Admin SDK:', error);
            console.warn('⚠️  Push notifications will be disabled');
        }
    } 

    async sendToPhoneNumber(
        phoneNumber: string,
        payload: PushNotificationPayload
    ): Promise<void> {
        if (!this.app) {
            console.warn('Firebase not initialized, skipping push notification');
            return;
        }

        try {
            // Get all FCM tokens for this phone number
            const tokens = await this.fcmTokenRepository.findByPhoneNumber(phoneNumber);

            if (tokens.length === 0) {
                console.log(`No FCM tokens found for phone number: ${phoneNumber}`);
                return;
            }

            const fcmTokens = tokens.map(t => t.token);

            // Send to multiple tokens (in case user has multiple devices)
            const message: admin.messaging.MulticastMessage = {
                notification: {
                    title: payload.title,
                    body: payload.body
                },
                data: payload.data ? this.convertDataToString(payload.data) : undefined,
                tokens: fcmTokens
            };

            const response = await admin.messaging().sendEachForMulticast(message);

            // Handle failed tokens
            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(fcmTokens[idx]);
                        console.error(`Failed to send notification to token: ${fcmTokens[idx]}`, resp.error);
                    }
                });

                // Remove invalid tokens from database
                for (const token of failedTokens) {
                    try {
                        await this.fcmTokenRepository.delete(token);
                        console.log(`🗑️  Removed invalid FCM token: ${token.substring(0, 20)}...`);
                    } catch (error) {
                        console.error(`❌ Failed to remove invalid token: ${token.substring(0, 20)}...`, error);
                    }
                }
            }

            console.log(`✅ Push notification sent successfully:`);
            console.log(`   📱 Phone: ${phoneNumber}`);
            console.log(`   📊 Success: ${response.successCount} device(s)`);
            console.log(`   ❌ Failed: ${response.failureCount} device(s)`);
            console.log(`   📝 Title: ${payload.title}`);
            console.log(`   📝 Body: ${payload.body}`);
        } catch (error) {
            console.error(`Error sending push notification to ${phoneNumber}:`, error);
            throw error;
        }
    }

    async sendToToken(
        token: string,
        payload: PushNotificationPayload
    ): Promise<void> {
        if (!this.app) {
            console.warn('Firebase not initialized, skipping push notification');
            return;
        }

        try {
            const message: admin.messaging.Message = {
                notification: {
                    title: payload.title,
                    body: payload.body
                },
                data: payload.data ? this.convertDataToString(payload.data) : undefined,
                token: token
            };

            await admin.messaging().send(message);
            console.log(`✅ Push notification sent to single token:`);
            console.log(`   🔑 Token: ${token.substring(0, 20)}...`);
            console.log(`   📝 Title: ${payload.title}`);
            console.log(`   📝 Body: ${payload.body}`);
        } catch (error: any) {
            console.error(`❌ Failed to send push notification to token: ${token.substring(0, 20)}...`, error.message);

            // If token is invalid, remove it from database
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                try {
                    await this.fcmTokenRepository.delete(token);
                    console.log(`🗑️  Removed invalid FCM token: ${token.substring(0, 20)}...`);
                } catch (deleteError) {
                    console.error(`❌ Failed to remove invalid token: ${token.substring(0, 20)}...`, deleteError);
                }
            }

            throw error;
        }
    }

    private convertDataToString(data: Record<string, string>): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = typeof value === 'string' ? value : JSON.stringify(value);
        }
        return result;
    }

    isInitialized(): boolean {
        return this.app !== null;
    }
}


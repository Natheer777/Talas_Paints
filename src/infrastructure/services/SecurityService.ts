import crypto from 'crypto';

export class SecurityService {
    private readonly secretKey: string;

    constructor() {
        this.secretKey = process.env.HMAC_SECRET_KEY || 'default-secret-key-change-me';
    }

    public generateHmacSignature(payload: string, timestamp: string, url: string): string {
        const data = `${url}${payload}${timestamp}`;
        return crypto.createHmac('sha256', this.secretKey)
            .update(data)
            .digest('hex');
    }

    public verifyHmacSignature(signature: string, payload: string, timestamp: string, url: string): boolean {
        const expectedSignature = this.generateHmacSignature(payload, timestamp, url);

        const signatureBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);

        if (signatureBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    }

    public verifyTimestamp(timestamp: string, toleranceSeconds: number = 30000): boolean {
        const reqTimestamp = parseInt(timestamp, 10);
        const now = Date.now();

        if (isNaN(reqTimestamp)) {
            console.log('HMAC Error: Timestamp is NaN', timestamp);
            return false;
        }

        
        const toleranceMs = toleranceSeconds * 1000;

        const isExpired = reqTimestamp < now - toleranceMs || reqTimestamp > now + toleranceMs;

        if (isExpired) {
            console.log('HMAC Error: Request expired');
            console.log('Server Time:', now, new Date(now).toISOString());
            console.log('Request Time:', reqTimestamp, new Date(reqTimestamp).toISOString());
            console.log('Tolerance (ms):', toleranceMs);
            console.log('Difference:', Math.abs(now - reqTimestamp));
        }

        return !isExpired;
    }
}

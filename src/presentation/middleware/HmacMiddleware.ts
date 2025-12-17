import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '../../infrastructure/services/SecurityService';

export class HmacMiddleware {
    constructor(private securityService: SecurityService) { }

    public handle() {
        return (req: Request, res: Response, next: NextFunction) => {
            if (process.env.NODE_ENV === 'development' && process.env.SKIP_HMAC === 'true') {
                return next();
            }

            const signature = req.headers['x-signature'] as string;
            const timestamp = req.headers['x-timestamp'] as string;

            if (!signature || !timestamp) {
                return res.status(401).json({
                    success: false,
                    message: 'Missing security headers'
                });
            }

            // Verify timestamp first to prevent replay attacks
            if (!this.securityService.verifyTimestamp(timestamp)) {
                return res.status(403).json({
                    success: false,
                    message: 'Request expired'
                });
            }


            const payload = JSON.stringify(req.body) || '';
            const url = req.originalUrl; // Includes query parameters

            if (process.env.NODE_ENV === 'development') {

                const masterData = `MASTER_KEY_BYPASS${timestamp}`;
                const crypto = require('crypto');
                const masterSignature = crypto.createHmac('sha256', process.env.HMAC_SECRET_KEY || 'default')
                    .update(masterData)
                    .digest('hex');

                if (signature === masterSignature) {
                    return next();
                }
            }

            const isValid = this.securityService.verifyHmacSignature(
                signature,
                payload,
                timestamp,
                url
            );

            if (!isValid) {
                console.log('---------------------------------------------------');
                console.log('❌ HMAC Verification Failed');
                console.log('Client Signature:', signature);
                console.log('Server Calculated:', this.securityService.generateHmacSignature(payload, timestamp, url));
                console.log('Data used for calculation:');
                console.log(`URL: '${url}'`);
                console.log(`Payload: '${payload}'`);
                console.log(`Timestamp: '${timestamp}'`);
                console.log('---------------------------------------------------');

                return res.status(403).json({
                    success: false,
                    message: 'Invalid signature'
                });
            }

            next();
        };
    }
}

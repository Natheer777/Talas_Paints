import express, { Application, Request, Response, NextFunction } from 'express';
import swaggerUI from 'swagger-ui-express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import YAML from 'yamljs';
import path from 'path';
import { createProductRouter } from './presentation/router/ProductRouter';
import { createCategoryRouter } from './presentation/router/CategoryRouter';
import { createOrderRouter } from './presentation/router/OrderRouter';
import { createOffersRouter } from './presentation/router/OffersRouter';
import { createAdsCardRouter } from './presentation/router/AdsCardRouter';
import { createVideoCardRouter } from './presentation/router/VideoCardRouter';
import { createPaymentMethodRouter } from './presentation/router/PaymentMethodRouter';
import Container from './infrastructure/di/container';
import { RateLimitMiddleware } from './presentation/middleware/RateLimitMiddleware';
import { HmacMiddleware } from './presentation/middleware/HmacMiddleware';

export class App {
  private app: Application;
  private server?: http.Server;
  private io?: SocketIOServer;

  constructor() {
    const swaggerDocument = YAML.load(path.join(__dirname, './docs/swagger.yaml'));
    this.app = express();
    this.app.use(express.json());

    // Serve static files from public directory
    this.app.use(express.static(path.join(__dirname, '../public')));

    // Apply global rate limiting
    const rateLimitService = Container.getRateLimitService();
    const globalRateLimit = RateLimitMiddleware.createModerate(rateLimitService);
    this.app.use('/api', globalRateLimit.handle());

    // Apply HMAC security
    const securityService = Container.getSecurityService();
    const hmacMiddleware = new HmacMiddleware(securityService);
    // Apply to all /api routes
    this.app.use('/api', hmacMiddleware.handle());

    const productsController = Container.getProductsController();
    const categoriesController = Container.getCategoriesController();
    const orderController = Container.getOrderController();
    const offersController = Container.getOffersController();
    const adsCardController = Container.getAdsCardController();
    const videoCardController = Container.getVideoCardController();
    const paymentMethodController = Container.getPaymentMethodController();

    this.app.use('/api', createProductRouter(productsController));
    this.app.use('/api', createCategoryRouter(categoriesController));
    this.app.use('/api', createOrderRouter(orderController));
    this.app.use('/api', createOffersRouter(offersController));
    this.app.use('/api', createAdsCardRouter(adsCardController));
    this.app.use('/api', createVideoCardRouter(videoCardController));
    this.app.use('/api', createPaymentMethodRouter(paymentMethodController));

    const swaggerOptions = {
      swaggerOptions: {
        withCredentials: true,
        requestInterceptor: (req: any) => {
          req.credentials = 'include';
          return req;
        },
        persistAuthorization: true,
        displayOperationId: false,
        tryItOutEnabled: true,
      },
    };

    this.app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument, swaggerOptions));
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupRoutes(): void {
    this.app.get('/api/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Global Error Handler:', error);

      // Handle Multer errors (file upload errors)
      if (error.name === 'MulterError') {
        let message = 'File upload error';
        let hint = '';
        let statusCode = 400;

        switch (error.code) {
          case 'LIMIT_UNEXPECTED_FILE':
            message = 'Unexpected file field';
            hint = `The field '${error.field}' is not expected. For product images, use field name 'images' (plural), not 'image'.`;
            break;
          case 'LIMIT_FILE_SIZE':
            message = 'File too large';
            hint = 'Maximum file size is 5MB per image. Please reduce the file size and try again.';
            break;
          case 'LIMIT_FILE_COUNT':
            message = 'Too many files';
            hint = 'You can upload unlimited images, but there might be a server limit. Try uploading in smaller batches.';
            break;
          case 'LIMIT_FIELD_KEY':
            message = 'Field name too long';
            hint = 'The field name is too long. Use shorter field names.';
            break;
          case 'LIMIT_FIELD_VALUE':
            message = 'Field value too long';
            hint = 'One of the field values is too long. Please reduce the length.';
            break;
          case 'LIMIT_FIELD_COUNT':
            message = 'Too many fields';
            hint = 'Too many form fields in the request. Reduce the number of fields.';
            break;
          case 'LIMIT_PART_COUNT':
            message = 'Too many parts';
            hint = 'The multipart request has too many parts. Simplify your request.';
            break;
          default:
            hint = 'Please check your file upload configuration and try again.';
        }

        return res.status(statusCode).json({
          success: false,
          message,
          error: error.message,
          hint,
          field: error.field,
          code: error.code,
          timestamp: new Date().toISOString(),
          path: req.path,
        });
      }

      // Handle other errors
      const statusCode = error.statusCode || error.status || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        path: req.path,
        ...(process.env.NODE_ENV === 'development' && {
          error: error.message,
          stack: error.stack
        }),
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public async start(port: number = 3000): Promise<void> {
    try {
      this.server = http.createServer(this.app);

      // Initialize Socket.IO
      this.io = new SocketIOServer(this.server, {
        cors: {
          origin: "*", // Configure this properly for production
          methods: ["GET", "POST"]
        }
      });

      // Initialize Socket.IO in DI container
      Container.initializeSocketIO(this.io);

      // Setup Socket.IO connection handling
      this.io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Admin joins admin room
        socket.on('join_admin', () => {
          socket.join('admin');
          console.log('Admin joined:', socket.id);
        });

        // User joins their personal room based on phone number
        socket.on('join_user', (phoneNumber: string) => {
          socket.join(`user_${phoneNumber}`);
          console.log(`User ${phoneNumber} joined room:`, socket.id);
        });

        socket.on('disconnect', () => {
          console.log('Client disconnected:', socket.id);
        });
      });

      this.server.listen(port, '0.0.0.0', () => {
        const env = process.env.NODE_ENV || 'development';
        console.log(`🚀 Server is running (env: ${env}) on http://localhost:${port}`);
        console.log(`📡 Socket.IO is ready for real-time notifications`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getIO(): SocketIOServer | undefined {
    return this.io;
  }
}
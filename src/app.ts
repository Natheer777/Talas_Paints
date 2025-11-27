import express, { Application, Request, Response, NextFunction } from 'express';
import swaggerUI from 'swagger-ui-express';
import http from 'http';
import YAML from 'yamljs';
import path from 'path'; 
import { createProductRouter } from './presentation/router/ProductRouter';
import { createCategoryRouter } from './presentation/router/CategoryRouter';
import Container from './infrastructure/di/container';

export class App {
  private app: Application;
  private server?: http.Server;

  constructor() {
    const swaggerDocument = YAML.load(path.join(__dirname, './docs/swagger.yaml'));
    this.app = express();
    this.app.use(express.json());

    // Controllers via DI container
    const productsController = Container.getProductsController();
    const categoriesController = Container.getCategoriesController();

    // Register routers
    this.app.use('/api', createProductRouter(productsController));
    this.app.use('/api', createCategoryRouter(categoriesController));

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
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Global Error Handler:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message }),
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public async start(port: number = 3000): Promise<void> {
    try {
      this.server = http.createServer(this.app);
      this.server.listen(port, '0.0.0.0', () => {
        const env = process.env.NODE_ENV || 'development';
        console.log(`🚀 Server is running (env: ${env}) on http://localhost:${port}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}
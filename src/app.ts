import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middlewares/error.middleware';
import authRouter from './modules/auth/auth.router';
import userRouter from './modules/users/user.router';
import invoiceRouter from './modules/invoices/invoice.router';
import swaggerSpec from './docs/swagger';

const createApp = () => {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({
  origin: "*",
  credentials: true,
}));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Smart Invoicer API Docs',
      swaggerOptions: { persistAuthorization: true },
    })
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/invoices', invoiceRouter);

  app.use(errorHandler);

  return app;
};

export default createApp;

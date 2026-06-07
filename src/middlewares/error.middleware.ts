import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 409, 'CONFLICT', 'A record with that value already exists');
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 404, 'NOT_FOUND', 'Record not found');
      return;
    }
  }

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
    return;
  }

  logger.error('Unhandled error', { error: err });
  sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred');
};

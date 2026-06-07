import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/apiResponse';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 401, 'UNAUTHORIZED', 'No token provided');
    return;
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    sendError(res, 401, 'UNAUTHORIZED', 'No token provided');
    return;
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
};

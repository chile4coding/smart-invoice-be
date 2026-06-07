import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { sendError } from '../utils/apiResponse';

export const authorize =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      
      sendError(res, 403, 'FORBIDDEN', 'You do not have permission to perform this action');
      return;
    }
    next();
  };

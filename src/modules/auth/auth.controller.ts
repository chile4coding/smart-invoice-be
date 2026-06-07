import { Request, Response, NextFunction } from 'express';
import { loginUser, getCurrentUser } from './auth.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await loginUser(email, password);
    if (!result) {
      sendError(res, 401, 'UNAUTHORIZED', 'Invalid email or password');
      return;
    }
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const logout = (_req: Request, res: Response): void => {
  sendSuccess(res, null, 'Logged out successfully');
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await getCurrentUser(req.user!.sub);
    
    if (!user) {
      sendError(res, 404, 'NOT_FOUND', 'User not found');
      return;
    }
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

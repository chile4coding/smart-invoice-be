import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import * as userService from './user.service';
import { sendSuccess, sendCreated, sendNoContent, sendError } from '../../utils/apiResponse';

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = req.body as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: Role;
    };
    const user = await userService.createUser({ ...body, createdById: req.user!.sub });
    sendCreated(res, user, 'User created successfully');
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query['page'] as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string, 10) || 10));
    const search = (req.query['search'] as string) || undefined;
    const result = await userService.listUsers({ search, page, limit });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params['id']);
    if (!user) {
      sendError(res, 404, 'NOT_FOUND', 'User not found');
      return;
    }
    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName } = req.body as { firstName: string; lastName: string };
    const user = await userService.updateProfile(req.params['id'], firstName, lastName);
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { newPassword } = req.body as { newPassword: string };
    const user = await userService.changePassword(req.params['id'], newPassword);
    sendSuccess(res, user, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};

export const changeRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body as { role: Role };
    const user = await userService.changeRole(req.params['id'], role);
    sendSuccess(res, user, 'Role updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deactivateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await userService.deactivateUser(req.params['id']);
    sendNoContent(res);
  } catch (err) {
    next(err);
  }
};

export const upsertDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const input = req.body as {
      totalAttendance: string;
      newRegistration: string;
      followUp: string;
      totalPatients: string;
      today: string;
      thisWeek: string;
      thisMonth: string;
      totalPayments: string;
    };
    const stats = await userService.upsertDashboardStats(userId, input);
    sendSuccess(res, stats, 'Dashboard stats saved successfully');
  } catch (err) {
    next(err);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await userService.getDashboardStats(req.user!.sub);
    if (!stats) {
      sendError(res, 404, 'NOT_FOUND', 'No dashboard stats found for this user');
      return;
    }
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};

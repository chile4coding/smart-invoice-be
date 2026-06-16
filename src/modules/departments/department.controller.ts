import { Request, Response, NextFunction } from 'express';
import * as departmentService from './department.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export const listDepartments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query['page'] as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string, 10) || 10));
    const search = (req.query['search'] as string) || undefined;
    const result = await departmentService.listDepartments({ search, page, limit });
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const listDepartmentFees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const identifier = req.params['identifier'] as string;
    const page = Math.max(1, parseInt(req.query['page'] as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string, 10) || 10));
    const search = (req.query['search'] as string) || undefined;

    const result = await departmentService.listDepartmentFees({ identifier, search, page, limit });

    if (!result) {
      sendError(res, 404, 'NOT_FOUND', 'Department not found');
      return;
    }

    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

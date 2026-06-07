import { Response } from 'express';

type ErrorDetail = { field?: string; message: string };

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200): void => {
  res.status(statusCode).json({ success: true, data, message });
};

export const sendCreated = <T>(res: Response, data: T, message?: string): void =>
  sendSuccess(res, data, message, 201);

export const sendNoContent = (res: Response): void => { res.status(204).send(); };

export const sendError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: ErrorDetail[]
): void => {
  res.status(statusCode).json({ success: false, error: { code, message, details } });
};

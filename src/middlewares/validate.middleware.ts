import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse';

export const validateRequest =
  (validations: ValidationChain[]) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const validation of validations) {
      await validation.run(req);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const details = errors.array().map((err) => ({
        field: err.type === 'field' ? err.path : undefined,
        message: err.msg as string,
      }));
      sendError(res, 400, 'VALIDATION_ERROR', 'Validation failed', details);
      return;
    }
    next();
  };

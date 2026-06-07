import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export const hashPassword = (plaintext: string): Promise<string> =>
  bcrypt.hash(plaintext, env.bcryptSaltRounds);

export const comparePassword = (plaintext: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plaintext, hash);

import { AppError } from './app-error.js';

export function parsePositiveId(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError('ID must be a positive integer.', 400, 'INVALID_ID');
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError('ID must be a positive integer.', 400, 'INVALID_ID');
  }

  return id;
}

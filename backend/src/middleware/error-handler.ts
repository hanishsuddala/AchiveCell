import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/app-error.js';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: { code: error.code, message: error.message },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    response.status(400).json({
      error: {
        code: 'DATABASE_CONSTRAINT_ERROR',
        message: 'The request conflicts with a database constraint.',
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    response.status(500).json({
      error: {
        code: 'DATABASE_CONNECTION_ERROR',
        message: 'The database connection is unavailable.',
      },
    });
    return;
  }

  console.error('Unhandled API error:', error);
  response.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred.',
    },
  });
};

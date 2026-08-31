import type { Request, Response } from 'express';

export function notFoundHandler(_request: Request, response: Response): void {
  response.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested endpoint does not exist.',
    },
  });
}

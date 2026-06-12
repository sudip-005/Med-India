import { Request, Response, NextFunction } from 'express';

/**
 * Global Error Handling Middleware for Express.
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('💥 Error handler caught exception:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

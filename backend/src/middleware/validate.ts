import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Middleware to validate incoming request data using Zod schema.
 * It expects the schema to define validations for body, query, or params.
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      // Update request with parsed/coerced data
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            location: err.path[0],
            field: err.path.slice(1).join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

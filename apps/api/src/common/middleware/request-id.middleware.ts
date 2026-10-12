import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Attaches a unique correlation ID to every incoming request.
 * Uses X-Request-ID header if provided by the client; otherwise generates a new UUID.
 * The ID is reflected in the response header for end-to-end tracing.
 */
export function RequestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) || randomUUID();
    (req as Request & { requestId: string }).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
}

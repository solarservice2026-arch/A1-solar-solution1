import type { NextFunction, Request, RequestHandler, Response } from "express";
export class AppError extends Error {
  constructor(public status: number, message: string, public code: string, public errors: unknown[] = []) { super(message); }
}
export const asyncHandler = (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { void Promise.resolve(handler(req, res, next)).catch(next); };
export const success = (res: Response, message: string, data: unknown, meta: object = {}) =>
  res.json({ success: true, message, data, meta });

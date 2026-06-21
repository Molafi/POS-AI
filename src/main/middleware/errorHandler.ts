import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const ERROR_LOG_DIR = path.join(process.cwd(), 'logs');
const ERROR_LOG_FILE = path.join(ERROR_LOG_DIR, 'error.log');

function ensureLogDir(): void {
  if (!fs.existsSync(ERROR_LOG_DIR)) {
    fs.mkdirSync(ERROR_LOG_DIR, { recursive: true });
  }
}

function writeToErrorLog(entry: string): void {
  try {
    ensureLogDir();
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${entry}\n`;
    fs.appendFileSync(ERROR_LOG_FILE, logLine);
  } catch {
    console.error('Failed to write to error log');
  }
}

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  details?: unknown;
}

export function createAppError(
  message: string,
  statusCode: number = 500,
  details?: unknown
): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  error.details = details;
  return error;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Log the error
  const logEntry = JSON.stringify({
    method: req.method,
    url: req.url,
    statusCode,
    message: err.message,
    stack: err.stack,
    details: err.details,
  });
  writeToErrorLog(logEntry);
  console.error(`[Error] ${req.method} ${req.url}:`, err.message);

  // User-friendly messages for common database errors
  let userMessage = err.message;
  if (!isOperational) {
    if (err.message.includes('SQLITE_CONSTRAINT')) {
      userMessage = 'A record with this information already exists.';
    } else if (err.message.includes('SQLITE_BUSY')) {
      userMessage = 'The database is temporarily busy. Please try again.';
    } else if (err.message.includes('connect')) {
      userMessage = 'Unable to connect to the database. Please restart the application.';
    } else {
      userMessage = 'An unexpected error occurred. Please try again later.';
    }
  }

  res.status(statusCode).json({
    success: false,
    error: userMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

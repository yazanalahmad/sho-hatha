export interface ErrorPayload {
  code: string;
  message: string;
  details: unknown[];
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown[];

  constructor(statusCode: number, code: string, message: string, details: unknown[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function toErrorBody(payload: ErrorPayload): { error: ErrorPayload } {
  return { error: payload };
}

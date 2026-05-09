export class AppError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}

export function getErrorStatus(error: unknown) {
  if (error instanceof AppError) {
    return error.status;
  }

  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === 'number') {
      return status;
    }
  }

  return 500;
}
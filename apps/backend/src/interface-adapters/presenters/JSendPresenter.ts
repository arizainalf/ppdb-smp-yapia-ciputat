export interface JSendSuccess<T> {
  status: 'success';
  message?: string;
  data: T;
}

export interface JSendFail {
  status: 'fail';
  message: string;
  data?: Record<string, unknown> | unknown[];
}

export interface JSendError {
  status: 'error';
  message: string;
  code?: string;
}

export class JSendPresenter {
  public static success<T>(data: T, message?: string): JSendSuccess<T> {
    return {
      status: 'success',
      ...(message ? { message } : {}),
      data,
    };
  }

  public static fail(message: string, data?: Record<string, unknown> | unknown[]): JSendFail {
    return {
      status: 'fail',
      message,
      ...(data ? { data } : {}),
    };
  }

  public static error(message: string, code?: string): JSendError {
    return {
      status: 'error',
      message,
      ...(code ? { code } : {}),
    };
  }
}

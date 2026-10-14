// Error with a code: the API returns { error: code, params } and the client translates it (lib/i18n)
export class AppError extends Error {
  constructor(code, params = {}, status = 502) {
    super(code);
    this.code = code;
    this.params = params;
    this.status = status;
  }
}

export const badRequest = (code, params) => new AppError(code, params, 400);

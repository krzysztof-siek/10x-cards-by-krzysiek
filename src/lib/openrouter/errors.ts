export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class OpenRouterAuthenticationError extends OpenRouterError {}

export class OpenRouterRateLimitError extends OpenRouterError {}

export class OpenRouterInvalidRequestError extends OpenRouterError {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

export class OpenRouterServerError extends OpenRouterError {}

export class JSONParsingError extends OpenRouterError {}

export class NetworkError extends OpenRouterError {}

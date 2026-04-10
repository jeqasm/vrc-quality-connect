import { env } from '../config/env';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(message || 'Request failed', response.status);
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  const rawBody = await response.text();

  if (!rawBody.trim()) {
    return null as TResponse;
  }

  return JSON.parse(rawBody) as TResponse;
}

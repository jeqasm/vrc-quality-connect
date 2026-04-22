import { env } from '../config/env';
import { getStoredAccessToken } from '../../modules/auth/model/auth-storage';

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
      ...(getStoredAccessToken() ? { Authorization: `Bearer ${getStoredAccessToken()}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const rawMessage = await response.text();
    let errorMessage: string | null = null;

    try {
      const parsedError = JSON.parse(rawMessage) as { message?: string | string[] };
      if (Array.isArray(parsedError.message)) {
        errorMessage = parsedError.message.join('; ');
      } else if (typeof parsedError.message === 'string' && parsedError.message.trim() !== '') {
        errorMessage = parsedError.message;
      }
    } catch {
      errorMessage = null;
    }

    throw new ApiError(errorMessage ?? rawMessage ?? 'Request failed', response.status);
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

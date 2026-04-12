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

    try {
      const parsedError = JSON.parse(rawMessage) as { message?: string };
      throw new ApiError(parsedError.message || 'Request failed', response.status);
    } catch {
      throw new ApiError(rawMessage || 'Request failed', response.status);
    }
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

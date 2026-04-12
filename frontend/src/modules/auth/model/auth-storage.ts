const accessTokenStorageKey = 'vrc-quality-connect.access-token';

export function getStoredAccessToken(): string | null {
  return window.localStorage.getItem(accessTokenStorageKey);
}

export function storeAccessToken(accessToken: string): void {
  window.localStorage.setItem(accessTokenStorageKey, accessToken);
}

export function clearStoredAccessToken(): void {
  window.localStorage.removeItem(accessTokenStorageKey);
}

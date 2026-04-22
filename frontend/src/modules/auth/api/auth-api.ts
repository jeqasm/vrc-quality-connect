import { apiClient } from '../../../shared/api/api-client';
import { AuthSession, CurrentAccount } from '../model/auth-session';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  inviteToken: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type RegistrationInvite = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  department: {
    id: string;
    code: string;
    name: string;
  };
  accessRole: {
    code: string;
    name: string;
  };
};

export type CreatedRegistrationInvite = RegistrationInvite & {
  inviteToken: string;
};

export type RegistrationInvitePublicInfo = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  expiresAt: string;
  department: {
    id: string;
    code: string;
    name: string;
  };
  accessRole: {
    code: string;
    name: string;
  };
};

export type CreateRegistrationInviteRequest = {
  email?: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  accessRoleCode: string;
  expiresInDays: number;
};

export type UpdateCurrentAccountRequest = {
  firstName: string;
  lastName: string;
};

export type UpdateCurrentAccountPasswordRequest = {
  newPassword: string;
  confirmPassword: string;
};

export function login(request: LoginRequest): Promise<AuthSession> {
  return apiClient<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function register(request: RegisterRequest): Promise<AuthSession> {
  return apiClient<AuthSession>('/auth/register-by-invite', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function getRegistrationInvite(inviteToken: string): Promise<RegistrationInvitePublicInfo> {
  return apiClient<RegistrationInvitePublicInfo>(`/auth/registration-invites/${inviteToken}`);
}

export function getRegistrationInvites(): Promise<RegistrationInvite[]> {
  return apiClient<RegistrationInvite[]>('/auth/registration-invites');
}

export function createRegistrationInvite(
  request: CreateRegistrationInviteRequest,
): Promise<CreatedRegistrationInvite> {
  return apiClient<CreatedRegistrationInvite>('/auth/registration-invites', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function deleteRegistrationInvite(inviteId: string): Promise<void> {
  return apiClient<void>(`/auth/registration-invites/${inviteId}`, {
    method: 'DELETE',
  });
}

export function fetchCurrentAccount(accessToken: string): Promise<CurrentAccount> {
  return apiClient<CurrentAccount>('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function logout(accessToken: string): Promise<void> {
  return apiClient<void>('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function updateCurrentAccount(request: UpdateCurrentAccountRequest): Promise<CurrentAccount> {
  return apiClient<CurrentAccount>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

export function updateCurrentAccountPassword(
  request: UpdateCurrentAccountPasswordRequest,
): Promise<void> {
  return apiClient<void>('/auth/me/password', {
    method: 'PATCH',
    body: JSON.stringify(request),
  });
}

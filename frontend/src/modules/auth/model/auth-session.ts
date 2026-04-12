export type AuthGroup = {
  id: string;
  code: string;
  name: string;
  type: string;
};

export type CurrentAccount = {
  accountId: string;
  email: string;
  status: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    department: {
      id: string;
      code: string;
      name: string;
    };
    accessRole: {
      code: string;
      name: string;
    };
    groups: AuthGroup[];
  };
  permissions: string[];
};

export type AuthSession = {
  accessToken: string;
  expiresAt: string;
  account: CurrentAccount;
};

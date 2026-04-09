export type ReferenceOption = {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
};

export type UserOption = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department: {
    id: string;
    code: string;
    name: string;
  };
};

export type ReferenceDataBundle = {
  users: UserOption[];
  departments: ReferenceOption[];
  activityTypes: ReferenceOption[];
  activityResults: ReferenceOption[];
};

CREATE TABLE "access_roles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_system" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "access_permissions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "access_role_permissions" (
  "role_id" UUID NOT NULL REFERENCES "access_roles"("id") ON DELETE CASCADE,
  "permission_id" UUID NOT NULL REFERENCES "access_permissions"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("role_id", "permission_id")
);

CREATE TABLE "groups" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "department_id" UUID REFERENCES "departments"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "group_memberships" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" UUID NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("group_id", "user_id")
);

CREATE TABLE "group_permission_assignments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "group_id" UUID NOT NULL REFERENCES "groups"("id") ON DELETE CASCADE,
  "permission_id" UUID NOT NULL REFERENCES "access_permissions"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("group_id", "permission_id")
);

CREATE TABLE "auth_accounts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "email_verified_at" TIMESTAMPTZ,
  "last_login_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "auth_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "auth_account_id" UUID NOT NULL REFERENCES "auth_accounts"("id") ON DELETE CASCADE,
  "token_hash" TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO "access_roles" ("code", "name", "description")
VALUES
  ('administrator', 'Administrator', 'Platform-wide administrator access'),
  ('manager', 'Manager', 'Manager access for reporting and team administration'),
  ('employee', 'Employee', 'Operational employee access');

ALTER TABLE "users"
  ADD COLUMN "access_role_id" UUID;

UPDATE "users"
SET "access_role_id" = "access_roles"."id"
FROM "access_roles"
WHERE "access_roles"."code" = CASE
  WHEN "users"."role" IN ('administrator', 'admin') THEN 'administrator'
  WHEN "users"."role" IN ('manager', 'quality-manager') THEN 'manager'
  ELSE 'employee'
END;

ALTER TABLE "users"
  ALTER COLUMN "access_role_id" SET NOT NULL,
  ADD CONSTRAINT "users_access_role_id_fkey"
    FOREIGN KEY ("access_role_id") REFERENCES "access_roles"("id") ON DELETE RESTRICT;

ALTER TABLE "users"
  DROP COLUMN "role";

CREATE INDEX "users_access_role_id_idx"
  ON "users" ("access_role_id");

CREATE INDEX "access_permissions_category_code_idx"
  ON "access_permissions" ("category", "code");

CREATE INDEX "groups_type_is_active_idx"
  ON "groups" ("type", "is_active");

CREATE INDEX "groups_department_id_idx"
  ON "groups" ("department_id");

CREATE INDEX "group_memberships_user_id_idx"
  ON "group_memberships" ("user_id");

CREATE INDEX "group_permission_assignments_permission_id_idx"
  ON "group_permission_assignments" ("permission_id");

CREATE INDEX "auth_sessions_auth_account_id_expires_at_idx"
  ON "auth_sessions" ("auth_account_id", "expires_at");

CREATE INDEX "auth_sessions_expires_at_idx"
  ON "auth_sessions" ("expires_at");

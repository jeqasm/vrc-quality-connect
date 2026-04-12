CREATE TABLE "registration_invites" (
    "id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "email" TEXT,
    "department_id" UUID NOT NULL,
    "access_role_id" UUID NOT NULL,
    "created_by_account_id" UUID NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_invites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "registration_invites_token_hash_key" ON "registration_invites"("token_hash");
CREATE INDEX "registration_invites_expires_at_idx" ON "registration_invites"("expires_at");
CREATE INDEX "registration_invites_created_by_account_id_created_at_idx" ON "registration_invites"("created_by_account_id", "created_at");
CREATE INDEX "registration_invites_department_id_idx" ON "registration_invites"("department_id");
CREATE INDEX "registration_invites_access_role_id_idx" ON "registration_invites"("access_role_id");

ALTER TABLE "registration_invites" ADD CONSTRAINT "registration_invites_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "registration_invites" ADD CONSTRAINT "registration_invites_access_role_id_fkey" FOREIGN KEY ("access_role_id") REFERENCES "access_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "registration_invites" ADD CONSTRAINT "registration_invites_created_by_account_id_fkey" FOREIGN KEY ("created_by_account_id") REFERENCES "auth_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

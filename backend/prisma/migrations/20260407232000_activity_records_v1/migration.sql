ALTER TABLE "departments"
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE "activity_types"
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE "activity_results"
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX "users_department_id_idx"
  ON "users" ("department_id");

ALTER TABLE "activity_records"
  DROP COLUMN IF EXISTS "license_operation_id" CASCADE,
  DROP COLUMN IF EXISTS "support_request_id" CASCADE,
  DROP COLUMN IF EXISTS "status" CASCADE,
  DROP COLUMN IF EXISTS "object_type" CASCADE,
  DROP COLUMN IF EXISTS "object_name" CASCADE;

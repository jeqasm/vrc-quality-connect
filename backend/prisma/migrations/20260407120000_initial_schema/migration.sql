CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "departments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "activity_types" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "activity_results" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "license_types" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "support_request_types" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "full_name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "department_id" UUID NOT NULL REFERENCES "departments"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "license_operations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "license_type_id" UUID NOT NULL REFERENCES "license_types"("id"),
  "organization" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "contact_full_name" TEXT,
  "contact_email" TEXT,
  "issued_at" TIMESTAMPTZ,
  "expires_at" TIMESTAMPTZ,
  "duration_days" INTEGER,
  "operation_type" TEXT NOT NULL,
  "comment" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "support_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "support_request_type_id" UUID NOT NULL REFERENCES "support_request_types"("id"),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "channel" TEXT,
  "requester_name" TEXT,
  "requester_email" TEXT,
  "organization" TEXT,
  "status" TEXT NOT NULL,
  "resolved_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "activity_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "department_id" UUID NOT NULL REFERENCES "departments"("id"),
  "activity_type_id" UUID NOT NULL REFERENCES "activity_types"("id"),
  "activity_result_id" UUID NOT NULL REFERENCES "activity_results"("id"),
  "license_operation_id" UUID REFERENCES "license_operations"("id"),
  "support_request_id" UUID REFERENCES "support_requests"("id"),
  "work_date" DATE NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "comment" TEXT,
  "external_id" TEXT,
  "external_url" TEXT,
  "status" TEXT,
  "object_type" TEXT,
  "object_name" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "activity_records_user_id_work_date_idx"
  ON "activity_records" ("user_id", "work_date");

CREATE INDEX "activity_records_department_id_work_date_idx"
  ON "activity_records" ("department_id", "work_date");

CREATE INDEX "activity_records_activity_type_id_work_date_idx"
  ON "activity_records" ("activity_type_id", "work_date");

CREATE INDEX "license_operations_user_id_idx"
  ON "license_operations" ("user_id");

CREATE INDEX "support_requests_user_id_idx"
  ON "support_requests" ("user_id");

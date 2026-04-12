CREATE TABLE "license_registry_records" (
    "id" UUID NOT NULL,
    "issue_date" DATE NOT NULL,
    "license_type_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "organization_name" TEXT,
    "recipient_email" TEXT,
    "issued_to" TEXT NOT NULL,
    "comment" TEXT,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "license_registry_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "license_registry_records_issue_date_license_type_id_idx" ON "license_registry_records"("issue_date", "license_type_id");
CREATE INDEX "license_registry_records_created_by_user_id_idx" ON "license_registry_records"("created_by_user_id");

ALTER TABLE "license_registry_records" ADD CONSTRAINT "license_registry_records_license_type_id_fkey" FOREIGN KEY ("license_type_id") REFERENCES "license_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "license_registry_records" ADD CONSTRAINT "license_registry_records_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "license_registry_records" (
    "id",
    "issue_date",
    "license_type_id",
    "quantity",
    "organization_name",
    "recipient_email",
    "issued_to",
    "comment",
    "created_by_user_id",
    "created_at",
    "updated_at"
)
SELECT
    gen_random_uuid(),
    entry."issue_date",
    license_type."id",
    entry."quantity",
    entry."organization_name",
    entry."recipient_email",
    entry."issued_to",
    NULL,
    NULL,
    entry."created_at",
    entry."created_at"
FROM "license_registry_entries" entry
INNER JOIN "license_registry_import_batches" batch ON batch."id" = entry."import_batch_id" AND batch."is_active" = true
INNER JOIN "license_types" license_type ON LOWER(license_type."name") = LOWER(entry."license_type")
    OR LOWER(license_type."code") = LOWER(entry."license_type");

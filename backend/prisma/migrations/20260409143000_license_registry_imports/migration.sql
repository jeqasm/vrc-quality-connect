CREATE TABLE "license_registry_import_batches" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "source_document_url" TEXT NOT NULL,
  "source_sheet_name" TEXT NOT NULL,
  "total_source_rows" INTEGER NOT NULL,
  "imported_rows" INTEGER NOT NULL,
  "skipped_rows" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "imported_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "license_registry_entries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "import_batch_id" UUID NOT NULL REFERENCES "license_registry_import_batches"("id") ON DELETE CASCADE,
  "source_row_number" INTEGER NOT NULL,
  "issue_date" DATE NOT NULL,
  "quantity" INTEGER NOT NULL,
  "license_type" TEXT NOT NULL,
  "organization_name" TEXT,
  "recipient_email" TEXT,
  "issued_to" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "license_registry_import_batches_is_active_imported_at_idx"
  ON "license_registry_import_batches" ("is_active", "imported_at");

CREATE INDEX "license_registry_entries_import_batch_id_issue_date_idx"
  ON "license_registry_entries" ("import_batch_id", "issue_date");

CREATE INDEX "license_registry_entries_issue_date_license_type_idx"
  ON "license_registry_entries" ("issue_date", "license_type");

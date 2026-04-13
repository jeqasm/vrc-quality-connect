WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY
        issue_date,
        license_type_id,
        quantity,
        COALESCE(TRIM(LOWER(issued_to)), ''),
        COALESCE(TRIM(LOWER(organization_name)), ''),
        COALESCE(TRIM(LOWER(recipient_email)), ''),
        COALESCE(TRIM(LOWER(comment)), '')
      ORDER BY created_at ASC, id ASC
    ) AS row_num
  FROM license_registry_records
)
DELETE FROM license_registry_records target
USING ranked source
WHERE target.id = source.id
  AND source.row_num > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "license_registry_records_dedup_guard_idx"
ON "license_registry_records" (
  "issue_date",
  "license_type_id",
  "quantity",
  (COALESCE(TRIM(LOWER("issued_to")), '')),
  (COALESCE(TRIM(LOWER("organization_name")), '')),
  (COALESCE(TRIM(LOWER("recipient_email")), '')),
  (COALESCE(TRIM(LOWER("comment")), ''))
);

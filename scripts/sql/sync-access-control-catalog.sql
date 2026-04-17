BEGIN;

INSERT INTO access_permissions (code, name, category) VALUES
  ('activity-records.qa.view', 'View QA activity tab', 'activity-records'),
  ('activity-records.support.view', 'View support activity tab', 'activity-records'),
  ('activity-records.management.view', 'View management activity tab', 'activity-records')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  category = EXCLUDED.category;

WITH desired_group_permissions (group_code, permission_code) AS (
  VALUES
    ('department-qa-testing', 'activity-records.qa.view'),
    ('department-qa-testing', 'reports.qa.view'),
    ('department-technical-support', 'activity-records.support.view'),
    ('department-technical-support', 'reports.support.view'),
    ('department-quality-management', 'activity-records.management.view'),
    ('department-quality-management', 'reports.management.view'),
    ('department-quality-management', 'groups.manage')
)
INSERT INTO group_permission_assignments (group_id, permission_id)
SELECT g.id, p.id
FROM desired_group_permissions d
JOIN groups g ON g.code = d.group_code
JOIN access_permissions p ON p.code = d.permission_code
ON CONFLICT (group_id, permission_id) DO NOTHING;

WITH desired_role_permissions (role_code, permission_code) AS (
  VALUES
    ('manager', 'dashboard.view'),
    ('manager', 'activity-records.view'),
    ('manager', 'activity-records.create'),
    ('manager', 'reports.view'),
    ('manager', 'licenses.view'),
    ('manager', 'support-requests.view'),
    ('manager', 'settings.view'),
    ('manager', 'groups.manage'),
    ('employee', 'activity-records.view'),
    ('employee', 'activity-records.create'),
    ('employee', 'reports.view'),
    ('employee', 'licenses.view')
),
target_roles AS (
  SELECT id, code
  FROM access_roles
  WHERE code IN ('manager', 'employee')
),
resolved_desired AS (
  SELECT tr.id AS role_id, p.id AS permission_id
  FROM desired_role_permissions d
  JOIN target_roles tr ON tr.code = d.role_code
  JOIN access_permissions p ON p.code = d.permission_code
)
DELETE FROM access_role_permissions arp
USING target_roles tr
WHERE arp.role_id = tr.id
  AND NOT EXISTS (
    SELECT 1
    FROM resolved_desired rd
    WHERE rd.role_id = arp.role_id
      AND rd.permission_id = arp.permission_id
  );

WITH desired_role_permissions (role_code, permission_code) AS (
  VALUES
    ('manager', 'dashboard.view'),
    ('manager', 'activity-records.view'),
    ('manager', 'activity-records.create'),
    ('manager', 'reports.view'),
    ('manager', 'licenses.view'),
    ('manager', 'support-requests.view'),
    ('manager', 'settings.view'),
    ('manager', 'groups.manage'),
    ('employee', 'activity-records.view'),
    ('employee', 'activity-records.create'),
    ('employee', 'reports.view'),
    ('employee', 'licenses.view')
),
resolved_desired AS (
  SELECT ar.id AS role_id, ap.id AS permission_id
  FROM desired_role_permissions d
  JOIN access_roles ar ON ar.code = d.role_code
  JOIN access_permissions ap ON ap.code = d.permission_code
)
INSERT INTO access_role_permissions (role_id, permission_id)
SELECT role_id, permission_id
FROM resolved_desired
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;

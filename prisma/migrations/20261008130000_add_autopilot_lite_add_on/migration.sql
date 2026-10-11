-- Add the Professional-tier Autopilot Lite commercial add-on.
-- Reuse the existing recurring add-on billing type so this migration does not
-- duplicate or hard-code the current enum value.

INSERT INTO "SubscriptionAddOn" (
  "id",
  "code",
  "name",
  "description",
  "billingType",
  "active",
  "createdAt",
  "updatedAt"
)
SELECT
  'autopilot_lite',
  'AUTOPILOT_LITE',
  'Autopilot Lite',
  'Professional-tier Autopilot recommendations as a commercial add-on.',
  "billingType",
  true,
  NOW(),
  NOW()
FROM "SubscriptionAddOn"
WHERE "code" = 'ADDITIONAL_USER'
ON CONFLICT ("code") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "active" = true,
  "updatedAt" = NOW();

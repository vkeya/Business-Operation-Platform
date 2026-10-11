-- 64F — Renewal Idempotency & Duplicate Payment Protection
--
-- renewalKey is populated only for subscription-renewal invoices. It is
-- intentionally nullable so existing purchase/add-on invoices are unaffected.
ALTER TABLE "BillingInvoice"
ADD COLUMN "renewalKey" TEXT;

-- Populate deterministic renewal keys for existing renewal invoices.
-- If duplicate renewal periods already exist, fail rather than silently
-- choosing one invoice and hiding existing duplicate billing state.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "BillingInvoice"
    WHERE "type" = 'SUBSCRIPTION_RENEWAL'
      AND "periodStart" IS NOT NULL
      AND "periodEnd" IS NOT NULL
    GROUP BY "subscriptionId", "periodStart", "periodEnd"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      '64F migration blocked: duplicate subscription renewal invoices already exist for the same billing period';
  END IF;
END $$;

UPDATE "BillingInvoice"
SET "renewalKey" = "subscriptionId"
  || ':'
  || to_char("periodStart" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  || ':'
  || to_char("periodEnd" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
WHERE "type" = 'SUBSCRIPTION_RENEWAL'
  AND "periodStart" IS NOT NULL
  AND "periodEnd" IS NOT NULL;

CREATE UNIQUE INDEX "BillingInvoice_renewalKey_key"
ON "BillingInvoice"("renewalKey");

-- A provider reference identifies one provider transaction. NULL references
-- remain allowed for payments that have not yet been initiated by a provider.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "BillingPayment"
    WHERE "providerReference" IS NOT NULL
    GROUP BY "provider", "providerReference"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      '64F migration blocked: duplicate billing payment provider references already exist';
  END IF;
END $$;

CREATE UNIQUE INDEX "BillingPayment_provider_providerReference_key"
ON "BillingPayment"("provider", "providerReference");

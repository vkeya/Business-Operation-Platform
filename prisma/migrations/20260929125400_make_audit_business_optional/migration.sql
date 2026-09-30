/*
  Make AuditEvent.businessId optional.

  Security/authentication events can occur outside
  a business context.
*/

ALTER TABLE "AuditEvent"
ALTER COLUMN "businessId" DROP NOT NULL;


export const AUDIT_ACTIONS = {
  // Authentication
  AUTH_LOGIN_SUCCESS: "auth.login.success",
  AUTH_LOGIN_FAILED: "auth.login.failed",
  AUTH_LOGOUT: "auth.logout",
  AUTH_PASSWORD_CHANGED: "auth.password.changed",
  AUTH_PASSWORD_RESET: "auth.password.reset",
  AUTH_EMAIL_VERIFIED: "auth.email.verified",
  AUTH_EMAIL_VERIFICATION_RESENT:
    "auth.email.verification.resent",

  // Users
  USER_REGISTERED: "user.registered",
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DEACTIVATED: "user.deactivated",
  USER_ROLE_CHANGED: "user.role.changed",
  USER_PERMISSION_CHANGED: "user.permission.changed",

  // Business
  BUSINESS_CREATED: "business.created",
  BUSINESS_UPDATED: "business.updated",
  BUSINESS_SETTINGS_CHANGED: "business.settings.changed",
  BUSINESS_MEMBER_ADDED: "business.member.added",
  BUSINESS_MEMBER_REMOVED: "business.member.removed",
  BUSINESS_INVITATION_CREATED: "business.invitation.created",
  BUSINESS_INVITATION_RESENT: "business.invitation.resent",
  BUSINESS_INVITATION_REVOKED: "business.invitation.revoked",


  // Products
  PRODUCT_CREATED: "product.created",
  PRODUCT_UPDATED: "product.updated",
  PRODUCT_DELETED: "product.deleted",

  // Inventory
  INVENTORY_ADJUSTED: "inventory.adjusted",
  INVENTORY_TRANSFERRED: "inventory.transferred",
  INVENTORY_IMPORT: "inventory.import",

  // Sales
  SALE_CREATED: "sale.created",
  SALE_CHECKOUT_FAILED: "sale.checkout.failed",
  SALE_VOIDED: "sale.voided",
  SALE_REFUNDED: "sale.refunded",
  SALE_RETURN_CREATED: "sale.return.created",
  SALE_COMPLETED: "sale.completed",
  SALE_CANCELLED: "sale.cancelled",
  SALE_REVERSED: "sale.reversed",

  // Purchases
  PURCHASE_CREATED: "purchase.created",
  PURCHASE_RECEIVED: "purchase.received",
  PURCHASE_CANCELLED: "purchase.cancelled",

  // Expenses
  EXPENSE_CREATED: "expense.created",
  EXPENSE_UPDATED: "expense.updated",
  EXPENSE_DELETED: "expense.deleted",

  // Accounting
  JOURNAL_CREATED: "journal.created",
  JOURNAL_POSTED: "journal.posted",
  JOURNAL_REVERSED: "journal.reversed",

  // Payments
  PAYMENT_INITIATED: "payment.initiated",
  PAYMENT_SUCCESS: "payment.success",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_REFUNDED: "payment.refunded",
  PAYMENT_REVERSED: "payment.reversed",

  // eTIMS
  ETIMS_INVOICE_CREATED: "etims.invoice.created",
  ETIMS_INVOICE_SUBMITTED: "etims.invoice.submitted",
  ETIMS_INVOICE_ACCEPTED: "etims.invoice.accepted",
  ETIMS_INVOICE_REJECTED: "etims.invoice.rejected",
  ETIMS_INVOICE_CANCELLED: "etims.invoice.cancelled",

  // Pharmacy
  PRESCRIPTION_CREATED: "pharmacy.prescription.created",
  CONTROLLED_DISPENSING: "pharmacy.controlled.dispensing",
  CONTROLLED_DISPENSING_REVERSED:
    "pharmacy.controlled.dispensing.reversed",

    // Supermarket Autopilot
  SUPERMARKET_AUTOPILOT_ACTION_UPDATED:
    "supermarket.autopilot.action.updated",

  // Admin
  ADMIN_LOGIN: "admin.login",
  ADMIN_ROLE_CHANGED: "admin.role.changed",
  ADMIN_BUSINESS_SUSPENDED: "admin.business.suspended",
  ADMIN_BUSINESS_REACTIVATED:
    "admin.business.reactivated",


    // Security
  SECURITY_EMAIL_VERIFIED: "security.email.verified",
  SECURITY_PASSWORD_RESET_REQUESTED:
    "security.password.reset.requested",
  SECURITY_PASSWORD_RESET_COMPLETED:
    "security.password.reset.completed",
  SECURITY_AUTHENTICATION_REJECTED:
    "security.authentication.rejected",
  SECURITY_SESSION_INVALIDATED:
    "security.session.invalidated",


} as const;

export type AuditAction =
  (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
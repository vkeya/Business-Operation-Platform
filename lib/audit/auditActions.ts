

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
  SUBSCRIPTION_TRIAL_STARTED: "subscription.trial.started",


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

  // Hospital Invoice
  HOSPITAL_INVOICE_CREATED: "hospital.invoice.created",
  HOSPITAL_INVOICE_ISSUED: "hospital.invoice.issued",
  HOSPITAL_INVOICE_VOIDED: "hospital.invoice.voided",
  HOSPITAL_INVOICE_PAYMENT_RECORDED: "hospital.invoice.payment.recorded",

  // Pharmacy
  PRESCRIPTION_CREATED: "pharmacy.prescription.created",
  CONTROLLED_DISPENSING: "pharmacy.controlled.dispensing",
  CONTROLLED_DISPENSING_REVERSED:
    "pharmacy.controlled.dispensing.reversed",

    // Hospital patient management
  HOSPITAL_PATIENT_CREATED:
    "hospital.patient.created",
  HOSPITAL_PATIENT_UPDATED:
    "hospital.patient.updated",
  HOSPITAL_PATIENT_DEACTIVATED:
    "hospital.patient.deactivated",
  HOSPITAL_PATIENT_VIEWED:
    "hospital.patient.viewed",

  // Hospital ward and bed management
  HOSPITAL_WARD_CREATED: "hospital.ward.created",
  HOSPITAL_WARD_UPDATED: "hospital.ward.updated",
  HOSPITAL_BED_CREATED: "hospital.bed.created",
  HOSPITAL_BED_STATUS_CHANGED: "hospital.bed.status_changed",
  HOSPITAL_BED_ALLOCATION_CREATED:
    "hospital.bed.allocation_created",
  HOSPITAL_BED_ALLOCATION_RELEASED:
    "hospital.bed.allocation_released",

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

    // Hospital appointment management
  HOSPITAL_APPOINTMENT_CREATED:
    "hospital.appointment.created",
  HOSPITAL_APPOINTMENT_UPDATED:
    "hospital.appointment.updated",
  HOSPITAL_APPOINTMENT_STATUS_CHANGED:
    "hospital.appointment.status_changed",
  HOSPITAL_APPOINTMENT_VIEWED:
    "hospital.appointment.viewed",

  // Hospital admissions
  HOSPITAL_ADMISSION_CREATED:
    "hospital.admission.created",
  HOSPITAL_ADMISSION_STATUS_CHANGED:
    "hospital.admission.status_changed",
  HOSPITAL_ADMISSION_VIEWED:
    "hospital.admission.viewed",

  // Hospital clinical encounters
  HOSPITAL_ENCOUNTER_CREATED:
    "hospital.encounter.created",
  HOSPITAL_ENCOUNTER_UPDATED:
    "hospital.encounter.updated",
  HOSPITAL_ENCOUNTER_STATUS_CHANGED:
    "hospital.encounter.status_changed",
  HOSPITAL_ENCOUNTER_VIEWED:
    "hospital.encounter.viewed",

  // Hospital clinical notes
  HOSPITAL_CLINICAL_NOTE_CREATED:
    "hospital.clinical_note.created",
  HOSPITAL_CLINICAL_NOTE_VIEWED:
    "hospital.clinical_note.viewed",

  // Hospital diagnoses
  HOSPITAL_DIAGNOSIS_CREATED:
    "hospital.diagnosis.created",
  HOSPITAL_DIAGNOSIS_VIEWED:
    "hospital.diagnosis.viewed",

  // Hospital observations
  HOSPITAL_OBSERVATION_CREATED:
    "hospital.observation.created",
  HOSPITAL_OBSERVATION_VIEWED:
    "hospital.observation.viewed",

  // Hospital prescriptions
  HOSPITAL_PRESCRIPTION_CREATED:
    "hospital.prescription.created",
  HOSPITAL_PRESCRIPTION_VIEWED:
    "hospital.prescription.viewed",
  HOSPITAL_PRESCRIPTION_DISPENSED:
    "hospital.prescription.dispensed",

  // Hospital laboratory
  HOSPITAL_LAB_ORDER_CREATED:
    "hospital.lab_order.created",
  HOSPITAL_LAB_ORDER_VIEWED:
    "hospital.lab_order.viewed",
  HOSPITAL_LAB_ORDER_CANCELLED:
    "hospital.lab_order.cancelled",
  HOSPITAL_LAB_SPECIMEN_CREATED:
    "hospital.lab_specimen.created",
  HOSPITAL_LAB_SPECIMEN_COLLECTED:
    "hospital.lab_specimen.collected",
  HOSPITAL_LAB_SPECIMEN_RECEIVED:
    "hospital.lab_specimen.received",
  HOSPITAL_LAB_SPECIMEN_REJECTED:
    "hospital.lab_specimen.rejected",
  HOSPITAL_LAB_RESULT_CREATED:
    "hospital.lab_result.created",
  HOSPITAL_LAB_RESULT_VIEWED:
    "hospital.lab_result.viewed",
  HOSPITAL_LAB_RESULT_VERIFIED:
    "hospital.lab_result.verified",
  HOSPITAL_LAB_RESULT_RELEASED:
    "hospital.lab_result.released",
  HOSPITAL_LAB_RESULT_AMENDED:
    "hospital.lab_result.amended",

  // Hospital imaging
  HOSPITAL_IMAGING_ORDER_CREATED:
    "hospital.imaging_order.created",
  HOSPITAL_IMAGING_ORDER_VIEWED:
    "hospital.imaging_order.viewed",
  HOSPITAL_IMAGING_ORDER_CANCELLED:
    "hospital.imaging_order.cancelled",
  HOSPITAL_IMAGING_STUDY_CREATED:
    "hospital.imaging_study.created",
  HOSPITAL_IMAGING_STUDY_UPDATED:
    "hospital.imaging_study.updated",
  HOSPITAL_IMAGING_STUDY_VIEWED:
    "hospital.imaging_study.viewed",
  HOSPITAL_IMAGING_REPORT_CREATED:
    "hospital.imaging_report.created",
  HOSPITAL_IMAGING_REPORT_VIEWED:
    "hospital.imaging_report.viewed",
  HOSPITAL_IMAGING_REPORT_VERIFIED:
    "hospital.imaging_report.verified",
  HOSPITAL_IMAGING_REPORT_RELEASED:
    "hospital.imaging_report.released",
  HOSPITAL_IMAGING_REPORT_AMENDED:
    "hospital.imaging_report.amended",

} as const;

export type AuditAction =
  (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
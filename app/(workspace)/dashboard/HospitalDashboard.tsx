
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  CalendarDays,
  ClipboardList,
  UserPlus,
  UsersRound,
  Stethoscope,
  ReceiptText,
} from "lucide-react";

type HospitalDashboardProps = {
  businessName: string;
};

export default function HospitalDashboard({
  businessName,
}: HospitalDashboardProps) {
  return (
    <div className="relative min-h-full space-y-6 overflow-hidden rounded-2xl bg-[#f7f7fc] p-4 sm:p-6 lg:p-8">
      {/* Subtle SmatPic background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 top-0 -z-10 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-40 -z-10 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl"
      />

      {/* Welcome header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 to-cyan-950 p-6 text-white sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-200">
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
              Hospital workspace
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome to {businessName}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Your hospital workspace for patient registration and
              patient records.
            </p>
          </div>

          <div className="hidden shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 p-5 sm:flex">
            <Stethoscope
              className="h-10 w-10 text-cyan-200"
              aria-hidden="true"
            />
          </div>
        </div>
      </header>

      {/* Patient actions */}
      <section aria-labelledby="patient-actions-heading">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-700">
            Patient services
          </p>

          <h2
            id="patient-actions-heading"
            className="mt-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl"
          >
            Where would you like to start?
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Register a new patient or find an existing patient record.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Link
            href="/settings/hospital/patients"
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 sm:p-6"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-50/70 blur-2xl transition group-hover:bg-cyan-100/70"
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-800">
                <UserPlus className="h-6 w-6" aria-hidden="true" />
              </div>

              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                Registration
              </span>
            </div>

            <h3 className="relative mt-5 font-semibold text-slate-900">
              Register a patient
            </h3>

            <p className="relative mt-2 max-w-md text-sm leading-6 text-slate-600">
              Create a patient record with demographic and contact
              information.
            </p>

            <div className="relative mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800">
              Open patient register
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>

          <Link
            href="/settings/hospital/patients"
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 sm:p-6"
          >
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-cyan-800 transition group-hover:border-cyan-200 group-hover:bg-cyan-50">
                <UsersRound className="h-6 w-6" aria-hidden="true" />
              </div>

              <ArrowRight
                className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-700"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              Find a patient
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Open patient management to search existing records and
              review available demographic details.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
              View patient records
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>
      </section>

      <section aria-labelledby="appointment-actions-heading">
        <h2
          id="appointment-actions-heading"
          className="mb-4 text-lg font-semibold text-slate-900"
        >
          Appointment services
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Link
            href="/settings/hospital/appointments"
            className="group rounded-xl border border-violet-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 sm:p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-800">
              <CalendarDays className="h-6 w-6" aria-hidden="true" />
            </div>
            <h3 className="mt-5 font-semibold text-slate-900">
              Manage Appointments
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Schedule patient visits, assign hospital staff, reschedule
              appointments, and manage visit status.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-800">
              Open appointment schedule
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* Clinical encounters */}
      <section aria-labelledby="clinical-encounters-heading">
        <h2
          id="clinical-encounters-heading"
          className="mb-4 text-lg font-semibold text-slate-900"
        >
          Clinical services
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <Link
            href="/settings/hospital/clinical"
            className="group rounded-xl border border-cyan-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-800">
                <Activity className="h-6 w-6" aria-hidden="true" />
              </div>
              <ArrowRight
                className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-700"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              Clinical Encounters
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Register patient encounters, update encounter status, and manage
              clinical notes, diagnoses, and observations.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
              Open Clinical Encounters
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* Hospital invoicing */}
      <section aria-labelledby="hospital-invoicing-heading">
        <h2
          id="hospital-invoicing-heading"
          className="mb-4 text-lg font-semibold text-slate-900"
        >
          Billing & payments
        </h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <Link
            href="/settings/hospital/invoices"
            className="group relative overflow-hidden rounded-xl border border-emerald-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800">
                <ReceiptText className="h-6 w-6" aria-hidden="true" />
              </div>
              <ArrowRight
                className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 font-semibold text-slate-900">
              Hospital Invoicing
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              Create and issue patient invoices, record payments, and track
              outstanding balances.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
              Open Hospital Invoices
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </section>

      {/* Feature availability */}
      <section
        aria-labelledby="hospital-operations-heading"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-100 bg-cyan-50 text-cyan-800">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <h2
              id="hospital-operations-heading"
              className="font-semibold text-slate-900"
            >
              Hospital operations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Patient registration, appointments, clinical encounters,
              clinical notes, diagnoses, and observations are available.
              Additional clinical and inpatient workflows can be introduced
              incrementally.
            </p>

            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Patient management available
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

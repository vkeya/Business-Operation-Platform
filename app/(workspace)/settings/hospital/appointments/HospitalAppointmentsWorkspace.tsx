"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus, RefreshCw } from "lucide-react";

type Patient = {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
};

type Clinician = {
  id: string;
  name: string | null;
  email: string;
};

type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

type Appointment = {
  id: string;
  appointmentNumber: string;
  patientId: string;
  clinicianId: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  reason: string;
  notes: string | null;
  status: AppointmentStatus;
  patient: {
    id: string;
    patientNumber: string;
    firstName: string;
    lastName: string;
    phone: string | null;
  };
};

const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  SCHEDULED: ["CONFIRMED", "CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CHECKED_IN: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
};

function toLocalInputValue(value: Date) {
  const local = new Date(
    value.getTime() - value.getTimezoneOffset() * 60_000,
  );
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function HospitalAppointmentsWorkspace() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [patientId, setPatientId] = useState("");
  const [clinicianId, setClinicianId] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [appointmentResponse, patientResponse, clinicianResponse] =
        await Promise.all([
          fetch("/api/hospital/appointments?take=100", {
            cache: "no-store",
          }),
          fetch("/api/hospital/patients?take=100", {
            cache: "no-store",
          }),
          fetch("/api/hospital/clinicians", {
            cache: "no-store",
          }),
        ]);

      const [appointmentResult, patientResult, clinicianResult] =
        await Promise.all([
          appointmentResponse.json(),
          patientResponse.json(),
          clinicianResponse.json(),
        ]);

      if (!appointmentResponse.ok) {
        throw new Error(
          appointmentResult.error ?? "Unable to load appointments.",
        );
      }

      if (!patientResponse.ok) {
        throw new Error(patientResult.error ?? "Unable to load patients.");
      }

      if (!clinicianResponse.ok) {
        throw new Error(
          clinicianResult.error ?? "Unable to load hospital staff.",
        );
      }

      setAppointments(appointmentResult.appointments ?? []);
      setPatients(patientResult.patients ?? []);
      setClinicians(clinicianResult.clinicians ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load the workspace.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function resetForm() {
    setPatientId("");
    setClinicianId("");
    setScheduledStart("");
    setScheduledEnd("");
    setReason("");
    setNotes("");
    setEditingId(null);
  }

  function beginReschedule(appointment: Appointment) {
    setError("");
    setSuccess("");
    setEditingId(appointment.id);
    setPatientId(appointment.patientId);
    setClinicianId(appointment.clinicianId ?? "");
    setScheduledStart(
      toLocalInputValue(new Date(appointment.scheduledStart)),
    );
    setScheduledEnd(toLocalInputValue(new Date(appointment.scheduledEnd)));
    setReason(appointment.reason);
    setNotes(appointment.notes ?? "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        patientId,
        clinicianId: clinicianId || null,
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: new Date(scheduledEnd).toISOString(),
        reason,
        notes: notes || null,
      };

      const response = await fetch(
        editingId
          ? `/api/hospital/appointments/${editingId}`
          : "/api/hospital/appointments",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to save the appointment.",
        );
      }

      setSuccess(
        editingId
          ? "Appointment updated successfully."
          : `Appointment ${result.appointment.appointmentNumber} created successfully.`,
      );
      resetForm();
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save the appointment.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    appointment: Appointment,
    status: AppointmentStatus,
  ) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/hospital/appointments/${appointment.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Unable to update appointment status.",
        );
      }

      setSuccess(
        `${appointment.appointmentNumber} status changed to ${statusLabels[status]}.`,
      );
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update appointment status.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 to-cyan-950 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
          Hospital workspace
        </p>
        <h1 className="mt-3 flex items-center gap-3 text-3xl font-semibold">
          <CalendarDays className="h-8 w-8" />
          Appointment scheduling
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Schedule patient visits, assign hospital staff, manage appointment
          status, and reschedule visits while avoiding clinician conflicts.
        </p>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Appointment schedule
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing up to 100 appointments, ordered by start time.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              }
              setShowForm((current) => !current);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            <Plus className="h-4 w-4" />
            New appointment
          </button>
        </div>
      </section>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? "Reschedule or edit appointment" : "New appointment"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a patient and time. The server validates clinician
              availability and prevents overlapping appointments.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Patient *
              <select
                required
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientNumber} — {patient.firstName}{" "}
                    {patient.lastName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Assigned clinician
              <select
                value={clinicianId}
                onChange={(event) => setClinicianId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"
              >
                <option value="">Unassigned</option>
                {clinicians.map((clinician) => (
                  <option key={clinician.id} value={clinician.id}>
                    {clinician.name || clinician.email}
                    {clinician.name ? ` (${clinician.email})` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Start date and time *
              <input
                required
                type="datetime-local"
                value={scheduledStart}
                onChange={(event) => setScheduledStart(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 p-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              End date and time *
              <input
                required
                type="datetime-local"
                value={scheduledEnd}
                min={scheduledStart || undefined}
                onChange={(event) => setScheduledEnd(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 p-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Appointment reason *
              <input
                required
                maxLength={500}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. General consultation"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Notes
              <textarea
                rows={3}
                maxLength={3000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional internal appointment notes"
                className="mt-2 w-full rounded-xl border border-slate-200 p-3"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || loading || patients.length === 0}
              className="rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create appointment"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>

          {patients.length === 0 && !loading && (
            <p className="text-sm text-amber-700">
              Register an active patient before creating an appointment.
            </p>
          )}
        </form>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-sm text-slate-500">
            Loading appointment schedule...
          </p>
        ) : appointments.length === 0 ? (
          <div className="p-10 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-900">
              No appointments found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Create an appointment to start building the schedule.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((appointment) => {
              const clinician = clinicians.find(
                (item) => item.id === appointment.clinicianId,
              );

              return (
                <article key={appointment.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {appointment.appointmentNumber}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {statusLabels[appointment.status]}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-900">
                        {appointment.patient.firstName}{" "}
                        {appointment.patient.lastName}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {appointment.patient.patientNumber}
                        {appointment.patient.phone
                          ? ` · ${appointment.patient.phone}`
                          : ""}
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatDateTime(appointment.scheduledStart)} –{" "}
                        {formatDateTime(appointment.scheduledEnd)}
                      </p>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Reason:</span>{" "}
                        {appointment.reason}
                      </p>
                      <p className="text-sm text-slate-500">
                        <span className="font-medium">Clinician:</span>{" "}
                        {clinician
                          ? clinician.name || clinician.email
                          : appointment.clinicianId
                            ? "Assigned staff"
                            : "Unassigned"}
                      </p>
                      {appointment.notes && (
                        <p className="whitespace-pre-wrap text-sm text-slate-500">
                          {appointment.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                      <button
                        type="button"
                        onClick={() => beginReschedule(appointment)}
                        disabled={
                          saving ||
                          appointment.status === "COMPLETED" ||
                          appointment.status === "CANCELLED" ||
                          appointment.status === "NO_SHOW"
                        }
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Edit / reschedule
                      </button>

                      {transitions[appointment.status].length > 0 && (
                        <label className="text-sm">
                          <span className="sr-only">
                            Change status for {appointment.appointmentNumber}
                          </span>
                          <select
                            value=""
                            disabled={saving}
                            onChange={(event) => {
                              const value = event.target.value as AppointmentStatus;
                              if (value) {
                                void changeStatus(appointment, value);
                              }
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:opacity-50"
                          >
                            <option value="">Change status...</option>
                            {transitions[appointment.status].map((status) => (
                              <option key={status} value={status}>
                                {statusLabels[status]}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

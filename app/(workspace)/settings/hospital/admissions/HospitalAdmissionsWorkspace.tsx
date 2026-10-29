"use client";

import { useCallback, useEffect, useState } from "react";
import { BedDouble, ClipboardList, RefreshCw, UserPlus } from "lucide-react";

type Patient = {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
};

type Admission = {
  id: string;
  admissionNumber: string;
  patientId: string;
  status: "ADMITTED" | "DISCHARGED" | "CANCELLED";
  admittedAt: string;
  dischargedAt: string | null;
  admissionReason: string | null;
  dischargeNotes: string | null;
  patient: {
    id: string;
    patientNumber: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

function statusClass(status: Admission["status"]) {
  if (status === "ADMITTED") {
    return "bg-emerald-50 text-emerald-800";
  }

  if (status === "DISCHARGED") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-rose-50 text-rose-800";
}

export default function HospitalAdmissionsWorkspace() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patientId, setPatientId] = useState("");
  const [admissionReason, setAdmissionReason] = useState("");
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [dischargingAdmissionId, setDischargingAdmissionId] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, admissionsResponse] = await Promise.all([
        fetch("/api/hospital/patients?take=100", { cache: "no-store" }),
        fetch("/api/hospital/admissions?take=100", { cache: "no-store" }),
      ]);

      const [patientsResult, admissionsResult] = await Promise.all([
        patientsResponse.json(),
        admissionsResponse.json(),
      ]);

      if (!patientsResponse.ok) {
        throw new Error(patientsResult.error ?? "Unable to load patients.");
      }

      if (!admissionsResponse.ok) {
        throw new Error(
          admissionsResult.error ?? "Unable to load admissions.",
        );
      }

      setPatients(patientsResult.patients ?? []);
      setAdmissions(admissionsResult.admissions ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the admissions workspace.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  async function createAdmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/hospital/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          ...(admissionReason.trim()
            ? { admissionReason: admissionReason.trim() }
            : {}),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create admission.");
      }

      setSuccess(
        `Admission ${result.admission.admissionNumber} created successfully.`,
      );
      setPatientId("");
      setAdmissionReason("");
      setShowForm(false);
      await loadWorkspace();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create admission.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateAdmission(
    admission: Admission,
    status: "DISCHARGED" | "CANCELLED",
  ) {
    const action = status === "DISCHARGED" ? "discharge" : "cancel";

    if (
      !window.confirm(
        `Are you sure you want to ${action} admission ${admission.admissionNumber}?`,
      )
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/hospital/admissions/${encodeURIComponent(admission.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            ...(status === "DISCHARGED" && dischargeNotes.trim()
              ? { dischargeNotes: dischargeNotes.trim() }
              : {}),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? `Unable to ${action} admission.`);
      }

      setSuccess(
        `Admission ${admission.admissionNumber} ${action}ed successfully.`,
      );
      setDischargingAdmissionId("");
      setDischargeNotes("");
      await loadWorkspace();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Unable to ${action} admission.`,
      );
    } finally {
      setSaving(false);
    }
  }

  const activeAdmissions = admissions.filter(
    (admission) => admission.status === "ADMITTED",
  );

  const filteredAdmissions =
    filter === "ALL"
      ? admissions
      : admissions.filter((admission) => admission.status === filter);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 to-cyan-950 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
          Hospital workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Hospital admissions</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Admit registered patients, track inpatient status, and manage
          discharge or cancellation.
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

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total admissions loaded</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {admissions.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-white p-5">
          <p className="text-sm text-slate-500">Currently admitted</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">
            {activeAdmissions.length}
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-200 bg-white p-5">
          <p className="text-sm text-slate-500">Registered patients loaded</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-800">
            {patients.length}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Admission register
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing up to 100 admissions from the current hospital business.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadWorkspace()}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            <UserPlus className="h-4 w-4" />
            Admit patient
          </button>
        </div>
      </section>

      {showForm && (
        <form
          onSubmit={createAdmission}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h2 className="text-lg font-semibold text-slate-900">
            Create an admission
          </h2>

          <div>
            <label
              htmlFor="admission-patient"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Registered patient *
            </label>
            <select
              id="admission-patient"
              required
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              className={inputClass}
            >
              <option value="">Select a patient</option>
              {patients
                .filter((patient) => patient.isActive)
                .map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientNumber} — {patient.firstName}{" "}
                    {patient.lastName}
                    {patient.phone ? ` (${patient.phone})` : ""}
                  </option>
                ))}
            </select>
            {patients.filter((patient) => patient.isActive).length === 0 && (
              <p className="mt-2 text-sm text-amber-700">
                No active patients were returned. Register a patient first or
                refresh the list.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="admission-reason"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Admission reason
            </label>
            <textarea
              id="admission-reason"
              value={admissionReason}
              onChange={(event) => setAdmissionReason(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Enter the reason for admission"
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving || !patientId}
              className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create admission"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Admissions</h2>
              <p className="text-sm text-slate-500">
                Review status and manage patient discharge.
              </p>
            </div>
          </div>

          <select
            aria-label="Filter admissions by status"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className={`${inputClass} sm:max-w-48`}
          >
            <option value="ALL">All statuses</option>
            <option value="ADMITTED">Admitted</option>
            <option value="DISCHARGED">Discharged</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading admissions...</p>
        ) : filteredAdmissions.length === 0 ? (
          <div className="p-8 text-center">
            <BedDouble className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 font-medium text-slate-800">
              No admissions found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Create an admission for a registered patient to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Admission</th>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Admitted</th>
                  <th className="px-5 py-3 font-semibold">Reason</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmissions.map((admission) => (
                  <tr key={admission.id} className="align-top hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {admission.admissionNumber}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {admission.patient.firstName}{" "}
                        {admission.patient.lastName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {admission.patient.patientNumber}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(admission.admittedAt).toLocaleString()}
                    </td>
                    <td className="max-w-56 whitespace-normal px-5 py-4 text-slate-600">
                      {admission.admissionReason || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(admission.status)}`}
                      >
                        {admission.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {admission.status === "ADMITTED" ? (
                        <div className="flex flex-col items-start gap-2">
                          {dischargingAdmissionId === admission.id && (
                            <textarea
                              aria-label="Discharge notes"
                              value={dischargeNotes}
                              onChange={(event) =>
                                setDischargeNotes(event.target.value)
                              }
                              rows={2}
                              maxLength={2000}
                              placeholder="Discharge notes (optional)"
                              className={`${inputClass} min-w-48`}
                            />
                          )}
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => {
                              if (dischargingAdmissionId !== admission.id) {
                                setDischargingAdmissionId(admission.id);
                                setDischargeNotes("");
                                return;
                              }

                              void updateAdmission(admission, "DISCHARGED");
                            }}
                            className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                          >
                            {dischargingAdmissionId === admission.id
                              ? "Confirm discharge"
                              : "Discharge"}
                          </button>
                          {dischargingAdmissionId === admission.id && (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => {
                                setDischargingAdmissionId("");
                                setDischargeNotes("");
                              }}
                              className="text-xs font-medium text-slate-600 hover:text-slate-900"
                            >
                              Keep admitted
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              void updateAdmission(admission, "CANCELLED")
                            }
                            className="text-xs font-semibold text-rose-700 hover:text-rose-900 disabled:opacity-50"
                          >
                            Cancel admission
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No actions available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

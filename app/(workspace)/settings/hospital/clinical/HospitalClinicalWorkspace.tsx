"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import HospitalEncounterClinicalRecords from "./HospitalEncounterClinicalRecords";
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
} from "lucide-react";

type EncounterStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type EncounterType = "OUTPATIENT" | "EMERGENCY" | "FOLLOW_UP" | "INPATIENT";

type Patient = {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
};

type Clinician = {
  id: string;
  name?: string | null;
  email: string;
};

type Encounter = {
  id: string;
  encounterNumber: string;
  patientId: string;
  type: EncounterType;
  status: EncounterStatus;
  clinicianId?: string | null;
  appointmentId?: string | null;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
  patient?: Patient;
  appointment?: {
    id: string;
    [key: string]: unknown;
  } | null;
  [key: string]: unknown;
};

const encounterTypes: { value: EncounterType; label: string }[] = [
  { value: "OUTPATIENT", label: "Outpatient" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "INPATIENT", label: "Inpatient" },
];

const statusLabels: Record<EncounterStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<EncounterStatus, string> = {
  OPEN: "bg-sky-50 text-sky-700 ring-sky-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
};

const transitions: Record<EncounterStatus, EncounterStatus[]> = {
  OPEN: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "The request could not be completed.");
  }

  return data;
}

function patientName(patient?: Patient) {
  if (!patient) return "Patient details unavailable";
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function HospitalClinicalWorkspace() {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | EncounterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [clinicianId, setClinicianId] = useState("");
  const [encounterType, setEncounterType] = useState<EncounterType>("OUTPATIENT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [encounterData, patientData, clinicianData] = await Promise.all([
        fetch("/api/hospital/encounters?take=100", { cache: "no-store" }).then(
          (response) => readJson<{ encounters: Encounter[] }>(response),
        ),
        fetch("/api/hospital/patients?take=100", { cache: "no-store" }).then(
          (response) => readJson<{ patients: Patient[] }>(response),
        ),
        fetch("/api/hospital/clinicians", { cache: "no-store" }).then(
          (response) => readJson<{ clinicians: Clinician[] }>(response),
        ),
      ]);

      setEncounters(encounterData.encounters);
      setPatients(patientData.patients);
      setClinicians(clinicianData.clinicians);

      setSelectedEncounter((current) => {
        if (!current) return null;

        return (
          encounterData.encounters.find((item) => item.id === current.id) ??
          current
        );
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load the clinical workspace.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const filteredEncounters = useMemo(() => {
    const query = search.trim().toLowerCase();

    return encounters.filter((encounter) => {
      if (statusFilter !== "ALL" && encounter.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      return [
        encounter.encounterNumber,
        patientName(encounter.patient),
        encounter.patient?.patientNumber,
        encounter.type,
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [encounters, search, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: encounters.length,
      open: encounters.filter((item) => item.status === "OPEN").length,
      inProgress: encounters.filter((item) => item.status === "IN_PROGRESS").length,
      completed: encounters.filter((item) => item.status === "COMPLETED").length,
    };
  }, [encounters]);

  async function createEncounter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await fetch("/api/hospital/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          type: encounterType,
          ...(clinicianId ? { clinicianId } : {}),
        }),
      }).then((response) => readJson<{ encounter: Encounter }>(response));

      setShowCreateForm(false);
      setPatientId("");
      setClinicianId("");
      setEncounterType("OUTPATIENT");
      setNotice(`Encounter ${result.encounter.encounterNumber} created.`);
      await loadWorkspace();
      setSelectedEncounter(result.encounter);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to create the encounter.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status: EncounterStatus) {
    if (!selectedEncounter) return;

    setChangingStatus(true);
    setError("");
    setNotice("");

    try {
      const result = await fetch(
        `/api/hospital/encounters/${encodeURIComponent(selectedEncounter.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      ).then((response) => readJson<{ encounter: Encounter }>(response));

      setSelectedEncounter((current) =>
        current?.id === result.encounter.id ? result.encounter : current,
      );
      setEncounters((current) =>
        current.map((item) =>
          item.id === result.encounter.id ? { ...item, ...result.encounter } : item,
        ),
      );
      setNotice(`Encounter status changed to ${statusLabels[status]}.`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update the encounter status.",
      );
    } finally {
      setChangingStatus(false);
    }
  }

  const clinicianName = (id?: string | null) => {
    if (!id) return "Unassigned";

    const clinician = clinicians.find((item) => item.id === id);

    return clinician?.name || clinician?.email || "Clinician unavailable";
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-300/20">
              <Stethoscope className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-cyan-300">Hospital operations</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Clinical encounters
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Register patient encounters, track clinical progress, and manage
              encounter status from one workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setNotice("");
              setShowCreateForm((value) => !value);
              setSelectedEncounter(null);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <Plus className="h-4 w-4" />
            New encounter
          </button>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total encounters", value: counts.total, icon: ClipboardList },
          { label: "Open", value: counts.open, icon: Activity },
          { label: "In progress", value: counts.inProgress, icon: Stethoscope },
          { label: "Completed", value: counts.completed, icon: ClipboardList },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-500">{item.label}</span>
              <item.icon className="h-4 w-4 text-cyan-700" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </section>

      {showCreateForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">Register encounter</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select an active patient and the type of clinical encounter.
            </p>
          </div>

          <form onSubmit={createEncounter} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Patient <span className="text-rose-600">*</span>
              <select
                required
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patientName(patient)} — {patient.patientNumber}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700">
              Encounter type
              <select
                value={encounterType}
                onChange={(event) => setEncounterType(event.target.value as EncounterType)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                {encounterTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
              Assigned clinician <span className="font-normal text-slate-400">(optional)</span>
              <select
                value={clinicianId}
                onChange={(event) => setClinicianId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Leave unassigned</option>
                {clinicians.map((clinician) => (
                  <option key={clinician.id} value={clinician.id}>
                    {clinician.name || clinician.email}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={saving || patients.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating…" : "Create encounter"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              {patients.length === 0 && (
                <p className="self-center text-sm text-amber-700">
                  No patients are available. Register an active patient first.
                </p>
              )}
            </div>
          </form>
        </section>
      )}

      {selectedEncounter ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <button
            type="button"
            onClick={() => setSelectedEncounter(null)}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to encounters
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Encounter record</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                {selectedEncounter.encounterNumber}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Created {formatDate(selectedEncounter.createdAt)}
              </p>
            </div>
            <span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${statusStyles[selectedEncounter.status]}`}>
              {statusLabels[selectedEncounter.status]}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Patient</p>
              <p className="mt-2 font-semibold text-slate-900">{patientName(selectedEncounter.patient)}</p>
              <p className="mt-1 text-sm text-slate-500">{selectedEncounter.patient?.patientNumber || "—"}</p>
              {selectedEncounter.patient?.phone && (
                <p className="mt-1 text-sm text-slate-500">{selectedEncounter.patient.phone}</p>
              )}
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Encounter type</p>
              <p className="mt-2 font-semibold text-slate-900">
                {encounterTypes.find((item) => item.value === selectedEncounter.type)?.label || selectedEncounter.type}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Clinician</p>
              <p className="mt-2 font-semibold text-slate-900">{clinicianName(selectedEncounter.clinicianId)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last updated</p>
              <p className="mt-2 font-semibold text-slate-900">{formatDate(selectedEncounter.updatedAt || selectedEncounter.createdAt)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed at</p>
              <p className="mt-2 font-semibold text-slate-900">{formatDate(selectedEncounter.completedAt)}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="font-semibold text-slate-900">Update encounter status</h3>
            <p className="mt-1 text-sm text-slate-500">
              Only transitions supported by the encounter service are available.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {transitions[selectedEncounter.status].map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={changingStatus}
                  onClick={() => void changeStatus(status)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                    status === "CANCELLED"
                      ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                      : "border-cyan-200 text-cyan-800 hover:bg-cyan-50"
                  }`}
                >
                  {changingStatus
                    ? "Updating…"
                    : status === "IN_PROGRESS"
                      ? "Start encounter"
                      : status === "COMPLETED"
                        ? "Complete encounter"
                        : "Cancel encounter"}
                </button>
              ))}
              {transitions[selectedEncounter.status].length === 0 && (
                <p className="text-sm text-slate-500">This encounter is in a final state.</p>
              )}
            </div>
          </div>
          <HospitalEncounterClinicalRecords encounter={selectedEncounter} />
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Encounter register</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredEncounters.length} encounter{filteredEncounters.length === 1 ? "" : "s"} shown
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadWorkspace()}
                disabled={loading}
                aria-label="Refresh encounters"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
              <label className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search encounters"
                  aria-label="Search encounters"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3">
            {(["ALL", "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === status
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status === "ALL" ? "All statuses" : statusLabels[status]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-slate-500">Loading clinical encounters…</div>
          ) : filteredEncounters.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">No encounters found</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                {encounters.length === 0
                  ? "Create an encounter to begin tracking a patient's clinical visit."
                  : "Try another search term or status filter."}
              </p>
              {encounters.length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Create first encounter
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Encounter</th>
                    <th className="px-5 py-3 font-semibold">Patient</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEncounters.map((encounter) => (
                    <tr key={encounter.id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{encounter.encounterNumber}</p>
                        <p className="mt-1 text-xs text-slate-500">{clinicianName(encounter.clinicianId)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{patientName(encounter.patient)}</p>
                        <p className="mt-1 text-xs text-slate-500">{encounter.patient?.patientNumber || "—"}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {encounterTypes.find((item) => item.value === encounter.type)?.label || encounter.type}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[encounter.status]}`}>
                          {statusLabels[encounter.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(encounter.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={async () => {
                            setError("");
                            setNotice("");

                            try {
                              const result = await fetch(
                                `/api/hospital/encounters/${encodeURIComponent(encounter.id)}`,
                                { cache: "no-store" },
                              ).then((response) => readJson<{ encounter: Encounter }>(response));

                              setSelectedEncounter(result.encounter);
                            } catch (cause) {
                              setError(
                                cause instanceof Error
                                  ? cause.message
                                  : "Unable to load encounter details.",
                              );
                            }
                          }}
                          className="font-semibold text-cyan-800 hover:text-cyan-950"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

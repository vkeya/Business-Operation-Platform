"use client";

import { useCallback, useEffect, useState } from "react";
import HospitalEncounterPrescriptions from "./HospitalEncounterPrescriptions";

type EncounterContext = {
  id: string;
  patientId: string;
};

type NoteType =
  | "INITIAL_ASSESSMENT"
  | "PROGRESS"
  | "CONSULTATION"
  | "DISCHARGE_SUMMARY";

type ClinicalNote = {
  id: string;
  noteType: NoteType;
  content: string;
  createdAt: string;
  authorId?: string | null;
};

type Diagnosis = {
  id: string;
  code?: string | null;
  description: string;
  classification?: string | null;
  createdAt: string;
};

type Observation = {
  id: string;
  observationType: string;
  value: string;
  numericValue?: number | string | null;
  unit?: string | null;
  observedAt: string;
  createdAt: string;
};

type LabResult = {
  id: string;
  resultValue?: string | null;
  numericValue?: number | string | null;
  unit?: string | null;
  referenceRange?: string | null;
  abnormalFlag?: string | null;
  status: string;
  releasedAt?: string | null;
};

type LabOrderItem = {
  id: string;
  testName: string;
  testCode?: string | null;
  specimenType?: string | null;
  status: string;
  results: LabResult[];
};

type LabOrder = {
  id: string;
  orderNumber: string;
  status: string;
  orderedAt: string;
  clinicalIndication?: string | null;
  items: LabOrderItem[];
};

type Tab = "notes" | "diagnoses" | "observations" | "laboratory" | "prescriptions";

const noteTypes: { value: NoteType; label: string }[] = [
  { value: "INITIAL_ASSESSMENT", label: "Initial assessment" },
  { value: "PROGRESS", label: "Progress note" },
  { value: "CONSULTATION", label: "Consultation" },
  { value: "DISCHARGE_SUMMARY", label: "Discharge summary" },
];

const tabs: { value: Tab; label: string }[] = [
  { value: "notes", label: "Clinical notes" },
  { value: "diagnoses", label: "Diagnoses" },
  { value: "observations", label: "Observations" },
  { value: "laboratory", label: "Laboratory results" },
  { value: "prescriptions", label: "Prescriptions" },
];

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "The request could not be completed.");
  }

  return data;
}

function displayDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

const buttonClass =
  "rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";

export default function HospitalEncounterClinicalRecords({
  encounter,
}: {
  encounter: EncounterContext;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");

  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [labLoading, setLabLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [noteType, setNoteType] = useState<NoteType>("INITIAL_ASSESSMENT");
  const [noteContent, setNoteContent] = useState("");

  const [diagnosisDescription, setDiagnosisDescription] = useState("");
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [diagnosisClassification, setDiagnosisClassification] = useState("");

  const [observationType, setObservationType] = useState("");
  const [observationValue, setObservationValue] = useState("");
  const [numericValue, setNumericValue] = useState("");
  const [observationUnit, setObservationUnit] = useState("");
  const [observedAt, setObservedAt] = useState("");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    const query = `encounterId=${encodeURIComponent(encounter.id)}&take=100`;

    try {
      const [noteData, diagnosisData, observationData] = await Promise.all([
        fetch(`/api/hospital/clinical-notes?${query}`, {
          cache: "no-store",
        }).then((response) =>
          readJson<{ notes: ClinicalNote[] }>(response),
        ),
        fetch(`/api/hospital/diagnoses?${query}`, {
          cache: "no-store",
        }).then((response) =>
          readJson<{ diagnoses: Diagnosis[] }>(response),
        ),
        fetch(`/api/hospital/observations?${query}`, {
          cache: "no-store",
        }).then((response) =>
          readJson<{ observations: Observation[] }>(response),
        ),
      ]);

      setNotes(noteData.notes);
      setDiagnoses(diagnosisData.diagnoses);
      setObservations(observationData.observations);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load clinical records.",
      );
    } finally {
      setLoading(false);
    }
  }, [encounter.id]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const loadLabOrders = useCallback(async () => {
    setLabLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        encounterId: encounter.id,
        take: "100",
      });

      const data = await fetch(
        `/api/hospital/lab-orders?${query.toString()}`,
        { cache: "no-store" },
      ).then((response) =>
        readJson<{ orders: LabOrder[] }>(response),
      );

      setLabOrders(data.orders);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load laboratory results.",
      );
    } finally {
      setLabLoading(false);
    }
  }, [encounter.id]);

  useEffect(() => {
    void loadLabOrders();
  }, [loadLabOrders]);

  async function createRecord(
    endpoint: string,
    payload: Record<string, unknown>,
    successMessage: string,
  ) {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: encounter.patientId,
          encounterId: encounter.id,
          ...payload,
        }),
      }).then((response) => readJson<{ id?: string }>(response));

      setNotice(successMessage);
      await loadRecords();
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to save the clinical record.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function submitNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!noteContent.trim()) {
      setError("Enter the clinical note before saving.");
      return;
    }

    if (noteContent.length > 20000) {
      setError("Clinical notes cannot exceed 20,000 characters.");
      return;
    }

    const saved = await createRecord(
      "/api/hospital/clinical-notes",
      { noteType, content: noteContent },
      "Clinical note saved.",
    );

    if (saved) setNoteContent("");
  }

  async function submitDiagnosis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!diagnosisDescription.trim()) {
      setError("Enter a diagnosis description.");
      return;
    }

    if (diagnosisDescription.trim().length > 2000) {
      setError("Diagnosis descriptions cannot exceed 2,000 characters.");
      return;
    }

    if (diagnosisCode.trim().length > 100) {
      setError("Diagnosis codes cannot exceed 100 characters.");
      return;
    }

    if (diagnosisClassification.trim().length > 100) {
      setError("Diagnosis classifications cannot exceed 100 characters.");
      return;
    }

    const saved = await createRecord(
      "/api/hospital/diagnoses",
      {
        description: diagnosisDescription.trim(),
        ...(diagnosisCode.trim() ? { code: diagnosisCode.trim() } : {}),
        ...(diagnosisClassification.trim()
          ? { classification: diagnosisClassification.trim() }
          : {}),
      },
      "Diagnosis saved.",
    );

    if (saved) {
      setDiagnosisDescription("");
      setDiagnosisCode("");
      setDiagnosisClassification("");
    }
  }

  async function submitObservation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!observationType.trim() || !observationValue.trim()) {
      setError("Observation type and value are required.");
      return;
    }

    if (observationType.trim().length > 100) {
      setError("Observation type cannot exceed 100 characters.");
      return;
    }

    if (observationValue.trim().length > 2000) {
      setError("Observation value cannot exceed 2,000 characters.");
      return;
    }

    if (observationUnit.trim().length > 50) {
      setError("Observation unit cannot exceed 50 characters.");
      return;
    }

    let parsedNumericValue: number | undefined;

    if (numericValue.trim()) {
      parsedNumericValue = Number(numericValue);

      if (!Number.isFinite(parsedNumericValue)) {
        setError("Enter a valid numeric observation value.");
        return;
      }

      const decimalPlaces = numericValue.split(".")[1]?.length ?? 0;

      if (decimalPlaces > 4) {
        setError("Numeric observations can have at most 4 decimal places.");
        return;
      }

      if (Math.abs(parsedNumericValue) > 99999999999999) {
        setError("Numeric observation value is outside the supported range.");
        return;
      }
    }

    let observedAtIso: string | undefined;

    if (observedAt) {
      const date = new Date(observedAt);

      if (Number.isNaN(date.getTime())) {
        setError("Enter a valid observation date and time.");
        return;
      }

      observedAtIso = date.toISOString();
    }

    const saved = await createRecord(
      "/api/hospital/observations",
      {
        observationType: observationType.trim(),
        value: observationValue.trim(),
        ...(parsedNumericValue !== undefined
          ? { numericValue: parsedNumericValue }
          : {}),
        ...(observationUnit.trim() ? { unit: observationUnit.trim() } : {}),
        ...(observedAtIso ? { observedAt: observedAtIso } : {}),
      },
      "Observation saved.",
    );

    if (saved) {
      setObservationType("");
      setObservationValue("");
      setNumericValue("");
      setObservationUnit("");
      setObservedAt("");
    }
  }

  return (
    <section className="mt-7 border-t border-slate-200 pt-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Clinical records
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Notes, diagnoses, and observations linked to this encounter.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void loadRecords();
            void loadLabOrders();
          }}
          disabled={loading || labLoading || saving}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading || labLoading ? "Refreshing…" : "Refresh records"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setActiveTab(tab.value);
              setError("");
              setNotice("");
            }}
            className={`border-b-2 px-3 py-3 text-sm font-semibold ${
              activeTab === tab.value
                ? "border-cyan-600 text-cyan-800"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab.label}
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {tab.value === "notes"
                ? notes.length
                : tab.value === "diagnoses"
                  ? diagnoses.length
                  : tab.value === "observations"
                    ? observations.length
                    : tab.value === "laboratory"
                    ? labOrders.length
                    : 0}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitNote} className="space-y-4">
            <h4 className="font-semibold text-slate-900">Add clinical note</h4>

            <div>
              <label className={labelClass} htmlFor="clinical-note-type">
                Note type
              </label>
              <select
                id="clinical-note-type"
                className={inputClass}
                value={noteType}
                onChange={(event) => setNoteType(event.target.value as NoteType)}
              >
                {noteTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass} htmlFor="clinical-note-content">
                Note content
              </label>
              <textarea
                id="clinical-note-content"
                className={inputClass}
                rows={6}
                maxLength={20000}
                required
                value={noteContent}
                onChange={(event) => setNoteContent(event.target.value)}
                placeholder="Document the clinical assessment or progress…"
              />
              <p className="mt-1 text-right text-xs text-slate-500">
                {noteContent.length.toLocaleString()} / 20,000
              </p>
            </div>

            <button className={buttonClass} disabled={saving}>
              {saving ? "Saving…" : "Save clinical note"}
            </button>
          </form>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Encounter notes</h4>

            {loading && notes.length === 0 ? (
              <p className="text-sm text-slate-500">Loading notes…</p>
            ) : notes.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No clinical notes recorded for this encounter.
              </p>
            ) : (
              notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {noteTypes.find((item) => item.value === note.noteType)
                        ?.label || note.noteType}
                    </span>
                    <span className="text-xs text-slate-500">
                      {displayDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {note.content}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "diagnoses" && (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitDiagnosis} className="space-y-4">
            <h4 className="font-semibold text-slate-900">Add diagnosis</h4>

            <div>
              <label className={labelClass} htmlFor="diagnosis-description">
                Description
              </label>
              <textarea
                id="diagnosis-description"
                className={inputClass}
                rows={3}
                maxLength={2000}
                required
                value={diagnosisDescription}
                onChange={(event) =>
                  setDiagnosisDescription(event.target.value)
                }
                placeholder="Enter the diagnosis description"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="diagnosis-code">
                Diagnosis code (optional)
              </label>
              <input
                id="diagnosis-code"
                className={inputClass}
                maxLength={100}
                value={diagnosisCode}
                onChange={(event) => setDiagnosisCode(event.target.value)}
                placeholder="e.g. ICD-10 code"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="diagnosis-classification">
                Classification (optional)
              </label>
              <input
                id="diagnosis-classification"
                className={inputClass}
                maxLength={100}
                value={diagnosisClassification}
                onChange={(event) =>
                  setDiagnosisClassification(event.target.value)
                }
                placeholder="e.g. provisional or confirmed"
              />
            </div>

            <button className={buttonClass} disabled={saving}>
              {saving ? "Saving…" : "Save diagnosis"}
            </button>
          </form>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">Encounter diagnoses</h4>

            {loading && diagnoses.length === 0 ? (
              <p className="text-sm text-slate-500">Loading diagnoses…</p>
            ) : diagnoses.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No diagnoses recorded for this encounter.
              </p>
            ) : (
              diagnoses.map((diagnosis) => (
                <article
                  key={diagnosis.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="font-semibold text-slate-900">
                    {diagnosis.description}
                  </p>
                  {(diagnosis.code || diagnosis.classification) && (
                    <p className="mt-2 text-sm text-slate-600">
                      {diagnosis.code ? `Code: ${diagnosis.code}` : ""}
                      {diagnosis.code && diagnosis.classification ? " · " : ""}
                      {diagnosis.classification
                        ? `Classification: ${diagnosis.classification}`
                        : ""}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Recorded {displayDate(diagnosis.createdAt)}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "observations" && (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <form onSubmit={submitObservation} className="space-y-4">
            <h4 className="font-semibold text-slate-900">Add observation</h4>

            <div>
              <label className={labelClass} htmlFor="observation-type">
                Observation type
              </label>
              <input
                id="observation-type"
                className={inputClass}
                maxLength={100}
                required
                value={observationType}
                onChange={(event) => setObservationType(event.target.value)}
                placeholder="e.g. Blood pressure, temperature, pulse"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="observation-value">
                Recorded value
              </label>
              <input
                id="observation-value"
                className={inputClass}
                maxLength={2000}
                required
                value={observationValue}
                onChange={(event) => setObservationValue(event.target.value)}
                placeholder="e.g. 120/80 or Normal"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="observation-numeric">
                  Numeric value (optional)
                </label>
                <input
                  id="observation-numeric"
                  type="number"
                  step="any"
                  className={inputClass}
                  value={numericValue}
                  onChange={(event) => setNumericValue(event.target.value)}
                  placeholder="e.g. 36.8"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="observation-unit">
                  Unit (optional)
                </label>
                <input
                  id="observation-unit"
                  className={inputClass}
                  maxLength={50}
                  value={observationUnit}
                  onChange={(event) => setObservationUnit(event.target.value)}
                  placeholder="e.g. °C, bpm, mmHg"
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="observation-time">
                Observation date and time (optional)
              </label>
              <input
                id="observation-time"
                type="datetime-local"
                className={inputClass}
                value={observedAt}
                onChange={(event) => setObservedAt(event.target.value)}
              />
              <p className="mt-1 text-xs text-slate-500">
                Leave blank to use the server's default observation time.
              </p>
            </div>

            <button className={buttonClass} disabled={saving}>
              {saving ? "Saving…" : "Save observation"}
            </button>
          </form>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">
              Encounter observations
            </h4>

            {loading && observations.length === 0 ? (
              <p className="text-sm text-slate-500">Loading observations…</p>
            ) : observations.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                No observations recorded for this encounter.
              </p>
            ) : (
              observations.map((observation) => (
                <article
                  key={observation.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      {observation.observationType}
                    </p>
                    <span className="text-xs text-slate-500">
                      {displayDate(observation.observedAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {observation.value}
                  </p>
                  {observation.numericValue !== null &&
                    observation.numericValue !== undefined && (
                      <p className="mt-1 text-sm text-slate-600">
                        Numeric value: {String(observation.numericValue)}
                        {observation.unit ? ` ${observation.unit}` : ""}
                      </p>
                    )}
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "prescriptions" && (
        <HospitalEncounterPrescriptions encounter={encounter} />
      )}
      {activeTab === "laboratory" && (
        <div className="mt-5 space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900">
              Laboratory results for this encounter
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Only released results are displayed as clinical results.
              Results awaiting release remain unavailable for clinical
              interpretation here.
            </p>
          </div>

          {labLoading && labOrders.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Loading laboratory orders…
            </p>
          ) : labOrders.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No laboratory orders were found for this encounter.
            </p>
          ) : (
            labOrders.map((order) => {
              const pendingResults = order.items.reduce(
                (count, item) =>
                  count +
                  item.results.filter(
                    (result) => result.status !== "RELEASED",
                  ).length,
                0,
              );

              return (
                <article
                  key={order.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h5 className="font-semibold text-slate-900">
                        Order {order.orderNumber}
                      </h5>
                      <p className="mt-1 text-xs text-slate-500">
                        Ordered {displayDate(order.orderedAt)}
                      </p>
                      {order.clinicalIndication && (
                        <p className="mt-2 text-sm text-slate-600">
                          Clinical indication: {order.clinicalIndication}
                        </p>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {order.items.map((item) => {
                      const releasedResults = item.results.filter(
                        (result) => result.status === "RELEASED",
                      );

                      return (
                        <div
                          key={item.id}
                          className="rounded-lg bg-slate-50 p-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {item.testName}
                              </p>
                              {item.testCode && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Code: {item.testCode}
                                </p>
                              )}
                              {item.specimenType && (
                                <p className="mt-1 text-xs text-slate-500">
                                  Specimen: {item.specimenType}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-slate-500">
                              {item.status.replaceAll("_", " ")}
                            </span>
                          </div>

                          {releasedResults.length > 0 ? (
                            <div className="mt-3 space-y-3">
                              {releasedResults.map((result) => {
                                const value = result.resultValue ?? result.numericValue;
                                return (
                                  <div
                                    key={result.id}
                                    className="rounded-lg border border-slate-200 bg-white p-3"
                                  >
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                      Released result
                                    </p>
                                    <p className="mt-1 text-base font-semibold text-slate-900">
                                      {value === null || value === undefined
                                        ? "No result value recorded"
                                        : String(value)}
                                      {result.unit ? ` ${result.unit}` : ""}
                                    </p>
                                    {result.referenceRange && (
                                      <p className="mt-1 text-sm text-slate-600">
                                        Reference range: {result.referenceRange}
                                      </p>
                                    )}
                                    {result.abnormalFlag && (
                                      <p className="mt-1 text-sm font-medium text-amber-700">
                                        Flag: {result.abnormalFlag}
                                      </p>
                                    )}
                                    <p className="mt-2 text-xs text-slate-500">
                                      Released: {displayDate(result.releasedAt)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-slate-500">
                              No released results are available for this test.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {pendingResults > 0 && (
                    <p className="mt-3 text-xs text-amber-700">
                      {pendingResults} result
                      {pendingResults === 1 ? "" : "s"} awaiting release.
                      Values are not displayed until released.
                    </p>
                  )}
                </article>
              );
            })
          )}
        </div>
      )}

    </section>
  );
}

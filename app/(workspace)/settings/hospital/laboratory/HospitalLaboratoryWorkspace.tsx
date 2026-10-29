"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ClipboardList,
  FlaskConical,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";

type Patient = {
  id: string;
  patientNumber: string;
  firstName: string;
  lastName: string;
  isActive?: boolean;
};

type Encounter = {
  id: string;
  encounterNumber: string;
  patientId: string;
  type: string;
  status: string;
  createdAt: string;
};

type LabPriority = "ROUTINE" | "URGENT" | "STAT";

type LabOrderItem = {
  id: string;
  testCode?: string | null;
  testName: string;
  specimenType: string;
  instructions?: string | null;
  status?: string;
  specimens?: {
    id: string;
    specimenNumber: string;
    specimenType: string;
    status: string;
  }[];
  results?: {
    id: string;
    resultValue: string;
    numericValue?: string | number | null;
    unit?: string | null;
    referenceRange?: string | null;
    status: string;
    abnormalFlag?: string | null;
  }[];
};

type LabOrder = {
  id: string;
  orderNumber: string;
  patientId: string;
  encounterId: string;
  priority: LabPriority;
  status: string;
  clinicalIndication?: string | null;
  notes?: string | null;
  orderedAt: string;
  items: LabOrderItem[];
};

type TestDraft = {
  key: string;
  testName: string;
  testCode: string;
  specimenType: string;
  instructions: string;
};

type ApiError = {
  error?: string;
};

const inputClass =
  "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

const labelClass = "block text-sm font-medium text-slate-700";

const priorityLabels: Record<LabPriority, string> = {
  ROUTINE: "Routine",
  URGENT: "Urgent",
  STAT: "STAT — immediate",
};

const priorityStyles: Record<LabPriority, string> = {
  ROUTINE: "bg-slate-100 text-slate-700",
  URGENT: "bg-amber-100 text-amber-800",
  STAT: "bg-rose-100 text-rose-800",
};

const orderStatusStyles: Record<string, string> = {
  ORDERED: "bg-sky-100 text-sky-800",
  COLLECTED: "bg-indigo-100 text-indigo-800",
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  PARTIALLY_RESULTED: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

function makeTestDraft(key: string): TestDraft {
  return {
    key,
    testName: "",
    testCode: "",
    specimenType: "",
    instructions: "",
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & ApiError;

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

function humanize(value?: string | null) {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function HospitalLaboratoryWorkspace() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [patientId, setPatientId] = useState("");
  const [encounterId, setEncounterId] = useState("");
  const [priority, setPriority] = useState<LabPriority>("ROUTINE");
  const [clinicalIndication, setClinicalIndication] = useState("");
  const [notes, setNotes] = useState("");
  const testIdPrefix = useId();
  const [nextTestKey, setNextTestKey] = useState(1);
  const [tests, setTests] = useState<TestDraft[]>([
    makeTestDraft(`${testIdPrefix}-test-0`),
  ]);
  const [search, setSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingEncounters, setLoadingEncounters] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [specimenBusyId, setSpecimenBusyId] = useState("");
  const [resultBusyId, setResultBusyId] = useState("");
  const [resultDrafts, setResultDrafts] = useState<
    Record<
      string,
      {
        specimenId: string;
        resultValue: string;
        numericValue: string;
        unit: string;
        referenceRange: string;
        abnormalFlag: string;
      }
    >
  >({});

  function getResultDraft(itemId: string) {
    return resultDrafts[itemId] ?? {
      specimenId: "",
      resultValue: "",
      numericValue: "",
      unit: "",
      referenceRange: "",
      abnormalFlag: "",
    };
  }

  function updateResultDraft(
    itemId: string,
    field: keyof ReturnType<typeof getResultDraft>,
    value: string,
  ) {
    setResultDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] ?? {
          specimenId: "",
          resultValue: "",
          numericValue: "",
          unit: "",
          referenceRange: "",
          abnormalFlag: "",
        }),
        [field]: value,
      },
    }));
  }

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === patientId),
    [patients, patientId],
  );

  const selectedEncounter = useMemo(
    () => encounters.find((encounter) => encounter.id === encounterId),
    [encounters, encounterId],
  );

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) =>
      [
        order.orderNumber,
        order.status,
        order.priority,
        order.clinicalIndication,
        ...order.items.flatMap((item) => [
          item.testName,
          item.testCode,
          item.specimenType,
        ]),
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [orders, search]);

  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    setError("");

    try {
      const data = await fetch("/api/hospital/patients?take=100", {
        cache: "no-store",
      }).then((response) => readJson<{ patients: Patient[] }>(response));

      setPatients(data.patients ?? []);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load hospital patients.",
      );
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  const loadEncounters = useCallback(async (selectedPatientId: string) => {
    setEncounters([]);
    setEncounterId("");

    if (!selectedPatientId) {
      setLoadingEncounters(false);
      return;
    }

    setLoadingEncounters(true);
    setError("");

    try {
      const params = new URLSearchParams({
        patientId: selectedPatientId,
        take: "100",
      });

      const data = await fetch(
        `/api/hospital/encounters?${params.toString()}`,
        { cache: "no-store" },
      ).then((response) => readJson<{ encounters: Encounter[] }>(response));

      setEncounters(data.encounters ?? []);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load encounters for this patient.",
      );
    } finally {
      setLoadingEncounters(false);
    }
  }, []);

  const loadOrders = useCallback(async (selectedPatientId: string) => {
    setOrders([]);

    if (!selectedPatientId) {
      setLoadingOrders(false);
      return;
    }

    setLoadingOrders(true);
    setError("");

    try {
      const params = new URLSearchParams({
        patientId: selectedPatientId,
        take: "100",
      });

      const data = await fetch(
        `/api/hospital/lab-orders?${params.toString()}`,
        { cache: "no-store" },
      ).then((response) => readJson<{ orders: LabOrder[] }>(response));

      setOrders(data.orders ?? []);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to load laboratory orders.",
      );
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    void loadEncounters(patientId);
    void loadOrders(patientId);
  }, [patientId, loadEncounters, loadOrders]);

  function updateTest(key: string, field: keyof Omit<TestDraft, "key">, value: string) {
    setTests((current) =>
      current.map((test) =>
        test.key === key ? { ...test, [field]: value } : test,
      ),
    );
  }

  function resetForm() {
    setEncounterId("");
    setPriority("ROUTINE");
    setClinicalIndication("");
    setNotes("");
    setTests([makeTestDraft(`test-${Date.now()}`)]);
  }

  async function createOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!patientId) {
      setError("Select a patient before creating a laboratory order.");
      return;
    }

    if (!encounterId) {
      setError("Select an encounter for this laboratory order.");
      return;
    }

    const normalizedTests = tests.map((test) => ({
      testName: test.testName.trim(),
      testCode: test.testCode.trim() || null,
      specimenType: test.specimenType.trim(),
      instructions: test.instructions.trim() || null,
    }));

    if (
      normalizedTests.some((test) => !test.testName || !test.specimenType)
    ) {
      setError("Every test requires both a test name and specimen type.");
      return;
    }

    setSaving(true);

    try {
      const data = await fetch("/api/hospital/lab-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          encounterId,
          priority,
          clinicalIndication: clinicalIndication.trim() || null,
          notes: notes.trim() || null,
          items: normalizedTests,
        }),
      }).then((response) => readJson<{ order: LabOrder }>(response));

      setNotice(`Laboratory order ${data.order.orderNumber} was created.`);
      setPriority("ROUTINE");
      setClinicalIndication("");
      setNotes("");
      setTests([makeTestDraft(`test-${Date.now()}`)]);
      await loadOrders(patientId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to create the laboratory order.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function registerSpecimen(item: LabOrderItem) {
    const busyId = `register:${item.id}`;
    setError("");
    setNotice("");
    setSpecimenBusyId(busyId);

    try {
      const data = await fetch(
        `/api/hospital/lab-orders/items/${encodeURIComponent(item.id)}/specimens`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specimenType: item.specimenType }),
        },
      ).then((response) =>
        readJson<{ specimen: { specimenNumber: string } }>(response),
      );

      setNotice(`Specimen ${data.specimen.specimenNumber} was registered.`);
      await loadOrders(patientId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to register the specimen.",
      );
    } finally {
      setSpecimenBusyId("");
    }
  }

  async function updateSpecimen(
    specimen: NonNullable<LabOrderItem["specimens"]>[number],
    action: "collect" | "receive" | "reject",
  ) {
    let rejectionReason: string | undefined;

    if (action === "reject") {
      const answer = window.prompt("Enter the reason for rejecting this specimen:");
      if (answer === null) return;

      rejectionReason = answer.trim();
      if (!rejectionReason) {
        setError("A rejection reason is required.");
        setNotice("");
        return;
      }
    }

    const busyId = `specimen:${specimen.id}`;
    setError("");
    setNotice("");
    setSpecimenBusyId(busyId);

    try {
      await fetch(
        `/api/hospital/lab-orders/specimens/${encodeURIComponent(specimen.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            ...(rejectionReason ? { rejectionReason } : {}),
          }),
        },
      ).then((response) => readJson<{ specimen: { status: string } }>(response));

      setNotice(
        `Specimen ${specimen.specimenNumber}: ${humanize(action)} successful.`,
      );
      await loadOrders(patientId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Unable to ${action} the specimen.`,
      );
    } finally {
      setSpecimenBusyId("");
    }
  }

  async function submitLabResult(
    event: React.FormEvent<HTMLFormElement>,
    item: LabOrderItem,
    order: LabOrder,
  ) {
    event.preventDefault();
    setError("");
    setNotice("");

    const draft = getResultDraft(item.id);
    if (!draft.resultValue.trim()) {
      setError("Enter a result value before saving.");
      return;
    }

    const busyId = `result:${item.id}`;
    setResultBusyId(busyId);

    try {
      const payload = {
        resultValue: draft.resultValue.trim(),
        ...(draft.specimenId ? { specimenId: draft.specimenId } : {}),
        ...(draft.numericValue.trim()
          ? { numericValue: draft.numericValue.trim() }
          : {}),
        ...(draft.unit.trim() ? { unit: draft.unit.trim() } : {}),
        ...(draft.referenceRange.trim()
          ? { referenceRange: draft.referenceRange.trim() }
          : {}),
        ...(draft.abnormalFlag
          ? { abnormalFlag: draft.abnormalFlag }
          : {}),
      };

      const data = await fetch(
        `/api/hospital/lab-orders/items/${encodeURIComponent(item.id)}/results`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      ).then((response) =>
        readJson<{ result: { id: string; status: string } }>(response),
      );

      setResultDrafts((current) => ({
        ...current,
        [item.id]: {
          specimenId: "",
          resultValue: "",
          numericValue: "",
          unit: "",
          referenceRange: "",
          abnormalFlag: "",
        },
      }));
      setNotice(`Laboratory result saved as ${humanize(data.result.status)}.`);
      await loadOrders(order.patientId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to save the laboratory result.",
      );
    } finally {
      setResultBusyId("");
    }
  }

  async function transitionLabResult(
    resultId: string,
    action: "verify" | "release",
    order: LabOrder,
  ) {
    setError("");
    setNotice("");
    setResultBusyId(`transition:${resultId}`);

    try {
      const data = await fetch(
        `/api/hospital/lab-results/${encodeURIComponent(resultId)}/${action}`,
        { method: "POST" },
      ).then((response) =>
        readJson<{ result: { status: string } }>(response),
      );

      setNotice(`Laboratory result ${action === "verify" ? "verified" : "released"} successfully.`);
      await loadOrders(order.patientId);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Unable to ${action} the laboratory result.`,
      );
    } finally {
      setResultBusyId("");
    }
  }

  const totalTests = orders.reduce((total, order) => total + order.items.length, 0);
  const activeOrders = orders.filter(
    (order) => !["COMPLETED", "CANCELLED"].includes(order.status),
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED",
  ).length;

  return (
    <main className="min-h-full space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      <header className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 to-cyan-950 p-6 text-white shadow-sm sm:p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-100 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Hospital dashboard
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100">
              <FlaskConical className="h-4 w-4" aria-hidden="true" />
              Hospital services
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Laboratory
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Create laboratory orders against patient encounters and review
              requested tests, specimen progress, and result availability.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadPatients();
              void loadEncounters(patientId);
              void loadOrders(patientId);
            }}
            disabled={loadingPatients || loadingEncounters || loadingOrders}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:self-center"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loadingPatients || loadingEncounters || loadingOrders
                  ? "animate-spin"
                  : ""
              }`}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </header>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {notice ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {notice}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Patient orders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{orders.length}</p>
          <p className="mt-1 text-xs text-slate-500">For the selected patient</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active orders</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{activeOrders}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting completion or cancellation</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tests ordered</p>
          <p className="mt-2 text-3xl font-bold text-cyan-800">{totalTests}</p>
          <p className="mt-1 text-xs text-slate-500">
            {completedOrders} completed order{completedOrders === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Create laboratory order
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose an active patient encounter and add one or more tests.
            </p>
          </div>
        </div>

        <form onSubmit={createOrder} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="lab-patient" className={labelClass}>
                Patient <span className="text-rose-600">*</span>
              </label>
              <select
                id="lab-patient"
                className={inputClass}
                value={patientId}
                onChange={(event) => {
                  setPatientId(event.target.value);
                  setEncounterId("");
                  setError("");
                  setNotice("");
                }}
                disabled={loadingPatients || saving}
                required
              >
                <option value="">
                  {loadingPatients ? "Loading patients…" : "Select patient"}
                </option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientNumber} — {patientName(patient)}
                  </option>
                ))}
              </select>
              {selectedPatient ? (
                <p className="mt-1.5 text-xs text-slate-500">
                  Patient number: {selectedPatient.patientNumber}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="lab-encounter" className={labelClass}>
                Encounter <span className="text-rose-600">*</span>
              </label>
              <select
                id="lab-encounter"
                className={inputClass}
                value={encounterId}
                onChange={(event) => setEncounterId(event.target.value)}
                disabled={!patientId || loadingEncounters || saving}
                required
              >
                <option value="">
                  {!patientId
                    ? "Select a patient first"
                    : loadingEncounters
                      ? "Loading encounters…"
                      : "Select encounter"}
                </option>
                {encounters
                  .filter(
                    (encounter) =>
                      !["COMPLETED", "CANCELLED"].includes(encounter.status),
                  )
                  .map((encounter) => (
                    <option key={encounter.id} value={encounter.id}>
                      {encounter.encounterNumber} — {humanize(encounter.type)} (
                      {humanize(encounter.status)})
                    </option>
                  ))}
              </select>
              {patientId && !loadingEncounters && encounters.length === 0 ? (
                <p className="mt-1.5 text-xs text-amber-700">
                  No encounters found for this patient. Create an encounter
                  before placing an order.
                </p>
              ) : null}
              {selectedEncounter ? (
                <p className="mt-1.5 text-xs text-slate-500">
                  Opened {formatDate(selectedEncounter.createdAt)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="lab-priority" className={labelClass}>
                Priority
              </label>
              <select
                id="lab-priority"
                className={inputClass}
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as LabPriority)
                }
                disabled={saving}
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="lab-indication" className={labelClass}>
                Clinical indication
              </label>
              <input
                id="lab-indication"
                className={inputClass}
                value={clinicalIndication}
                onChange={(event) => setClinicalIndication(event.target.value)}
                maxLength={2000}
                placeholder="Reason for requesting the tests"
                disabled={saving}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">Requested tests</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Test name and specimen type are required for every item.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTests((current) => [
                    ...current,
                    makeTestDraft(`${testIdPrefix}-test-${nextTestKey}`),
                  ]);
                  setNextTestKey((current) => current + 1);
                }}
                disabled={saving || tests.length >= 100}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add test
              </button>
            </div>

            {tests.map((test, index) => (
              <div
                key={test.key}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">
                    Test {index + 1}
                  </h4>
                  {tests.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setTests((current) =>
                          current.filter((item) => item.key !== test.key),
                        )
                      }
                      disabled={saving}
                      aria-label={`Remove test ${index + 1}`}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor={`lab-test-name-${test.key}`} className={labelClass}>
                      Test name *
                    </label>
                    <input
                      id={`lab-test-name-${test.key}`}
                      className={inputClass}
                      value={test.testName}
                      onChange={(event) =>
                        updateTest(test.key, "testName", event.target.value)
                      }
                      maxLength={200}
                      placeholder="e.g. Full blood count"
                      required
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label htmlFor={`lab-test-code-${test.key}`} className={labelClass}>
                      Test code (optional)
                    </label>
                    <input
                      id={`lab-test-code-${test.key}`}
                      className={inputClass}
                      value={test.testCode}
                      onChange={(event) =>
                        updateTest(test.key, "testCode", event.target.value)
                      }
                      maxLength={100}
                      placeholder="Local laboratory code"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label htmlFor={`lab-specimen-${test.key}`} className={labelClass}>
                      Specimen type *
                    </label>
                    <input
                      id={`lab-specimen-${test.key}`}
                      className={inputClass}
                      value={test.specimenType}
                      onChange={(event) =>
                        updateTest(test.key, "specimenType", event.target.value)
                      }
                      maxLength={100}
                      placeholder="e.g. Blood, urine, swab"
                      required
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label htmlFor={`lab-instructions-${test.key}`} className={labelClass}>
                      Collection instructions
                    </label>
                    <input
                      id={`lab-instructions-${test.key}`}
                      className={inputClass}
                      value={test.instructions}
                      onChange={(event) =>
                        updateTest(test.key, "instructions", event.target.value)
                      }
                      maxLength={1000}
                      placeholder="Optional instructions"
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="lab-order-notes" className={labelClass}>
              Order notes
            </label>
            <textarea
              id="lab-order-notes"
              className={inputClass}
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={4000}
              placeholder="Additional information for the laboratory"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Reset form
            </button>
            <button
              type="submit"
              disabled={saving || loadingPatients || loadingEncounters || !patientId || !encounterId}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Creating order…" : "Create laboratory order"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Laboratory order history
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a patient above to view that patient&apos;s orders.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              aria-label="Search laboratory orders"
              className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search orders and tests"
              disabled={!patientId}
            />
          </div>
        </div>

        {!patientId ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <p className="mt-3 font-medium text-slate-700">Select a patient</p>
            <p className="mt-1 text-sm text-slate-500">
              Laboratory order history will appear here.
            </p>
          </div>
        ) : loadingOrders ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading laboratory orders…
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
            <FlaskConical className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
            <p className="mt-3 font-medium text-slate-700">
              {orders.length === 0
                ? "No laboratory orders yet"
                : "No orders match your search"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {orders.length === 0
                ? "Create the first order using the form above."
                : "Try a different order number, status, or test name."}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {filteredOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Ordered {formatDate(order.orderedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        priorityStyles[order.priority] ?? priorityStyles.ROUTINE
                      }`}
                    >
                      {priorityLabels[order.priority] ?? humanize(order.priority)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        orderStatusStyles[order.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {humanize(order.status)}
                    </span>
                  </div>
                </div>

                {order.clinicalIndication ? (
                  <p className="mt-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Indication:</span>{" "}
                    {order.clinicalIndication}
                  </p>
                ) : null}

                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg bg-slate-50 p-3"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {item.testName}
                            {item.testCode ? (
                              <span className="ml-2 text-xs font-normal text-slate-500">
                                {item.testCode}
                              </span>
                            ) : null}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Specimen: {item.specimenType}
                            {item.status ? ` · ${humanize(item.status)}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(item.specimens ?? []).map((specimen) => {
                            const busy = specimenBusyId === `specimen:${specimen.id}`;
                            const canCollect = specimen.status === "PENDING";
                            const canReceive = specimen.status === "COLLECTED";
                            const canReject = ["PENDING", "COLLECTED"].includes(
                              specimen.status,
                            );

                            return (
                              <div
                                key={specimen.id}
                                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2"
                              >
                                <span
                                  className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-800"
                                  title={specimen.specimenNumber}
                                >
                                  {specimen.specimenNumber} · {humanize(specimen.status)}
                                </span>

                                {canCollect ? (
                                  <button
                                    type="button"
                                    onClick={() => void updateSpecimen(specimen, "collect")}
                                    disabled={Boolean(specimenBusyId)}
                                    className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {busy ? "Processing…" : "Collect"}
                                  </button>
                                ) : null}

                                {canReceive ? (
                                  <button
                                    type="button"
                                    onClick={() => void updateSpecimen(specimen, "receive")}
                                    disabled={Boolean(specimenBusyId)}
                                    className="rounded-md bg-cyan-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {busy ? "Processing…" : "Receive"}
                                  </button>
                                ) : null}

                                {canReject ? (
                                  <button
                                    type="button"
                                    onClick={() => void updateSpecimen(specimen, "reject")}
                                    disabled={Boolean(specimenBusyId)}
                                    className="rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                ) : null}
                              </div>
                            );
                          })}
                          {(item.results ?? []).map((result) => (
                            <div
                              key={result.id}
                              className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-200 bg-white p-2"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800">
                                  {result.resultValue}
                                  {result.unit ? ` ${result.unit}` : ""}
                                  {result.abnormalFlag
                                    ? ` · ${result.abnormalFlag}`
                                    : ""}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                  {humanize(result.status)}
                                  {result.numericValue !== null &&
                                  result.numericValue !== undefined &&
                                  result.numericValue !== ""
                                    ? ` · Numeric: ${result.numericValue}`
                                    : ""}
                                  {result.referenceRange
                                    ? ` · Reference: ${result.referenceRange}`
                                    : ""}
                                </p>
                              </div>
                              {["DRAFT", "PRELIMINARY", "AMENDED"].includes(
                                result.status,
                              ) ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void transitionLabResult(result.id, "verify", order)
                                  }
                                  disabled={Boolean(resultBusyId)}
                                  className="rounded-md border border-cyan-200 px-2.5 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {resultBusyId === `transition:${result.id}`
                                    ? "Processing…"
                                    : "Verify"}
                                </button>
                              ) : null}
                              {result.status === "VERIFIED" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void transitionLabResult(result.id, "release", order)
                                  }
                                  disabled={Boolean(resultBusyId)}
                                  className="rounded-md bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {resultBusyId === `transition:${result.id}`
                                    ? "Processing…"
                                    : "Release"}
                                </button>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>

                      <form
                        onSubmit={(event) => void submitLabResult(event, item, order)}
                        className="mt-3 space-y-3 rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <h4 className="text-sm font-semibold text-slate-800">
                          Enter laboratory result
                        </h4>
                        <div>
                          <label className={labelClass} htmlFor={`result-specimen-${item.id}`}>
                            Received specimen
                          </label>
                          <select
                            id={`result-specimen-${item.id}`}
                            className={inputClass}
                            value={getResultDraft(item.id).specimenId}
                            onChange={(event) =>
                              updateResultDraft(item.id, "specimenId", event.target.value)
                            }
                          >
                            <option value="">No specimen linked</option>
                            {(item.specimens ?? [])
                              .filter((specimen) => specimen.status === "RECEIVED")
                              .map((specimen) => (
                                <option key={specimen.id} value={specimen.id}>
                                  {specimen.specimenNumber} · {specimen.specimenType}
                                </option>
                              ))}
                          </select>
                          <p className="mt-1 text-xs text-slate-500">
                            Only received specimens can be linked to a result.
                          </p>
                        </div>
                        <div>
                          <label className={labelClass} htmlFor={`result-value-${item.id}`}>
                            Result value *
                          </label>
                          <textarea
                            id={`result-value-${item.id}`}
                            className={inputClass}
                            rows={2}
                            maxLength={20000}
                            required
                            value={getResultDraft(item.id).resultValue}
                            onChange={(event) =>
                              updateResultDraft(item.id, "resultValue", event.target.value)
                            }
                            placeholder="Enter the laboratory finding"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className={labelClass} htmlFor={`result-numeric-${item.id}`}>
                              Numeric value
                            </label>
                            <input
                              id={`result-numeric-${item.id}`}
                              className={inputClass}
                              inputMode="decimal"
                              value={getResultDraft(item.id).numericValue}
                              onChange={(event) =>
                                updateResultDraft(item.id, "numericValue", event.target.value)
                              }
                              placeholder="e.g. 5.4"
                            />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor={`result-unit-${item.id}`}>
                              Unit
                            </label>
                            <input
                              id={`result-unit-${item.id}`}
                              className={inputClass}
                              maxLength={100}
                              value={getResultDraft(item.id).unit}
                              onChange={(event) =>
                                updateResultDraft(item.id, "unit", event.target.value)
                              }
                              placeholder="e.g. mmol/L"
                            />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor={`result-range-${item.id}`}>
                              Reference range
                            </label>
                            <input
                              id={`result-range-${item.id}`}
                              className={inputClass}
                              maxLength={200}
                              value={getResultDraft(item.id).referenceRange}
                              onChange={(event) =>
                                updateResultDraft(item.id, "referenceRange", event.target.value)
                              }
                              placeholder="e.g. 3.5–5.5"
                            />
                          </div>
                          <div>
                            <label className={labelClass} htmlFor={`result-flag-${item.id}`}>
                              Abnormal flag
                            </label>
                            <select
                              id={`result-flag-${item.id}`}
                              className={inputClass}
                              value={getResultDraft(item.id).abnormalFlag}
                              onChange={(event) =>
                                updateResultDraft(item.id, "abnormalFlag", event.target.value)
                              }
                            >
                              <option value="">None</option>
                              <option value="LOW">Low</option>
                              <option value="NORMAL">Normal</option>
                              <option value="HIGH">High</option>
                              <option value="CRITICAL">Critical</option>
                              <option value="ABNORMAL">Abnormal</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={
                              Boolean(resultBusyId) ||
                              Boolean(specimenBusyId) ||
                              !getResultDraft(item.id).resultValue.trim() ||
                              ["COMPLETED", "CANCELLED"].includes(order.status) ||
                              ["COMPLETED", "CANCELLED"].includes(item.status ?? "")
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Save className="h-3.5 w-3.5" aria-hidden="true" />
                            {resultBusyId === `result:${item.id}`
                              ? "Saving result…"
                              : "Save result"}
                          </button>
                        </div>
                      </form>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
                        <p className="text-xs text-slate-500">
                          {(item.specimens ?? []).length} specimen
                          {(item.specimens ?? []).length === 1 ? "" : "s"} registered
                        </p>
                        <button
                          type="button"
                          onClick={() => void registerSpecimen(item)}
                          disabled={
                            Boolean(specimenBusyId) ||
                            ["COMPLETED", "CANCELLED"].includes(order.status) ||
                            ["CANCELLED", "COMPLETED"].includes(item.status ?? "")
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          {specimenBusyId === `register:${item.id}`
                            ? "Registering…"
                            : "Register specimen"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {order.notes ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Notes: {order.notes}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

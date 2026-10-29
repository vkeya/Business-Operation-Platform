"use client";

import { useCallback, useEffect, useState } from "react";

type Ward = {
  id: string;
  code: string;
  name: string;
  type: string | null;
  description: string | null;
  isActive: boolean;
  _count?: { beds: number };
};

type Bed = {
  id: string;
  wardId: string;
  bedNumber: string;
  status: string;
  notes: string | null;
  ward?: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
  };
};

type Admission = {
  id: string;
  admissionNumber: string;
  status: string;
  patient: {
    firstName: string;
    lastName: string;
    patientNumber: string;
  };
};

type Allocation = {
  id: string;
  releasedAt: string | null;
  admission: {
    id: string;
    admissionNumber: string;
    patientId?: string;
  };
  bed: {
    id: string;
    bedNumber: string;
    ward?: { id: string; code: string; name: string };
  };
};

type ApiResponse = {
  error?: string;
  message?: string;
  wards?: Ward[];
  ward?: Ward;
  beds?: Bed[];
  bed?: Bed;
  admissions?: Admission[];
  admission?: Admission & { allocations?: Allocation[] };
  allocation?: Allocation;
};

async function readResponse(response: Response): Promise<ApiResponse> {
  return response.json().catch(() => ({}));
}

export default function HospitalWardsWorkspace() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(true);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [activeAllocations, setActiveAllocations] = useState<Allocation[]>([]);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");
  const [releaseReason, setReleaseReason] = useState("");
  const [loadingAdmission, setLoadingAdmission] = useState(false);
  const [savingAllocation, setSavingAllocation] = useState(false);
  const [releasingAllocationId, setReleasingAllocationId] = useState("");
  const [savingWard, setSavingWard] = useState(false);
  const [savingBed, setSavingBed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [wardCode, setWardCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [wardType, setWardType] = useState("");
  const [wardDescription, setWardDescription] = useState("");

  const [selectedWardId, setSelectedWardId] = useState("");
  const [bedNumber, setBedNumber] = useState("");
  const [bedNotes, setBedNotes] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [wardsResponse, bedsResponse, admissionsResponse] =
        await Promise.all([
          fetch("/api/hospital/wards?includeInactive=true&take=100", {
            cache: "no-store",
          }),
          fetch("/api/hospital/beds?take=100", {
            cache: "no-store",
          }),
          fetch("/api/hospital/admissions?status=ADMITTED&take=100", {
            cache: "no-store",
          }),
        ]);

      const [wardsData, bedsData, admissionsData] = await Promise.all([
        readResponse(wardsResponse),
        readResponse(bedsResponse),
        readResponse(admissionsResponse),
      ]);

      if (!wardsResponse.ok) {
        throw new Error(
          wardsData.error || wardsData.message || "Could not load hospital wards.",
        );
      }

      if (!bedsResponse.ok) {
        throw new Error(
          bedsData.error || bedsData.message || "Could not load hospital beds.",
        );
      }

      if (!admissionsResponse.ok) {
        throw new Error(
          admissionsData.error ||
            admissionsData.message ||
            "Could not load admitted patients.",
        );
      }

      const nextWards = wardsData.wards ?? [];
      setWards(nextWards);
      setBeds(bedsData.beds ?? []);
      setAdmissions(admissionsData.admissions ?? []);
      setSelectedBedId((current) => {
        if (
          current &&
          (bedsData.beds ?? []).some(
            (bed) => bed.id === current && bed.status === "AVAILABLE",
          )
        ) {
          return current;
        }
        return (bedsData.beds ?? []).find(
          (bed) => bed.status === "AVAILABLE",
        )?.id ?? "";
      });
      setSelectedAdmissionId((current) => {
        if (
          current &&
          (admissionsData.admissions ?? []).some(
            (admission) => admission.id === current,
          )
        ) {
          return current;
        }
        return (admissionsData.admissions ?? [])[0]?.id ?? "";
      });

      setSelectedWardId((current) => {
        if (current && nextWards.some((ward) => ward.id === current && ward.isActive)) {
          return current;
        }

        return nextWards.find((ward) => ward.isActive)?.id ?? "";
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not load wards and beds.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function createWard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingWard(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/hospital/wards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: wardCode.trim(),
          name: wardName.trim(),
          ...(wardType.trim() ? { type: wardType.trim() } : {}),
          ...(wardDescription.trim()
            ? { description: wardDescription.trim() }
            : {}),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Could not create the ward.");
      }

      setWardCode("");
      setWardName("");
      setWardType("");
      setWardDescription("");
      setSuccess(`Ward ${data.ward?.code ?? wardCode.trim()} created successfully.`);
      await loadData();

      if (data.ward?.id) {
        setSelectedWardId(data.ward.id);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the ward.");
    } finally {
      setSavingWard(false);
    }
  }

  async function createBed(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedWardId) {
      setError("Select an active ward before creating a bed.");
      return;
    }

    setSavingBed(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/hospital/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wardId: selectedWardId,
          bedNumber: bedNumber.trim(),
          ...(bedNotes.trim() ? { notes: bedNotes.trim() } : {}),
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Could not create the bed.");
      }

      setBedNumber("");
      setBedNotes("");
      setSuccess(
        `Bed ${data.bed?.bedNumber ?? bedNumber.trim()} created successfully.`,
      );
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the bed.");
    } finally {
      setSavingBed(false);
    }
  }

  useEffect(() => {
    if (!selectedAdmissionId) {
      setActiveAllocations([]);
      return;
    }

    let cancelled = false;

    async function loadAdmissionAllocations() {
      setLoadingAdmission(true);
      try {
        const response = await fetch(
          `/api/hospital/admissions/${encodeURIComponent(selectedAdmissionId)}`,
          { cache: "no-store" },
        );
        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Could not load the selected admission.",
          );
        }

        if (!cancelled) {
          setActiveAllocations(data.admission?.allocations ?? []);
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load the selected admission.",
          );
        }
      } finally {
        if (!cancelled) setLoadingAdmission(false);
      }
    }

    void loadAdmissionAllocations();
    return () => {
      cancelled = true;
    };
  }, [selectedAdmissionId]);

  async function allocateBed(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAdmissionId || !selectedBedId) {
      setError("Select an admitted patient and an available bed.");
      return;
    }

    setSavingAllocation(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/hospital/admissions/${encodeURIComponent(selectedAdmissionId)}/bed-allocation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bedId: selectedBedId }),
        },
      );
      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not allocate the bed.",
        );
      }

      setSuccess("Bed allocated successfully.");
      await loadData();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not allocate the bed.",
      );
    } finally {
      setSavingAllocation(false);
    }
  }

  async function releaseBed(allocationId: string) {
    const reason = releaseReason.trim();
    if (
      !window.confirm(
        reason
          ? "Release this bed allocation?"
          : "Release this bed allocation without a reason?",
      )
    ) {
      return;
    }

    setReleasingAllocationId(allocationId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/hospital/bed-allocations/${encodeURIComponent(allocationId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            reason ? { releaseReason: reason } : {},
          ),
        },
      );
      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Could not release the bed.",
        );
      }

      setReleaseReason("");
      setSuccess("Bed released successfully.");
      await loadData();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not release the bed.",
      );
    } finally {
      setReleasingAllocationId("");
    }
  }

  const activeWards = wards.filter((ward) => ward.isActive);
  const availableBeds = beds.filter((bed) => bed.status === "AVAILABLE").length;
  const occupiedBeds = beds.filter((bed) => bed.status === "OCCUPIED").length;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 to-cyan-950 p-7 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
          Hospital workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Wards &amp; Beds</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Manage hospital wards, register beds, and monitor bed availability.
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
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total wards loaded</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {wards.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {activeWards.length} active
          </p>
        </div>

        <div className="rounded-xl border border-cyan-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available beds loaded</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-700">
            {availableBeds}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Occupied beds loaded</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">
            {occupiedBeds}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={createWard}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Create a ward</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a ward to the current hospital business.
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Ward code *
            <input
              required
              maxLength={40}
              value={wardCode}
              onChange={(event) => setWardCode(event.target.value)}
              placeholder="e.g. GEN-01"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Ward name *
            <input
              required
              maxLength={120}
              value={wardName}
              onChange={(event) => setWardName(event.target.value)}
              placeholder="e.g. General Ward"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Ward type
            <select
              value={wardType}
              onChange={(event) => setWardType(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
            >
              <option value="">Select ward type (optional)</option>
              <option value="GENERAL">General</option>
              <option value="MATERNITY">Maternity</option>
              <option value="PAEDIATRIC">Paediatric</option>
              <option value="SURGICAL">Surgical</option>
              <option value="MEDICAL">Medical</option>
              <option value="ICU">Intensive Care Unit (ICU)</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              maxLength={1000}
              value={wardDescription}
              onChange={(event) => setWardDescription(event.target.value)}
              placeholder="Optional ward details"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>

          <button
            type="submit"
            disabled={savingWard}
            className="rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingWard ? "Creating ward..." : "Create ward"}
          </button>
        </form>

        <form
          onSubmit={createBed}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Register a bed</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a bed to an active ward.
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Active ward *
            <select
              required
              value={selectedWardId}
              onChange={(event) => setSelectedWardId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
            >
              <option value="">Select a ward</option>
              {activeWards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.code} — {ward.name}
                </option>
              ))}
            </select>
          </label>

          {activeWards.length === 0 && (
            <p className="text-sm text-amber-700">
              Create an active ward before registering beds.
            </p>
          )}

          <label className="block text-sm font-medium text-slate-700">
            Bed number *
            <input
              required
              maxLength={40}
              value={bedNumber}
              onChange={(event) => setBedNumber(event.target.value)}
              placeholder="e.g. BED-001"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Notes
            <textarea
              maxLength={1000}
              value={bedNotes}
              onChange={(event) => setBedNotes(event.target.value)}
              placeholder="Optional bed details"
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>

          <button
            type="submit"
            disabled={savingBed || activeWards.length === 0}
            className="rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingBed ? "Registering bed..." : "Register bed"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Ward register</h2>
            <p className="mt-1 text-sm text-slate-500">
              Wards and their registered bed counts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading wards and beds...</p>
        ) : wards.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No wards found for this hospital business. Create your first ward above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Ward</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Beds</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wards.map((ward) => {
                  const wardBeds = beds.filter((bed) => bed.wardId === ward.id);

                  return (
                    <tr key={ward.id}>
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                        {ward.code}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{ward.name}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {ward.type || "—"}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {ward._count?.beds ?? wardBeds.length}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            ward.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {ward.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Bed allocation
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Allocate an available bed to an admitted patient, or release an
            existing allocation.
          </p>
        </div>

        <form onSubmit={allocateBed} className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm font-medium text-slate-700">
            Admitted patient *
            <select
              required
              value={selectedAdmissionId}
              onChange={(event) => setSelectedAdmissionId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
            >
              <option value="">Select an admission</option>
              {admissions.map((admission) => (
                <option key={admission.id} value={admission.id}>
                  {admission.admissionNumber} — {admission.patient.firstName}{" "}
                  {admission.patient.lastName} ({admission.patient.patientNumber})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Available bed *
            <select
              required
              value={selectedBedId}
              onChange={(event) => setSelectedBedId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"
            >
              <option value="">Select a bed</option>
              {beds
                .filter(
                  (bed) =>
                    bed.status === "AVAILABLE" &&
                    bed.ward?.isActive !== false &&
                    wards.some(
                      (ward) => ward.id === bed.wardId && ward.isActive,
                    ),
                )
                .map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bedNumber} —{" "}
                    {bed.ward
                      ? `${bed.ward.code} (${bed.ward.name})`
                      : wards.find((ward) => ward.id === bed.wardId)?.name ??
                        "Ward"}
                  </option>
                ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={
                savingAllocation ||
                loading ||
                loadingAdmission ||
                admissions.length === 0 ||
                !selectedBedId ||
                !selectedAdmissionId
              }
              className="w-full rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingAllocation ? "Allocating..." : "Allocate bed"}
            </button>
          </div>
        </form>

        {admissions.length === 0 && (
          <p className="text-sm text-amber-700">
            There are no admitted patients available for allocation.
          </p>
        )}

        <div className="border-t border-slate-200 pt-5">
          <h3 className="font-semibold text-slate-900">
            Active allocation for selected admission
          </h3>

          {loadingAdmission ? (
            <p className="mt-3 text-sm text-slate-500">
              Loading active allocation...
            </p>
          ) : activeAllocations.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              No active bed allocation for this admission.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {activeAllocations.map((allocation) => (
                <div
                  key={allocation.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {allocation.bed.bedNumber}
                    </p>
                    <p className="text-sm text-slate-600">
                      {allocation.bed.ward
                        ? `${allocation.bed.ward.code} — ${allocation.bed.ward.name}`
                        : "Ward details unavailable"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Admission {admissions.find((item) => item.id === selectedAdmissionId)?.admissionNumber ?? selectedAdmissionId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void releaseBed(allocation.id)}
                    disabled={Boolean(releasingAllocationId)}
                    className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {releasingAllocationId === allocation.id
                      ? "Releasing..."
                      : "Release bed"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeAllocations.length > 0 && (
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Release reason (optional)
              <input
                maxLength={500}
                value={releaseReason}
                onChange={(event) => setReleaseReason(event.target.value)}
                placeholder="e.g. Patient transferred to another ward"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              />
            </label>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Bed register</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bed availability for the current hospital business.
          </p>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading beds...</p>
        ) : beds.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No beds registered yet. Create a ward, then register its beds above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Bed number</th>
                  <th className="px-5 py-3">Ward</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {beds.map((bed) => (
                  <tr key={bed.id}>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                      {bed.bedNumber}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {bed.ward
                        ? `${bed.ward.code} — ${bed.ward.name}`
                        : wards.find((ward) => ward.id === bed.wardId)?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{bed.notes || "—"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          bed.status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-700"
                            : bed.status === "OCCUPIED"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {bed.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

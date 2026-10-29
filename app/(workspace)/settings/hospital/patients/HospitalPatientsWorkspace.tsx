
"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, UserPlus, Users, RefreshCw } from "lucide-react";

type Patient = {
  id: string;
  patientNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string | null;
  sex: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
};

export default function HospitalPatientsWorkspace() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search: search.trim(),
        take: "100",
      });

      const response = await fetch(
        `/api/hospital/patients?${params.toString()}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to load patients.");
      }

      setPatients(result.patients ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load patients.",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  function resetForm() {
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setDateOfBirth("");
    setSex("");
    setPhone("");
    setEmail("");
    setAddress("");
    setEmergencyContactName("");
    setEmergencyContactRelationship("");
    setEmergencyContactPhone("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/hospital/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          middleName: middleName || null,
          lastName,
          dateOfBirth: dateOfBirth || null,
          sex: sex || null,
          phone: phone || null,
          email: email || null,
          address: address || null,
          emergencyContactName: emergencyContactName || null,
          emergencyContactRelationship:
            emergencyContactRelationship || null,
          emergencyContactPhone: emergencyContactPhone || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to register patient.");
      }

      setSuccess(
        `Patient registered successfully. Patient number: ${result.patient.patientNumber}`,
      );
      resetForm();
      setShowForm(false);
      await loadPatients();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to register patient.",
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
        <h1 className="mt-3 text-3xl font-semibold">Patient management</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Register patients and manage their demographic and contact records.
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
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search number, name, phone or email"
            aria-label="Search patients"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadPatients()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-800"
          >
            <UserPlus className="h-4 w-4" />
            Register patient
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
              Register a patient
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fields marked required must be completed. The patient number is
              generated automatically.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">First name *</span>
              <input
                required
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Middle name</span>
              <input
                value={middleName}
                onChange={(event) => setMiddleName(event.target.value)}
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Last name *</span>
              <input
                required
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                maxLength={100}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Date of birth</span>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(event) => setDateOfBirth(event.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Sex</span>
              <select
                value={sex}
                onChange={(event) => setSex(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
              >
                <option value="">Not specified</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="intersex">Intersex</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={40}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>

            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="font-medium text-slate-700">Address</span>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                maxLength={500}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
              />
            </label>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="font-semibold text-slate-900">
              Emergency contact
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">Contact name</span>
                <input
                  value={emergencyContactName}
                  onChange={(event) =>
                    setEmergencyContactName(event.target.value)
                  }
                  maxLength={150}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">
                  Relationship
                </span>
                <input
                  value={emergencyContactRelationship}
                  onChange={(event) =>
                    setEmergencyContactRelationship(event.target.value)
                  }
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">
                  Contact phone
                </span>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(event) =>
                    setEmergencyContactPhone(event.target.value)
                  }
                  maxLength={40}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
            >
              {saving ? "Registering..." : "Save patient"}
            </button>
          </div>
        </form>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Patient register</h2>
            <p className="mt-1 text-sm text-slate-500">
              {patients.length} record{patients.length === 1 ? "" : "s"} shown
            </p>
          </div>
          <Users className="h-5 w-5 text-slate-400" />
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading patient records...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">
              No patients found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Register a patient or try a different search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Patient number</th>
                  <th className="px-5 py-3 font-semibold">Patient name</th>
                  <th className="px-5 py-3 font-semibold">Date of birth</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-cyan-800">
                      {patient.patientNumber}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {[patient.firstName, patient.middleName, patient.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {patient.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {patient.phone || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          patient.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {patient.isActive ? "Active" : "Inactive"}
                      </span>
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

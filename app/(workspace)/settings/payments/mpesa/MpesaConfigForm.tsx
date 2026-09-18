"use client";

import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  saveMpesaConfigurationAction,
  verifyMpesaConfigurationAction,
} from "@/lib/payment/mpesaActions";

type MerchantType = "TILL" | "PAYBILL";
type Environment = "SANDBOX" | "PRODUCTION";

interface ExistingConfiguration {
  merchantType: MerchantType;
  shortcode: string;
  consumerKey: string;
  environment: Environment;
  isActive: boolean;
  verifiedAt: string | null;
}

interface Props {
  configuration: ExistingConfiguration | null;
}

export default function MpesaConfigForm({ configuration }: Props) {
  const [merchantType, setMerchantType] = useState<MerchantType>(
    configuration?.merchantType ?? "TILL"
  );

  const [shortcode, setShortcode] = useState(
    configuration?.shortcode ?? ""
  );

  const [consumerKey, setConsumerKey] = useState(
    configuration?.consumerKey ?? ""
  );

  const [consumerSecret, setConsumerSecret] = useState("");

  const [passkey, setPasskey] = useState("");

  const [environment, setEnvironment] = useState<Environment>(
    configuration?.environment ?? "SANDBOX"
  );

  const [showSecret, setShowSecret] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);

  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

async function handleVerify() {
  setVerifying(true);
  setMessage(null);
  setError(null);

  try {
    const result = await verifyMpesaConfigurationAction();

    setMessage(
      `M-Pesa connection verified successfully at ${new Date(
        result.verifiedAt
      ).toLocaleString()}.`
    );
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to verify M-Pesa configuration."
    );
  } finally {
    setVerifying(false);
  }
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      if (!shortcode.trim()) {
        throw new Error("Enter your M-Pesa shortcode.");
      }

if (!configuration && !consumerSecret.trim()) {
  throw new Error("Enter your Daraja consumer secret.");
}

if (!configuration && !passkey.trim()) {
  throw new Error("Enter your M-Pesa passkey.");
}


      await saveMpesaConfigurationAction({
        merchantType,
        shortcode: shortcode.trim(),
        consumerKey: consumerKey.trim(),
        consumerSecret: consumerSecret.trim(),
        passkey: passkey.trim(),
        environment,
      });

      setMessage(
        environment === "SANDBOX"
          ? "M-Pesa sandbox configuration saved."
          : "M-Pesa production configuration saved. Connection verification is still required before live payments are enabled."
      );

      setConsumerSecret("");
      setPasskey("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save M-Pesa configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Merchant account */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
            <Smartphone className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Merchant account
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Tell SmatPic which M-Pesa merchant account should receive
              customer payments.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Merchant type
            </label>

            <select
              value={merchantType}
              onChange={(event) =>
                setMerchantType(event.target.value as MerchantType)
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="TILL">M-Pesa Till</option>
              <option value="PAYBILL">PayBill</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              {merchantType === "TILL"
                ? "Till number"
                : "PayBill number"}
            </label>

            <input
              type="text"
              inputMode="numeric"
              value={shortcode}
              onChange={(event) => setShortcode(event.target.value)}
              placeholder={
                merchantType === "TILL"
                  ? "Enter Till number"
                  : "Enter PayBill number"
              }
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>
      </section>

      {/* Daraja credentials */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
            <KeyRound className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Daraja credentials
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              These credentials are used by SmatPic's server to communicate
              with Safaricom's M-Pesa API.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Consumer key
            </label>

            <input
              type="text"
              value={consumerKey}
              onChange={(event) => setConsumerKey(event.target.value)}
              placeholder="Enter Daraja consumer key"
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Consumer secret
            </label>

            <div className="relative mt-2">
              <input
                type={showSecret ? "text" : "password"}
                value={consumerSecret}
                onChange={(event) =>
                  setConsumerSecret(event.target.value)
                }
                placeholder={
  configuration
    ? "Leave blank to keep existing secret"
    : "Enter Daraja consumer secret"
}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />

              <button
                type="button"
                onClick={() => setShowSecret((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label={
                  showSecret
                    ? "Hide consumer secret"
                    : "Show consumer secret"
                }
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              M-Pesa passkey
            </label>

            <div className="relative mt-2">
              <input
                type={showPasskey ? "text" : "password"}
                value={passkey}
                onChange={(event) => setPasskey(event.target.value)}
                placeholder={
  configuration
    ? "Leave blank to keep existing passkey"
    : "Enter M-Pesa passkey"
}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />

              <button
                type="button"
                onClick={() => setShowPasskey((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                aria-label={
                  showPasskey
                    ? "Hide passkey"
                    : "Show passkey"
                }
              >
                {showPasskey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

          <p className="text-xs leading-5 text-slate-500">
            Consumer secrets and passkeys are encrypted before they are
            stored. They are not returned to the browser after being saved.
          </p>
        </div>
      </section>

      {/* Environment */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Environment
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Use Sandbox while testing. Production should only be enabled
          after the merchant's Daraja integration has been approved and
          verified.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setEnvironment("SANDBOX")}
            className={`rounded-xl border p-4 text-left transition ${
              environment === "SANDBOX"
                ? "border-violet-300 bg-violet-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">
              Sandbox
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Test M-Pesa integration without live customer transactions.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setEnvironment("PRODUCTION")}
            className={`rounded-xl border p-4 text-left transition ${
              environment === "PRODUCTION"
                ? "border-amber-300 bg-amber-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-sm font-semibold text-slate-900">
              Production
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Live merchant environment. Verification is required.
            </p>
          </button>
        </div>
      </section>

      {/* Status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
        Connection status
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            configuration?.verifiedAt
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {configuration?.verifiedAt
            ? "Verified"
            : "Not verified"}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {configuration?.verifiedAt
          ? `Last verified ${new Date(
              configuration.verifiedAt
            ).toLocaleString()}.`
          : "Save your configuration, then verify the Daraja connection before accepting M-Pesa payments."}
      </p>
    </div>

    <button
      type="button"
      onClick={handleVerify}
      disabled={verifying || !configuration}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {verifying ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4" />
          Verify connection
        </>
      )}
    </button>
  </div>
</section>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save M-Pesa configuration
            </>
          )}
        </button>
      </div>
    </form>
  );
}
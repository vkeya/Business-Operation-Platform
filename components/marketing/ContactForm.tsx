"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

const enquiryTypes = [
  "Request a product demo",
  "Discuss business requirements",
  "Ask about pricing",
  "Get onboarding assistance",
  "Other enquiry",
];

const businessTypes = [
  "Shop / Retail",
  "Supermarket",
  "Pharmacy",
  "Hospital",
  "Restaurant",
  "Boutique",
  "Wines & Spirits",
  "Other",
];

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to submit your enquiry.");
      }

      setMessage("Thank you. Your enquiry has been submitted successfully.");
      form.reset();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
	  <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Full name *
          </label>
          <input
            name="fullName"
            required
            maxLength={120}
            autoComplete="name"
            placeholder="Your full name"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Business name *
          </label>
          <input
            name="businessName"
            required
            maxLength={160}
            placeholder="Your business name"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Business email *
          </label>
          <input
            type="email"
            name="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-700">
            Phone / WhatsApp *
          </label>
          <input
            type="tel"
            name="phone"
            required
            maxLength={30}
            autoComplete="tel"
            placeholder="+254 ..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Business type *
        </label>
        <select
          name="businessType"
          required
          defaultValue=""
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        >
          <option value="" disabled>
            Select your business type
          </option>
          {businessTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          How can we help? *
        </label>
        <select
          name="enquiryType"
          required
          defaultValue=""
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        >
          <option value="" disabled>
            Select an enquiry type
          </option>
          {enquiryTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-slate-700">
          Tell us more
        </label>
        <textarea
          name="message"
          rows={4}
          maxLength={3000}
          placeholder="Tell us briefly about your business or what you would like to discuss..."
          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit enquiry
            <ArrowRight size={18} />
          </>
        )}
      </button>

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700"
        >
          {message}
        </p>
      )}

      <p className="text-center text-xs leading-5 text-slate-500">
        By submitting this form, you agree that the SmatPic team may contact
        you about your enquiry.
      </p>
    </form>
  );
}
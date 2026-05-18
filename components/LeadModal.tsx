"use client";

import { useState } from "react";
import { sendLead } from "@/lib/leadStore";

type Props = {
  open: boolean;
  onClose: () => void;
  tool: "university-match" | "cost-calculator";
  payload: Record<string, unknown>;
  onSuccess: (info: { name: string; email: string; phone: string }) => void;
  ctaLabel?: string;
};

export default function LeadModal({ open, onClose, tool, payload, onSuccess, ctaLabel = "Email me the PDF report" }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.includes("@") || phone.replace(/\D/g, "").length < 7) {
      setError("Please fill name, a valid email and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      await sendLead({ name, email, phone, tool, payload });
      onSuccess({ name, email, phone });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">Get your detailed PDF report</h3>
            <p className="text-sm text-slate-600 mt-1">
              We&apos;ll email it to you and one of our counsellors at PR Study Abroad will reach out with a personalized plan.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 -mt-1 -mr-1" aria-label="Close">✕</button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <Field label="Full name" value={name} onChange={setName} placeholder="Aarav Sharma" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <Field label="Phone (with country code)" value={phone} onChange={setPhone} placeholder="+91 98xxxxxxxx" type="tel" />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center px-4 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : ctaLabel}
          </button>
          <p className="text-[11px] text-slate-500 text-center">
            By submitting, you agree to be contacted by PR Study Abroad. We don&apos;t spam.
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
    </label>
  );
}

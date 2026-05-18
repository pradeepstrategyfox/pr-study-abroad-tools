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
      setError("Please enter a name, valid email and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      await sendLead({ name, email, phone, tool, payload });
      onSuccess({ name, email, phone });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 sm:p-7 md:p-9 shadow-2xl">
        <div className="flex justify-between items-start mb-2">
          <h3 className="title-section text-xl sm:text-2xl text-[#1d1d1f]">Get your PDF report</h3>
          <button onClick={onClose} aria-label="Close" className="-mr-1 w-9 h-9 rounded-full hover:bg-[#f5f5f7] text-[#6e6e73] flex items-center justify-center text-lg">✕</button>
        </div>
        <p className="text-[14px] text-[#6e6e73] leading-relaxed">
          We&apos;ll email it instantly, and a PR Study Abroad counsellor will reach out with a personalized plan.
        </p>

        <form onSubmit={submit} className="mt-5 sm:mt-6 space-y-4">
          <Field label="Full name" value={name} onChange={setName} placeholder="Aarav Sharma" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
          <Field label="Phone (with country code)" value={phone} onChange={setPhone} placeholder="+91 98xxxxxxxx" type="tel" />

          {error && <div className="text-[13px] text-red-600">{error}</div>}

          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 disabled:opacity-60">
            {submitting ? "Submitting…" : ctaLabel}
          </button>
          <p className="text-[11px] text-[#6e6e73] text-center leading-snug">
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
      <span className="label-base">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-base" required />
    </label>
  );
}

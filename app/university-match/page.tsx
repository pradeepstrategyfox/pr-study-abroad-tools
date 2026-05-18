"use client";

import { useMemo, useState } from "react";
import { predict, countryList, type PredictionResult, type Match } from "@/lib/predictor";
import { formatINR } from "@/lib/costs";
import LeadModal from "@/components/LeadModal";
import { generateUniversityMatchPDF } from "@/lib/pdf";

const PROGRAMS: Array<"MS" | "MBA" | "UG"> = ["MS", "MBA", "UG"];

export default function UniversityMatchPage() {
  const countries = useMemo(() => ["Any", ...countryList()], []);

  const [tenthMarks, setTenthMarks] = useState(85);
  const [twelfthMarks, setTwelfthMarks] = useState(82);
  const [ugCGPA, setUgCGPA] = useState(7.8);
  const [workExperienceYears, setWXP] = useState(2);
  const [targetCountry, setTargetCountry] = useState("USA");
  const [annualBudgetINR, setBudget] = useState(3500000);
  const [ieltsScore, setIELTS] = useState<number>(7.0);
  const [greScore, setGRE] = useState<number>(0);
  const [programType, setProgram] = useState<"MS" | "MBA" | "UG">("MS");

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unlockedLead, setUnlockedLead] = useState<{ name: string; email: string; phone: string } | null>(null);

  function onPredict(e: React.FormEvent) {
    e.preventDefault();
    const r = predict({
      tenthMarks: Number(tenthMarks),
      twelfthMarks: Number(twelfthMarks),
      ugCGPA: Number(ugCGPA),
      workExperienceYears: Number(workExperienceYears),
      targetCountry,
      annualBudgetINR: Number(annualBudgetINR),
      ieltsScore: ieltsScore > 0 ? Number(ieltsScore) : undefined,
      greScore: greScore > 0 ? Number(greScore) : undefined,
      programType,
    });
    setResult(r);
    setUnlockedLead(null);
    if (typeof window !== "undefined") {
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }

  function downloadPDF(info: { name: string; email: string; phone: string }) {
    if (!result) return;
    generateUniversityMatchPDF({
      ...info,
      inputs: {
        tenthMarks: Number(tenthMarks),
        twelfthMarks: Number(twelfthMarks),
        ugCGPA: Number(ugCGPA),
        workExperienceYears: Number(workExperienceYears),
        targetCountry,
        annualBudgetINR: Number(annualBudgetINR),
        ieltsScore: ieltsScore > 0 ? Number(ieltsScore) : undefined,
        greScore: greScore > 0 ? Number(greScore) : undefined,
        programType,
      },
      result,
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">University Match & Admit Predictor</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Tell us about your academic profile and target. We&apos;ll bucket relevant universities into Ambitious / Target / Safe with a probability of admit for each.
        </p>
      </div>

      <form onSubmit={onPredict} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 grid md:grid-cols-2 gap-4">
        <Input label="10th marks (%)" min={0} max={100} value={tenthMarks} onChange={setTenthMarks} step={1} />
        <Input label="12th marks (%)" min={0} max={100} value={twelfthMarks} onChange={setTwelfthMarks} step={1} />
        <Input label="UG CGPA (/10)" min={0} max={10} value={ugCGPA} onChange={setUgCGPA} step={0.1} />
        <Input label="Work experience (years)" min={0} max={20} value={workExperienceYears} onChange={setWXP} step={1} />

        <Select label="Program type" value={programType} onChange={(v) => setProgram(v as "MS" | "MBA" | "UG")} options={PROGRAMS.map(p => ({ label: p, value: p }))} />
        <Select label="Target country" value={targetCountry} onChange={setTargetCountry} options={countries.map(c => ({ label: c, value: c }))} />

        <Input label="Annual budget (₹)" min={100000} max={20000000} value={annualBudgetINR} onChange={setBudget} step={50000} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="IELTS (optional, 0=skip)" min={0} max={9} value={ieltsScore} onChange={setIELTS} step={0.5} />
          <Input label="GRE (optional, 0=skip)" min={0} max={340} value={greScore} onChange={setGRE} step={1} />
        </div>

        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
          <button type="submit" className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
            Predict my matches →
          </button>
          <p className="text-xs text-slate-500 self-center">Free. No signup required to see results.</p>
        </div>
      </form>

      {result && (
        <div id="results" className="mt-10">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="text-2xl font-bold">Your university matches</h2>
            <p className="text-sm text-slate-500">Considered {result.totalConsidered} programs in {targetCountry === "Any" ? "all destinations" : targetCountry}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-5">
            <BucketCol title="Ambitious" hint="Reach schools. Strong but uncertain." color="from-pink-500 to-rose-500" matches={result.ambitious} />
            <BucketCol title="Target" hint="A realistic match for your profile." color="from-indigo-500 to-violet-500" matches={result.target} />
            <BucketCol title="Safe" hint="High likelihood of an admit." color="from-emerald-500 to-green-500" matches={result.safe} />
          </div>

          <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold">Get the full PDF report</h3>
                <p className="text-indigo-100 mt-1 max-w-xl text-sm">
                  Detailed reasoning per university, tuition fit, your profile summary, and a counsellor follow-up. Free.
                </p>
              </div>
              {unlockedLead ? (
                <button onClick={() => downloadPDF(unlockedLead)} className="px-5 py-3 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50">
                  Download PDF again
                </button>
              ) : (
                <button onClick={() => setModalOpen(true)} className="px-5 py-3 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50">
                  Email me the PDF
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tool="university-match"
        payload={{
          tenthMarks, twelfthMarks, ugCGPA, workExperienceYears,
          targetCountry, annualBudgetINR, ieltsScore, greScore, programType,
          counts: result ? { ambitious: result.ambitious.length, target: result.target.length, safe: result.safe.length } : null,
        }}
        onSuccess={(info) => {
          setModalOpen(false);
          setUnlockedLead(info);
          setTimeout(() => downloadPDF(info), 200);
        }}
      />
    </div>
  );
}

function BucketCol({ title, hint, color, matches }: { title: string; hint: string; color: string; matches: Match[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
      <div className={`bg-gradient-to-r ${color} text-white p-4`}>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-xs opacity-90">{hint}</p>
      </div>
      <div className="p-3 flex-1">
        {matches.length === 0 && <p className="text-sm text-slate-500 p-3">No universities in this bucket — try widening your budget or country.</p>}
        <ul className="space-y-2">
          {matches.map((m) => (
            <li key={m.university.name} className="rounded-lg border border-slate-200 p-3 hover:border-indigo-300">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-semibold text-sm">{m.university.name}</div>
                <span className="text-xs font-bold text-indigo-700 shrink-0">{m.probability}%</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {m.university.country} • Tier {m.university.tier} • {formatINR(m.university.annualTuitionINR)}/yr
              </div>
              <ul className="mt-2 space-y-1">
                {m.reasons.slice(0, 2).map((r, i) => (
                  <li key={i} className="text-[11px] text-slate-600 leading-snug">• {r}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type="number"
        value={value}
        min={min} max={max} step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

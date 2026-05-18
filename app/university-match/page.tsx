"use client";

import { useMemo, useState } from "react";
import { predict, countryList, countryCover, type PredictionResult, type Match } from "@/lib/predictor";
import { formatINR } from "@/lib/costs";
import LeadModal from "@/components/LeadModal";
import CoverImage from "@/components/CoverImage";
import { generateUniversityMatchPDF } from "@/lib/pdf";

const PROGRAMS: Array<"MS" | "MBA" | "UG"> = ["MS", "MBA", "UG"];

export default function UniversityMatchPage() {
  const countries = useMemo(() => ["Any", ...countryList()], []);
  const defaultCountry = useMemo(() => countryList()[0] ?? "Any", []);

  const [tenthMarks, setTenthMarks] = useState(85);
  const [twelfthMarks, setTwelfthMarks] = useState(82);
  const [ugCGPA, setUgCGPA] = useState(7.8);
  const [workExperienceYears, setWXP] = useState(2);
  const [targetCountry, setTargetCountry] = useState(defaultCountry);
  const [ieltsScore, setIELTS] = useState<number>(7.0);
  const [greScore, setGRE] = useState<number>(0);
  const [programType, setProgram] = useState<"MS" | "MBA" | "UG">("MS");

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unlockedLead, setUnlockedLead] = useState<{ name: string; email: string; phone: string } | null>(null);

  function buildInputs() {
    return {
      tenthMarks: Number(tenthMarks),
      twelfthMarks: Number(twelfthMarks),
      ugCGPA: Number(ugCGPA),
      workExperienceYears: Number(workExperienceYears),
      targetCountry,
      ieltsScore: ieltsScore > 0 ? Number(ieltsScore) : undefined,
      greScore: greScore > 0 ? Number(greScore) : undefined,
      programType,
    };
  }

  function onPredict(e: React.FormEvent) {
    e.preventDefault();
    const r = predict(buildInputs());
    setResult(r);
    setUnlockedLead(null);
    if (typeof window !== "undefined") {
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }

  function downloadPDF(info: { name: string; email: string; phone: string }) {
    if (!result) return;
    generateUniversityMatchPDF({ ...info, inputs: buildInputs(), result });
  }

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-5 pt-12 md:pt-20 pb-10 md:pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-[14px] md:text-[15px] font-medium text-[#0071e3] mb-3 md:mb-4">Admit Predictor</p>
          <h1 className="title-display text-[34px] sm:text-5xl md:text-6xl text-[#1d1d1f]">Where can you get in?</h1>
          <p className="mt-5 md:mt-6 text-[16px] md:text-[18px] text-[#6e6e73] leading-relaxed">
            Tell us about your profile. We&apos;ll rank universities into Ambitious, Target and Safe, with admit probability and a profile of each school.
          </p>
        </div>

        <form onSubmit={onPredict} className="mt-10 md:mt-12 rounded-2xl md:rounded-3xl bg-[#f5f5f7] p-5 md:p-10 grid md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
          <Input label="10th marks (%)" min={0} max={100} value={tenthMarks} onChange={setTenthMarks} step={1} />
          <Input label="12th marks (%)" min={0} max={100} value={twelfthMarks} onChange={setTwelfthMarks} step={1} />
          <Input label="UG CGPA (/10)" min={0} max={10} value={ugCGPA} onChange={setUgCGPA} step={0.1} />
          <Input label="Work experience (years)" min={0} max={20} value={workExperienceYears} onChange={setWXP} step={1} />
          <Select label="Program type" value={programType} onChange={(v) => setProgram(v as "MS" | "MBA" | "UG")} options={PROGRAMS.map(p => ({ label: p, value: p }))} />
          <Select label="Target country" value={targetCountry} onChange={setTargetCountry} options={countries.map(c => ({ label: c, value: c }))} />
          <Input label="IELTS (optional · 0 to skip)" min={0} max={9} value={ieltsScore} onChange={setIELTS} step={0.5} />
          <Input label="GRE (optional · 0 to skip)" min={0} max={340} value={greScore} onChange={setGRE} step={1} />

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-3 items-center">
            <button type="submit" className="btn-primary w-full sm:w-auto">
              Predict my matches
            </button>
            <p className="text-[13px] text-[#6e6e73]">Free. No signup. Results in a second.</p>
          </div>
        </form>
      </div>

      {result && (
        <div id="results" className="bg-[#f5f5f7] py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="title-section text-3xl md:text-5xl text-[#1d1d1f]">Your university matches</h2>
              <p className="mt-3 text-[14px] md:text-[15px] text-[#6e6e73]">
                Considered {result.totalConsidered} programs in {targetCountry === "Any" ? "all destinations" : targetCountry}
              </p>
            </div>

            <div className="space-y-10 md:space-y-12">
              <BucketRow title="Ambitious" subtitle="Reach schools. Strong applications stand a chance." accent="#d6336c" matches={result.ambitious} />
              <BucketRow title="Target" subtitle="A realistic match for your profile." accent="#0071e3" matches={result.target} />
              <BucketRow title="Safe" subtitle="High likelihood of an admit." accent="#1f8a3a" matches={result.safe} />
            </div>

            <div className="mt-14 md:mt-20 rounded-2xl md:rounded-3xl bg-[#1d1d1f] text-white px-6 md:px-12 py-10 md:py-12 text-center">
              <h3 className="title-section text-2xl md:text-4xl">Get the full PDF report</h3>
              <p className="mt-3 md:mt-4 text-[15px] md:text-[17px] text-white/70 max-w-xl mx-auto leading-relaxed">
                A premium, shareable report with detailed school profiles, tuition fit, and a counsellor follow-up. Free.
              </p>
              <div className="mt-7 md:mt-8">
                {unlockedLead ? (
                  <button onClick={() => downloadPDF(unlockedLead)} className="inline-flex items-center bg-white text-black rounded-full px-6 md:px-7 py-3 md:py-3.5 font-medium text-[15px] hover:opacity-90">
                    Download PDF again
                  </button>
                ) : (
                  <button onClick={() => setModalOpen(true)} className="inline-flex items-center bg-white text-black rounded-full px-6 md:px-7 py-3 md:py-3.5 font-medium text-[15px] hover:opacity-90">
                    Email me the PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tool="university-match"
        payload={{
          ...buildInputs(),
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

function BucketRow({ title, subtitle, accent, matches }: { title: string; subtitle: string; accent: string; matches: Match[] }) {
  if (matches.length === 0) {
    return (
      <div>
        <BucketHeader title={title} subtitle={subtitle} accent={accent} />
        <p className="text-[15px] text-[#6e6e73]">No universities in this bucket. Try widening your country or program type.</p>
      </div>
    );
  }
  return (
    <div>
      <BucketHeader title={title} subtitle={subtitle} accent={accent} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {matches.map((m) => <MatchCard key={m.university.name} m={m} />)}
      </div>
    </div>
  );
}

function BucketHeader({ title, subtitle, accent }: { title: string; subtitle: string; accent: string }) {
  return (
    <div className="mb-5 md:mb-6">
      <div className="flex items-center gap-2.5">
        <span className="inline-block w-2 h-2 rounded-full" style={{ background: accent }} />
        <h3 className="title-section text-2xl md:text-3xl text-[#1d1d1f]">{title}</h3>
      </div>
      <p className="text-[13px] md:text-[14px] text-[#6e6e73] mt-1.5 ml-4">{subtitle}</p>
    </div>
  );
}

function MatchCard({ m }: { m: Match }) {
  const u = m.university;
  return (
    <div className="rounded-2xl bg-white overflow-hidden ring-1 ring-black/[0.06] hover:ring-black/20 transition-all hover:-translate-y-0.5 flex flex-col">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#1d1d1f] to-[#3a3a3c]">
        <CoverImage
          primary={u.image}
          fallback={countryCover(u.country)}
          alt={u.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-3 py-1 text-[12px] font-semibold text-[#1d1d1f] tracking-tight">
          {m.probability}%
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <div className="text-white text-[10px] uppercase tracking-[0.18em] opacity-90 font-medium">{u.city}</div>
          <h4 className="text-white text-[17px] font-semibold leading-tight tracking-tight mt-0.5">{u.name}</h4>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-1.5 text-[12px] text-[#6e6e73] mb-3">
          <span>{u.country}</span>
          <span className="text-[#c7c7cc]">·</span>
          <span>Tier {u.tier}</span>
          <span className="text-[#c7c7cc]">·</span>
          <span>{formatINR(u.annualTuitionINR)} / yr</span>
        </div>
        <p className="text-[14px] text-[#1d1d1f]/85 leading-relaxed">{u.description}</p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <label className="block">
      <span className="label-base">{label}</span>
      <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} className="input-base" />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <label className="block">
      <span className="label-base">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-base bg-[#f5f5f7]">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

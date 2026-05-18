"use client";

import { useEffect, useMemo, useState } from "react";
import { countries, citiesFor, computeCost, formatINR, type CostResult } from "@/lib/costs";
import LeadModal from "@/components/LeadModal";
import { generateCostReportPDF } from "@/lib/pdf";

export default function CostCalculatorPage() {
  const countryOpts = useMemo(() => countries(), []);
  const [country, setCountry] = useState(countryOpts[0] ?? "USA");
  const [cityOpts, setCityOpts] = useState<string[]>(citiesFor(country));
  const [city, setCity] = useState(cityOpts[0] ?? "");
  const [courseType, setCourseType] = useState<"MS" | "MBA" | "UG">("MS");
  const [durationYears, setDuration] = useState(2);

  const [result, setResult] = useState<CostResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unlockedLead, setUnlockedLead] = useState<{ name: string; email: string; phone: string } | null>(null);

  useEffect(() => {
    const cities = citiesFor(country);
    setCityOpts(cities);
    if (!cities.includes(city)) setCity(cities[0] ?? "");
  }, [country, city]);

  function onCompute(e: React.FormEvent) {
    e.preventDefault();
    if (!city) return;
    const r = computeCost({ country, city, courseType, durationYears: Number(durationYears) });
    setResult(r);
    setUnlockedLead(null);
    if (typeof window !== "undefined") {
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }

  function downloadPDF(info: { name: string; email: string; phone: string }) {
    if (!result) return;
    generateCostReportPDF({ ...info, result });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Study Abroad Cost Calculator</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Get an itemized cost in INR — tuition, living, visa, flights, insurance, miscellaneous — year-on-year, plus your monthly burn rate.
        </p>
      </div>

      <form onSubmit={onCompute} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 grid md:grid-cols-2 gap-4">
        <Select label="Country" value={country} onChange={setCountry} options={countryOpts.map(c => ({ label: c, value: c }))} />
        <Select label="City" value={city} onChange={setCity} options={cityOpts.map(c => ({ label: c, value: c }))} />
        <Select label="Course type" value={courseType} onChange={(v) => setCourseType(v as "MS" | "MBA" | "UG")} options={[{ label: "MS", value: "MS" }, { label: "MBA", value: "MBA" }, { label: "UG", value: "UG" }]} />
        <Input label="Duration (years)" value={durationYears} onChange={setDuration} min={1} max={5} step={1} />
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
          <button type="submit" className="px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
            Calculate cost →
          </button>
          <p className="text-xs text-slate-500 self-center">Numbers reflect 2025–26 averages. Inflation factored at 5%/yr.</p>
        </div>
      </form>

      {result && (
        <div id="results" className="mt-10">
          <div className="grid md:grid-cols-4 gap-4">
            <Stat label="Total estimated cost" value={formatINR(result.grandTotalINR)} accent="indigo" />
            <Stat label="Monthly burn (living + insurance)" value={formatINR(result.monthlyBurnINR)} accent="violet" />
            <Stat label="One-time (visa + flights)" value={formatINR(result.oneTimeINR)} accent="emerald" />
            <Stat label="Annual recurring" value={formatINR(result.recurringAnnualINR)} accent="slate" />
          </div>

          <div className="mt-6 bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-lg">Year-by-year breakdown</h2>
              <p className="text-xs text-slate-500">Tuition + living inflated at {result.inflationPctPerYear}% per year. Visa & double-flight in year 1 only.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <Th>Year</Th><Th>Tuition</Th><Th>Living</Th><Th>Insurance</Th><Th>Misc</Th><Th>Visa</Th><Th>Flights</Th><Th>Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {result.years.map((y) => (
                    <tr key={y.year} className="border-t border-slate-200">
                      <Td className="font-semibold">Year {y.year}</Td>
                      <Td>{formatINR(y.tuitionINR)}</Td>
                      <Td>{formatINR(y.livingINR)}</Td>
                      <Td>{formatINR(y.insuranceINR)}</Td>
                      <Td>{formatINR(y.miscINR)}</Td>
                      <Td>{formatINR(y.visaINR)}</Td>
                      <Td>{formatINR(y.flightsINR)}</Td>
                      <Td className="font-bold">{formatINR(y.totalINR)}</Td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-300 bg-slate-50">
                    <Td className="font-bold">Total</Td>
                    <Td colSpan={6}>{" "}</Td>
                    <Td className="font-bold text-indigo-700">{formatINR(result.grandTotalINR)}</Td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold">Get this report as PDF</h3>
                <p className="text-indigo-100 mt-1 max-w-xl text-sm">
                  Share with parents or sponsors. Includes the year-on-year split, notes on scholarships, and a counsellor follow-up. Free.
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
        tool="cost-calculator"
        payload={{ country, city, courseType, durationYears, grandTotalINR: result?.grandTotalINR }}
        onSuccess={(info) => {
          setModalOpen(false);
          setUnlockedLead(info);
          setTimeout(() => downloadPDF(info), 200);
        }}
      />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "indigo" | "violet" | "emerald" | "slate" }) {
  const cls = {
    indigo: "from-indigo-600 to-indigo-700",
    violet: "from-violet-600 to-violet-700",
    emerald: "from-emerald-600 to-emerald-700",
    slate: "from-slate-700 to-slate-800",
  }[accent];
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${cls} text-white p-5`}>
      <div className="text-xs uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="text-left font-semibold px-4 py-3">{children}</th>; }
function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) { return <td colSpan={colSpan} className={`px-4 py-3 ${className}`}>{children}</td>; }

function Input({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </label>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

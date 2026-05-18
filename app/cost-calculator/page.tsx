"use client";

import { useEffect, useMemo, useState } from "react";
import { countries, citiesFor, computeCost, formatINR, type CostResult } from "@/lib/costs";
import LeadModal from "@/components/LeadModal";
import { generateCostReportPDF } from "@/lib/pdf";
import { countryCover } from "@/lib/predictor";

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
    generateCostReportPDF({ ...info, result, coverImage: countryCover(result.country) });
  }

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-5 pt-12 md:pt-20 pb-10 md:pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-[14px] md:text-[15px] font-medium text-[#0071e3] mb-3 md:mb-4">Cost Calculator</p>
          <h1 className="title-display text-[34px] sm:text-5xl md:text-6xl text-[#1d1d1f]">What it really costs.</h1>
          <p className="mt-5 md:mt-6 text-[16px] md:text-[18px] text-[#6e6e73] leading-relaxed">
            Tuition, living, visa, flights, insurance. Year by year. In rupees. With your monthly burn rate.
          </p>
        </div>

        <form onSubmit={onCompute} className="mt-10 md:mt-12 rounded-2xl md:rounded-3xl bg-[#f5f5f7] p-5 md:p-10 grid md:grid-cols-2 gap-4 md:gap-5 max-w-4xl mx-auto">
          <Select label="Country" value={country} onChange={setCountry} options={countryOpts.map(c => ({ label: c, value: c }))} />
          <Select label="City" value={city} onChange={setCity} options={cityOpts.map(c => ({ label: c, value: c }))} />
          <Select label="Course type" value={courseType} onChange={(v) => setCourseType(v as "MS" | "MBA" | "UG")} options={[{ label: "MS", value: "MS" }, { label: "MBA", value: "MBA" }, { label: "UG", value: "UG" }]} />
          <Input label="Duration (years)" value={durationYears} onChange={setDuration} min={1} max={5} step={1} />
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-3 items-center">
            <button type="submit" className="btn-primary w-full sm:w-auto">Calculate cost</button>
            <p className="text-[13px] text-[#6e6e73]">2025–26 averages. Inflation factored at 5% / yr.</p>
          </div>
        </form>
      </div>

      {result && (
        <div id="results" className="bg-[#f5f5f7] py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-5">
            <div className="rounded-2xl md:rounded-3xl overflow-hidden bg-white ring-1 ring-black/[0.06]">
              <div className="relative h-36 sm:h-44 md:h-56 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={countryCover(result.country)} alt={result.country} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-5 md:bottom-6 left-5 md:left-6 right-5 md:right-6 text-white">
                  <div className="text-[10px] md:text-[11px] uppercase tracking-widest opacity-80">{result.courseType} · {result.durationYears} {result.durationYears === 1 ? "year" : "years"}</div>
                  <h2 className="title-display text-2xl sm:text-3xl md:text-5xl mt-1">{result.city}, {result.country}</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/[0.06]">
                <Stat label="Total estimated cost" value={formatINR(result.grandTotalINR)} highlight />
                <Stat label="Monthly burn rate" value={formatINR(result.monthlyBurnINR)} />
                <Stat label="One-time (visa + flights)" value={formatINR(result.oneTimeINR)} />
                <Stat label="Annual recurring" value={formatINR(result.recurringAnnualINR)} />
              </div>
            </div>

            <div className="mt-8 rounded-3xl bg-white ring-1 ring-black/[0.06] overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b border-black/[0.06]">
                <h3 className="title-section text-xl md:text-2xl">Year-by-year breakdown</h3>
                <p className="text-[13px] text-[#6e6e73] mt-1">Tuition and living inflated at {result.inflationPctPerYear}% per year. Visa and double flight in year 1 only.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead className="text-[#6e6e73] bg-[#f5f5f7]">
                    <tr>
                      <Th>Year</Th><Th>Tuition</Th><Th>Living</Th><Th>Insurance</Th><Th>Misc</Th><Th>Visa</Th><Th>Flights</Th><Th>Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.years.map((y) => (
                      <tr key={y.year} className="border-t border-black/[0.06]">
                        <Td className="font-medium">Year {y.year}</Td>
                        <Td>{formatINR(y.tuitionINR)}</Td>
                        <Td>{formatINR(y.livingINR)}</Td>
                        <Td>{formatINR(y.insuranceINR)}</Td>
                        <Td>{formatINR(y.miscINR)}</Td>
                        <Td>{formatINR(y.visaINR)}</Td>
                        <Td>{formatINR(y.flightsINR)}</Td>
                        <Td className="font-semibold">{formatINR(y.totalINR)}</Td>
                      </tr>
                    ))}
                    <tr className="border-t border-black/[0.12] bg-[#fafafa]">
                      <Td className="font-semibold">Total</Td>
                      <Td colSpan={6}>{" "}</Td>
                      <Td className="font-semibold text-[#0071e3]">{formatINR(result.grandTotalINR)}</Td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-10 md:mt-12 rounded-2xl md:rounded-3xl bg-[#1d1d1f] text-white px-6 md:px-12 py-10 md:py-12 text-center">
              <h3 className="title-section text-2xl md:text-4xl">Get this as a PDF</h3>
              <p className="mt-3 md:mt-4 text-[15px] md:text-[17px] text-white/70 max-w-xl mx-auto leading-relaxed">
                Share with parents or sponsors. Clean, branded, ready to print. Free.
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

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-white px-6 py-5 ${highlight ? "" : ""}`}>
      <div className="text-[11px] uppercase tracking-widest text-[#6e6e73] font-medium">{label}</div>
      <div className={`mt-2 font-semibold tracking-tight ${highlight ? "text-2xl md:text-3xl text-[#0071e3]" : "text-xl md:text-2xl text-[#1d1d1f]"}`}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th className="text-left font-medium text-[12px] uppercase tracking-widest px-5 py-3.5">{children}</th>; }
function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) { return <td colSpan={colSpan} className={`px-5 py-4 ${className}`}>{children}</td>; }

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

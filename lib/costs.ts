import costsData from "@/data/costs.json";

type CityData = { livingMonthlyINR: number };
type CountryData = {
  currency: string;
  rateINR: number;
  visaINR: number;
  flightOneWayINR: number;
  healthInsuranceAnnualINR: number;
  miscAnnualINR: number;
  tuition: Record<string, number>;
  cities: Record<string, CityData>;
};
type CostsShape = { countries: Record<string, CountryData> };

const DATA = costsData as CostsShape;

export type CostInputs = {
  country: string;
  city: string;
  courseType: "MS" | "MBA" | "UG";
  durationYears: number;
};

export type YearBreakdown = {
  year: number;
  tuitionINR: number;
  livingINR: number;
  insuranceINR: number;
  miscINR: number;
  visaINR: number;
  flightsINR: number;
  totalINR: number;
};

export type CostResult = {
  country: string;
  city: string;
  courseType: string;
  durationYears: number;
  years: YearBreakdown[];
  grandTotalINR: number;
  monthlyBurnINR: number;
  oneTimeINR: number;
  recurringAnnualINR: number;
  inflationPctPerYear: number;
};

export function countries(): string[] { return Object.keys(DATA.countries); }
export function citiesFor(country: string): string[] {
  return DATA.countries[country] ? Object.keys(DATA.countries[country].cities) : [];
}

export function computeCost(inp: CostInputs): CostResult {
  const c = DATA.countries[inp.country];
  if (!c) throw new Error("Unknown country");
  const cityData = c.cities[inp.city];
  if (!cityData) throw new Error("Unknown city");

  const baseTuition = c.tuition[inp.courseType] ?? c.tuition.MS;
  const baseLivingAnnual = cityData.livingMonthlyINR * 12;
  const inflation = 0.05;
  const years: YearBreakdown[] = [];

  for (let y = 1; y <= inp.durationYears; y++) {
    const factor = Math.pow(1 + inflation, y - 1);
    const tuitionINR = Math.round(baseTuition * factor);
    const livingINR = Math.round(baseLivingAnnual * factor);
    const insuranceINR = Math.round(c.healthInsuranceAnnualINR * factor);
    const miscINR = Math.round(c.miscAnnualINR * factor);
    const visaINR = y === 1 ? c.visaINR : 0;
    const flightsINR = y === 1 ? c.flightOneWayINR * 2 : c.flightOneWayINR;
    const totalINR = tuitionINR + livingINR + insuranceINR + miscINR + visaINR + flightsINR;
    years.push({ year: y, tuitionINR, livingINR, insuranceINR, miscINR, visaINR, flightsINR, totalINR });
  }

  const grandTotalINR = years.reduce((s, y) => s + y.totalINR, 0);
  const monthlyBurnINR = Math.round((baseLivingAnnual + c.healthInsuranceAnnualINR + c.miscAnnualINR) / 12);
  const oneTimeINR = c.visaINR + c.flightOneWayINR * 2;
  const recurringAnnualINR = baseTuition + baseLivingAnnual + c.healthInsuranceAnnualINR + c.miscAnnualINR;

  return {
    country: inp.country,
    city: inp.city,
    courseType: inp.courseType,
    durationYears: inp.durationYears,
    years,
    grandTotalINR,
    monthlyBurnINR,
    oneTimeINR,
    recurringAnnualINR,
    inflationPctPerYear: inflation * 100,
  };
}

export function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

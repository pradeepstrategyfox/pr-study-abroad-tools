import universitiesData from "@/data/universities.json";

export type University = {
  name: string;
  shortName: string;
  country: string;
  city: string;
  tier: "T1" | "T2" | "T3";
  minCGPA: number;
  minGRE: number;
  minIELTS: number;
  annualTuitionINR: number;
  popularPrograms: string[];
  description: string;
  image?: string;
};

export type PredictorInputs = {
  tenthMarks: number;
  twelfthMarks: number;
  ugCGPA: number;
  workExperienceYears: number;
  targetCountry: string;
  ieltsScore?: number;
  greScore?: number;
  programType: "MS" | "MBA" | "UG";
};

export type Match = {
  university: University;
  probability: number;
  bucket: "Ambitious" | "Target" | "Safe";
  coverImage: string;
};

export type PredictionResult = {
  ambitious: Match[];
  target: Match[];
  safe: Match[];
  totalConsidered: number;
};

type DataShape = { countryCovers: Record<string, string>; universities: University[] };
const DATA = universitiesData as DataShape;
const ALL = DATA.universities;

function scoreUniversity(u: University, inp: PredictorInputs): number {
  let score = 50;

  const cgpaGap = inp.ugCGPA - u.minCGPA;
  if (cgpaGap >= 1.0) score += 22;
  else if (cgpaGap >= 0.3) score += 14;
  else if (cgpaGap >= 0) score += 6;
  else if (cgpaGap >= -0.3) score -= 5;
  else score -= 18;

  const acadAvg = (inp.tenthMarks + inp.twelfthMarks) / 2;
  if (acadAvg >= 85) score += 6;
  else if (acadAvg >= 75) score += 3;
  else if (acadAvg < 60) score -= 6;

  if (u.minGRE > 0) {
    if (!inp.greScore) {
      score -= 8;
    } else {
      const greGap = inp.greScore - u.minGRE;
      if (greGap >= 8) score += 14;
      else if (greGap >= 0) score += 8;
      else if (greGap >= -5) score -= 4;
      else score -= 14;
    }
  }

  if (inp.ieltsScore && inp.ieltsScore > 0) {
    if (inp.ieltsScore >= u.minIELTS + 0.5) score += 4;
    else if (inp.ieltsScore >= u.minIELTS) score += 2;
    else score -= 10;
  }

  if (inp.programType === "MBA") {
    if (inp.workExperienceYears >= 4) score += 12;
    else if (inp.workExperienceYears >= 2) score += 6;
    else score -= 10;
  } else if (inp.workExperienceYears >= 2) {
    score += 4;
  }

  if (u.tier === "T1") score -= 8;
  else if (u.tier === "T3") score += 4;

  return Math.max(5, Math.min(92, Math.round(score)));
}

export function predict(inp: PredictorInputs): PredictionResult {
  const country = inp.targetCountry.trim();
  const pool = ALL.filter(u =>
    (country === "Any" || u.country === country) &&
    u.popularPrograms.some(p => p.includes(inp.programType))
  );

  const scored: Match[] = pool.map(u => {
    const probability = scoreUniversity(u, inp);
    let bucket: Match["bucket"];
    if (probability >= 65) bucket = "Safe";
    else if (probability >= 40) bucket = "Target";
    else bucket = "Ambitious";
    return {
      university: u,
      probability,
      bucket,
      coverImage: u.image || DATA.countryCovers[u.country] || "",
    };
  });

  scored.sort((a, b) => b.probability - a.probability);

  return {
    ambitious: scored.filter(m => m.bucket === "Ambitious").slice(0, 6),
    target: scored.filter(m => m.bucket === "Target").slice(0, 6),
    safe: scored.filter(m => m.bucket === "Safe").slice(0, 6),
    totalConsidered: pool.length,
  };
}

export function countryList(): string[] {
  return Array.from(new Set(ALL.map(u => u.country))).sort();
}

export function countryCover(country: string): string {
  return DATA.countryCovers[country] ?? "";
}

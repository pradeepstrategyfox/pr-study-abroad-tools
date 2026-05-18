import universitiesData from "@/data/universities.json";

export type University = {
  name: string;
  country: string;
  tier: "T1" | "T2" | "T3";
  minCGPA: number;
  minGRE: number;
  minIELTS: number;
  annualTuitionINR: number;
  popularPrograms: string[];
};

export type PredictorInputs = {
  tenthMarks: number;
  twelfthMarks: number;
  ugCGPA: number;
  workExperienceYears: number;
  targetCountry: string;
  annualBudgetINR: number;
  ieltsScore?: number;
  greScore?: number;
  programType: "MS" | "MBA" | "UG";
};

export type Match = {
  university: University;
  probability: number;
  bucket: "Ambitious" | "Target" | "Safe";
  reasons: string[];
};

export type PredictionResult = {
  ambitious: Match[];
  target: Match[];
  safe: Match[];
  totalConsidered: number;
};

const ALL: University[] = (universitiesData.universities as University[]);

function scoreUniversity(u: University, inp: PredictorInputs): { probability: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 50;

  // CGPA match
  const cgpaGap = inp.ugCGPA - u.minCGPA;
  if (cgpaGap >= 1.0) { score += 22; reasons.push(`Your CGPA ${inp.ugCGPA} comfortably exceeds the typical ${u.minCGPA} baseline.`); }
  else if (cgpaGap >= 0.3) { score += 14; reasons.push(`Your CGPA ${inp.ugCGPA} is above the typical ${u.minCGPA} baseline.`); }
  else if (cgpaGap >= 0) { score += 6; reasons.push(`Your CGPA ${inp.ugCGPA} just clears the ${u.minCGPA} baseline.`); }
  else if (cgpaGap >= -0.3) { score -= 5; reasons.push(`Your CGPA ${inp.ugCGPA} is slightly below the ${u.minCGPA} baseline — a strong SOP can help.`); }
  else { score -= 18; reasons.push(`Your CGPA ${inp.ugCGPA} is well below the ${u.minCGPA} baseline.`); }

  // Academic record (10th/12th)
  const acadAvg = (inp.tenthMarks + inp.twelfthMarks) / 2;
  if (acadAvg >= 85) { score += 6; reasons.push(`Strong academic record (avg ${acadAvg.toFixed(0)}%) supports the application.`); }
  else if (acadAvg >= 75) { score += 3; }
  else if (acadAvg < 60) { score -= 6; reasons.push(`Lower 10th/12th aggregate (${acadAvg.toFixed(0)}%) may need explanation.`); }

  // GRE
  if (u.minGRE > 0) {
    if (!inp.greScore) {
      score -= 8;
      reasons.push(`GRE is typically expected here; submitting a competitive score will materially help.`);
    } else {
      const greGap = inp.greScore - u.minGRE;
      if (greGap >= 8) { score += 14; reasons.push(`GRE ${inp.greScore} is well above the ${u.minGRE} target.`); }
      else if (greGap >= 0) { score += 8; reasons.push(`GRE ${inp.greScore} meets the ${u.minGRE} expectation.`); }
      else if (greGap >= -5) { score -= 4; reasons.push(`GRE ${inp.greScore} is slightly below the ${u.minGRE} target.`); }
      else { score -= 14; reasons.push(`GRE ${inp.greScore} is below the ${u.minGRE} expectation — consider a retake.`); }
    }
  }

  // IELTS
  if (inp.ieltsScore !== undefined && inp.ieltsScore > 0) {
    if (inp.ieltsScore >= u.minIELTS + 0.5) { score += 4; }
    else if (inp.ieltsScore >= u.minIELTS) { score += 2; }
    else { score -= 10; reasons.push(`IELTS ${inp.ieltsScore} is below the ${u.minIELTS} requirement — retake recommended.`); }
  } else {
    reasons.push(`IELTS not submitted — required for visa and most admissions.`);
  }

  // Work experience (matters more for MBA)
  if (inp.programType === "MBA") {
    if (inp.workExperienceYears >= 4) { score += 12; reasons.push(`${inp.workExperienceYears} years of work experience strengthens the MBA profile.`); }
    else if (inp.workExperienceYears >= 2) { score += 6; }
    else { score -= 10; reasons.push(`MBA programs typically expect 3+ years of work experience.`); }
  } else if (inp.workExperienceYears >= 2) {
    score += 4;
    reasons.push(`${inp.workExperienceYears} years of work experience adds depth to the application.`);
  }

  // Budget fit
  if (u.annualTuitionINR <= inp.annualBudgetINR) {
    score += 6;
    reasons.push(`Tuition (₹${(u.annualTuitionINR/100000).toFixed(1)}L/yr) fits within your stated budget.`);
  } else if (u.annualTuitionINR <= inp.annualBudgetINR * 1.25) {
    score -= 4;
    reasons.push(`Tuition (₹${(u.annualTuitionINR/100000).toFixed(1)}L/yr) is moderately above budget — scholarships or loans may bridge the gap.`);
  } else {
    score -= 12;
    reasons.push(`Tuition (₹${(u.annualTuitionINR/100000).toFixed(1)}L/yr) significantly exceeds your stated budget.`);
  }

  // Tier dampening — top schools always carry more uncertainty
  if (u.tier === "T1") score -= 8;
  else if (u.tier === "T3") score += 4;

  const probability = Math.max(5, Math.min(92, Math.round(score)));
  return { probability, reasons: reasons.slice(0, 5) };
}

export function predict(inp: PredictorInputs): PredictionResult {
  const country = inp.targetCountry.trim();
  const pool = ALL.filter(u =>
    (country === "Any" || u.country === country) &&
    u.popularPrograms.some(p => p.includes(inp.programType))
  );

  const scored: Match[] = pool.map(u => {
    const { probability, reasons } = scoreUniversity(u, inp);
    let bucket: Match["bucket"];
    if (probability >= 65) bucket = "Safe";
    else if (probability >= 40) bucket = "Target";
    else bucket = "Ambitious";
    return { university: u, probability, bucket, reasons };
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

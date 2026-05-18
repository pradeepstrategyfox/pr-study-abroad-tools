import jsPDF from "jspdf";
import type { PredictionResult } from "./predictor";
import type { CostResult } from "./costs";
import { formatINR } from "./costs";

function header(doc: jsPDF, title: string) {
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 26, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("PR Study Abroad", 14, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("prstudyabroad.com", 14, 19);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, 210 - 14, 16, { align: "right" });
  doc.setTextColor(15, 23, 42);
}

function footer(doc: jsPDF, page: number, totalPages: number) {
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "© PR Study Abroad — Free tool. For personalized counselling, book at prstudyabroad.com",
    14,
    290
  );
  doc.text(`Page ${page} of ${totalPages}`, 210 - 14, 290, { align: "right" });
  doc.setTextColor(15, 23, 42);
}

export function generateUniversityMatchPDF(opts: {
  name: string;
  email: string;
  phone: string;
  inputs: {
    tenthMarks: number; twelfthMarks: number; ugCGPA: number;
    workExperienceYears: number; targetCountry: string; annualBudgetINR: number;
    ieltsScore?: number; greScore?: number; programType: string;
  };
  result: PredictionResult;
}) {
  const doc = new jsPDF();
  header(doc, "Admit Predictor Report");
  let y = 35;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Prepared for: ${opts.name}`, 14, y); y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Email: ${opts.email}    Phone: ${opts.phone}`, 14, y); y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Your profile snapshot", 14, y); y += 6;
  doc.setFont("helvetica", "normal");
  const inp = opts.inputs;
  const profile = [
    `10th: ${inp.tenthMarks}%  •  12th: ${inp.twelfthMarks}%  •  UG CGPA: ${inp.ugCGPA}`,
    `Program: ${inp.programType}  •  Target: ${inp.targetCountry}  •  Work experience: ${inp.workExperienceYears} yrs`,
    `Budget: ${formatINR(inp.annualBudgetINR)}/yr  •  IELTS: ${inp.ieltsScore ?? "—"}  •  GRE: ${inp.greScore ?? "—"}`,
  ];
  profile.forEach(l => { doc.text(l, 14, y); y += 5.5; });
  y += 4;

  const sections: Array<{ title: string; color: [number, number, number]; matches: PredictionResult["ambitious"] }> = [
    { title: "Ambitious", color: [219, 39, 119], matches: opts.result.ambitious },
    { title: "Target", color: [79, 70, 229], matches: opts.result.target },
    { title: "Safe", color: [22, 163, 74], matches: opts.result.safe },
  ];

  for (const s of sections) {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFillColor(s.color[0], s.color[1], s.color[2]);
    doc.rect(14, y, 182, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${s.title}  (${s.matches.length})`, 17, y + 5);
    doc.setTextColor(15, 23, 42);
    y += 11;

    if (s.matches.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("No matches in this bucket.", 14, y); y += 7;
      continue;
    }

    for (const m of s.matches) {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${m.university.name} — ${m.university.country}`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Admit probability: ${m.probability}%`, 196, y, { align: "right" });
      y += 5;
      doc.setTextColor(71, 85, 105);
      doc.text(`Tuition ≈ ${formatINR(m.university.annualTuitionINR)} / year  •  Tier ${m.university.tier}`, 14, y);
      doc.setTextColor(15, 23, 42);
      y += 5;
      for (const r of m.reasons) {
        const wrapped = doc.splitTextToSize(`• ${r}`, 178);
        for (const ln of wrapped) {
          if (y > 275) { doc.addPage(); y = 20; }
          doc.text(ln, 18, y); y += 4.6;
        }
      }
      y += 3;
    }
  }

  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFont("helvetica", "bold");
  doc.text("Next step", 14, y); y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const next = doc.splitTextToSize(
    "These are indicative matches generated from your profile. A PR Study Abroad counsellor will reach out to refine this shortlist based on a full profile review — including projects, recommendations, target intake, and scholarships you may qualify for. To accelerate, book a free consultation at prstudyabroad.com.",
    182
  );
  next.forEach((ln: string) => { doc.text(ln, 14, y); y += 5; });

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) { doc.setPage(i); footer(doc, i, total); }
  doc.save(`PR-Study-Abroad-Admit-Predictor-${opts.name.replace(/\s+/g, "-")}.pdf`);
}

export function generateCostReportPDF(opts: {
  name: string; email: string; phone: string; result: CostResult;
}) {
  const doc = new jsPDF();
  header(doc, "Cost Calculator Report");
  let y = 35;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Prepared for: ${opts.name}`, 14, y); y += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Email: ${opts.email}    Phone: ${opts.phone}`, 14, y); y += 8;

  const r = opts.result;
  doc.setFont("helvetica", "bold"); doc.text("Plan summary", 14, y); y += 6;
  doc.setFont("helvetica", "normal");
  [
    `Destination: ${r.city}, ${r.country}`,
    `Program: ${r.courseType}  •  Duration: ${r.durationYears} year(s)`,
    `Total estimated cost: ${formatINR(r.grandTotalINR)}`,
    `Monthly living burn: ${formatINR(r.monthlyBurnINR)}`,
    `One-time costs (visa + flights): ${formatINR(r.oneTimeINR)}`,
  ].forEach(l => { doc.text(l, 14, y); y += 5.5; });
  y += 4;

  doc.setFont("helvetica", "bold"); doc.text("Year-by-year breakdown", 14, y); y += 6;
  const headers = ["Year", "Tuition", "Living", "Insurance", "Misc", "Visa", "Flights", "Total"];
  const colX = [14, 32, 60, 88, 116, 140, 158, 180];
  doc.setFontSize(9.5);
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 4, 182, 7, "F");
  doc.setFont("helvetica", "bold");
  headers.forEach((h, i) => { doc.text(h, colX[i], y); });
  y += 6;
  doc.setFont("helvetica", "normal");

  for (const yr of r.years) {
    if (y > 270) { doc.addPage(); y = 20; }
    const row = [
      `Y${yr.year}`,
      formatINR(yr.tuitionINR),
      formatINR(yr.livingINR),
      formatINR(yr.insuranceINR),
      formatINR(yr.miscINR),
      formatINR(yr.visaINR),
      formatINR(yr.flightsINR),
      formatINR(yr.totalINR),
    ];
    row.forEach((c, i) => doc.text(c, colX[i], y));
    y += 5.5;
  }
  y += 4;

  doc.setFont("helvetica", "bold"); doc.text("Notes", 14, y); y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const notes = [
    `• Costs assume ${r.inflationPctPerYear}% inflation per year on tuition + living.`,
    "• Visa fee is one-time; flights include 2 one-way tickets in Year 1, one annual visit per year after.",
    "• Living estimate is city-specific average for a student lifestyle (shared housing).",
    "• Misc covers books, local transport, mobile, occasional travel.",
    "• Actual costs vary by university, scholarship, and lifestyle — speak to a counsellor for a personalized plan.",
  ];
  notes.forEach(l => {
    const wrapped = doc.splitTextToSize(l, 182);
    wrapped.forEach((ln: string) => { if (y > 280) { doc.addPage(); y = 20; } doc.text(ln, 14, y); y += 5; });
  });

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) { doc.setPage(i); footer(doc, i, total); }
  doc.save(`PR-Study-Abroad-Cost-Report-${opts.name.replace(/\s+/g, "-")}.pdf`);
}

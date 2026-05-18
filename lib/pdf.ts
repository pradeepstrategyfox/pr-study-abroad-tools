import jsPDF from "jspdf";
import type { PredictionResult } from "./predictor";
import type { CostResult } from "./costs";
import { formatINR } from "./costs";

const PAGE = { w: 210, h: 297 };
const M = { left: 18, right: 18, top: 22, bottom: 22 };
const CONTENT_W = PAGE.w - M.left - M.right;

const COLOR = {
  ink: [29, 29, 31] as [number, number, number],
  muted: [110, 110, 115] as [number, number, number],
  faint: [230, 230, 235] as [number, number, number],
  accent: [0, 113, 227] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const TYPE = {
  title: { size: 22, weight: "bold" as const, lh: 9 },
  h2:    { size: 14, weight: "bold" as const, lh: 6.5 },
  h3:    { size: 12, weight: "bold" as const, lh: 5.5 },
  body:  { size: 10, weight: "normal" as const, lh: 5 },
  small: { size: 9,  weight: "normal" as const, lh: 4.4 },
  micro: { size: 8,  weight: "normal" as const, lh: 4 },
};

type Doc = jsPDF & { _cursorY: number };

function setStyle(doc: jsPDF, style: { size: number; weight: "bold" | "normal" }, color: [number, number, number] = COLOR.ink) {
  doc.setFont("helvetica", style.weight);
  doc.setFontSize(style.size);
  doc.setTextColor(color[0], color[1], color[2]);
}

function ensureSpace(doc: Doc, needed: number) {
  if (doc._cursorY + needed > PAGE.h - M.bottom) {
    doc.addPage();
    drawPageChrome(doc);
    doc._cursorY = M.top;
  }
}

function writeText(
  doc: Doc,
  text: string,
  style: { size: number; weight: "bold" | "normal"; lh: number },
  opts: { color?: [number, number, number]; maxWidth?: number; gap?: number } = {}
) {
  setStyle(doc, style, opts.color ?? COLOR.ink);
  const lines = doc.splitTextToSize(text, opts.maxWidth ?? CONTENT_W);
  for (const line of lines) {
    ensureSpace(doc, style.lh);
    doc.text(line, M.left, doc._cursorY);
    doc._cursorY += style.lh;
  }
  if (opts.gap !== undefined) doc._cursorY += opts.gap;
}

function spacer(doc: Doc, mm: number) { doc._cursorY += mm; }

function drawHr(doc: Doc, gap = 4) {
  ensureSpace(doc, 1);
  doc.setDrawColor(COLOR.faint[0], COLOR.faint[1], COLOR.faint[2]);
  doc.setLineWidth(0.2);
  doc.line(M.left, doc._cursorY, PAGE.w - M.right, doc._cursorY);
  doc._cursorY += gap;
}

function drawPageChrome(doc: Doc) {
  // Tiny brand mark top-left + page label top-right
  setStyle(doc, TYPE.micro, COLOR.muted);
  doc.text("PR Study Abroad · prstudyabroad.com", M.left, 12);
  const page = doc.getCurrentPageInfo().pageNumber;
  doc.text(`${page}`, PAGE.w - M.right, 12, { align: "right" });
  // Footer line
  setStyle(doc, TYPE.micro, COLOR.muted);
  doc.text(
    "Free tool by PR Study Abroad. For personalized counselling, book at prstudyabroad.com",
    PAGE.w / 2,
    PAGE.h - 10,
    { align: "center" }
  );
}

function drawCoverHeader(doc: Doc, opts: { label: string; title: string; subtitle: string }) {
  // Solid black header band, white text — premium feel
  doc.setFillColor(COLOR.ink[0], COLOR.ink[1], COLOR.ink[2]);
  doc.rect(0, 0, PAGE.w, 60, "F");

  setStyle(doc, TYPE.micro, COLOR.white);
  doc.text("PR STUDY ABROAD", M.left, 16);

  setStyle(doc, { size: 9, weight: "normal" }, [200, 200, 210]);
  doc.text(opts.label.toUpperCase(), M.left, 26);

  setStyle(doc, TYPE.title, COLOR.white);
  doc.text(opts.title, M.left, 40);

  setStyle(doc, TYPE.body, [200, 200, 210]);
  const sub = doc.splitTextToSize(opts.subtitle, CONTENT_W);
  doc.text(sub, M.left, 50);

  doc._cursorY = 72;
}

// ──────────────────────────────────────────────────────────────────────────

export function generateUniversityMatchPDF(opts: {
  name: string;
  email: string;
  phone: string;
  inputs: {
    tenthMarks: number; twelfthMarks: number; ugCGPA: number;
    workExperienceYears: number; targetCountry: string;
    ieltsScore?: number; greScore?: number; programType: string;
  };
  result: PredictionResult;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" }) as Doc;
  doc._cursorY = M.top;

  drawCoverHeader(doc, {
    label: "Admit Predictor Report",
    title: `Hello, ${opts.name.split(" ")[0] || opts.name}.`,
    subtitle: `Here are ${(opts.result.ambitious.length + opts.result.target.length + opts.result.safe.length)} universities, ranked by fit with your profile.`,
  });
  drawPageChrome(doc);

  // Profile snapshot
  const inp = opts.inputs;
  writeText(doc, "Your profile", TYPE.h3, { color: COLOR.muted });
  spacer(doc, 1);
  const profileLines = [
    ["10th", `${inp.tenthMarks}%`],
    ["12th", `${inp.twelfthMarks}%`],
    ["UG CGPA", `${inp.ugCGPA} / 10`],
    ["Program", inp.programType],
    ["Target country", inp.targetCountry],
    ["Work experience", `${inp.workExperienceYears} year${inp.workExperienceYears === 1 ? "" : "s"}`],
    ["IELTS", inp.ieltsScore ? `${inp.ieltsScore}` : "—"],
    ["GRE", inp.greScore ? `${inp.greScore}` : "—"],
  ];
  // two-column grid
  const colW = CONTENT_W / 2;
  for (let i = 0; i < profileLines.length; i += 2) {
    ensureSpace(doc, 6);
    setStyle(doc, TYPE.small, COLOR.muted);
    doc.text(profileLines[i][0], M.left, doc._cursorY);
    setStyle(doc, { size: 10, weight: "bold" }, COLOR.ink);
    doc.text(profileLines[i][1], M.left + 32, doc._cursorY);
    if (profileLines[i + 1]) {
      setStyle(doc, TYPE.small, COLOR.muted);
      doc.text(profileLines[i + 1][0], M.left + colW, doc._cursorY);
      setStyle(doc, { size: 10, weight: "bold" }, COLOR.ink);
      doc.text(profileLines[i + 1][1], M.left + colW + 32, doc._cursorY);
    }
    doc._cursorY += 6;
  }
  spacer(doc, 4);
  drawHr(doc, 8);

  const sections: Array<{ title: string; matches: PredictionResult["ambitious"]; accent: [number, number, number]; subtitle: string }> = [
    { title: "Ambitious", matches: opts.result.ambitious, accent: [214, 51, 108], subtitle: "Reach schools — strong applications stand a chance." },
    { title: "Target", matches: opts.result.target, accent: COLOR.accent, subtitle: "A realistic match for your profile." },
    { title: "Safe", matches: opts.result.safe, accent: [31, 138, 58], subtitle: "High likelihood of an admit." },
  ];

  for (const s of sections) {
    ensureSpace(doc, 18);
    // Section label with accent dot
    doc.setFillColor(s.accent[0], s.accent[1], s.accent[2]);
    doc.circle(M.left + 1.5, doc._cursorY - 1.5, 1.4, "F");
    setStyle(doc, TYPE.h2, COLOR.ink);
    doc.text(`${s.title}`, M.left + 6, doc._cursorY);
    setStyle(doc, TYPE.small, COLOR.muted);
    doc.text(`${s.matches.length} school${s.matches.length === 1 ? "" : "s"}`, PAGE.w - M.right, doc._cursorY, { align: "right" });
    doc._cursorY += 5;
    writeText(doc, s.subtitle, TYPE.small, { color: COLOR.muted, gap: 4 });

    if (s.matches.length === 0) {
      writeText(doc, "No universities matched this bucket.", TYPE.body, { color: COLOR.muted, gap: 8 });
      continue;
    }

    for (const m of s.matches) {
      const u = m.university;
      // Each card: name, meta, probability badge, description
      ensureSpace(doc, 26);
      // Probability pill (right-aligned)
      const pillX = PAGE.w - M.right - 18;
      const pillY = doc._cursorY - 4;
      doc.setFillColor(245, 245, 247);
      doc.roundedRect(pillX, pillY, 18, 6, 3, 3, "F");
      setStyle(doc, { size: 9, weight: "bold" }, COLOR.ink);
      doc.text(`${m.probability}%`, pillX + 9, pillY + 4.1, { align: "center" });

      // University name + city
      setStyle(doc, TYPE.h3, COLOR.ink);
      doc.text(u.name, M.left, doc._cursorY);
      doc._cursorY += 4.8;

      setStyle(doc, TYPE.small, COLOR.muted);
      doc.text(`${u.city} · Tier ${u.tier} · ${formatINR(u.annualTuitionINR)} / yr`, M.left, doc._cursorY);
      doc._cursorY += 5;

      // Description — proper wrap, no overflow
      writeText(doc, u.description, TYPE.body, { color: COLOR.ink, gap: 6 });
      drawHr(doc, 4);
    }

    spacer(doc, 4);
  }

  // Next step section
  ensureSpace(doc, 30);
  drawHr(doc, 6);
  writeText(doc, "Next step", TYPE.h2, { gap: 2 });
  writeText(
    doc,
    "These are indicative matches generated from your profile. A PR Study Abroad counsellor will refine this shortlist with a full review — including your projects, recommendations, target intake, and scholarships you may qualify for. To accelerate, book a free consultation at prstudyabroad.com.",
    TYPE.body,
    { color: COLOR.muted, gap: 0 }
  );

  doc.save(`PR-Study-Abroad-Admit-Report-${opts.name.replace(/\s+/g, "-")}.pdf`);
}

// ──────────────────────────────────────────────────────────────────────────

export function generateCostReportPDF(opts: {
  name: string; email: string; phone: string; result: CostResult; coverImage?: string;
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" }) as Doc;
  doc._cursorY = M.top;

  const r = opts.result;
  drawCoverHeader(doc, {
    label: "Cost Calculator Report",
    title: `${r.city}, ${r.country}`,
    subtitle: `${r.courseType} · ${r.durationYears} ${r.durationYears === 1 ? "year" : "years"} · prepared for ${opts.name}`,
  });
  drawPageChrome(doc);

  // Headline numbers — 2x2 grid
  const stats = [
    { label: "Total estimated cost", value: formatINR(r.grandTotalINR), big: true },
    { label: "Monthly burn rate", value: formatINR(r.monthlyBurnINR) },
    { label: "One-time (visa + flights)", value: formatINR(r.oneTimeINR) },
    { label: "Annual recurring", value: formatINR(r.recurringAnnualINR) },
  ];
  const cardW = (CONTENT_W - 5) / 2;
  const cardH = 22;
  for (let i = 0; i < stats.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M.left + col * (cardW + 5);
    const y = doc._cursorY + row * (cardH + 5);
    doc.setFillColor(245, 245, 247);
    doc.roundedRect(x, y, cardW, cardH, 3, 3, "F");
    setStyle(doc, TYPE.micro, COLOR.muted);
    doc.text(stats[i].label.toUpperCase(), x + 5, y + 7);
    setStyle(doc, { size: stats[i].big ? 16 : 13, weight: "bold" }, stats[i].big ? COLOR.accent : COLOR.ink);
    doc.text(stats[i].value, x + 5, y + 16);
  }
  doc._cursorY += cardH * 2 + 5 + 8;
  drawHr(doc, 6);

  // Table — Year-by-year
  writeText(doc, "Year-by-year breakdown", TYPE.h2, { gap: 1 });
  writeText(doc, `Tuition and living inflated at ${r.inflationPctPerYear}% per year. Visa and double flights in year 1 only.`, TYPE.small, { color: COLOR.muted, gap: 4 });

  const cols = [
    { key: "year", label: "Year", x: M.left, w: 18 },
    { key: "tuition", label: "Tuition", x: M.left + 18, w: 28 },
    { key: "living", label: "Living", x: M.left + 46, w: 24 },
    { key: "insurance", label: "Insurance", x: M.left + 70, w: 22 },
    { key: "misc", label: "Misc", x: M.left + 92, w: 20 },
    { key: "visa", label: "Visa", x: M.left + 112, w: 22 },
    { key: "flights", label: "Flights", x: M.left + 134, w: 22 },
    { key: "total", label: "Total", x: M.left + 156, w: 18 },
  ];

  // Header row
  ensureSpace(doc, 8);
  doc.setFillColor(245, 245, 247);
  doc.rect(M.left, doc._cursorY - 4, CONTENT_W, 7, "F");
  setStyle(doc, TYPE.micro, COLOR.muted);
  for (const c of cols) doc.text(c.label.toUpperCase(), c.x + 1, doc._cursorY);
  doc._cursorY += 6;

  for (const y of r.years) {
    ensureSpace(doc, 7);
    setStyle(doc, { size: 9.5, weight: "bold" }, COLOR.ink);
    doc.text(`Y${y.year}`, cols[0].x + 1, doc._cursorY);
    setStyle(doc, { size: 9.5, weight: "normal" }, COLOR.ink);
    const cells = [
      formatINR(y.tuitionINR), formatINR(y.livingINR), formatINR(y.insuranceINR),
      formatINR(y.miscINR), formatINR(y.visaINR), formatINR(y.flightsINR),
    ];
    cells.forEach((val, i) => doc.text(val, cols[i + 1].x + 1, doc._cursorY));
    setStyle(doc, { size: 9.5, weight: "bold" }, COLOR.ink);
    doc.text(formatINR(y.totalINR), cols[7].x + 1, doc._cursorY);
    doc._cursorY += 5.5;
    doc.setDrawColor(COLOR.faint[0], COLOR.faint[1], COLOR.faint[2]);
    doc.setLineWidth(0.15);
    doc.line(M.left, doc._cursorY - 1, PAGE.w - M.right, doc._cursorY - 1);
  }

  // Total row
  ensureSpace(doc, 9);
  doc._cursorY += 2;
  setStyle(doc, { size: 10, weight: "bold" }, COLOR.ink);
  doc.text("Grand total", M.left + 1, doc._cursorY);
  setStyle(doc, { size: 12, weight: "bold" }, COLOR.accent);
  doc.text(formatINR(r.grandTotalINR), cols[7].x + 1, doc._cursorY);
  doc._cursorY += 8;
  drawHr(doc, 6);

  // Notes
  writeText(doc, "Notes", TYPE.h2, { gap: 2 });
  const notes = [
    `Costs assume ${r.inflationPctPerYear}% inflation per year on tuition and living.`,
    "Visa fee is one-time; flights include two one-way tickets in Year 1, one annual visit thereafter.",
    "Living estimate is a city-specific average for a student lifestyle (shared housing).",
    "Misc covers books, local transport, mobile, occasional travel.",
    "Actual costs vary by university, scholarship and lifestyle — talk to a counsellor for a personalized plan.",
  ];
  for (const n of notes) {
    ensureSpace(doc, 6);
    setStyle(doc, TYPE.body, COLOR.accent);
    doc.text("•", M.left, doc._cursorY);
    setStyle(doc, TYPE.body, COLOR.muted);
    const lines = doc.splitTextToSize(n, CONTENT_W - 6);
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) ensureSpace(doc, 5);
      doc.text(lines[i], M.left + 4, doc._cursorY);
      doc._cursorY += 5;
    }
    doc._cursorY += 1;
  }

  doc.save(`PR-Study-Abroad-Cost-Report-${opts.name.replace(/\s+/g, "-")}.pdf`);
}

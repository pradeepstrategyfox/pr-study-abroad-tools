import jsPDF from "jspdf";
import type { PredictionResult } from "./predictor";
import type { CostResult } from "./costs";

const PAGE = { w: 210, h: 297 };
const M = { left: 22, right: 22, top: 22, bottom: 22 };
const CONTENT_W = PAGE.w - M.left - M.right;

const COLOR = {
  ink: [29, 29, 31] as [number, number, number],
  muted: [110, 110, 115] as [number, number, number],
  faint: [228, 228, 232] as [number, number, number],
  bg: [245, 245, 247] as [number, number, number],
  accent: [0, 113, 227] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// jsPDF's built-in helvetica has no glyph for ₹ (renders as ¹). Use "Rs " in PDFs.
function pdfINR(n: number): string {
  if (n >= 10000000) return `Rs ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `Rs ${(n / 100000).toFixed(2)} L`;
  return `Rs ${n.toLocaleString("en-IN")}`;
}

// Strip Unicode characters jsPDF helvetica can't render cleanly
function clean(s: string): string {
  return s
    .replace(/—/g, ", ")
    .replace(/–/g, "-")
    .replace(/·/g, "|")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/₹/g, "Rs ");
}

const TYPE = {
  cover_label:   { size: 9,  weight: "normal" as const },
  cover_title:   { size: 24, weight: "bold"   as const },
  cover_sub:     { size: 11, weight: "normal" as const },
  h1:            { size: 16, weight: "bold"   as const, lh: 7.5 },
  h2:            { size: 13, weight: "bold"   as const, lh: 6.5 },
  h3:            { size: 11, weight: "bold"   as const, lh: 5.4 },
  body:          { size: 10, weight: "normal" as const, lh: 5.2 },
  small:         { size: 9,  weight: "normal" as const, lh: 4.6 },
  micro:         { size: 8,  weight: "normal" as const, lh: 4.0 },
};

type Doc = jsPDF & { _cursorY: number };

function setStyle(doc: jsPDF, style: { size: number; weight: "bold" | "normal" }, color: [number, number, number] = COLOR.ink) {
  doc.setFont("helvetica", style.weight);
  doc.setFontSize(style.size);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setCharSpace(0); // explicit: no letter-spacing tweaks
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
  opts: { color?: [number, number, number]; maxWidth?: number; gap?: number; indent?: number } = {}
) {
  setStyle(doc, style, opts.color ?? COLOR.ink);
  const w = opts.maxWidth ?? (CONTENT_W - (opts.indent ?? 0));
  const lines = doc.splitTextToSize(clean(text), w);
  for (const line of lines) {
    ensureSpace(doc, style.lh);
    doc.text(line, M.left + (opts.indent ?? 0), doc._cursorY);
    doc._cursorY += style.lh;
  }
  if (opts.gap !== undefined) doc._cursorY += opts.gap;
}

function spacer(doc: Doc, mm: number) { doc._cursorY += mm; }

function drawHr(doc: Doc, gap = 6) {
  ensureSpace(doc, 1);
  doc.setDrawColor(COLOR.faint[0], COLOR.faint[1], COLOR.faint[2]);
  doc.setLineWidth(0.25);
  doc.line(M.left, doc._cursorY, PAGE.w - M.right, doc._cursorY);
  doc._cursorY += gap;
}

function drawPageChrome(doc: Doc) {
  setStyle(doc, TYPE.micro, COLOR.muted);
  doc.text("PR Study Abroad  |  prstudyabroad.com", M.left, 12);
  const page = doc.getCurrentPageInfo().pageNumber;
  doc.text(`${page}`, PAGE.w - M.right, 12, { align: "right" });
  setStyle(doc, TYPE.micro, COLOR.muted);
  doc.text(
    "Free tool by PR Study Abroad. For personalized counselling, book at prstudyabroad.com",
    PAGE.w / 2,
    PAGE.h - 10,
    { align: "center" }
  );
}

function drawCover(doc: Doc, opts: { label: string; title: string; subtitle: string }) {
  // Dark cover band
  doc.setFillColor(COLOR.ink[0], COLOR.ink[1], COLOR.ink[2]);
  doc.rect(0, 0, PAGE.w, 64, "F");

  setStyle(doc, TYPE.micro, COLOR.white);
  doc.text("PR STUDY ABROAD", M.left, 18);

  setStyle(doc, TYPE.cover_label, [200, 200, 210]);
  doc.text(clean(opts.label).toUpperCase(), M.left, 28);

  setStyle(doc, TYPE.cover_title, COLOR.white);
  doc.text(clean(opts.title), M.left, 44);

  setStyle(doc, TYPE.cover_sub, [200, 200, 210]);
  const sub = doc.splitTextToSize(clean(opts.subtitle), CONTENT_W);
  doc.text(sub, M.left, 55);

  doc._cursorY = 80;
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

  const total = opts.result.ambitious.length + opts.result.target.length + opts.result.safe.length;
  drawCover(doc, {
    label: "Admit Predictor Report",
    title: "Your university shortlist",
    subtitle: `${total} universities ranked by fit with your profile, across Ambitious, Target and Safe.`,
  });
  drawPageChrome(doc);

  // Profile snapshot
  writeText(doc, "Your profile", TYPE.h2, { gap: 4 });
  const inp = opts.inputs;
  const profileLines: Array<[string, string]> = [
    ["Prepared for", opts.name],
    ["Email", opts.email],
    ["Phone", opts.phone],
    ["10th", `${inp.tenthMarks}%`],
    ["12th", `${inp.twelfthMarks}%`],
    ["UG CGPA", `${inp.ugCGPA} / 10`],
    ["Program", inp.programType],
    ["Target country", inp.targetCountry],
    ["Work experience", `${inp.workExperienceYears} year${inp.workExperienceYears === 1 ? "" : "s"}`],
    ["IELTS", inp.ieltsScore ? `${inp.ieltsScore}` : "Not submitted"],
    ["GRE", inp.greScore ? `${inp.greScore}` : "Not submitted"],
  ];
  const colW = CONTENT_W / 2;
  for (let i = 0; i < profileLines.length; i += 2) {
    ensureSpace(doc, 7);
    setStyle(doc, TYPE.small, COLOR.muted);
    doc.text(profileLines[i][0], M.left, doc._cursorY);
    setStyle(doc, { size: 10, weight: "bold" }, COLOR.ink);
    doc.text(clean(profileLines[i][1]), M.left + 36, doc._cursorY);
    if (profileLines[i + 1]) {
      setStyle(doc, TYPE.small, COLOR.muted);
      doc.text(profileLines[i + 1][0], M.left + colW, doc._cursorY);
      setStyle(doc, { size: 10, weight: "bold" }, COLOR.ink);
      doc.text(clean(profileLines[i + 1][1]), M.left + colW + 36, doc._cursorY);
    }
    doc._cursorY += 7;
  }
  spacer(doc, 4);
  drawHr(doc, 10);

  const sections: Array<{ title: string; matches: PredictionResult["ambitious"]; accent: [number, number, number]; subtitle: string }> = [
    { title: "Ambitious", matches: opts.result.ambitious, accent: [214, 51, 108], subtitle: "Reach schools. Strong applications stand a chance." },
    { title: "Target", matches: opts.result.target, accent: COLOR.accent, subtitle: "A realistic match for your profile." },
    { title: "Safe", matches: opts.result.safe, accent: [31, 138, 58], subtitle: "High likelihood of an admit." },
  ];

  for (const s of sections) {
    ensureSpace(doc, 22);
    // Accent dot + heading
    doc.setFillColor(s.accent[0], s.accent[1], s.accent[2]);
    doc.circle(M.left + 1.8, doc._cursorY - 1.8, 1.6, "F");
    setStyle(doc, TYPE.h1, COLOR.ink);
    doc.text(s.title, M.left + 6.5, doc._cursorY);
    setStyle(doc, TYPE.small, COLOR.muted);
    doc.text(`${s.matches.length} school${s.matches.length === 1 ? "" : "s"}`, PAGE.w - M.right, doc._cursorY, { align: "right" });
    doc._cursorY += 6;
    writeText(doc, s.subtitle, TYPE.small, { color: COLOR.muted, gap: 8 });

    if (s.matches.length === 0) {
      writeText(doc, "No universities matched this bucket.", TYPE.body, { color: COLOR.muted, gap: 10 });
      continue;
    }

    for (const m of s.matches) {
      const u = m.university;
      ensureSpace(doc, 30);

      // Probability pill, right-aligned
      const pillW = 22;
      const pillX = PAGE.w - M.right - pillW;
      const pillY = doc._cursorY - 5;
      doc.setFillColor(COLOR.bg[0], COLOR.bg[1], COLOR.bg[2]);
      doc.roundedRect(pillX, pillY, pillW, 7.5, 3.5, 3.5, "F");
      setStyle(doc, { size: 9, weight: "bold" }, COLOR.ink);
      doc.text(`${m.probability}% match`, pillX + pillW / 2, pillY + 5, { align: "center" });

      // University name
      setStyle(doc, TYPE.h3, COLOR.ink);
      const nameLines = doc.splitTextToSize(clean(u.name), CONTENT_W - pillW - 4);
      for (const line of nameLines) {
        doc.text(line, M.left, doc._cursorY);
        doc._cursorY += 5.2;
      }

      // Meta line
      setStyle(doc, TYPE.small, COLOR.muted);
      doc.text(clean(`${u.city}  |  Tier ${u.tier}  |  ${pdfINR(u.annualTuitionINR)} per year`), M.left, doc._cursorY);
      doc._cursorY += 6;

      // Description body
      writeText(doc, u.description, TYPE.body, { color: COLOR.ink, gap: 8 });
      drawHr(doc, 7);
    }

    spacer(doc, 6);
  }

  // Next step
  ensureSpace(doc, 30);
  writeText(doc, "Next step", TYPE.h2, { gap: 4 });
  writeText(
    doc,
    "These are indicative matches from your profile. A PR Study Abroad counsellor will refine this shortlist with a full review of your projects, recommendations, target intake and the scholarships you may qualify for. Book a free consultation at prstudyabroad.com to accelerate.",
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
  drawCover(doc, {
    label: "Cost Calculator Report",
    title: `${r.city}, ${r.country}`,
    subtitle: `${r.courseType}  |  ${r.durationYears} ${r.durationYears === 1 ? "year" : "years"}  |  Prepared for ${opts.name}`,
  });
  drawPageChrome(doc);

  // Headline stat cards: 2x2
  const stats = [
    { label: "TOTAL ESTIMATED COST", value: pdfINR(r.grandTotalINR), big: true },
    { label: "MONTHLY BURN RATE", value: pdfINR(r.monthlyBurnINR) },
    { label: "ONE-TIME (VISA + FLIGHTS)", value: pdfINR(r.oneTimeINR) },
    { label: "ANNUAL RECURRING", value: pdfINR(r.recurringAnnualINR) },
  ];
  const gap = 6;
  const cardW = (CONTENT_W - gap) / 2;
  const cardH = 28;
  const startY = doc._cursorY;
  for (let i = 0; i < stats.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M.left + col * (cardW + gap);
    const y = startY + row * (cardH + gap);
    doc.setFillColor(COLOR.bg[0], COLOR.bg[1], COLOR.bg[2]);
    doc.roundedRect(x, y, cardW, cardH, 4, 4, "F");
    setStyle(doc, TYPE.micro, COLOR.muted);
    doc.text(stats[i].label, x + 7, y + 9);
    setStyle(doc, { size: stats[i].big ? 18 : 14, weight: "bold" }, stats[i].big ? COLOR.accent : COLOR.ink);
    doc.text(stats[i].value, x + 7, y + 21);
  }
  doc._cursorY = startY + cardH * 2 + gap + 10;
  drawHr(doc, 10);

  // Year-by-year breakdown
  writeText(doc, "Year-by-year breakdown", TYPE.h2, { gap: 2 });
  writeText(
    doc,
    `Tuition and living inflated at ${r.inflationPctPerYear}% per year. Visa fee and two one-way flights in year 1, one annual return flight thereafter.`,
    TYPE.small,
    { color: COLOR.muted, gap: 8 }
  );

  // Column layout (mm) tuned for 5 to 8 columns within content width
  const colDef = [
    { key: "year",     label: "YEAR",      w: 14, align: "left"  },
    { key: "tuition",  label: "TUITION",   w: 25, align: "right" },
    { key: "living",   label: "LIVING",    w: 22, align: "right" },
    { key: "ins",      label: "INSURANCE", w: 25, align: "right" },
    { key: "misc",     label: "MISC",      w: 18, align: "right" },
    { key: "visa",     label: "VISA",      w: 18, align: "right" },
    { key: "flights",  label: "FLIGHTS",   w: 22, align: "right" },
    { key: "total",    label: "TOTAL",     w: 22, align: "right" },
  ] as const;

  // Compute x for each column
  const totalDefW = colDef.reduce((s, c) => s + c.w, 0);
  const scale = CONTENT_W / totalDefW;
  let runningX = M.left;
  const cols = colDef.map(c => {
    const w = c.w * scale;
    const x = runningX;
    runningX += w;
    return { ...c, x, w };
  });

  // Header row
  ensureSpace(doc, 10);
  doc.setFillColor(COLOR.bg[0], COLOR.bg[1], COLOR.bg[2]);
  doc.rect(M.left, doc._cursorY - 5, CONTENT_W, 8, "F");
  setStyle(doc, TYPE.micro, COLOR.muted);
  for (const c of cols) {
    const x = c.align === "right" ? c.x + c.w - 2 : c.x + 2;
    doc.text(c.label, x, doc._cursorY, { align: c.align as "left" | "right" });
  }
  doc._cursorY += 7;

  for (const y of r.years) {
    ensureSpace(doc, 9);
    const cells = [
      { val: `Y${y.year}`, bold: true },
      { val: pdfINR(y.tuitionINR), bold: false },
      { val: pdfINR(y.livingINR), bold: false },
      { val: pdfINR(y.insuranceINR), bold: false },
      { val: pdfINR(y.miscINR), bold: false },
      { val: pdfINR(y.visaINR), bold: false },
      { val: pdfINR(y.flightsINR), bold: false },
      { val: pdfINR(y.totalINR), bold: true },
    ];
    cells.forEach((cell, i) => {
      setStyle(doc, { size: 9.5, weight: cell.bold ? "bold" : "normal" }, COLOR.ink);
      const c = cols[i];
      const x = c.align === "right" ? c.x + c.w - 2 : c.x + 2;
      doc.text(cell.val, x, doc._cursorY, { align: c.align as "left" | "right" });
    });
    doc._cursorY += 6;
    doc.setDrawColor(COLOR.faint[0], COLOR.faint[1], COLOR.faint[2]);
    doc.setLineWidth(0.2);
    doc.line(M.left, doc._cursorY - 2, PAGE.w - M.right, doc._cursorY - 2);
  }

  // Total row
  ensureSpace(doc, 12);
  doc._cursorY += 3;
  setStyle(doc, { size: 10.5, weight: "bold" }, COLOR.ink);
  doc.text("Grand total", M.left + 2, doc._cursorY);
  setStyle(doc, { size: 13, weight: "bold" }, COLOR.accent);
  const lastCol = cols[cols.length - 1];
  doc.text(pdfINR(r.grandTotalINR), lastCol.x + lastCol.w - 2, doc._cursorY, { align: "right" });
  doc._cursorY += 10;
  drawHr(doc, 10);

  // Notes
  writeText(doc, "Notes", TYPE.h2, { gap: 4 });
  const notes = [
    `Costs assume ${r.inflationPctPerYear}% inflation per year on tuition and living.`,
    "Visa fee is one-time. Flights include two one-way tickets in year 1, one annual visit thereafter.",
    "Living estimate is a city-specific average for a student lifestyle with shared housing.",
    "Misc covers books, local transport, mobile and occasional travel.",
    "Actual costs vary by university, scholarship and lifestyle. Talk to a counsellor for a personalized plan.",
  ];
  for (const n of notes) {
    ensureSpace(doc, 7);
    setStyle(doc, TYPE.body, COLOR.accent);
    doc.text("•", M.left, doc._cursorY);
    setStyle(doc, TYPE.body, COLOR.muted);
    const lines = doc.splitTextToSize(clean(n), CONTENT_W - 6);
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) ensureSpace(doc, TYPE.body.lh);
      doc.text(lines[i], M.left + 5, doc._cursorY);
      doc._cursorY += TYPE.body.lh;
    }
    doc._cursorY += 2;
  }

  doc.save(`PR-Study-Abroad-Cost-Report-${opts.name.replace(/\s+/g, "-")}.pdf`);
}

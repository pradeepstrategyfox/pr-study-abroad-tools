// Resolve a unique real campus photo for every university.
// 1) Scrape Wikipedia article HTML for the best image
// 2) If empty, try alternate article titles (campus pages, building pages)
// 3) If still empty, fall back to Wikimedia Commons category listing
// 4) Manual OVERRIDES for the truly stubborn ones

import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const jsonPath = path.join(here, "..", "data", "universities.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

const TITLES = {
  Oxford: ["University of Oxford"],
  Cambridge: ["University of Cambridge"],
  Imperial: ["Imperial College London", "South Kensington Campus", "Queen's Tower, London"],
  LSE: ["London School of Economics"],
  UCL: ["University College London", "Wilkins Building"],
  "King's College": ["King's College London", "Strand Campus", "King's Building, London"],
  Edinburgh: ["University of Edinburgh", "Old College, University of Edinburgh"],
  Manchester: ["University of Manchester", "Whitworth Hall"],
  Warwick: ["University of Warwick"],
  Bristol: ["University of Bristol", "Wills Memorial Building"],
  Glasgow: ["University of Glasgow", "Gilbert Scott Building"],
  Leeds: ["University of Leeds", "Parkinson Building"],
  Sheffield: ["University of Sheffield", "Firth Court"],
  Coventry: ["Coventry University"],
  Hertfordshire: ["University of Hertfordshire"],
  "U of T": ["University of Toronto", "University College, Toronto", "Convocation Hall (University of Toronto)"],
  UBC: ["University of British Columbia"],
  McGill: ["McGill University", "Roddick Gates"],
  Waterloo: ["University of Waterloo"],
  Alberta: ["University of Alberta"],
  McMaster: ["McMaster University"],
  "Queen's": ["Queen's University at Kingston"],
  York: ["York University"],
  Concordia: ["Concordia University", "Henry F. Hall Building"],
  TMU: ["Toronto Metropolitan University"],
  Melbourne: ["University of Melbourne", "Old Quadrangle, University of Melbourne"],
  ANU: ["Australian National University"],
  USyd: ["University of Sydney", "Main Quadrangle, University of Sydney"],
  UNSW: ["University of New South Wales"],
  Monash: ["Monash University"],
  UQ: ["University of Queensland", "Great Court, University of Queensland"],
  Adelaide: ["University of Adelaide", "Bonython Hall"],
  Deakin: ["Deakin University"],
  RMIT: ["RMIT University", "Storey Hall"],
  TUM: ["Technical University of Munich"],
  "RWTH Aachen": ["RWTH Aachen University"],
  "TU Berlin": ["Technical University of Berlin"],
  Stuttgart: ["University of Stuttgart"],
  Heidelberg: ["Heidelberg University", "Old University, Heidelberg"],
  "TU Darmstadt": ["Technische Universität Darmstadt"],
  Freiburg: ["University of Freiburg"],
  Trinity: ["Trinity College Dublin", "Campanile of Trinity College Dublin"],
  UCD: ["University College Dublin"],
  "NUI Galway": ["University of Galway"],
  DCU: ["Dublin City University"],
  UL: ["University of Limerick"],
};

// Commons category names — most universities have a `Category:<Name>` page on Commons
const COMMONS_CATS = {
  Oxford: "University of Oxford",
  Cambridge: "University of Cambridge",
  Imperial: "Imperial College London",
  LSE: "London School of Economics and Political Science",
  UCL: "University College London",
  "King's College": "King's College London",
  Edinburgh: "University of Edinburgh",
  Manchester: "University of Manchester",
  Warwick: "University of Warwick",
  Bristol: "University of Bristol",
  Glasgow: "University of Glasgow",
  Leeds: "University of Leeds",
  Sheffield: "University of Sheffield",
  Coventry: "Coventry University",
  Hertfordshire: "University of Hertfordshire",
  "U of T": "University of Toronto",
  UBC: "University of British Columbia",
  McGill: "McGill University",
  Waterloo: "University of Waterloo",
  Alberta: "University of Alberta",
  McMaster: "McMaster University",
  "Queen's": "Queen's University at Kingston",
  York: "York University",
  Concordia: "Concordia University",
  TMU: "Toronto Metropolitan University",
  Melbourne: "University of Melbourne",
  ANU: "Australian National University",
  USyd: "University of Sydney",
  UNSW: "University of New South Wales",
  Monash: "Monash University",
  UQ: "University of Queensland",
  Adelaide: "University of Adelaide",
  Deakin: "Deakin University",
  RMIT: "RMIT University",
  TUM: "Technical University of Munich",
  "RWTH Aachen": "RWTH Aachen University",
  "TU Berlin": "Technical University of Berlin",
  Stuttgart: "University of Stuttgart",
  Heidelberg: "Heidelberg University",
  "TU Darmstadt": "Technische Universität Darmstadt",
  Freiburg: "University of Freiburg",
  Trinity: "Trinity College Dublin",
  UCD: "University College Dublin",
  "NUI Galway": "University of Galway",
  DCU: "Dublin City University",
  UL: "University of Limerick",
};

// Word-boundary-aware bad keywords. The school's name (King's College, Queen's University) won't trigger these.
const BAD_PATTERNS = [
  /\b(seal|crest|wordmark|emblem|heraldic|symbol|signature|stamp)\b/i,
  /coat[_-]?of[_-]?arms/i,
  /\blogo\b/i,
  /[_-]edit[_-]/i,
  /icon[_-]edit/i,
  /\b(portrait|painting|drawing|engraving|sketch)\b/i,
  /\b(sir[_-]|lady[_-]|lord[_-]|prince[_-]|princess[_-]|professor[_-]|dr[_-]|chancellor[_-]|founder[_-]|vice[_-]chancellor)/i,
  /\b(king[_-]george|king[_-]edward|king[_-]henry|king[_-]william|queen[_-]victoria|queen[_-]elizabeth|queen[_-]anne)/i,
  /[_-]by[_-][A-Z]/i, // "painting_by_Artist"
  /flag[_-]of/i,
  /map[_-]of/i,
  /\bsvg\b/i,
  /athene|siegel/i,
  /\.svg\//i,
];

const GOOD = /campus|building|hall|tower|library|quad|college|courtyard|gate|aerial|view|chapel|exterior|façade|facade|park|main|cloister|spires|centre|center|school[_-]of|institute|courtyard|square|university|hauptgebäude|hauptgebaude/i;

const UA = "pr-study-abroad-tools/1.0 (https://github.com/pradeepstrategyfox/pr-study-abroad-tools; contact@example.com)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
      if (res.ok) return res.text();
      if (res.status === 429 || res.status >= 500) {
        await sleep(800 * Math.pow(2, i));
        continue;
      }
      return null;
    } catch {
      await sleep(800 * Math.pow(2, i));
    }
  }
  return null;
}
async function fetchJSON(url, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (res.ok) return res.json();
      if (res.status === 429 || res.status >= 500) {
        await sleep(800 * Math.pow(2, i));
        continue;
      }
      return null;
    } catch {
      await sleep(800 * Math.pow(2, i));
    }
  }
  return null;
}
async function head(url) {
  try { const r = await fetch(url, { method: "HEAD" }); return r.ok; } catch { return false; }
}

function scoreImg(url) {
  if (BAD_PATTERNS.some((p) => p.test(url))) return -1;
  if (!/\.jpg\//i.test(url) && !/\.jpeg\//i.test(url) && !/\.JPG\//.test(url)) return -1;
  let score = 5;
  const name = url.split("/").pop() || "";
  if (GOOD.test(name)) score += 25;
  if (name.length > 30) score += 4;
  if (/geograph/i.test(name)) score += 8;
  const commaCount = (name.match(/%2C/g) || []).length;
  if (commaCount >= 2) score -= 8;
  return score;
}

function pickFromHTML(html) {
  if (!html) return null;
  const re = /<img[^>]+src=["']([^"']+upload\.wikimedia\.org[^"']+)["']/g;
  const candidates = [];
  for (const m of html.matchAll(re)) {
    let url = m[1].startsWith("//") ? `https:${m[1]}` : m[1];
    const s = scoreImg(url);
    if (s < 0) continue;
    url = url.replace(/\/\d+px-/, "/1280px-");
    candidates.push({ url, score: s });
  }
  candidates.sort((a, b) => b.score - a.score);
  // Dedupe in case URL appears twice
  const seen = new Set();
  for (const c of candidates) {
    if (seen.has(c.url)) continue;
    seen.add(c.url);
    return c.url;
  }
  return null;
}

async function fromArticle(title) {
  const html = await fetchText(`https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`);
  if (process.env.DEBUG_FETCH && title === process.env.DEBUG_FETCH) {
    console.log(`[debug] ${title}: html length=${html?.length}`);
    const re = /<img[^>]+src=["']([^"']+upload\.wikimedia\.org[^"']+\.jpg[^"']*)["']/g;
    const matches = html ? [...html.matchAll(re)].slice(0, 5).map(m => m[1]) : [];
    console.log(`[debug] raw matches:`, matches);
  }
  return pickFromHTML(html);
}

async function fromCommonsCategory(cat) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=categorymembers&gcmtitle=${encodeURIComponent("Category:" + cat)}&gcmtype=file&gcmlimit=100&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280&origin=*`;
  const json = await fetchJSON(url);
  if (!json) return null;
  const pages = Object.values(json.query?.pages || {});
  const candidates = [];
  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (!info) continue;
    if (info.mime !== "image/jpeg") continue;
    if (!info.width || info.width < 800) continue;
    // Prefer landscape, but only skip definitely-portrait
    if (info.height && info.width / info.height < 0.85) continue;
    const fileURL = (info.thumburl || info.url || "").split("?")[0]; // strip UTM
    if (!fileURL) continue;
    if (BAD_PATTERNS.some((p) => p.test(fileURL))) continue;
    let score = 10;
    if (GOOD.test(p.title || "")) score += 25;
    if (info.width >= 1280) score += 6;
    // Penalize images with "strike", "protest", "tribute", "event" - not buildings
    if (/strike|protest|tribute|crowd|event|conference|ceremony|graduation|march/i.test(p.title || "")) score -= 30;
    // Penalize people-name-heavy titles
    if (/by[_ ][A-Z]|portrait of|painting of/i.test(p.title || "")) score -= 30;
    candidates.push({ url: fileURL, score, title: p.title });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.url || null;
}

console.log("Resolving images…");
let ok = 0;
const fails = [];
for (const u of data.universities) {
  const titles = TITLES[u.shortName] || [u.name];
  let img = null;

  // Phase 1: scan article HTML across alternate titles
  for (const title of titles) {
    try {
      const picked = await fromArticle(title);
      if (picked && await head(picked)) { img = picked; break; }
    } catch {}
    await sleep(200);
  }

  // Phase 2: Commons category
  if (!img) {
    const cat = COMMONS_CATS[u.shortName];
    if (cat) {
      try {
        const picked = await fromCommonsCategory(cat);
        if (picked && await head(picked)) img = picked;
      } catch {}
    }
  }

  u.image = img || "";
  if (img) { ok++; console.log(`OK  ${u.shortName.padEnd(18)} ${img.split("/").pop()}`); }
  else { fails.push(u.shortName); console.log(`--  ${u.shortName}`); }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`\n${ok}/${data.universities.length} resolved.`);
if (fails.length) console.log("Unresolved:", fails.join(", "));

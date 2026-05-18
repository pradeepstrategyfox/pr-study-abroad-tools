// For each university, fetch every image on its Wikipedia page and pick a
// real campus photo (jpg/jpeg, not a logo/seal, reasonable size).

import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const jsonPath = path.join(here, "..", "data", "universities.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

const WIKI_TITLES = {
  Oxford: "University of Oxford",
  Cambridge: "University of Cambridge",
  Imperial: "Imperial College London",
  LSE: "London School of Economics",
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

const BAD = /seal|coat|crest|logo|athene|siegel|heraldic|shield|emblem|wordmark|symbol|flag|map|graduation|portrait|signature|chart|diagram/i;
const GOOD = /campus|building|main|hall|tower|library|quad|college|courtyard|gate|aerial|view|chapel|exterior|façade|facade|university|park|street/i;

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { "User-Agent": "pr-study-abroad-tools/1.0" } });
  if (!res.ok) return null;
  return res.json();
}

async function imagesOnPage(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=images&imlimit=50&titles=${encodeURIComponent(title)}&origin=*`;
  const json = await fetchJSON(url);
  if (!json) return [];
  const pages = Object.values(json.query?.pages || {});
  const images = pages.flatMap((p) => p.images || []).map((i) => i.title);
  return images;
}

async function imageInfo(fileTitle) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280&titles=${encodeURIComponent(fileTitle)}&origin=*`;
  const json = await fetchJSON(url);
  if (!json) return null;
  const pages = Object.values(json.query?.pages || {});
  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (info) return info;
  }
  return null;
}

function scoreImage(fileTitle, info) {
  if (!info) return -1;
  if (info.mime !== "image/jpeg" && info.mime !== "image/png") return -1;
  // Reject thumbs that are too small or oddly shaped (logos are often square; landscape photos are wider)
  if (info.width < 600 || info.height < 300) return -1;
  if (info.width / info.height < 0.9) return -1; // prefer landscape

  let score = 0;
  if (BAD.test(fileTitle)) score -= 50;
  if (GOOD.test(fileTitle)) score += 10;
  // Prefer larger images
  score += Math.min(20, Math.floor(info.width / 100));
  return score;
}

async function resolveForTitle(title) {
  const files = await imagesOnPage(title);
  if (files.length === 0) return null;
  const candidates = [];
  for (const f of files) {
    if (BAD.test(f)) continue;
    if (!/\.(jpg|jpeg|png)$/i.test(f)) continue;
    const info = await imageInfo(f);
    const s = scoreImage(f, info);
    if (s > 0) candidates.push({ file: f, score: s, url: info.thumburl || info.url });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.url || null;
}

async function check(url) {
  try { const r = await fetch(url, { method: "HEAD" }); return r.ok; } catch { return false; }
}

console.log("Resolving images…");
let resolved = 0, fallback = 0;
for (const u of data.universities) {
  const title = WIKI_TITLES[u.shortName] || u.name;
  let img = null;
  try { img = await resolveForTitle(title); } catch (e) { console.log(`  err ${u.shortName}: ${e.message}`); }
  if (img && !(await check(img))) img = null;
  u.image = img || "";
  if (img) { resolved++; console.log(`OK ${u.shortName}`); }
  else { fallback++; console.log(`-- ${u.shortName}`); }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`\n${resolved} resolved, ${fallback} will fall back to country cover.`);

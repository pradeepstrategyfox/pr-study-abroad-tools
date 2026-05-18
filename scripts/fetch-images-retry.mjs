// Resolve a list of File: titles via the Commons API to get real thumb URLs.
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const jsonPath = path.join(here, "..", "data", "universities.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

const TARGETS = {
  "Queen's University at Kingston": "Grant Hall (Queen's University at Kingston).jpg",
  "Heidelberg University": "Heidelberg University Library.jpg",
  "Technische Universität Darmstadt": "TU Darmstadt Library and Main Building.jpg",
  "Technical University of Berlin": "Berlin Charlottenburg TU-Berlin Hauptgebaeude.jpg",
  "University of Waterloo": "Dana Porter Library 2.jpg",
  "University College London": "UCL Portico Building.jpg",
  "Imperial College London": "Queen's Tower Imperial College London - geograph.org.uk - 2288317.jpg",
  "London School of Economics": "Centre Building, LSE from LSE Square.jpg",
  "King's College London": "King's Building and Strand quad.jpg",
  "University of Sydney": "Main Quadrangle, University of Sydney.jpg",
  "University of Adelaide": "Bonython Hall, University of Adelaide, East view 20230207.jpg",
  "RMIT University": "Storey Hall, RMIT Old Building (4505219368).jpg",
};

const UA = "pr-study-abroad-tools/1.0";

async function resolveFileURL(fileTitle) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent("File:" + fileTitle)}&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=1280&origin=*`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  const json = await res.json();
  const pages = Object.values(json.query?.pages || {});
  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (!info) continue;
    const u = (info.thumburl || info.url || "").split("?")[0];
    if (u) return u;
  }
  return null;
}

let fixed = 0;
for (const u of data.universities) {
  const target = TARGETS[u.name];
  if (!target) continue;
  const resolved = await resolveFileURL(target);
  if (resolved) {
    u.image = resolved;
    fixed++;
    console.log(`OK ${u.shortName}: ${resolved.split("/").pop()}`);
  } else {
    console.log(`-- ${u.shortName}: not found (${target})`);
  }
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
const empties = data.universities.filter((u) => !u.image).map((u) => u.shortName);
console.log(`\n${fixed} forced. ${empties.length} empty.`);
if (empties.length) console.log("Empty:", empties.join(", "));

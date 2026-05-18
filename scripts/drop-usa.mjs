import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);

// Universities
const uniPath = path.join(here, "..", "data", "universities.json");
const uni = JSON.parse(fs.readFileSync(uniPath, "utf-8"));
const beforeU = uni.universities.length;
uni.universities = uni.universities.filter((u) => u.country !== "USA");
delete uni.countryCovers.USA;
fs.writeFileSync(uniPath, JSON.stringify(uni, null, 2) + "\n", "utf-8");
console.log(`universities.json: dropped ${beforeU - uni.universities.length} USA entries (now ${uni.universities.length}).`);

// Costs
const costPath = path.join(here, "..", "data", "costs.json");
const costs = JSON.parse(fs.readFileSync(costPath, "utf-8"));
delete costs.countries.USA;
fs.writeFileSync(costPath, JSON.stringify(costs, null, 2) + "\n", "utf-8");
console.log(`costs.json: dropped USA. Remaining countries: ${Object.keys(costs.countries).join(", ")}.`);

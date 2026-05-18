// Replace em-dashes (—) with commas across description text in the universities JSON.
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const jsonPath = path.join(here, "..", "data", "universities.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

function clean(s) {
  return s.replace(/\s*—\s*/g, ", ");
}

data.universities = data.universities.map(u => ({
  ...u,
  description: clean(u.description),
}));

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log("Stripped em-dashes from", data.universities.length, "descriptions.");

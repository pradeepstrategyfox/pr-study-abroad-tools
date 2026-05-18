// Build per-university image URLs from a curated country pool.
// Wikipedia's summary endpoint mostly returns seals/coats, not campus photos.
// We use a pool of stable Unsplash photo IDs per country and round-robin them.

import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const jsonPath = path.join(here, "..", "data", "universities.json");
const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// Stable Unsplash photo IDs for university / city / campus imagery
const POOLS = {
  USA: [
    "1497486751825-1233686d5d80", // Harvard yard ish
    "1554232456-8f4e2b97fbab",
    "1565025091011-aaecb22b8d6b",
    "1607237138185-eedd9c632b0b",
    "1606761568499-6d2451b23c66",
    "1564981797816-1043664bf78d",
    "1583373834259-46cc92173cb7",
    "1568792923760-d70635a89fdc",
    "1532649538693-f3a2ec1bf8bd",
    "1622403060956-6e7a40bc7eb0",
    "1518733057094-95b53143d2a7",
    "1612779553842-25925cab6a31",
  ],
  UK: [
    "1573757019562-8c5f3b8b8b8c",
    "1543340713-8e7f5b1b8a6f",
    "1568323651-29f4ed6ad5c1",
    "1564598519-e6f9be8f0afb",
    "1571260899304-425eee4c7efc",
    "1505761671935-60b3a7427bad",
    "1577896851231-70ef18881754",
    "1544006659-f0b21884ce1d",
    "1486299267070-83823f5448dd",
    "1486325212027-8081e485255e",
  ],
  Canada: [
    "1503614472-8c93a56e33fa",
    "1517090504586-fde19ea6066f",
    "1559682468-a6a29e7d9517",
    "1465353-c5c44e9ddc09",
    "1465153690352-10c1b29577f8",
    "1518733057094-95b53143d2a7",
    "1607237138185-eedd9c632b0b",
    "1465311530779-5241f5a29892",
  ],
  Australia: [
    "1506905925346-21bda4d32df4",
    "1523482580672-f109ba8cb9be",
    "1494233914256-1c4b6a8c8e7c",
    "1496939376851-89342e90adcd",
    "1494233914256-1c4b6a8c8e7c",
    "1531971589569-0d9370cbe1e5",
    "1486325212027-8081e485255e",
  ],
  Germany: [
    "1599946347371-68eb71b16afc",
    "1554072675-66db59dba46f",
    "1467269204594-9661b134dd2b",
    "1571260899304-425eee4c7efc",
    "1543340713-8e7f5b1b8a6f",
    "1538133916736-1bc6dbb33dc7",
    "1467269204594-9661b134dd2b",
  ],
  Ireland: [
    "1549918864-48ac978761a4",
    "1567361672830-f7aef5e36a23",
    "1564061170164-8b5e1fb8f7e2",
    "1571260899304-425eee4c7efc",
    "1538133916736-1bc6dbb33dc7",
  ],
};

// Curated mapping: known-good direct Wikipedia/Wikimedia campus photos (not seals)
// for famous universities where we want the real building photo.
const SPECIFIC = {
  "Massachusetts Institute of Technology": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_Main_Campus_Aerial.jpg/1280px-MIT_Main_Campus_Aerial.jpg",
  "Stanford University": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Stanford_University_campus_from_above.jpg/1280px-Stanford_University_campus_from_above.jpg",
  "Harvard University": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Harvard_yard_winter_2009j.JPG/1280px-Harvard_yard_winter_2009j.JPG",
  "University of Oxford": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Oxford_-_Christ_Church_-_geograph.org.uk_-_1607264.jpg/1280px-Oxford_-_Christ_Church_-_geograph.org.uk_-_1607264.jpg",
  "University of Cambridge": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/KingsCollegeChapelWest.jpg/1280px-KingsCollegeChapelWest.jpg",
  "Imperial College London": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Imperial_College_London_Queens_Tower.jpg/1280px-Imperial_College_London_Queens_Tower.jpg",
  "London School of Economics": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Bridge_at_the_London_School_of_Economics.jpg/1280px-Bridge_at_the_London_School_of_Economics.jpg",
  "University of Toronto": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Convocation_Hall_University_of_Toronto.jpg/1280px-Convocation_Hall_University_of_Toronto.jpg",
  "University of Melbourne": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/University_of_Melbourne_Architecture_Building.jpg/1280px-University_of_Melbourne_Architecture_Building.jpg",
  "Trinity College Dublin": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/The_entrance_of_the_historic_Trinity_College_%28Unsplash%29.jpg/1280px-The_entrance_of_the_historic_Trinity_College_%28Unsplash%29.jpg",
};

function urlForId(id) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
}

async function check(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch { return false; }
}

// Verify pools — drop any that 404
console.log("Verifying image URLs…");
for (const country of Object.keys(POOLS)) {
  const verified = [];
  for (const id of POOLS[country]) {
    const url = urlForId(id);
    if (await check(url)) verified.push(id);
    else console.log(`  drop ${country}: ${id}`);
  }
  POOLS[country] = verified;
}

// Group universities by country and assign round-robin from country pool
const byCountry = {};
for (const u of data.universities) {
  (byCountry[u.country] ??= []).push(u);
}

const updated = data.universities.map(u => {
  if (SPECIFIC[u.name]) return { ...u, image: SPECIFIC[u.name] };
  const pool = POOLS[u.country] ?? [];
  if (pool.length === 0) return { ...u, image: "" };
  const idx = byCountry[u.country].findIndex(x => x.name === u.name);
  const id = pool[idx % pool.length];
  return { ...u, image: urlForId(id) };
});

data.universities = updated;
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`\nAssigned images to ${updated.filter(u => u.image).length}/${updated.length} universities.`);

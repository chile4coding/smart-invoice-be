const fs = require("fs");
const path = require("path");

const API_URL =
  "https://medixtrak.cinfores.net/php/api/route/index.php//payment/listbills";
const API_KEY =
  "82feb54f11f681bfcc5a4cf12c0b7666b079c63ef34d1cbcd25498bd96d59d4b";
const TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJtZWRpeHRyYWsucnN1dGgubmciLCJpYXQiOjE3ODE1NDg2NzUsIm5iZiI6MTc4MTU0ODY3NSwiZXhwIjoxNzgxNTc3NDc1LCJ1SWQiOiJnb2RzcG93ZXIucGVwcGxlIiwicm9sZSI6InBheW1lbnQgb2ZmaWNlciIsInByaXZsaXN0IjoiLCA4MDAxMCwgODAwMjksIDgwMDAxLCA4MDAxNSwgODAwMjQsIDgwMDE3IiwicmVxX2lwIjoiMTI3LjAuMC4xIiwiY2xpbmljIjoiMiIsInN1Yl91bml0IjoiIiwicGF5cG9pbnQiOjJ9.I_AqjCp5sy6Kjsk41UBALSxgBMrpVMDZihTgHVrVA7c";
const USERID = "godspower.pepple";
const PCODE = "131474";

const OUTPUT_DIR = path.join(__dirname, "bills_output");

async function fetchBillsForUnit(unit) {
  const formData = new FormData();
  formData.append("userid", USERID);
  formData.append("unit", unit);
  formData.append("pcode", PCODE);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-invex-api-key": API_KEY,
      Authorization: `Bearer ${TOKEN}`,
      Cookie: "PHPSESSID=nd88tepfqmngjnsdqb93kv07ev",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function sanitizeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, "-").trim();
}

async function main() {
  const raw = fs.readFileSync(path.join(__dirname, "department.json"), "utf-8");
  const { status: departments } = JSON.parse(raw);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  for (const dept of departments) {
    const unit = dept.name;
    console.log(`Fetching bills for: ${unit}`);

    try {
      const data = await fetchBillsForUnit(unit);

      const result = { unit, items: data };
      const filename = `${sanitizeFilename(unit)}.json`;
      const filepath = path.join(OUTPUT_DIR, filename);

      fs.writeFileSync(filepath, JSON.stringify(result, null, 2), "utf-8");
      console.log(`  Saved -> ${filename}`);
    } catch (err) {
      console.error(`  Failed for "${unit}": ${err.message}`);
    }
  }

  console.log("\nDone.");
}

main();

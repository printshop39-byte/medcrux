// Convert a CSV of drugs into data/drugs.json (which the app auto-merges).
//
// Usage:
//   node scripts/csv-to-json.mjs path/to/drugs.csv
//
// CSV header (first row) must contain these columns. List columns use `|` to
// separate items; viva/mcq columns use a compact syntax described below.
//
//   id,name,topic,drugClass,moa,uses,sideEffects,contraindications,
//   interactions,mnemonic,viva,mcqs,importantForExam,askedFrequently
//
//   uses / sideEffects / contraindications / interactions : "a | b | c"
//   viva  : "Q?::Answer || Q2?::Answer2"
//   mcqs  : "Question::optA;optB;optC;optD::answerIndex::explanation || ...next"
//   importantForExam / askedFrequently : "true" or "false" (optional)
//
// This is a zero-dependency parser good enough for exam data. For anything
// complex, hand-edit data/drugs.json directly.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseCsv(text) {
  // Minimal CSV parser supporting quoted fields with embedded commas/quotes.
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\r") { /* skip */ }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

const list = (s) => (s ? s.split("|").map((x) => x.trim()).filter(Boolean) : []);

const parseViva = (s) =>
  s
    ? s.split("||").map((pair) => {
        const [q, a] = pair.split("::");
        return { q: (q || "").trim(), a: (a || "").trim() };
      }).filter((v) => v.q)
    : [];

const parseMcqs = (s, id) =>
  s
    ? s.split("||").map((block, idx) => {
        const [question, opts, ans, expl] = block.split("::");
        return {
          id: `${id}-csv${idx + 1}`,
          question: (question || "").trim(),
          options: (opts || "").split(";").map((o) => o.trim()).filter(Boolean),
          answerIndex: Number((ans || "0").trim()) || 0,
          explanation: (expl || "").trim(),
        };
      }).filter((m) => m.question)
    : [];

function main() {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: node scripts/csv-to-json.mjs <file.csv>");
    process.exit(1);
  }
  const rows = parseCsv(readFileSync(input, "utf8"));
  const header = rows.shift().map((h) => h.trim());
  const col = (r, name) => r[header.indexOf(name)] ?? "";

  const drugs = rows.map((r) => {
    const id = col(r, "id").trim();
    const out = {
      id,
      name: col(r, "name").trim(),
      topic: col(r, "topic").trim(),
      drugClass: col(r, "drugClass").trim(),
      moa: col(r, "moa").trim(),
      uses: list(col(r, "uses")),
      sideEffects: list(col(r, "sideEffects")),
      contraindications: list(col(r, "contraindications")),
      interactions: list(col(r, "interactions")),
      vivaQuestions: parseViva(col(r, "viva")),
      mcqs: parseMcqs(col(r, "mcqs"), id),
    };
    const mnem = col(r, "mnemonic").trim();
    if (mnem) out.mnemonic = mnem;
    if (col(r, "importantForExam").trim() === "true") out.importantForExam = true;
    if (col(r, "askedFrequently").trim() === "true") out.askedFrequently = true;
    return out;
  });

  const outPath = join(__dirname, "..", "data", "drugs.json");
  writeFileSync(outPath, JSON.stringify(drugs, null, 2) + "\n");
  console.log(`✓ Wrote ${drugs.length} drug(s) to data/drugs.json`);
}

main();

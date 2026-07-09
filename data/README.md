# Adding drugs (JSON / CSV import)

The app merges any drugs in **`data/drugs.json`** on top of the built-in list in
`lib/drugs.ts`. No code changes needed — just edit the JSON (or generate it from a
CSV) and restart / rebuild.

## Option A — edit `data/drugs.json` directly

It's an array of `Drug` objects. See **`data/drugs.example.json`** for a complete
example (Captopril). Minimum shape:

```json
[
  {
    "id": "unique-id",
    "name": "Drug Name",
    "topic": "cardiovascular-drugs",
    "drugClass": "…",
    "moa": "…",
    "uses": ["…"],
    "sideEffects": ["…"],
    "contraindications": ["…"],
    "interactions": ["…"],
    "mnemonic": "optional",
    "vivaQuestions": [{ "q": "…", "a": "…" }],
    "mcqs": [
      { "id": "id-m1", "question": "…", "options": ["a","b","c","d"], "answerIndex": 1, "explanation": "…" }
    ],
    "importantForExam": true,
    "askedFrequently": false
  }
]
```

**Valid `topic` values:** `general-pharmacology`, `autonomic-nervous-system`,
`cardiovascular-drugs`, `cns-drugs`, `antibiotics`, `antimicrobials`,
`endocrine-pharmacology`, `nsaids-analgesics`, `autacoids`.

> Tags are optional — if omitted, the app applies sensible defaults from
> `lib/drugs.ts`. Everything (flashcards, MCQs, viva, search, revision) picks up
> imported drugs automatically.

## Option B — import from CSV

```bash
node scripts/csv-to-json.mjs my-drugs.csv
```

This writes `data/drugs.json`. CSV columns and the compact viva/MCQ syntax are
documented at the top of `scripts/csv-to-json.mjs`.

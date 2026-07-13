# MedCrux Pharmacology — Module Release Note

> **Release status: ✅ Production Ready**
> Live on `medcrux.vercel.app` · Release commit `ae79ebc`
> Summarizes the final production audit. This is a documentation-only release note — no code changes.

MedCrux Pharmacology is the flagship study module of MedCrux: a fast, exam-focused
pharmacology revision library for MBBS students, now at complete high-yield coverage
across all nine topics with drug detail pages, viva questions, MCQs, flashcards, an
exam mode, and a spaced-revision **Mistake Intelligence** layer.

---

## 1. Module

| | |
|---|---|
| **Module name** | MedCrux Pharmacology |
| **Release status** | Production Ready |
| **Environment** | Production (`medcrux.vercel.app`) |
| **Release commit** | `ae79ebc` |

---

## 2. Content totals

| Metric | Count |
|---|---|
| Drugs | **114** |
| General Pharmacology concepts | **12** |
| **Total study items** | **126** |
| Validated MCQs | **203** |

---

## 3. Topic-wise coverage

Every topic meets the 12+ high-yield item bar.

| Topic | Items |
|---|---|
| CNS Drugs | 16 |
| Cardiovascular Drugs | 16 |
| Antibiotics | 16 |
| Autonomic Nervous System | 15 |
| Endocrine Pharmacology | 14 |
| Antiviral / Antifungal / Anti-TB | 13 |
| NSAIDs & Analgesics | 12 |
| Autacoids | 12 |
| General Pharmacology | 12 concepts |
| **Total** | **126** |

---

## 4. Features

- **Topic library** — nine pharmacology topics, each with a reference badge.
- **Drug detail pages** — mechanism of action, uses, side effects, contraindications, drug interactions, and a mnemonic per drug.
- **Viva questions** — exam-style oral Q&A on every drug.
- **MCQs** — single-best-answer questions with explanations; correct-answer position is shuffled per question so the answer isn't predictable.
- **Flashcards** — generated from drug and concept data for quick recall.
- **Exam mode** — timed-style MCQ tests by topic or mixed, with scoring.
- **Mistake Intelligence** — after a wrong answer, a "Why did you miss this?" reason selector categorises the error.
- **Wrong Answer Notebook** — every missed question is saved with your answer, the correct answer, topic/drug, difficulty, reason, and revision schedule; retry, mark reviewed, remove, and bookmark actions.
- **Spaced revision** — Day 1 → 3 → 7 → 21 → mastered ladder; a correct review promotes one rung, any wrong answer resets to Day 1.
- **Progress coaching** — most common mistake reason, weakest topic, accuracy by competency, and an actionable coaching line.
- **Dark / light / system theme** — theme-aware across the app.

---

## 5. Verification (final production audit)

All checks performed against the production deployment (`ae79ebc`).

| # | Check | Result |
|---|-------|--------|
| 1 | Duplicate drug-ID validator | ✅ Passed — 114 unique IDs, 0 duplicates |
| 2 | MCQ `answerIndex` validator | ✅ Passed — 203 MCQs, all ≥2 options with in-range answer, no duplicate MCQ IDs |
| 3 | All topic pages render | ✅ All 9 topics return HTTP 200 with correct headings and counts |
| 4 | Exam dropdown includes all 9 topics | ✅ All 9 present (plus "All topics (mixed)") |
| 5 | Wrong Answer Notebook captures mistakes | ✅ Exam wrong answers are captured, scheduled, and rendered in the notebook |
| 6 | Mobile + dark mode | ✅ No horizontal overflow; dark theme verified on key pages (375 px) |
| 7 | Console errors | ✅ None on any page checked |
| 8 | TypeScript typecheck + production build | ✅ Passed |

**Verdict: PASS.**

---

## 6. Copyright & sourcing

- **Original wording** — all notes, explanations, viva answers, and MCQs are written in MedCrux's own simplified wording.
- **Reference-aligned** — content is aligned to standard MBBS references (e.g. K.D. Tripathi section/chapter citations) shown as reference badges.
- **No textbook text copied** — no textbook text, tables, diagrams, or question banks are reproduced. References are citations/pointers only; students should consult the original textbook for complete reading.

---

*Not medical advice — for study use only.*

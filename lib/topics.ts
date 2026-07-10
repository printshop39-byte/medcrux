import { Topic } from "./types";

export const TOPICS: Topic[] = [
  {
    slug: "general-pharmacology",
    title: "General Pharmacology",
    description: "Pharmacokinetics, pharmacodynamics, receptors, ADR, prescription writing.",
    icon: "🧪",
    order: 1,
    reference: "Sec 1 · Ch 1–6 · p.1",
  },
  {
    slug: "autonomic-nervous-system",
    title: "Autonomic Nervous System",
    description: "Cholinergics, anticholinergics, adrenergic agonists, alpha & beta blockers.",
    icon: "⚡",
    order: 2,
    reference: "Sec 2 · Ch 7–10 · p.92",
  },
  {
    slug: "cardiovascular-drugs",
    title: "Cardiovascular Drugs",
    description: "Antihypertensives, diuretics, antianginals, antiarrhythmics, heart failure.",
    icon: "❤️",
    order: 3,
    reference: "Sec 8 · Ch 36–40 · p.492",
  },
  {
    slug: "cns-drugs",
    title: "CNS Drugs",
    description: "Sedatives, benzodiazepines, antidepressants, antipsychotics, opioids, anesthetics.",
    icon: "🧠",
    order: 4,
    reference: "Sec 7 · Ch 27–35 · p.372",
  },
  {
    slug: "antibiotics",
    title: "Antibiotics",
    description: "Penicillins, cephalosporins, macrolides, aminoglycosides, quinolones, and more.",
    icon: "🦠",
    order: 5,
    reference: "Sec 12 · Ch 49–54 · p.688",
  },
  {
    slug: "antimicrobials",
    title: "Antiviral / Antifungal / Anti-TB",
    description: "Antivirals, antifungals and antitubercular drugs.",
    icon: "🧬",
    order: 6,
    reference: "Sec 12 · Ch 55–61 · p.765",
  },
  {
    slug: "endocrine-pharmacology",
    title: "Endocrine Pharmacology",
    description: "Insulin, oral antidiabetics, thyroid drugs, corticosteroids.",
    icon: "🩸",
    order: 7,
    reference: "Sec 5 · Ch 17–24 · p.234",
  },
  {
    slug: "nsaids-analgesics",
    title: "NSAIDs & Analgesics",
    description: "Aspirin, ibuprofen, diclofenac, paracetamol, opioids.",
    icon: "💊",
    order: 8,
    reference: "Ch 14–15, 34 · p.192",
  },
  {
    slug: "autacoids",
    title: "Autacoids",
    description: "Histamine, antihistamines, 5-HT, prostaglandins and related mediators.",
    icon: "🔬",
    order: 9,
    reference: "Sec 3 · Ch 11–13 · p.159",
  },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

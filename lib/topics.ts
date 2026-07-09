import { Topic } from "./types";

export const TOPICS: Topic[] = [
  {
    slug: "general-pharmacology",
    title: "General Pharmacology",
    description: "Pharmacokinetics, pharmacodynamics, receptors, ADR, prescription writing.",
    icon: "🧪",
    order: 1,
  },
  {
    slug: "autonomic-nervous-system",
    title: "Autonomic Nervous System",
    description: "Cholinergics, anticholinergics, adrenergic agonists, alpha & beta blockers.",
    icon: "⚡",
    order: 2,
  },
  {
    slug: "cardiovascular-drugs",
    title: "Cardiovascular Drugs",
    description: "Antihypertensives, diuretics, antianginals, antiarrhythmics, heart failure.",
    icon: "❤️",
    order: 3,
  },
  {
    slug: "cns-drugs",
    title: "CNS Drugs",
    description: "Sedatives, benzodiazepines, antidepressants, antipsychotics, opioids, anesthetics.",
    icon: "🧠",
    order: 4,
  },
  {
    slug: "antibiotics",
    title: "Antibiotics",
    description: "Penicillins, cephalosporins, macrolides, aminoglycosides, quinolones, and more.",
    icon: "🦠",
    order: 5,
  },
  {
    slug: "antimicrobials",
    title: "Antiviral / Antifungal / Anti-TB",
    description: "Antivirals, antifungals and antitubercular drugs.",
    icon: "🧬",
    order: 6,
  },
  {
    slug: "endocrine-pharmacology",
    title: "Endocrine Pharmacology",
    description: "Insulin, oral antidiabetics, thyroid drugs, corticosteroids.",
    icon: "🩸",
    order: 7,
  },
  {
    slug: "nsaids-analgesics",
    title: "NSAIDs & Analgesics",
    description: "Aspirin, ibuprofen, diclofenac, paracetamol, opioids.",
    icon: "💊",
    order: 8,
  },
  {
    slug: "autacoids",
    title: "Autacoids",
    description: "Histamine, antihistamines, 5-HT, prostaglandins and related mediators.",
    icon: "🔬",
    order: 9,
  },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

import { Concept } from "./types";

// General Pharmacology concept cards. Each is exam-focused: definition, a short
// answer you can write in the paper, a viva Q&A, one simple example, mnemonic.
export const CONCEPTS: Concept[] = [
  {
    id: "pharmacokinetics",
    title: "Pharmacokinetics",
    definition: "What the body does to a drug — Absorption, Distribution, Metabolism, Excretion (ADME).",
    examAnswer:
      "Pharmacokinetics describes drug movement through the body via four processes: Absorption (entry into blood), Distribution (to tissues), Metabolism (biotransformation, mainly hepatic), and Excretion (removal, mainly renal). It determines the concentration of drug at its site of action over time.",
    viva: {
      q: "What is the difference between pharmacokinetics and pharmacodynamics?",
      a: "Pharmacokinetics = what the body does to the drug (ADME); pharmacodynamics = what the drug does to the body (mechanism & effect).",
    },
    example: "Oral paracetamol is absorbed from the gut, distributed to tissues, metabolised in the liver, and excreted by the kidney.",
    mnemonic: "ADME — “A Drug's Metabolic Expedition.”",
  },
  {
    id: "pharmacodynamics",
    title: "Pharmacodynamics",
    definition: "What the drug does to the body — mechanism of action, receptor binding, and dose–response.",
    examAnswer:
      "Pharmacodynamics is the study of the biochemical and physiological effects of drugs and their mechanism of action. It includes receptor binding (agonist/antagonist), signal transduction, and the dose–response relationship (potency and efficacy).",
    viva: {
      q: "Define agonist and antagonist.",
      a: "An agonist binds a receptor and produces a response; an antagonist binds but produces no response and blocks the agonist.",
    },
    example: "Salbutamol (agonist) activates β2 receptors to cause bronchodilation.",
    mnemonic: "“Dynamics = Drug's action” (both start with D).",
  },
  {
    id: "bioavailability",
    title: "Bioavailability (F)",
    definition: "The fraction of an administered dose that reaches the systemic circulation in active form.",
    examAnswer:
      "Bioavailability (F) is the fraction of unchanged drug reaching systemic circulation. IV drugs have F = 100% (by definition). Oral bioavailability is reduced by incomplete absorption and first-pass hepatic metabolism.",
    viva: {
      q: "Why is oral bioavailability of some drugs low?",
      a: "Because of first-pass metabolism in the gut wall and liver before the drug reaches systemic circulation.",
    },
    example: "IV drug F = 1 (100%); oral morphine has low F (~25%) due to high first-pass metabolism.",
    mnemonic: "“F for Fraction that Finds the blood.”",
  },
  {
    id: "half-life",
    title: "Half-life (t½)",
    definition: "The time taken for the plasma concentration of a drug to fall to half its original value.",
    examAnswer:
      "Half-life (t½) is the time for plasma drug concentration to reduce by 50%. It determines dosing frequency and time to steady state (~4–5 half-lives) and time to complete elimination (~4–5 half-lives).",
    viva: {
      q: "How many half-lives are needed to reach steady state?",
      a: "Approximately 4–5 half-lives (about 94–97% of steady state).",
    },
    example: "A drug with t½ = 4 h given repeatedly reaches steady state in ~16–20 h.",
    mnemonic: "“4–5 halves to steady the ship.”",
  },
  {
    id: "volume-of-distribution",
    title: "Volume of Distribution (Vd)",
    definition: "The apparent volume into which a drug distributes to give the observed plasma concentration.",
    examAnswer:
      "Vd = Total amount of drug in body ÷ Plasma concentration. A high Vd means extensive tissue distribution (lipid-soluble drugs); a low Vd means the drug stays in plasma (water-soluble, protein-bound drugs).",
    viva: {
      q: "What does a high volume of distribution indicate?",
      a: "That the drug is widely distributed into tissues (usually lipophilic), leaving little in the plasma.",
    },
    example: "Digoxin has a very high Vd (~500 L); warfarin has a low Vd (highly plasma-protein bound).",
    mnemonic: "“Vd = Dose ÷ Concentration.”",
  },
  {
    id: "clearance",
    title: "Clearance (CL)",
    definition: "The volume of plasma completely cleared of a drug per unit time.",
    examAnswer:
      "Clearance is the volume of plasma from which the drug is completely removed per unit time (mL/min). Total clearance = hepatic + renal clearance. It governs the maintenance dose needed to keep a steady-state concentration.",
    viva: {
      q: "How are clearance, half-life and Vd related?",
      a: "t½ = (0.693 × Vd) ÷ CL. Half-life rises if Vd increases or clearance decreases.",
    },
    example: "In renal failure, clearance of gentamicin falls, so the dose must be reduced.",
    mnemonic: "“Clearance Cleans the plasma per minute.”",
  },
  {
    id: "therapeutic-index",
    title: "Therapeutic Index (TI)",
    definition: "The ratio between the toxic dose and the therapeutic (effective) dose of a drug — a measure of safety.",
    examAnswer:
      "Therapeutic Index = TD50 ÷ ED50 (or LD50 ÷ ED50). A high TI means a wide safety margin; a low (narrow) TI means small dose changes can cause toxicity, requiring drug-level monitoring.",
    viva: {
      q: "Name two drugs with a narrow therapeutic index.",
      a: "Digoxin, warfarin, phenytoin, lithium, theophylline, aminoglycosides.",
    },
    example: "Digoxin has a narrow TI, so plasma levels must be monitored.",
    mnemonic: "“Narrow TI drugs: Digoxin, Warfarin, Phenytoin, Lithium, Theophylline — monitor them!”",
  },
  {
    id: "drug-tolerance",
    title: "Drug Tolerance",
    definition: "A decreased response to a drug after repeated administration, requiring a higher dose for the same effect.",
    examAnswer:
      "Tolerance is a reduction in drug effect with repeated use, needing higher doses to achieve the original response. Tachyphylaxis is rapidly developing tolerance after only a few doses.",
    viva: {
      q: "What is tachyphylaxis?",
      a: "Rapid development of tolerance over a short time / few doses (e.g., ephedrine, nitrates).",
    },
    example: "Repeated use of nitrates causes tolerance; a nitrate-free interval restores response.",
    mnemonic: "“Tolerance = need To take mORE.”",
  },
  {
    id: "drug-dependence",
    title: "Drug Dependence",
    definition: "A state where continued drug use is needed to prevent withdrawal (physical) or for psychological reward.",
    examAnswer:
      "Dependence is a compulsion to take a drug. Physical dependence produces a withdrawal syndrome on stopping; psychological dependence is a craving for the drug's rewarding effect. Both often coexist in addiction.",
    viva: {
      q: "Difference between tolerance and dependence?",
      a: "Tolerance = reduced effect needing higher dose; dependence = need to keep taking the drug to feel normal / avoid withdrawal.",
    },
    example: "Sudden stopping of morphine or benzodiazepines causes a withdrawal syndrome.",
    mnemonic: "“Dependence = Drug needed Daily.”",
  },
  {
    id: "adverse-drug-reactions",
    title: "Adverse Drug Reactions (ADR)",
    definition: "Any harmful, unintended response to a drug at normal therapeutic doses.",
    examAnswer:
      "An ADR is any noxious, unintended effect at normal doses. Type A (Augmented) are dose-dependent, predictable extensions of pharmacology (e.g., hypoglycaemia with insulin). Type B (Bizarre) are dose-independent and unpredictable (e.g., penicillin anaphylaxis).",
    viva: {
      q: "Classify adverse drug reactions.",
      a: "Type A (augmented, dose-related, predictable) and Type B (bizarre, non-dose-related, idiosyncratic/allergic).",
    },
    example: "Type A: bleeding with warfarin. Type B: anaphylaxis to penicillin.",
    mnemonic: "“A = Augmented (dose), B = Bizarre (allergy).”",
  },
  {
    id: "cyp450-interactions",
    title: "CYP450 Enzyme Interactions",
    definition: "Drug interactions caused by induction or inhibition of hepatic cytochrome P450 metabolising enzymes.",
    examAnswer:
      "CYP450 enzymes metabolise most drugs. Inducers increase enzyme activity → faster metabolism → reduced drug levels/effect. Inhibitors decrease activity → slower metabolism → increased levels/toxicity. This underlies many clinically important drug interactions.",
    viva: {
      q: "Give one enzyme inducer and one inhibitor.",
      a: "Inducer: rifampicin (also phenytoin, carbamazepine). Inhibitor: erythromycin (also ketoconazole, cimetidine, grapefruit juice).",
    },
    example: "Rifampicin (inducer) reduces the effect of oral contraceptives; erythromycin (inhibitor) raises warfarin levels.",
    mnemonic: "Inducers “CRAP-GPS”: Carbamazepine, Rifampicin, Alcohol(chronic), Phenytoin, Griseofulvin, Phenobarbitone, Sulfonylureas. Inhibitors “CRACKED-CVG”: Cimetidine, Ciprofloxacin, Erythromycin, Ketoconazole, Grapefruit, Valproate.",
  },
  {
    id: "prescription-writing",
    title: "Prescription Writing Basics",
    definition: "The rules and standard parts of a valid prescription (рецепт).",
    examAnswer:
      "A prescription has: (1) prescriber & patient details and date (superscription), (2) Rp. — the drug, strength and quantity (inscription), (3) dosage form & number to dispense — D.t.d. (subscription), and (4) S. — Signa, the directions for the patient. It ends with the doctor's signature.",
    viva: {
      q: "What do 'Rp.', 'D.t.d.' and 'S.' mean in a prescription?",
      a: "Rp. (recipe) = 'take'; D.t.d. (da tales doses) = 'give such doses' (number to dispense); S. (Signa) = 'label/directions' for the patient.",
    },
    example:
      "Rp.: Tab. Paracetamoli 500 mg\nD.t.d. N. 10\nS. 1 tablet three times a day after food.",
    mnemonic: "Order: “Rp → D.t.d → S” (Drug → Dispense → Directions).",
  },
];

export function getConcept(id: string): Concept | undefined {
  return CONCEPTS.find((c) => c.id === id);
}

import type { MCQ } from "./types";
import { validateMCQs as validateSubjectMCQs, type MCQProblem } from "./mcq-validate";

// ── Pathology module (self-contained subject, same pattern as Microbiology) ───
// Indian reference: Harsh Mohan — Textbook of Pathology. Content is written from
// scratch in our own words (concept mapping only) — NOT copied from the book.
//
// NOTE: we don't yet have the student's Russian university Pathology lecture PDFs
// (the uploaded PDFs are Microbiology only), so `lectureRef` is optional and left
// undefined here. The pages show the Indian-reference badge and a "syllabus PDF
// pending" hint; once Pathology lectures arrive we tag each topic like Micro.

export interface PathFlashcard {
  front: string;
  back: string;
}

export interface PathTopic {
  slug: string; // namespaced "path-*" — never collides with pharma/micro slugs
  title: string;
  icon: string;
  order: number;
  summary: string;
  lectureRef?: string; // set only when matched to an actual uploaded lecture PDF
  syllabusRef?: string; // standard Russian MBBS Pathology discipline/module (generic, honest)
  bookRef: string; // Indian reference pointer (Harsh Mohan)
  importantForExam: boolean;
  easyNotes: string[];
  keyPoints: string[];
  diagram: string;
  mnemonic?: string;
  viva: { q: string; a: string }[];
  mcqs: MCQ[];
  flashcards: PathFlashcard[];
}

export const PATH_TOPICS: PathTopic[] = [
  // 1 ───────────────────────────────────────────────────────────────────────
  {
    slug: "path-introduction",
    title: "Introduction to Pathology",
    icon: "🔬",
    order: 1,
    summary: "What pathology is, its four aspects, and the branches & techniques used to study disease.",
    syllabusRef: "Патологическая анатомия — Введение, методы (Intro & methods)",
    bookRef: "Harsh Mohan — Ch. 1 (Introduction to Pathology)",
    importantForExam: true,
    easyNotes: [
      "Pathology = the study of DISEASE — what causes it, how it develops, and the changes it produces in cells, tissues and organs.",
      "Four aspects of any disease (learn these): 1) ETIOLOGY = the cause. 2) PATHOGENESIS = the mechanism of how it develops. 3) MORPHOLOGY = the structural changes (gross + microscopic). 4) FUNCTIONAL changes / clinical significance.",
      "Etiology has two groups: genetic (inherited) and acquired (infections, chemicals, physical agents, nutrition, etc.).",
      "Main branches: Histopathology (tissues), Cytopathology (cells, e.g. Pap smear), Haematology (blood), Clinical pathology/Biochemistry, Microbiology, Immunopathology, and Molecular pathology.",
      "Common tools: the microscope, H&E staining, special stains, immunohistochemistry (IHC), and autopsy.",
    ],
    keyPoints: [
      "The four pillars of disease: Etiology → Pathogenesis → Morphology → Functional/Clinical effects.",
      "Etiology = CAUSE; pathogenesis = MECHANISM. Don't mix them up (classic viva trap).",
      "Biopsy = tissue removed from a living patient for diagnosis; autopsy = post-mortem examination.",
      "H&E (haematoxylin & eosin) is the routine stain: haematoxylin → blue nuclei, eosin → pink cytoplasm.",
    ],
    diagram:
      "DISEASE = 4 questions\n 1. ETIOLOGY ...... what caused it?  (genetic | acquired)\n 2. PATHOGENESIS .. how did it develop?\n 3. MORPHOLOGY .... what does it look like? (gross + microscopic)\n 4. FUNCTION ...... what does it do to the patient? (signs/symptoms)",
    mnemonic: "Disease study order → 'Every Pathologist Must Focus' = Etiology, Pathogenesis, Morphology, Functional change.",
    viva: [
      { q: "Define pathology.", a: "Pathology is the scientific study of disease — its causes (etiology), mechanisms (pathogenesis), and the structural and functional changes it produces in cells, tissues and organs." },
      { q: "Differentiate etiology and pathogenesis.", a: "Etiology is the cause of a disease; pathogenesis is the sequence of events / mechanism by which that cause leads to the disease." },
      { q: "What is the difference between a biopsy and an autopsy?", a: "A biopsy is removal of tissue from a living patient for diagnosis; an autopsy (necropsy) is examination of a body after death to determine the cause and nature of disease." },
    ],
    mcqs: [
      {
        id: "path-intro-1",
        question: "The cause of a disease is referred to as its:",
        options: ["Pathogenesis", "Etiology", "Morphology", "Prognosis"],
        answerIndex: 1,
        explanation: "Etiology is the cause of a disease; pathogenesis is the mechanism by which that cause produces disease.",
      },
      {
        id: "path-intro-2",
        question: "The mechanism by which an etiologic agent produces disease is called:",
        options: ["Etiology", "Pathogenesis", "Epidemiology", "Diagnosis"],
        answerIndex: 1,
        explanation: "Pathogenesis is the sequence of cellular and molecular events from the initial stimulus to the final disease.",
      },
      {
        id: "path-intro-3",
        question: "Examination of tissue removed from a living patient for diagnosis is a:",
        options: ["Autopsy", "Biopsy", "Necropsy", "Culture"],
        answerIndex: 1,
        explanation: "A biopsy samples tissue from a living patient; autopsy/necropsy is a post-mortem examination.",
      },
    ],
    flashcards: [
      { front: "Four aspects of disease?", back: "Etiology (cause), Pathogenesis (mechanism), Morphology (structural change), Functional/clinical effects." },
      { front: "Etiology vs pathogenesis?", back: "Etiology = the cause; pathogenesis = how the cause leads to disease." },
      { front: "What does H&E stain show?", back: "Haematoxylin → blue/purple nuclei; Eosin → pink cytoplasm." },
    ],
  },

  // 2 ───────────────────────────────────────────────────────────────────────
  {
    slug: "path-cell-injury",
    title: "Cell Injury & Adaptation",
    icon: "🧫",
    order: 2,
    summary: "How cells adapt to stress, reversible vs irreversible injury, and the two patterns of cell death.",
    syllabusRef: "Патологическая анатомия — Повреждение клетки: дистрофии, некроз, апоптоз (Cell injury & death)",
    bookRef: "Harsh Mohan — Cell Injury & Cellular Adaptations",
    importantForExam: true,
    easyNotes: [
      "When cells face stress they first ADAPT. Adaptations: Atrophy (shrink), Hypertrophy (bigger cells), Hyperplasia (more cells), Metaplasia (one mature cell type → another), and Dysplasia (disordered growth — pre-cancer).",
      "If stress exceeds adaptation, the cell is INJURED. Reversible injury = cell can recover (cloudy/hydropic swelling, fatty change). Irreversible injury = cell dies.",
      "Common causes of injury: HYPOXIA (lack of oxygen — the commonest), ischaemia, physical/chemical agents, infections, immune reactions, genetic and nutritional problems.",
      "Cell death has TWO patterns. NECROSIS = uncontrolled death of many cells after injury, with inflammation (cell swells and bursts). APOPTOSIS = programmed, controlled 'suicide' of single cells, NO inflammation (cell shrinks into fragments).",
      "Types of necrosis: coagulative (most organs, e.g. heart infarct), liquefactive (brain, abscess), caseous (TB — 'cheesy'), fat necrosis (pancreas), and fibrinoid (blood vessels).",
      "Irreversible injury markers: severe mitochondrial damage, membrane rupture, and nuclear changes — pyknosis (shrink), karyorrhexis (fragment), karyolysis (fade).",
    ],
    keyPoints: [
      "Hypoxia/ischaemia is the most common cause of cell injury.",
      "Reversible injury: cell swelling (hydropic change) + fatty change. Irreversible: cell death.",
      "Necrosis = pathological, inflammation +, cells swell; Apoptosis = programmed, inflammation −, cells shrink.",
      "Caseous necrosis → think TUBERCULOSIS; liquefactive → BRAIN & abscess; coagulative → most solid organs.",
      "Nuclear signs of death: pyknosis → karyorrhexis → karyolysis.",
    ],
    diagram:
      "STRESS on cell\n └─ ADAPT → Atrophy · Hypertrophy · Hyperplasia · Metaplasia · Dysplasia\n      └─ too much → INJURY\n           ├─ Reversible (swelling, fatty change)\n           └─ Irreversible → CELL DEATH\n                ├─ NECROSIS (many cells, inflammation +, swell/burst)\n                │    coagulative·liquefactive·caseous·fat·fibrinoid\n                └─ APOPTOSIS (single cell, inflammation −, shrink)",
    mnemonic: "Necrosis vs apoptosis → 'Necrosis = Nasty & Numerous (swells, inflames); Apoptosis = A programmed Adieu (shrinks, silent).'",
    viva: [
      { q: "What is the difference between necrosis and apoptosis?", a: "Necrosis is uncontrolled death of groups of cells after injury — cells swell and rupture and provoke inflammation. Apoptosis is programmed, energy-dependent death of single cells — cells shrink into apoptotic bodies and do NOT cause inflammation." },
      { q: "Name the types of necrosis and give an example of each.", a: "Coagulative (heart/kidney infarct), liquefactive (brain infarct, abscess), caseous (tuberculosis), fat necrosis (acute pancreatitis), and fibrinoid necrosis (immune vascular damage)." },
      { q: "What is metaplasia? Give an example.", a: "Metaplasia is a reversible change in which one differentiated cell type is replaced by another — e.g. respiratory columnar epithelium → squamous epithelium in a smoker's bronchus." },
      { q: "Which type of necrosis is characteristic of tuberculosis?", a: "Caseous necrosis — a soft, 'cheese-like' area within a granuloma." },
    ],
    mcqs: [
      {
        id: "path-ci-1",
        question: "The most common cause of cell injury is:",
        options: ["Genetic defects", "Hypoxia / ischaemia", "Radiation", "Nutritional excess"],
        answerIndex: 1,
        explanation: "Hypoxia and ischaemia (lack of oxygen/blood supply) are the commonest causes of cell injury.",
      },
      {
        id: "path-ci-2",
        question: "Which feature best distinguishes apoptosis from necrosis?",
        options: [
          "Apoptosis affects many cells at once",
          "Apoptosis causes marked inflammation",
          "Apoptosis is programmed and does not incite inflammation",
          "Apoptosis is always pathological",
        ],
        answerIndex: 2,
        explanation: "Apoptosis is programmed single-cell death without inflammation; necrosis affects groups of cells and triggers inflammation.",
      },
      {
        id: "path-ci-3",
        question: "Caseous necrosis is most characteristically seen in:",
        options: ["Myocardial infarction", "Tuberculosis", "Brain infarction", "Acute pancreatitis"],
        answerIndex: 1,
        explanation: "Caseous ('cheese-like') necrosis is the hallmark of tuberculosis. Coagulative → MI, liquefactive → brain, fat necrosis → pancreatitis.",
      },
      {
        id: "path-ci-4",
        question: "Replacement of one type of mature epithelium by another is called:",
        options: ["Hyperplasia", "Hypertrophy", "Metaplasia", "Dysplasia"],
        answerIndex: 2,
        explanation: "Metaplasia is the reversible replacement of one differentiated cell type by another (e.g. columnar → squamous in a smoker's airway).",
      },
    ],
    flashcards: [
      { front: "Necrosis vs apoptosis — inflammation?", back: "Necrosis → inflammation present (cells swell/burst). Apoptosis → no inflammation (cells shrink, programmed)." },
      { front: "Caseous necrosis → which disease?", back: "Tuberculosis." },
      { front: "5 cellular adaptations?", back: "Atrophy, Hypertrophy, Hyperplasia, Metaplasia, Dysplasia." },
      { front: "Liquefactive necrosis — where?", back: "Brain infarcts and abscesses (pus)." },
    ],
  },

  // 3 ───────────────────────────────────────────────────────────────────────
  {
    slug: "path-acute-inflammation",
    title: "Acute Inflammation",
    icon: "🔥",
    order: 3,
    summary: "The body's rapid response to injury — vascular and cellular events, mediators, and the cardinal signs.",
    syllabusRef: "Патологическая анатомия — Воспаление (экссудативное) (Inflammation)",
    bookRef: "Harsh Mohan — Inflammation & Healing (Acute)",
    importantForExam: true,
    easyNotes: [
      "Inflammation = the body's protective response to injury/infection that brings defence cells and fluid to the site. Acute = fast (minutes–days), short-lived; the main cell is the NEUTROPHIL.",
      "5 cardinal signs: Rubor (redness), Calor (heat), Tumor (swelling), Dolor (pain), and Functio laesa (loss of function).",
      "Two components: (1) VASCULAR events — brief vasoconstriction, then vasodilation (redness/heat) and increased permeability → fluid leaks out = EXUDATE (causes swelling). (2) CELLULAR events — neutrophils leave vessels and reach the site.",
      "Neutrophil steps (leukocyte extravasation): margination → rolling → adhesion → transmigration (diapedesis) → chemotaxis → phagocytosis.",
      "Chemical mediators drive it: histamine (early vasodilation & permeability), prostaglandins (pain, fever), leukotrienes, bradykinin (pain), complement (C3a, C5a), cytokines (TNF, IL-1), and nitric oxide.",
      "Exudate (inflammatory, high protein, high specific gravity) vs Transudate (non-inflammatory, low protein — e.g. heart failure) — a favourite exam comparison.",
    ],
    keyPoints: [
      "Acute inflammation → predominant cell is the NEUTROPHIL; it is rapid and short-lived.",
      "5 cardinal signs: redness, heat, swelling, pain, loss of function (rubor, calor, tumor, dolor, functio laesa).",
      "Increased vascular permeability → protein-rich EXUDATE (swelling).",
      "Leukocyte sequence: margination → rolling → adhesion → transmigration → chemotaxis → phagocytosis.",
      "Histamine = earliest mediator of vasodilation & increased permeability.",
      "Exudate = high protein/high SG (inflammatory); transudate = low protein (non-inflammatory).",
    ],
    diagram:
      "INJURY → ACUTE INFLAMMATION\n VASCULAR: transient vasoconstriction → vasodilation (redness/heat)\n          → ↑ permeability → EXUDATE (swelling)\n CELLULAR: Margination → Rolling → Adhesion → Transmigration\n          → Chemotaxis → PHAGOCYTOSIS (neutrophils)\n MEDIATORS: histamine · prostaglandins · leukotrienes · bradykinin · C3a/C5a · TNF/IL-1",
    mnemonic: "Neutrophil journey → 'My Rolling Army Trucks Cross Paths' = Margination, Rolling, Adhesion, Transmigration, Chemotaxis, Phagocytosis.",
    viva: [
      { q: "Name the five cardinal signs of acute inflammation.", a: "Rubor (redness), Calor (heat), Tumor (swelling), Dolor (pain), and Functio laesa (loss of function)." },
      { q: "Which is the predominant cell of acute inflammation?", a: "The neutrophil (polymorphonuclear leukocyte)." },
      { q: "Differentiate exudate from transudate.", a: "Exudate is an inflammatory fluid with high protein content and high specific gravity (>1.020) due to increased vascular permeability; transudate is a non-inflammatory fluid with low protein and low specific gravity, caused by altered hydrostatic/osmotic pressure (e.g. heart failure)." },
      { q: "Name the steps of leukocyte extravasation.", a: "Margination, rolling, adhesion, transmigration (diapedesis), chemotaxis, and phagocytosis." },
    ],
    mcqs: [
      {
        id: "path-ai-1",
        question: "The predominant inflammatory cell in acute inflammation is the:",
        options: ["Lymphocyte", "Neutrophil", "Plasma cell", "Macrophage"],
        answerIndex: 1,
        explanation: "Neutrophils dominate acute inflammation; lymphocytes/plasma cells/macrophages dominate chronic inflammation.",
      },
      {
        id: "path-ai-2",
        question: "Which of the following is NOT one of the five cardinal signs of inflammation?",
        options: ["Redness (rubor)", "Heat (calor)", "Pallor", "Pain (dolor)"],
        answerIndex: 2,
        explanation: "The cardinal signs are rubor, calor, tumor, dolor and functio laesa. Pallor (paleness) is not among them.",
      },
      {
        id: "path-ai-3",
        question: "An inflammatory fluid with high protein content and high specific gravity is a(n):",
        options: ["Transudate", "Exudate", "Lymph", "Serum"],
        answerIndex: 1,
        explanation: "Exudate is protein-rich with high specific gravity, formed by increased vascular permeability; transudate is protein-poor.",
      },
      {
        id: "path-ai-4",
        question: "The earliest chemical mediator causing vasodilation and increased permeability is:",
        options: ["Histamine", "Bradykinin", "Interferon", "Collagen"],
        answerIndex: 0,
        explanation: "Histamine (released mainly from mast cells) is the earliest mediator of vasodilation and increased vascular permeability.",
      },
    ],
    flashcards: [
      { front: "5 cardinal signs of inflammation?", back: "Rubor (redness), Calor (heat), Tumor (swelling), Dolor (pain), Functio laesa (loss of function)." },
      { front: "Main cell of acute inflammation?", back: "Neutrophil." },
      { front: "Exudate vs transudate?", back: "Exudate = high protein, high SG, inflammatory. Transudate = low protein, low SG, non-inflammatory (e.g. CHF)." },
      { front: "Earliest mediator of vasodilation/permeability?", back: "Histamine (from mast cells)." },
    ],
  },

  // 4 ───────────────────────────────────────────────────────────────────────
  {
    slug: "path-chronic-inflammation",
    title: "Chronic Inflammation & Granuloma",
    icon: "🧱",
    order: 4,
    summary: "Long-standing inflammation, its cells, and granulomatous diseases like tuberculosis.",
    syllabusRef: "Патологическая анатомия — Продуктивное (гранулематозное) воспаление (Chronic/granulomatous)",
    bookRef: "Harsh Mohan — Inflammation & Healing (Chronic)",
    importantForExam: true,
    easyNotes: [
      "Chronic inflammation = inflammation of long duration (weeks–years) where active inflammation, tissue destruction and healing happen at the same time.",
      "Main cells: MACROPHAGES (the key cell), lymphocytes and plasma cells — NOT neutrophils. Often causes fibrosis (scarring).",
      "Causes: persistent infection (TB, leprosy, syphilis), prolonged exposure to toxins (silica), and autoimmune diseases (rheumatoid arthritis).",
      "GRANULOMATOUS inflammation is a special pattern: a GRANULOMA = a tiny nodular collection of activated macrophages called EPITHELIOID cells, often with multinucleated GIANT cells (e.g. Langhans giant cells) and a rim of lymphocytes.",
      "Classic granulomatous diseases: tuberculosis (caseating granuloma), leprosy, sarcoidosis (non-caseating), syphilis (gumma), and fungal infections.",
      "TB granuloma = 'tubercle' = central caseous necrosis + epithelioid cells + Langhans giant cells + lymphocytes.",
    ],
    keyPoints: [
      "Chronic inflammation cells: macrophages (chief), lymphocytes, plasma cells — mononuclear.",
      "Granuloma = focal aggregate of epithelioid macrophages ± giant cells + lymphocyte rim.",
      "Epithelioid cells = activated macrophages (look like epithelium).",
      "TB → caseating granuloma with Langhans giant cells; sarcoidosis → non-caseating granuloma.",
      "Chronic inflammation heals by fibrosis (scarring).",
    ],
    diagram:
      "CHRONIC INFLAMMATION (weeks–years)\n Cells: MACROPHAGES + lymphocytes + plasma cells (mononuclear)\n Outcome: tissue destruction + fibrosis (scar)\n\n GRANULOMA =\n   [ central caseous necrosis (TB) ]\n   surrounded by EPITHELIOID cells + Langhans GIANT cells\n   + rim of lymphocytes",
    mnemonic: "Chronic cells = 'MLP' → Macrophages, Lymphocytes, Plasma cells. Granuloma → 'Epithelioid + Giant = the granuloma engine.'",
    viva: [
      { q: "Which cell is the hallmark of chronic inflammation?", a: "The macrophage (activated tissue macrophages), along with lymphocytes and plasma cells." },
      { q: "Define a granuloma.", a: "A granuloma is a small focal aggregate of activated (epithelioid) macrophages, usually surrounded by a rim of lymphocytes and often containing multinucleated giant cells." },
      { q: "What are epithelioid cells?", a: "Epithelioid cells are activated macrophages that resemble epithelial cells, with abundant pink cytoplasm; they are the building block of a granuloma." },
      { q: "Differentiate the granuloma of tuberculosis from that of sarcoidosis.", a: "Tuberculous granulomas show central caseous necrosis; sarcoid granulomas are typically non-caseating (no central necrosis)." },
    ],
    mcqs: [
      {
        id: "path-cinf-1",
        question: "The predominant cell type of chronic inflammation is the:",
        options: ["Neutrophil", "Macrophage", "Eosinophil", "Basophil"],
        answerIndex: 1,
        explanation: "Chronic inflammation is dominated by macrophages together with lymphocytes and plasma cells.",
      },
      {
        id: "path-cinf-2",
        question: "Epithelioid cells found in a granuloma are derived from:",
        options: ["Fibroblasts", "Activated macrophages", "Neutrophils", "Endothelial cells"],
        answerIndex: 1,
        explanation: "Epithelioid cells are activated macrophages with abundant cytoplasm — the core cell of a granuloma.",
      },
      {
        id: "path-cinf-3",
        question: "A caseating granuloma is most characteristic of:",
        options: ["Sarcoidosis", "Tuberculosis", "Rheumatoid nodule", "Foreign body reaction"],
        answerIndex: 1,
        explanation: "Central caseous necrosis within a granuloma is characteristic of tuberculosis; sarcoid granulomas are non-caseating.",
      },
      {
        id: "path-cinf-4",
        question: "The multinucleated giant cell classically seen in tuberculosis is the:",
        options: ["Foreign body giant cell", "Langhans giant cell", "Touton giant cell", "Reed-Sternberg cell"],
        answerIndex: 1,
        explanation: "Langhans giant cells (nuclei arranged peripherally in a horseshoe) are typical of tuberculous granulomas.",
      },
    ],
    flashcards: [
      { front: "Cells of chronic inflammation?", back: "Macrophages (chief), lymphocytes, plasma cells — mononuclear cells." },
      { front: "What is a granuloma?", back: "Focal collection of epithelioid macrophages ± giant cells, ringed by lymphocytes." },
      { front: "Caseating vs non-caseating granuloma?", back: "Caseating → TB. Non-caseating → sarcoidosis." },
      { front: "Giant cell of TB?", back: "Langhans giant cell (peripheral horseshoe nuclei)." },
    ],
  },

  // 5 ───────────────────────────────────────────────────────────────────────
  {
    slug: "path-tissue-repair",
    title: "Tissue Repair & Wound Healing",
    icon: "🩹",
    order: 5,
    summary: "How damaged tissue is restored — regeneration vs repair, healing of wounds, and what slows it down.",
    syllabusRef: "Патологическая анатомия — Компенсаторно-приспособительные процессы: регенерация, репарация (Repair)",
    bookRef: "Harsh Mohan — Healing (Repair & Regeneration)",
    importantForExam: true,
    easyNotes: [
      "After injury tissue is restored two ways. REGENERATION = replacement by the same type of cells (perfect, e.g. liver, skin epithelium). REPAIR = replacement by fibrous scar tissue (when cells can't regenerate, e.g. heart, brain).",
      "Cells by regenerating ability: LABILE (always dividing — skin, gut, bone marrow), STABLE (divide when needed — liver, kidney), PERMANENT (can't divide — neurons, cardiac muscle → heal by scar).",
      "GRANULATION TISSUE is the hallmark of repair: new capillaries (angiogenesis) + fibroblasts + collagen — soft, pink, granular tissue that fills the wound.",
      "Skin wound healing: by FIRST intention (primary union) = clean, sutured wound, minimal scar; by SECOND intention (secondary union) = large open wound, more granulation tissue, wound contraction, bigger scar.",
      "Steps: clot/haemostasis → inflammation → granulation tissue & angiogenesis → collagen deposition → remodelling & scar maturation.",
      "Factors that DELAY healing: infection, poor blood supply, diabetes, old age, poor nutrition (vitamin C, protein, zinc deficiency), and steroids.",
    ],
    keyPoints: [
      "Regeneration = same cells (restores function); Repair = fibrous scar (loses specialised function).",
      "Labile / Stable / Permanent cells — permanent cells (neurons, cardiac muscle) heal only by scar.",
      "Granulation tissue = angiogenesis + fibroblasts + collagen (the raw material of a scar).",
      "First intention = clean sutured wound (small scar); second intention = open wound + contraction (big scar).",
      "Vitamin C is essential for collagen synthesis — its deficiency (scurvy) impairs healing.",
      "Local factor most important for healing: adequate blood supply; systemic: nutrition, diabetes control.",
    ],
    diagram:
      "TISSUE RESTORATION\n ├─ REGENERATION → same cell type (labile/stable cells) → full recovery\n └─ REPAIR → fibrous SCAR (permanent cells / big wounds)\n       Clot → Inflammation → GRANULATION TISSUE (angiogenesis+fibroblasts+collagen)\n       → collagen deposition → remodelling → SCAR\n WOUND: 1st intention (clean, sutured, small scar) | 2nd intention (open, contraction, big scar)",
    mnemonic: "Cell renewal → 'Labile Loves dividing, Stable Sometimes, Permanent Passes (scars).'",
    viva: [
      { q: "Differentiate regeneration and repair.", a: "Regeneration replaces lost cells with the same specialised cell type, restoring normal structure and function; repair replaces the loss with fibrous (scar) tissue, which lacks the original specialised function." },
      { q: "Classify cells according to their capacity to regenerate.", a: "Labile cells (continuously dividing — epidermis, GI epithelium, bone marrow), stable cells (divide when stimulated — hepatocytes, renal tubular cells), and permanent cells (non-dividing — neurons, cardiac and skeletal muscle)." },
      { q: "What is granulation tissue?", a: "Granulation tissue is the pink, soft, granular tissue of repair, made of new capillaries (angiogenesis), proliferating fibroblasts, and loose collagen — it fills the wound before scar formation." },
      { q: "Differentiate healing by first and second intention.", a: "First intention (primary union) occurs in clean, apposed wounds (e.g. a sutured surgical incision) with little granulation tissue and a small scar; second intention (secondary union) occurs in large open wounds with abundant granulation tissue, marked wound contraction, and a larger scar." },
    ],
    mcqs: [
      {
        id: "path-tr-1",
        question: "Neurons and cardiac muscle cells are examples of which cell category?",
        options: ["Labile cells", "Stable cells", "Permanent cells", "Stem cells"],
        answerIndex: 2,
        explanation: "Permanent cells (neurons, cardiac and skeletal muscle) cannot divide, so their loss is repaired by scar tissue.",
      },
      {
        id: "path-tr-2",
        question: "Granulation tissue is mainly composed of:",
        options: [
          "Neutrophils and pus",
          "New capillaries, fibroblasts and collagen",
          "Necrotic debris",
          "Mature scar collagen only",
        ],
        answerIndex: 1,
        explanation: "Granulation tissue consists of angiogenic capillaries, proliferating fibroblasts, and new collagen — the substrate of repair.",
      },
      {
        id: "path-tr-3",
        question: "Healing of a clean, sutured surgical incision is an example of:",
        options: ["Healing by second intention", "Healing by first intention", "Regeneration only", "Fibrinoid change"],
        answerIndex: 1,
        explanation: "A clean, apposed, sutured wound heals by first intention (primary union) with minimal scarring.",
      },
      {
        id: "path-tr-4",
        question: "Deficiency of which vitamin most directly impairs wound healing by affecting collagen synthesis?",
        options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"],
        answerIndex: 1,
        explanation: "Vitamin C is required for collagen cross-linking (hydroxylation of proline/lysine); its deficiency (scurvy) impairs healing.",
      },
    ],
    flashcards: [
      { front: "Regeneration vs repair?", back: "Regeneration = same cell type restored. Repair = fibrous scar replaces the loss." },
      { front: "Labile / stable / permanent — examples?", back: "Labile: skin, gut, marrow. Stable: liver, kidney. Permanent: neurons, cardiac muscle (scar only)." },
      { front: "Granulation tissue components?", back: "New capillaries + fibroblasts + collagen." },
      { front: "Vitamin needed for collagen/healing?", back: "Vitamin C (deficiency = scurvy)." },
    ],
  },

  // 6 ───────────────────────────────────────────────────────────────────────
  {
    slug: "path-hemodynamics",
    title: "Hemodynamic Disorders",
    icon: "🩸",
    order: 6,
    summary: "Disorders of blood flow — edema, thrombosis, embolism, infarction and shock.",
    syllabusRef: "Патанатомия / Патофизиология — Нарушения кровообращения: тромбоз, эмболия, инфаркт (Hemodynamics)",
    bookRef: "Harsh Mohan — Hemodynamic Derangements",
    importantForExam: true,
    easyNotes: [
      "EDEMA = excess fluid in tissues/spaces. Causes: raised hydrostatic pressure (heart failure), low plasma protein/oncotic pressure (nephrotic syndrome, liver disease), lymphatic block, and sodium retention.",
      "HYPEREMIA (active, more arterial inflow — red) vs CONGESTION (passive, impaired venous outflow — blue, e.g. 'nutmeg liver' in heart failure).",
      "THROMBOSIS = a solid clot forming INSIDE a living blood vessel. Virchow's TRIAD explains why: 1) Endothelial injury, 2) Abnormal blood flow (stasis/turbulence), 3) Hypercoagulability.",
      "EMBOLISM = a detached mass (embolus) travelling in blood and lodging in a distant vessel. Most emboli are thromboemboli; others: fat, air, amniotic fluid.",
      "INFARCTION = an area of ischaemic necrosis caused by blocked blood supply. Red (haemorrhagic) infarcts in loose/dual-supply organs (lung, intestine); pale (white) infarcts in solid organs (heart, kidney, spleen).",
      "SHOCK = circulatory failure with inadequate tissue perfusion. Types: hypovolaemic (blood/fluid loss), cardiogenic (pump failure, e.g. MI), and distributive — septic (infection) & anaphylactic.",
    ],
    keyPoints: [
      "Virchow's triad: endothelial injury + abnormal flow (stasis) + hypercoagulability.",
      "Thrombus forms in flowing blood in a live vessel; a post-mortem clot does not (no lines of Zahn).",
      "Lines of Zahn (alternating pale platelet/fibrin & red cell layers) indicate an ante-mortem thrombus.",
      "Most emboli are thromboemboli; pulmonary embolism usually arises from deep leg vein thrombi (DVT).",
      "Red infarct → lung/intestine (dual or loose supply); pale infarct → heart/kidney/spleen (end-arteries).",
      "Shock types: hypovolaemic, cardiogenic, septic, anaphylactic, neurogenic.",
    ],
    diagram:
      "HEMODYNAMIC DISORDERS\n Edema ......... ↑hydrostatic | ↓oncotic | lymph block | Na+ retention\n Congestion .... passive venous back-up (nutmeg liver)\n THROMBOSIS .... Virchow's triad: Endothelial injury + Stasis + Hypercoagulability\n EMBOLISM ...... detached mass → lodges distally (mostly thromboemboli; also fat/air)\n INFARCTION .... ischaemic necrosis — RED (lung/gut) vs PALE (heart/kidney/spleen)\n SHOCK ......... hypovolaemic · cardiogenic · septic · anaphylactic",
    mnemonic: "Virchow's triad → 'SHE' = Stasis, Hypercoagulability, Endothelial injury.",
    viva: [
      { q: "State Virchow's triad.", a: "The three factors predisposing to thrombosis: (1) endothelial injury, (2) abnormal blood flow (stasis or turbulence), and (3) hypercoagulability of blood." },
      { q: "Differentiate a thrombus from a post-mortem clot.", a: "A thrombus forms in flowing blood within a living vessel — it is firm, attached to the wall, and shows lines of Zahn. A post-mortem clot forms after death — it is soft, gelatinous ('chicken-fat/currant-jelly'), unattached, and lacks lines of Zahn." },
      { q: "What is an embolism? Give the commonest type.", a: "An embolism is the lodgement of a detached intravascular mass (embolus) at a distant site; the commonest is thromboembolism (a fragment of a thrombus), e.g. pulmonary embolism from a deep vein thrombosis." },
      { q: "Differentiate red and pale infarcts.", a: "Red (haemorrhagic) infarcts occur in organs with loose tissue or dual/collateral blood supply (lung, intestine); pale (white/anaemic) infarcts occur in solid organs with end-arterial supply (heart, kidney, spleen)." },
    ],
    mcqs: [
      {
        id: "path-hd-1",
        question: "Virchow's triad of thrombosis includes all EXCEPT:",
        options: ["Endothelial injury", "Stasis/turbulence of blood flow", "Hypercoagulability", "Hypoproteinaemia"],
        answerIndex: 3,
        explanation: "Virchow's triad is endothelial injury, abnormal blood flow (stasis/turbulence), and hypercoagulability. Hypoproteinaemia causes edema, not the triad.",
      },
      {
        id: "path-hd-2",
        question: "Lines of Zahn are a feature of a(n):",
        options: ["Post-mortem clot", "Ante-mortem thrombus", "Hematoma", "Transudate"],
        answerIndex: 1,
        explanation: "Lines of Zahn (alternating platelet-fibrin and red cell layers) form in flowing blood and indicate an ante-mortem thrombus.",
      },
      {
        id: "path-hd-3",
        question: "A pale (anaemic) infarct is most typical of the:",
        options: ["Lung", "Small intestine", "Kidney", "Liver"],
        answerIndex: 2,
        explanation: "Solid organs with end-arterial supply (kidney, heart, spleen) give pale infarcts; lung and intestine give red infarcts.",
      },
      {
        id: "path-hd-4",
        question: "Shock due to myocardial infarction (pump failure) is classified as:",
        options: ["Hypovolaemic shock", "Cardiogenic shock", "Septic shock", "Anaphylactic shock"],
        answerIndex: 1,
        explanation: "Cardiogenic shock results from failure of the heart to pump adequately, as in a large myocardial infarction.",
      },
    ],
    flashcards: [
      { front: "Virchow's triad?", back: "Endothelial injury + abnormal flow (stasis/turbulence) + hypercoagulability." },
      { front: "Thrombus vs post-mortem clot?", back: "Thrombus: firm, attached, lines of Zahn (ante-mortem). Post-mortem clot: soft, gelatinous, unattached, no lines of Zahn." },
      { front: "Red vs pale infarct — where?", back: "Red: lung, intestine (dual/loose supply). Pale: heart, kidney, spleen (end-arteries)." },
      { front: "Commonest source of pulmonary embolism?", back: "Deep vein thrombosis (DVT) of the leg." },
    ],
  },

  // 7 ───────────────────────────────────────────────────────────────────────
  {
    slug: "path-neoplasia",
    title: "Neoplasia (Cancer)",
    icon: "🎗️",
    order: 7,
    summary: "Tumours — benign vs malignant, nomenclature, spread/metastasis, grading & staging, and carcinogenesis.",
    syllabusRef: "Патологическая анатомия — Опухоли, общая онкоморфология (Neoplasia)",
    bookRef: "Harsh Mohan — Neoplasia",
    importantForExam: true,
    easyNotes: [
      "Neoplasia = 'new growth': an abnormal mass of tissue whose growth is uncoordinated, excessive, and continues after the stimulus stops. A tumour has parenchyma (the neoplastic cells) + stroma (supporting connective tissue & vessels).",
      "BENIGN vs MALIGNANT — the key exam table. Benign: slow, well-differentiated, encapsulated, NO invasion, NO metastasis (e.g. lipoma, adenoma). Malignant (cancer): rapid, poorly differentiated (anaplasia), invasive, and METASTASISES.",
      "Naming: benign → '-oma' (lipoma, fibroma, adenoma). Malignant of epithelium → CARCINOMA; of mesenchyme/connective tissue → SARCOMA. (Some '-omas' are malignant exceptions: lymphoma, melanoma.)",
      "Anaplasia = lack of differentiation (hallmark of malignancy): pleomorphism, large hyperchromatic nuclei, high nucleo-cytoplasmic ratio, and abnormal mitoses.",
      "METASTASIS = spread to distant sites (proves malignancy). Routes: lymphatic (typical of carcinomas), haematogenous/blood (typical of sarcomas), and transcoelomic (across body cavities).",
      "GRADING = how differentiated the tumour looks (degree of anaplasia). STAGING = how far it has spread — the TNM system (Tumour size, Nodes, Metastasis). Staging matters more for prognosis.",
    ],
    keyPoints: [
      "Metastasis and invasion are the definitive features of malignancy — benign tumours do neither.",
      "Carcinoma = malignant epithelial tumour; Sarcoma = malignant mesenchymal (connective tissue) tumour.",
      "Anaplasia (loss of differentiation) is the hallmark of malignancy.",
      "Carcinomas spread mainly via lymphatics; sarcomas mainly via blood.",
      "Grading = differentiation; Staging = spread (TNM). Staging is the stronger prognostic factor.",
      "Exceptions: lymphoma, melanoma, seminoma are malignant despite the '-oma' suffix.",
    ],
    diagram:
      "NEOPLASM = parenchyma (tumour cells) + stroma (support)\n BENIGN                     MALIGNANT (cancer)\n slow, encapsulated         rapid, invasive\n well-differentiated        anaplastic\n NO metastasis              METASTASISES ✔\n '-oma'                     Carcinoma (epithelium) | Sarcoma (mesenchyme)\n\n SPREAD: lymphatic (carcinoma) · haematogenous (sarcoma) · transcoelomic\n GRADE = differentiation | STAGE = spread (TNM)",
    mnemonic: "Carcinoma → Comes from Cover/epithelium; Sarcoma → from Support/mesenchyme. Staging = TNM (Tumour, Nodes, Metastasis).",
    viva: [
      { q: "Differentiate benign and malignant tumours.", a: "Benign tumours are slow-growing, well-differentiated, encapsulated, non-invasive and do not metastasise. Malignant tumours grow rapidly, are poorly differentiated (anaplastic), invade locally, and metastasise to distant sites." },
      { q: "Differentiate carcinoma and sarcoma.", a: "A carcinoma is a malignant tumour of epithelial origin; a sarcoma is a malignant tumour of mesenchymal (connective tissue) origin. Carcinomas typically spread via lymphatics, sarcomas via the bloodstream." },
      { q: "What is anaplasia?", a: "Anaplasia is the lack of differentiation of tumour cells — the morphological hallmark of malignancy, showing pleomorphism, hyperchromatic nuclei, a high nucleo-cytoplasmic ratio, and abnormal mitoses." },
      { q: "Differentiate grading and staging of a tumour.", a: "Grading assesses the degree of differentiation (how abnormal the cells look) microscopically; staging assesses the extent of spread of the tumour (size, lymph node involvement, distant metastasis — the TNM system). Staging is generally the better predictor of prognosis." },
    ],
    mcqs: [
      {
        id: "path-neo-1",
        question: "The single most reliable feature that defines a tumour as malignant is:",
        options: ["Rapid growth", "Large size", "Metastasis", "Presence of a capsule"],
        answerIndex: 2,
        explanation: "Metastasis (and invasion) unequivocally define malignancy; benign tumours neither invade nor metastasise.",
      },
      {
        id: "path-neo-2",
        question: "A malignant tumour arising from epithelial tissue is called a:",
        options: ["Sarcoma", "Carcinoma", "Adenoma", "Lipoma"],
        answerIndex: 1,
        explanation: "Malignant epithelial tumours are carcinomas; malignant mesenchymal tumours are sarcomas.",
      },
      {
        id: "path-neo-3",
        question: "Carcinomas most characteristically spread by which route?",
        options: ["Haematogenous (blood)", "Lymphatic", "Transcoelomic", "Perineural"],
        answerIndex: 1,
        explanation: "Carcinomas usually metastasise first via lymphatics; sarcomas typically spread haematogenously.",
      },
      {
        id: "path-neo-4",
        question: "In the TNM staging system, 'N' refers to:",
        options: ["Nuclear grade", "Number of mitoses", "Regional lymph node involvement", "Necrosis"],
        answerIndex: 2,
        explanation: "TNM = Tumour size/extent, Node (regional lymph node) involvement, and Metastasis (distant spread).",
      },
    ],
    flashcards: [
      { front: "Definitive feature of malignancy?", back: "Metastasis (and invasion) — benign tumours do neither." },
      { front: "Carcinoma vs sarcoma origin?", back: "Carcinoma = epithelial; Sarcoma = mesenchymal (connective tissue)." },
      { front: "Spread: carcinoma vs sarcoma?", back: "Carcinoma → lymphatic; Sarcoma → blood (haematogenous)." },
      { front: "Grading vs staging?", back: "Grade = differentiation (how cells look). Stage = spread (TNM). Stage predicts prognosis better." },
    ],
  },

  // 8 ───────────────────────────────────────────────────────────────────────
  {
    slug: "path-immunopathology",
    title: "Immunopathology & Hypersensitivity",
    icon: "🛡️",
    order: 8,
    summary: "When the immune system harms the body — the four hypersensitivity types and autoimmunity basics.",
    syllabusRef: "Патофизиология / Иммунология — Иммунопатология, реакции гиперчувствительности (Hypersensitivity)",
    bookRef: "Harsh Mohan — Immunopathology",
    importantForExam: true,
    easyNotes: [
      "Hypersensitivity = an exaggerated or inappropriate immune response that damages the body's own tissues. There are FOUR types (Gell & Coombs) — a must-know exam classic.",
      "TYPE I — Anaphylactic/Immediate: IgE on mast cells → release histamine within minutes. Examples: allergy, asthma, hay fever, anaphylaxis.",
      "TYPE II — Cytotoxic (Antibody-mediated): IgG/IgM antibodies attack antigens on cell surfaces → cell destruction. Examples: haemolytic transfusion reaction, Rh haemolytic disease, autoimmune haemolytic anaemia.",
      "TYPE III — Immune complex mediated: antigen–antibody complexes deposit in tissues → complement activation & inflammation. Examples: SLE, post-streptococcal glomerulonephritis, Arthus reaction, serum sickness.",
      "TYPE IV — Delayed / Cell-mediated: T lymphocytes (not antibodies), reaction peaks in 48–72 hours. Examples: tuberculin (Mantoux) test, contact dermatitis, graft rejection.",
      "AUTOIMMUNITY = immune response against 'self' antigens (loss of self-tolerance), e.g. SLE, rheumatoid arthritis, Hashimoto thyroiditis.",
    ],
    keyPoints: [
      "Four types: I anaphylactic (IgE), II cytotoxic (IgG/IgM vs cell surface), III immune complex, IV delayed/cell-mediated (T cells).",
      "Type I is immediate (minutes, IgE, histamine); Type IV is delayed (48–72 h, T cells).",
      "Types I, II, III are antibody-mediated; Type IV is cell (T-lymphocyte) mediated.",
      "SLE and post-streptococcal glomerulonephritis are classic Type III (immune complex) diseases.",
      "Mantoux/tuberculin test and contact dermatitis are classic Type IV reactions.",
    ],
    diagram:
      "HYPERSENSITIVITY (Gell & Coombs)\n I   Anaphylactic  → IgE + mast cells + histamine  (allergy, asthma) — minutes\n II  Cytotoxic     → IgG/IgM vs cell-surface antigen (transfusion rxn, Rh disease)\n III Immune complex→ Ag-Ab complexes deposit (SLE, PSGN, serum sickness)\n IV  Delayed       → T cells, 48–72 h (Mantoux, contact dermatitis, graft rejection)\n\n Antibody-mediated: I, II, III   |   Cell-mediated: IV",
    mnemonic: "'ACID' → I Anaphylactic, II Cytotoxic, III Immune-complex, IV Delayed.",
    viva: [
      { q: "Classify the types of hypersensitivity.", a: "Type I (anaphylactic/immediate, IgE-mediated), Type II (cytotoxic, IgG/IgM against cell-surface antigens), Type III (immune complex mediated), and Type IV (delayed, cell/T-lymphocyte mediated)." },
      { q: "Which immunoglobulin mediates Type I hypersensitivity?", a: "IgE, bound to mast cells and basophils; cross-linking by antigen triggers histamine release." },
      { q: "Give an example of a Type IV hypersensitivity reaction.", a: "The tuberculin (Mantoux) test, contact dermatitis, or graft rejection — all mediated by T lymphocytes and delayed (48–72 hours)." },
      { q: "What is autoimmunity?", a: "An immune response directed against the body's own (self) antigens due to loss of self-tolerance, causing diseases such as SLE, rheumatoid arthritis and Hashimoto thyroiditis." },
    ],
    mcqs: [
      {
        id: "path-imm-1",
        question: "Anaphylaxis and atopic allergy are examples of which type of hypersensitivity?",
        options: ["Type I", "Type II", "Type III", "Type IV"],
        answerIndex: 0,
        explanation: "Type I (immediate/anaphylactic) hypersensitivity is IgE-mediated with rapid histamine release from mast cells.",
      },
      {
        id: "path-imm-2",
        question: "Type IV (delayed) hypersensitivity is mediated primarily by:",
        options: ["IgE antibodies", "IgG/IgM antibodies", "T lymphocytes", "Complement alone"],
        answerIndex: 2,
        explanation: "Type IV reactions are cell-mediated by sensitised T lymphocytes and are delayed (peak at 48–72 hours).",
      },
      {
        id: "path-imm-3",
        question: "Systemic lupus erythematosus (SLE) is a classic example of which hypersensitivity type?",
        options: ["Type I", "Type II", "Type III (immune complex)", "Type IV"],
        answerIndex: 2,
        explanation: "SLE is mediated by deposition of antigen–antibody (immune) complexes — Type III hypersensitivity.",
      },
      {
        id: "path-imm-4",
        question: "The tuberculin (Mantoux) skin test is an example of:",
        options: ["Type I hypersensitivity", "Type II hypersensitivity", "Type III hypersensitivity", "Type IV hypersensitivity"],
        answerIndex: 3,
        explanation: "The Mantoux reaction is a delayed, T-cell-mediated Type IV response read at 48–72 hours.",
      },
    ],
    flashcards: [
      { front: "Four hypersensitivity types (ACID)?", back: "I Anaphylactic (IgE), II Cytotoxic (IgG/IgM), III Immune-complex, IV Delayed (T cells)." },
      { front: "Type I mediator & Ig?", back: "IgE on mast cells → histamine (immediate, minutes)." },
      { front: "SLE & post-strep GN — which type?", back: "Type III (immune complex mediated)." },
      { front: "Mantoux test — which type?", back: "Type IV (delayed, cell-mediated, 48–72 h)." },
    ],
  },

  // 9 ───────────────────────────────────────────────────────────────────────
  {
    slug: "path-amyloidosis",
    title: "Amyloidosis",
    icon: "🧬",
    order: 9,
    summary: "Abnormal extracellular protein deposition — its types, staining, and effects on organs.",
    syllabusRef: "Патологическая анатомия — Стромально-сосудистые диспротеинозы: амилоидоз (Amyloidosis)",
    bookRef: "Harsh Mohan — Amyloidosis",
    importantForExam: true,
    easyNotes: [
      "Amyloidosis = abnormal deposition of a waxy, protein–carbohydrate material called AMYLOID between cells (extracellular), which slowly damages organs.",
      "Amyloid is not one substance — it's a group of proteins that all share a β-pleated sheet structure. Main types: AL (light chains — from plasma cell disorders like multiple myeloma) and AA (from serum amyloid-associated protein — in chronic inflammation/infection).",
      "STAINING (very high-yield): Congo red stain → amyloid appears salmon-pink and shows APPLE-GREEN birefringence under polarised light. This is the classic diagnostic finding.",
      "Classified as: primary (AL, plasma cell dyscrasias), secondary/reactive (AA, chronic diseases — TB, RA, chronic osteomyelitis), hereditary, and localised.",
      "Commonly affected organs: kidney (→ nephrotic syndrome, the most serious), heart (→ restrictive cardiomyopathy), liver, spleen ('sago' or 'lardaceous' spleen), and tongue (macroglossia).",
      "Diagnosis is by biopsy (e.g. rectal, gingival, abdominal fat pad) with Congo red staining.",
    ],
    keyPoints: [
      "Amyloid = extracellular protein with a β-pleated sheet structure.",
      "Congo red → apple-green birefringence under polarised light (the diagnostic hallmark).",
      "AL amyloid = light chains (primary; multiple myeloma). AA amyloid = from SAA (secondary; chronic inflammation).",
      "Kidney is the most commonly and seriously involved organ → nephrotic syndrome.",
      "Secondary amyloidosis causes: chronic infections/inflammation — TB, rheumatoid arthritis, chronic osteomyelitis.",
    ],
    diagram:
      "AMYLOIDOSIS = extracellular AMYLOID (β-pleated sheet protein)\n Types: AL (light chains → myeloma) | AA (from SAA → chronic inflammation)\n Stain: CONGO RED → salmon-pink → APPLE-GREEN birefringence (polarised light)\n Organs: KIDNEY (nephrotic) · heart · liver · spleen · tongue (macroglossia)",
    mnemonic: "Congo red + polarised light = APPLE-GREEN. AA = 'Acute-phase Amyloid' (chronic inflammation); AL = 'Amyloid Light-chain' (myeloma).",
    viva: [
      { q: "What is amyloid?", a: "Amyloid is an abnormal, insoluble extracellular protein–polysaccharide material with a characteristic β-pleated sheet structure that deposits between cells and progressively damages organs." },
      { q: "How is amyloid demonstrated histologically?", a: "By Congo red staining — amyloid stains salmon-pink/red and shows apple-green birefringence under polarised light, the diagnostic hallmark." },
      { q: "Differentiate AL and AA amyloid.", a: "AL amyloid is derived from immunoglobulin light chains, seen in primary amyloidosis and plasma cell dyscrasias (e.g. multiple myeloma). AA amyloid is derived from serum amyloid-associated (SAA) protein and occurs in secondary (reactive) amyloidosis due to chronic inflammation or infection." },
      { q: "Which organ involvement in amyloidosis is most clinically significant?", a: "The kidney — renal amyloidosis causes proteinuria and nephrotic syndrome and is a major cause of morbidity and death." },
    ],
    mcqs: [
      {
        id: "path-amy-1",
        question: "Amyloid is best demonstrated by which stain?",
        options: ["Congo red", "Haematoxylin & eosin only", "Gram stain", "Prussian blue"],
        answerIndex: 0,
        explanation: "Congo red stains amyloid salmon-pink and produces apple-green birefringence under polarised light.",
      },
      {
        id: "path-amy-2",
        question: "Under polarised light, Congo-red-stained amyloid shows:",
        options: ["Blue fluorescence", "Apple-green birefringence", "Yellow autofluorescence", "No change"],
        answerIndex: 1,
        explanation: "Apple-green birefringence under polarised light is the classic diagnostic feature of amyloid.",
      },
      {
        id: "path-amy-3",
        question: "AA (secondary) amyloidosis is most often associated with:",
        options: ["Multiple myeloma", "Chronic inflammatory/infective disease", "Acute myocardial infarction", "Iron overload"],
        answerIndex: 1,
        explanation: "AA amyloid derives from serum amyloid-associated protein and complicates chronic inflammation/infection (e.g. TB, RA). AL amyloid is linked to myeloma.",
      },
      {
        id: "path-amy-4",
        question: "The physical structure common to all amyloid proteins is the:",
        options: ["α-helix", "β-pleated sheet", "Double helix", "Random coil"],
        answerIndex: 1,
        explanation: "All amyloid, regardless of protein of origin, shares a β-pleated sheet configuration that resists degradation.",
      },
    ],
    flashcards: [
      { front: "Amyloid stain & finding?", back: "Congo red → salmon-pink → apple-green birefringence under polarised light." },
      { front: "AL vs AA amyloid?", back: "AL = light chains (myeloma/primary). AA = from SAA (chronic inflammation/secondary)." },
      { front: "Amyloid protein structure?", back: "β-pleated sheet (common to all amyloid types)." },
      { front: "Most serious organ in amyloidosis?", back: "Kidney → nephrotic syndrome." },
    ],
  },
];

export function getPathTopic(slug: string): PathTopic | undefined {
  return PATH_TOPICS.find((t) => t.slug === slug);
}

export const PATH_STATS = {
  topicCount: PATH_TOPICS.length,
  mcqCount: PATH_TOPICS.reduce((n, t) => n + t.mcqs.length, 0),
  vivaCount: PATH_TOPICS.reduce((n, t) => n + t.viva.length, 0),
  flashcardCount: PATH_TOPICS.reduce((n, t) => n + t.flashcards.length, 0),
};

export type { MCQProblem };
export function validateMCQs(): MCQProblem[] {
  return validateSubjectMCQs(PATH_TOPICS);
}

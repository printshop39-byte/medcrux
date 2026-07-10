import type { MCQ } from "./types";
import { validateMCQs as validateSubjectMCQs, type MCQProblem } from "./mcq-validate";

// ── Microbiology module (subject-agnostic, self-contained) ───────────────────
// This is a NEW subject added alongside Pharmacology. It deliberately does NOT
// touch the pharmacology `TopicSlug` union or DRUGS data, so V1 stays intact.
//
// Content model:  Subject → University lecture (Russia syllabus) → simplified
// Indian-reference explanation → viva / MCQ / flashcards → exam tag.
//
// Source mapping (Smolensk / Russian Microbiology lectures the student uploaded):
//   1st term Lecture #1 ................ Introduction
//   Lecture 3 (Cultivation, part 1) .... Cultivation of bacteria
//   Lecture 4 (Cultivation p2 + ID) .... Identification of bacteria
//   Lecture 5 ......................... Antimicrobial drugs & resistance
//   Lecture 6 ......................... Environmental microbiology
//   Lecture 7 ......................... Infection control
//   Lecture 8 ......................... Microbial genetics
//   Lecture 9 ......................... Infectious process
//   Lecture 12 ........................ Applied immunology
//
// COPYRIGHT NOTE: explanations below are written from scratch (concept mapping
// in our own words). We do NOT copy text from Paniker or the lecture PDFs — the
// book/lecture names are shown only as *reference pointers* for the student.

export interface MicroFlashcard {
  front: string;
  back: string;
}

export interface MicroTopic {
  slug: string; // namespaced, e.g. "micro-cultivation" (never collides with pharma slugs)
  title: string;
  icon: string;
  order: number;
  summary: string;
  lectureRef: string; // Russia syllabus source (Smolensk lecture)
  bookRef: string; // Indian reference book pointer (Paniker etc.)
  importantForExam: boolean;
  easyNotes: string[]; // "Explain like I'm tired" — simplest possible bullets
  keyPoints: string[]; // exam-important one-liners
  diagram: string; // text/ASCII concept map (our own, no copyrighted figure)
  mnemonic?: string;
  viva: { q: string; a: string }[];
  mcqs: MCQ[];
  flashcards: MicroFlashcard[];
}

export const MICRO_TOPICS: MicroTopic[] = [
  // 1 ─────────────────────────────────────────────────────────────────────────
  {
    slug: "micro-introduction",
    title: "Introduction to Microbiology",
    icon: "🔬",
    order: 1,
    summary: "What microbiology is, the main groups of microbes, and how the field began.",
    lectureRef: "Smolensk · 1st term Lecture #1 (Introduction)",
    bookRef: "Paniker — Ch. 1–2 (History & Classification)",
    importantForExam: true,
    easyNotes: [
      "Microbiology = the study of tiny living things too small to see with the naked eye (microbes).",
      "Main groups: bacteria, viruses, fungi, protozoa, and helminths (worms) + algae.",
      "Bacteria are prokaryotes (no true nucleus). Fungi and protozoa are eukaryotes (true nucleus). Viruses are not cells at all — they need a host to multiply.",
      "Medical microbiology asks three questions: Which microbe? Does it cause disease? How do we detect, treat and prevent it?",
      "Big names to remember: Leeuwenhoek (first saw microbes), Louis Pasteur (disproved spontaneous generation, vaccines, pasteurisation), Robert Koch (proved germs cause disease — Koch's postulates).",
    ],
    keyPoints: [
      "Prokaryote vs eukaryote is the single most-tested classification split.",
      "Koch's postulates = the classic proof that a specific microbe causes a specific disease.",
      "Pasteur: 'father of microbiology'; Koch: 'father of bacteriology'.",
      "Units: bacteria are measured in micrometres (µm), viruses in nanometres (nm).",
    ],
    diagram:
      "MICROBES\n ├─ Cellular\n │   ├─ Prokaryotes → Bacteria (incl. Rickettsia, Chlamydia, Mycoplasma)\n │   └─ Eukaryotes → Fungi · Protozoa · Helminths · Algae\n └─ Acellular\n     └─ Viruses (+ prions, viroids)",
    mnemonic: "Koch's postulates → 'Find, Grow, Give, Get-back' (find in sick host, grow in pure culture, give to healthy host → disease, re-isolate same microbe).",
    viva: [
      { q: "What is the difference between a prokaryote and a eukaryote?", a: "A prokaryote (bacteria) has no membrane-bound nucleus or organelles; a eukaryote (fungi, protozoa) has a true nucleus and membrane-bound organelles." },
      { q: "State Koch's postulates.", a: "1) The microbe is found in all cases of the disease. 2) It can be isolated and grown in pure culture. 3) Inoculating it into a healthy host reproduces the disease. 4) The same microbe is re-isolated from that host." },
      { q: "Who is called the father of microbiology and why?", a: "Louis Pasteur — he disproved spontaneous generation, developed pasteurisation, and pioneered vaccines (rabies, anthrax)." },
      { q: "Name microbes that are exceptions to Koch's postulates.", a: "Mycobacterium leprae and Treponema pallidum (cannot be grown on artificial media), and viruses (need living cells)." },
    ],
    mcqs: [
      {
        id: "micro-intro-1",
        question: "Which of the following is a prokaryote?",
        options: ["Fungus", "Protozoan", "Bacterium", "Helminth"],
        answerIndex: 2,
        explanation: "Bacteria are prokaryotes — they lack a membrane-bound nucleus. Fungi, protozoa and helminths are eukaryotes.",
      },
      {
        id: "micro-intro-2",
        question: "Koch's postulates are used to establish that:",
        options: [
          "A drug is effective against a microbe",
          "A specific microbe causes a specific disease",
          "A culture medium is sterile",
          "An antibody is protective",
        ],
        answerIndex: 1,
        explanation: "Koch's postulates are the classic criteria proving a causal link between a microbe and a disease.",
      },
      {
        id: "micro-intro-3",
        question: "Viruses differ from bacteria because viruses:",
        options: [
          "Have a cell wall",
          "Can be grown on nutrient agar",
          "Cannot multiply outside a living host cell",
          "Are larger than bacteria",
        ],
        answerIndex: 2,
        explanation: "Viruses are obligate intracellular parasites — they lack the machinery to replicate on their own and need a living host cell.",
      },
    ],
    flashcards: [
      { front: "Father of bacteriology?", back: "Robert Koch — proved germs cause disease, gave Koch's postulates, discovered TB and anthrax bacilli." },
      { front: "Prokaryote vs eukaryote — key difference?", back: "Prokaryotes (bacteria) have no true nucleus; eukaryotes (fungi, protozoa) do." },
      { front: "Size units for bacteria vs viruses?", back: "Bacteria: micrometres (µm). Viruses: nanometres (nm)." },
    ],
  },

  // 2 ─────────────────────────────────────────────────────────────────────────
  {
    slug: "micro-cultivation",
    title: "Cultivation of Bacteria",
    icon: "🧫",
    order: 2,
    summary: "How we grow bacteria in the lab — nutrition, culture media, and the conditions bacteria need.",
    lectureRef: "Smolensk · Lecture 3 (Cultivation of bacteria, part 1)",
    bookRef: "Paniker — Culture & Culture Media",
    importantForExam: true,
    easyNotes: [
      "To study a bacterium you first have to grow (culture) it. We grow it on/in 'culture media' — food jelly or broth made for bacteria.",
      "Bacteria need: a carbon & energy source, nitrogen, minerals, water, the right temperature, right pH, and the right gas (oxygen or not).",
      "Media can be liquid (broth) or solid. Solid media are made solid by adding AGAR — a jelly from seaweed that bacteria can't eat and that melts at ~95°C but sets at ~40°C.",
      "Types of media by purpose: Simple (basic, e.g. nutrient agar), Enriched (add blood/serum, e.g. blood agar), Selective (allow one type, stop others, e.g. MacConkey), Differential (show colour difference, e.g. MacConkey again), Enrichment (liquid that favours one type), Transport (keep alive during transit).",
      "By oxygen need: aerobes (need O₂), anaerobes (killed by O₂), facultative anaerobes (either way), microaerophilic (little O₂), capnophilic (need extra CO₂).",
    ],
    keyPoints: [
      "Agar sets the medium solid but is NOT a nutrient — bacteria cannot digest it.",
      "Blood agar = enriched medium; MacConkey agar = selective AND differential (lactose fermenters go pink).",
      "Most human pathogens grow best at 37°C, pH ~7.2–7.4.",
      "Obligate anaerobes (e.g. Clostridium) need oxygen removed; use anaerobic jar / thioglycollate broth.",
    ],
    diagram:
      "CULTURE MEDIA\n ├─ by consistency → Liquid (broth) · Solid (agar) · Semi-solid\n ├─ by purpose\n │    ├─ Simple ...... nutrient agar\n │    ├─ Enriched .... blood agar, chocolate agar\n │    ├─ Selective ... MacConkey, DCA, LJ (TB)\n │    ├─ Differential  MacConkey (lactose → pink)\n │    ├─ Enrichment .. selenite-F broth\n │    └─ Transport ... Stuart's, Cary-Blair\n └─ by O₂ need → Aerobe · Anaerobe · Facultative · Microaerophilic · Capnophilic",
    mnemonic: "Media purposes → 'Some Elephants Sit Down Every Time' = Simple, Enriched, Selective, Differential, Enrichment, Transport.",
    viva: [
      { q: "Why is agar used in solid media?", a: "Agar solidifies the medium (sets at ~40°C, melts at ~95°C), is not attacked by most bacteria, and is transparent — so it supports growth without being a nutrient source." },
      { q: "What is the difference between a selective and an enrichment medium?", a: "Selective media are SOLID and inhibit unwanted organisms so the target forms visible colonies; enrichment media are LIQUID and give the target a growth advantage before subculture." },
      { q: "Give an example of an enriched medium and why it is enriched.", a: "Blood agar — nutrient agar enriched with 5–10% blood to grow fastidious organisms and to show haemolysis." },
      { q: "How do you grow an obligate anaerobe?", a: "Remove oxygen — use an anaerobic jar (GasPak), Robertson's cooked meat medium, or thioglycollate broth." },
    ],
    mcqs: [
      {
        id: "micro-cult-1",
        question: "Agar is added to culture media mainly to:",
        options: ["Provide nitrogen", "Provide carbon", "Solidify the medium", "Lower the pH"],
        answerIndex: 2,
        explanation: "Agar is a solidifying agent from seaweed; it is not a nutrient — bacteria cannot digest it.",
      },
      {
        id: "micro-cult-2",
        question: "MacConkey agar is best described as a:",
        options: [
          "Simple medium",
          "Selective and differential medium",
          "Transport medium",
          "Anaerobic medium",
        ],
        answerIndex: 1,
        explanation: "MacConkey selects Gram-negative enteric bacteria (bile salts inhibit others) and differentiates lactose fermenters (pink) from non-fermenters (colourless).",
      },
      {
        id: "micro-cult-3",
        question: "A facultative anaerobe is an organism that:",
        options: [
          "Grows only with oxygen",
          "Is killed by oxygen",
          "Grows with or without oxygen",
          "Needs extra CO₂",
        ],
        answerIndex: 2,
        explanation: "Facultative anaerobes can respire aerobically when O₂ is present and ferment when it is absent (e.g. E. coli, Staphylococcus).",
      },
      {
        id: "micro-cult-4",
        question: "The optimum temperature and pH for most human pathogenic bacteria is:",
        options: ["25°C, pH 5", "37°C, pH 7.2–7.4", "42°C, pH 9", "4°C, pH 6"],
        answerIndex: 1,
        explanation: "Human pathogens are mesophiles that grow best near body temperature (37°C) and neutral pH (~7.2–7.4).",
      },
    ],
    flashcards: [
      { front: "Blood agar is which type of medium?", back: "Enriched medium (nutrient agar + blood) — also shows haemolysis patterns." },
      { front: "MacConkey — what does pink colour mean?", back: "Lactose fermenter (e.g. E. coli). Non-fermenters (e.g. Salmonella, Shigella) stay colourless." },
      { front: "How to culture an obligate anaerobe?", back: "Remove O₂: anaerobic jar (GasPak), Robertson's cooked meat, or thioglycollate broth." },
      { front: "Transport medium example?", back: "Stuart's or Cary-Blair — keeps organisms alive without multiplication during transport." },
    ],
  },

  // 3 ─────────────────────────────────────────────────────────────────────────
  {
    slug: "micro-identification",
    title: "Identification of Bacteria",
    icon: "🩺",
    order: 3,
    summary: "How we tell one bacterium from another — morphology, staining, biochemical tests and beyond.",
    lectureRef: "Smolensk · Lecture 4 (Cultivation part 2 · Identification of bacteria)",
    bookRef: "Paniker — Morphology, Staining & Identification",
    importantForExam: true,
    easyNotes: [
      "Once grown, we identify a bacterium step by step: shape → staining → colony look → biochemical reactions → serology/molecular tests.",
      "SHAPE: cocci (round), bacilli (rods), spiral (spirochaetes/vibrios). Arrangement matters: clusters (staph), chains (strep), pairs (diplococci).",
      "GRAM STAIN is the master test: Gram-positive = purple (thick peptidoglycol wall), Gram-negative = pink/red (thin wall + outer membrane). Steps: Crystal violet → Iodine (mordant) → Alcohol (decolouriser) → Safranin (counterstain).",
      "ZIEHL–NEELSEN (acid-fast) stain is for TB & leprosy — their waxy mycolic-acid wall holds red carbol fuchsin even after acid wash (acid-fast bacilli = red).",
      "BIOCHEMICAL tests fingerprint the metabolism: catalase (Staph +, Strep −), coagulase (S. aureus +), oxidase (Pseudomonas +), sugar fermentation, indole, urease, IMViC for coliforms.",
      "Modern tools: automated panels, MALDI-TOF mass spectrometry, and PCR/16S rRNA sequencing for fast, exact ID.",
    ],
    keyPoints: [
      "Gram stain order: Crystal violet → Iodine → Alcohol → Safranin. Iodine is the mordant; alcohol is the decolouriser (the critical step).",
      "Gram-positive wall = thick peptidoglycan (retains violet); Gram-negative = thin peptidoglycan + outer LPS membrane (loses violet, takes safranin).",
      "Catalase separates Staphylococci (+) from Streptococci (−); coagulase separates S. aureus (+) from other staph (−).",
      "Acid-fast (Ziehl–Neelsen) → Mycobacterium tuberculosis / leprae.",
    ],
    diagram:
      "IDENTIFICATION LADDER\n 1. Shape/arrangement (microscopy)\n 2. Gram stain → G+ (purple) or G− (pink)\n 3. Colony morphology on media (+ haemolysis)\n 4. Biochemical tests → catalase, coagulase, oxidase, IMViC, urease\n 5. Serology (antigens) / MALDI-TOF / 16S rRNA PCR",
    mnemonic: "Gram steps → 'Come In And Stain' = Crystal violet, Iodine, Alcohol, Safranin.",
    viva: [
      { q: "What is the role of iodine in the Gram stain?", a: "Iodine is the mordant — it forms a crystal-violet–iodine complex inside the cell that is trapped by the thick peptidoglycan of Gram-positive bacteria." },
      { q: "Which is the most critical step of the Gram stain and why?", a: "Decolourisation with alcohol/acetone — over-decolourising makes Gram-positives look Gram-negative, and under-decolourising does the reverse." },
      { q: "How do you differentiate Staphylococcus from Streptococcus?", a: "Catalase test — Staphylococci are catalase-positive (bubbles with H₂O₂); Streptococci are catalase-negative." },
      { q: "Why does Mycobacterium stain acid-fast?", a: "Its cell wall is rich in mycolic acid (a waxy lipid) that resists decolourisation by acid-alcohol, so it retains the red carbol fuchsin." },
    ],
    mcqs: [
      {
        id: "micro-id-1",
        question: "In the Gram stain, the decolourising agent is:",
        options: ["Crystal violet", "Gram's iodine", "Alcohol/acetone", "Safranin"],
        answerIndex: 2,
        explanation: "Alcohol (or acetone) decolourises — it removes the crystal-violet–iodine complex from Gram-negative cells. It is the critical, error-prone step.",
      },
      {
        id: "micro-id-2",
        question: "A Gram-negative bacterium appears which colour after staining?",
        options: ["Purple/violet", "Pink/red", "Green", "Colourless"],
        answerIndex: 1,
        explanation: "Gram-negatives lose the violet during decolourisation and take up the safranin counterstain, appearing pink/red.",
      },
      {
        id: "micro-id-3",
        question: "The catalase test is used to differentiate:",
        options: [
          "Staphylococcus from Streptococcus",
          "E. coli from Klebsiella",
          "Aerobes from anaerobes",
          "Gram-positive from Gram-negative",
        ],
        answerIndex: 0,
        explanation: "Staphylococci are catalase-positive; streptococci are catalase-negative — a quick bench test to separate the two Gram-positive cocci.",
      },
      {
        id: "micro-id-4",
        question: "Ziehl–Neelsen (acid-fast) staining is used primarily for:",
        options: ["Staphylococcus aureus", "Mycobacterium tuberculosis", "Escherichia coli", "Streptococcus pyogenes"],
        answerIndex: 1,
        explanation: "Acid-fast staining detects mycobacteria (TB, leprosy) whose mycolic-acid wall retains carbol fuchsin despite acid decolourisation.",
      },
    ],
    flashcards: [
      { front: "Gram stain — 4 reagents in order?", back: "Crystal violet → Iodine (mordant) → Alcohol (decolouriser) → Safranin (counterstain)." },
      { front: "Coagulase test — what does positive mean?", back: "Staphylococcus aureus (the main pathogenic staph). Coagulase-negative = skin commensals like S. epidermidis." },
      { front: "Acid-fast bacilli appear what colour and mean what?", back: "Red on a blue background → Mycobacterium (TB/leprosy)." },
      { front: "What does IMViC test?", back: "Indole, Methyl red, Voges-Proskauer, Citrate — differentiates coliforms (E. coli ++−− vs Klebsiella −−++)." },
    ],
  },

  // 4 ─────────────────────────────────────────────────────────────────────────
  {
    slug: "micro-antimicrobial-resistance",
    title: "Antimicrobial Drugs & Resistance",
    icon: "💊",
    order: 4,
    summary: "How antibiotics kill bacteria, how bacteria fight back (resistance), and how we test sensitivity.",
    lectureRef: "Smolensk · Lecture 5 (Antimicrobial drugs & antimicrobial resistance)",
    bookRef: "Paniker — Antimicrobial agents  ·  cross-ref K.D. Tripathi (Pharmacology)",
    importantForExam: true,
    easyNotes: [
      "Antibiotics are drugs that kill (bactericidal) or stop the growth of (bacteriostatic) bacteria, ideally without harming us — this is 'selective toxicity'.",
      "They work by hitting targets bacteria have but we don't: (1) cell wall (penicillins, cephalosporins, vancomycin), (2) protein synthesis/ribosome (aminoglycosides, macrolides, tetracyclines), (3) nucleic acid (quinolones, rifampicin), (4) folate metabolism (sulfonamides, trimethoprim), (5) cell membrane (polymyxins).",
      "RESISTANCE = bacteria survive a drug that should kill them. Mechanisms: enzyme destroys drug (β-lactamase), target changes (altered PBP → MRSA), drug pumped out (efflux), or reduced entry.",
      "Resistance genes spread FAST between bacteria by horizontal transfer — mainly plasmids via conjugation. Overuse/misuse of antibiotics selects for resistant strains.",
      "We test which antibiotic works using the Kirby–Bauer disc diffusion test (zones of inhibition) or MIC (minimum inhibitory concentration).",
      "Scary superbugs: MRSA (methicillin-resistant Staph aureus), ESBL & carbapenem-resistant Gram-negatives, MDR-TB, VRE.",
    ],
    keyPoints: [
      "Selective toxicity = harm the microbe, spare the host (why cell-wall drugs are so safe — human cells have no wall).",
      "β-lactamase (incl. ESBL) inactivates penicillins/cephalosporins — a major resistance mechanism.",
      "MRSA resistance = altered penicillin-binding protein PBP2a (mecA gene), not a β-lactamase.",
      "Resistance spreads mainly by PLASMIDS through conjugation; misuse of antibiotics drives selection.",
      "Sensitivity testing: Kirby–Bauer disc diffusion (zone size) or broth MIC.",
    ],
    diagram:
      "ANTIBIOTIC TARGETS            RESISTANCE MECHANISMS\n Cell wall ...... β-lactams     • Enzyme (β-lactamase/ESBL)\n Ribosome ....... aminoglyc.    • Target change (MRSA PBP2a)\n DNA/RNA ........ quinolones    • Efflux pump\n Folate ......... sulfonamides  • Reduced permeability\n Membrane ....... polymyxins    (genes spread via PLASMIDS)",
    mnemonic: "5 antibiotic targets → 'We Push Nasty Foreign Microbes' = Wall, Protein synth, Nucleic acid, Folate, Membrane.",
    viva: [
      { q: "What is selective toxicity?", a: "The ability of an antimicrobial to harm the microbe while sparing host cells, by acting on structures/pathways unique to the microbe (e.g. the bacterial cell wall)." },
      { q: "Differentiate bactericidal and bacteriostatic drugs.", a: "Bactericidal drugs kill bacteria (e.g. penicillins, aminoglycosides); bacteriostatic drugs only halt multiplication and rely on host defences to clear them (e.g. tetracyclines, macrolides)." },
      { q: "How does MRSA resist methicillin?", a: "It acquires the mecA gene encoding an altered penicillin-binding protein (PBP2a) with low affinity for β-lactams — so cell-wall synthesis continues despite the drug." },
      { q: "What is the commonest way antibiotic resistance spreads between bacteria?", a: "Horizontal gene transfer, mainly by conjugation of resistance (R) plasmids." },
      { q: "Name a method to test antibiotic sensitivity.", a: "Kirby–Bauer disc diffusion (measure zone of inhibition) or determination of the MIC by broth/agar dilution." },
    ],
    mcqs: [
      {
        id: "micro-amr-1",
        question: "The principle that lets an antibiotic harm bacteria but not the patient is called:",
        options: ["Synergism", "Selective toxicity", "Antagonism", "Potentiation"],
        answerIndex: 1,
        explanation: "Selective toxicity means the drug targets a structure/pathway unique to the microbe — e.g. the bacterial cell wall, which human cells lack.",
      },
      {
        id: "micro-amr-2",
        question: "β-lactam antibiotics (penicillins) act by inhibiting:",
        options: ["Protein synthesis", "Cell wall synthesis", "DNA gyrase", "Folate synthesis"],
        answerIndex: 1,
        explanation: "β-lactams bind penicillin-binding proteins and block peptidoglycan cross-linking, inhibiting cell wall synthesis.",
      },
      {
        id: "micro-amr-3",
        question: "Antibiotic resistance genes most commonly spread between bacteria via:",
        options: ["Binary fission", "Plasmids (conjugation)", "Sporulation", "Endocytosis"],
        answerIndex: 1,
        explanation: "R-plasmids transferred by conjugation are the main vehicle of horizontal resistance spread.",
      },
      {
        id: "micro-amr-4",
        question: "The Kirby–Bauer test measures:",
        options: [
          "The Gram reaction",
          "Zone of inhibition around antibiotic discs",
          "Catalase activity",
          "Oxygen requirement",
        ],
        answerIndex: 1,
        explanation: "Kirby–Bauer disc diffusion measures the zone of inhibition to classify an organism as sensitive, intermediate, or resistant.",
      },
    ],
    flashcards: [
      { front: "MRSA is resistant because of…?", back: "Altered PBP2a encoded by the mecA gene — low affinity for β-lactams (NOT β-lactamase)." },
      { front: "Bactericidal vs bacteriostatic — one example each?", back: "Bactericidal = penicillin/aminoglycoside (kill). Bacteriostatic = tetracycline/macrolide (stop growth)." },
      { front: "What does MIC stand for and mean?", back: "Minimum Inhibitory Concentration — the lowest drug concentration that visibly inhibits growth." },
      { front: "Main way resistance spreads between species?", back: "Horizontal transfer via R-plasmids (conjugation)." },
    ],
  },

  // 5 ─────────────────────────────────────────────────────────────────────────
  {
    slug: "micro-environmental",
    title: "Environmental Microbiology",
    icon: "🌍",
    order: 5,
    summary: "Microbes in air, water and soil — the normal flora of the environment and how we test water safety.",
    lectureRef: "Smolensk · Lecture 6 (Environmental microbiology)",
    bookRef: "Paniker — Microbiology of Water, Air & Soil",
    importantForExam: true,
    easyNotes: [
      "Microbes are everywhere — soil, water and air. Most are harmless or useful; a few cause disease and spread through these routes.",
      "SOIL is the richest microbial habitat. Important soil organisms form spores and cause disease from wounds: Clostridium tetani (tetanus), C. perfringens (gas gangrene), Bacillus anthracis (anthrax).",
      "WATER can carry faecal pathogens (cholera, typhoid, hepatitis A, E. coli). We judge water safety by testing for 'indicator organisms' — mainly coliforms/E. coli — because they signal faecal contamination.",
      "AIR carries droplets and dust with respiratory pathogens (TB, influenza, Streptococcus). Air is a route, not a home — microbes don't multiply in air but survive on droplets/dust.",
      "Microbes also run the planet: nitrogen fixation, carbon and sulphur cycles, sewage treatment, and composting all depend on them.",
      "Safe drinking water: coliform count should be 0 per 100 mL. Tests include the presumptive coliform (MPN) test and membrane filtration.",
    ],
    keyPoints: [
      "Coliforms / E. coli are the indicator organisms of faecal water contamination.",
      "Safe drinking water = 0 coliforms per 100 mL.",
      "Spore-forming soil pathogens: Clostridium tetani, C. perfringens, Bacillus anthracis.",
      "Water-borne diseases: cholera, typhoid, hepatitis A & E, bacillary/amoebic dysentery.",
      "Microbes drive the nitrogen, carbon and sulphur cycles and sewage treatment.",
    ],
    diagram:
      "ENVIRONMENT → MICROBES → DISEASE ROUTE\n Soil  → Clostridium, Bacillus (spores) → wound/ingestion\n Water → coliforms, Vibrio, Salmonella   → faeco-oral\n Air   → droplets/dust (TB, flu, strep)  → respiratory\n\n WATER SAFETY = test for coliforms (indicator)\n  → MPN (presumptive) · Membrane filtration · aim 0/100 mL",
    mnemonic: "Water is unsafe if coliforms are 'Present' — Presumptive test comes first (MPN).",
    viva: [
      { q: "Why is E. coli used as an indicator of water contamination?", a: "E. coli lives in the intestine and is excreted in large numbers in faeces; its presence in water indicates recent faecal contamination and the possible presence of intestinal pathogens." },
      { q: "What is the acceptable coliform count in safe drinking water?", a: "Zero coliforms per 100 mL of water." },
      { q: "Name two spore-forming pathogens found in soil.", a: "Clostridium tetani (tetanus) and Bacillus anthracis (anthrax); also Clostridium perfringens (gas gangrene)." },
      { q: "Name a water-borne bacterial disease.", a: "Cholera (Vibrio cholerae) or typhoid (Salmonella Typhi)." },
    ],
    mcqs: [
      {
        id: "micro-env-1",
        question: "The standard indicator organism for faecal contamination of water is:",
        options: ["Staphylococcus aureus", "Escherichia coli (coliforms)", "Bacillus subtilis", "Clostridium tetani"],
        answerIndex: 1,
        explanation: "Coliforms, especially E. coli, indicate recent faecal pollution and the possible presence of intestinal pathogens.",
      },
      {
        id: "micro-env-2",
        question: "Safe drinking water should contain how many coliforms per 100 mL?",
        options: ["0", "10", "100", "1000"],
        answerIndex: 0,
        explanation: "Potable water must have zero coliforms per 100 mL.",
      },
      {
        id: "micro-env-3",
        question: "Which disease is spread mainly by contaminated water?",
        options: ["Tetanus", "Cholera", "Tuberculosis", "Influenza"],
        answerIndex: 1,
        explanation: "Cholera (Vibrio cholerae) is a classic water-borne, faeco-oral disease. Tetanus is soil-borne; TB and influenza are airborne.",
      },
      {
        id: "micro-env-4",
        question: "Which is a spore-forming pathogen typically acquired from soil?",
        options: ["Escherichia coli", "Streptococcus pneumoniae", "Clostridium tetani", "Vibrio cholerae"],
        answerIndex: 2,
        explanation: "Clostridium tetani spores persist in soil and cause tetanus when they enter deep wounds.",
      },
    ],
    flashcards: [
      { front: "Indicator organism for water safety?", back: "Coliforms / E. coli — signal faecal contamination. Safe water = 0 per 100 mL." },
      { front: "Three spore-forming soil pathogens?", back: "Clostridium tetani, Clostridium perfringens, Bacillus anthracis." },
      { front: "Presumptive coliform test name?", back: "MPN (Most Probable Number) test; confirmatory by membrane filtration." },
      { front: "Why doesn't air have 'normal flora' like soil?", back: "Air is only a transport route — microbes survive on droplets/dust but do not multiply in air." },
    ],
  },

  // 6 ─────────────────────────────────────────────────────────────────────────
  {
    slug: "micro-infection-control",
    title: "Infection Control",
    icon: "🧼",
    order: 6,
    summary: "Sterilisation, disinfection, asepsis and hospital-infection prevention — keeping patients safe.",
    lectureRef: "Smolensk · Lecture 7 (Infection control)",
    bookRef: "Paniker — Sterilisation, Disinfection & Hospital Infection",
    importantForExam: true,
    easyNotes: [
      "Key definitions: STERILISATION kills ALL microbes including spores; DISINFECTION kills most microbes but not always spores (used on surfaces/instruments); ANTISEPSIS kills/inhibits microbes on living tissue (skin); ASEPSIS = techniques to keep an area microbe-free.",
      "Sterilisation methods — PHYSICAL: heat is the commonest. Moist heat (autoclave: 121°C, 15 psi, 15 min) is best for most items; dry heat (hot air oven: 160°C, 2 h) for glassware. Also filtration (for heat-sensitive fluids) and radiation (for plastics, single-use items).",
      "Sterilisation methods — CHEMICAL: ethylene oxide gas (heat-sensitive equipment), formaldehyde, glutaraldehyde (endoscopes), hydrogen peroxide plasma.",
      "The AUTOCLAVE is the star — moist heat under pressure. Check it worked with spore strips of Geobacillus stearothermophilus (biological indicator) or Bowie–Dick tape.",
      "HOSPITAL (nosocomial) INFECTIONS are infections caught in hospital, e.g. catheter-related UTIs, ventilator pneumonia, surgical-site and IV-line infections. Common bugs: MRSA, Pseudomonas, E. coli, Klebsiella, C. difficile.",
      "The single most effective way to prevent hospital infection is HAND HYGIENE. Add: sterilisation of instruments, aseptic technique, isolation, and antibiotic stewardship.",
    ],
    keyPoints: [
      "Sterilisation kills spores; disinfection may not. Antiseptics are for living tissue, disinfectants for inanimate surfaces.",
      "Autoclave standard cycle: 121°C, 15 psi (1.05 kg/cm²), 15 minutes — moist heat under pressure.",
      "Hot air oven: 160°C for 2 hours (dry heat) — for glassware, powders, oils.",
      "Ethylene oxide sterilises heat-sensitive equipment (plastics, endoscopes).",
      "Biological indicator for autoclave = spores of Geobacillus stearothermophilus.",
      "Hand hygiene is the #1 measure to prevent nosocomial infection.",
    ],
    diagram:
      "CONTROL OF MICROBES\n ├─ Sterilisation (kills ALL incl. spores)\n │   ├─ Physical → Moist heat (AUTOCLAVE 121°C) · Dry heat (oven 160°C) · Filtration · Radiation\n │   └─ Chemical → Ethylene oxide · Glutaraldehyde · H₂O₂ plasma\n ├─ Disinfection (most microbes, surfaces) → phenols, hypochlorite, alcohols\n └─ Antisepsis (living skin) → alcohol, povidone-iodine, chlorhexidine",
    mnemonic: "Autoclave numbers → '121-15-15' = 121°C, 15 psi, 15 minutes.",
    viva: [
      { q: "Define sterilisation and how it differs from disinfection.", a: "Sterilisation is the complete removal/killing of all microbes including bacterial spores; disinfection kills most pathogenic microbes on inanimate objects but may not kill spores." },
      { q: "What are the standard autoclave conditions?", a: "121°C at 15 psi (pounds per square inch) for 15 minutes — moist heat under pressure." },
      { q: "How would you sterilise a heat-sensitive endoscope?", a: "Chemical methods — glutaraldehyde (cold sterilant) or ethylene oxide gas — because heat would damage it." },
      { q: "What is the most effective measure to prevent hospital-acquired infection?", a: "Hand hygiene (hand washing/alcohol rub) — simple, cheap and the most effective single measure." },
      { q: "How do you confirm that an autoclave cycle achieved sterilisation?", a: "Biological indicator — spores of Geobacillus stearothermophilus; also chemical indicators like Bowie–Dick tape/autoclave tape." },
    ],
    mcqs: [
      {
        id: "micro-ic-1",
        question: "The standard operating conditions of an autoclave are:",
        options: ["100°C, 10 min", "121°C, 15 psi, 15 min", "160°C, 2 h", "180°C, 30 min"],
        answerIndex: 1,
        explanation: "Moist-heat sterilisation in an autoclave uses 121°C at 15 psi for 15 minutes. 160°C/2 h is the dry-heat (hot air oven) setting.",
      },
      {
        id: "micro-ic-2",
        question: "Which process kills bacterial spores?",
        options: ["Disinfection", "Antisepsis", "Sterilisation", "Sanitisation"],
        answerIndex: 2,
        explanation: "Only sterilisation reliably destroys all microbes including resistant bacterial spores.",
      },
      {
        id: "micro-ic-3",
        question: "The single most effective measure to prevent hospital-acquired infections is:",
        options: ["Antibiotic prophylaxis", "Hand hygiene", "Isolation wards", "UV lamps"],
        answerIndex: 1,
        explanation: "Hand hygiene is the cheapest and most effective measure to reduce nosocomial infection transmission.",
      },
      {
        id: "micro-ic-4",
        question: "A heat-sensitive plastic instrument is best sterilised by:",
        options: ["Autoclaving", "Hot air oven", "Ethylene oxide gas", "Boiling"],
        answerIndex: 2,
        explanation: "Ethylene oxide (a chemical gas sterilant) is used for heat- and moisture-sensitive items such as plastics and endoscopes.",
      },
    ],
    flashcards: [
      { front: "Sterilisation vs disinfection — one-line difference?", back: "Sterilisation kills ALL microbes incl. spores; disinfection kills most but may spare spores." },
      { front: "Autoclave settings?", back: "121°C, 15 psi, 15 minutes (moist heat under pressure)." },
      { front: "Hot air oven settings and use?", back: "160°C for 2 hours (dry heat) — glassware, powders, oils." },
      { front: "Antiseptic vs disinfectant?", back: "Antiseptic = on living tissue/skin; disinfectant = on inanimate surfaces." },
    ],
  },

  // 7 ─────────────────────────────────────────────────────────────────────────
  {
    slug: "micro-genetics",
    title: "Microbial Genetics",
    icon: "🧬",
    order: 7,
    summary: "Bacterial DNA, mutations, and the three ways bacteria swap genes — the engine of resistance & evolution.",
    lectureRef: "Smolensk · Lecture 8 (Genetics)",
    bookRef: "Paniker — Bacterial Genetics",
    importantForExam: true,
    easyNotes: [
      "Bacterial genetic material = one circular chromosome of DNA in the cytoplasm (no nucleus) + small extra circles of DNA called PLASMIDS.",
      "PLASMIDS carry 'bonus' genes — often antibiotic resistance (R factor), toxins, or virulence — and can copy and pass themselves between bacteria.",
      "Bacteria change their genes two ways: MUTATION (a random change in their own DNA) and GENE TRANSFER (getting DNA from another bacterium).",
      "THREE gene-transfer methods (learn these cold): 1) TRANSFORMATION — cell takes up naked DNA from the surroundings. 2) TRANSDUCTION — a virus (bacteriophage) carries DNA from one bacterium to another. 3) CONJUGATION — direct cell-to-cell transfer of a plasmid through a sex pilus ('bacterial mating').",
      "TRANSPOSONS ('jumping genes') move genes within/between DNA molecules and help spread resistance.",
      "Why it matters: these mechanisms are how antibiotic resistance and new virulence spread so quickly — conjugation of R-plasmids is the biggest culprit.",
    ],
    keyPoints: [
      "Three transfer mechanisms: Transformation (naked DNA), Transduction (via bacteriophage), Conjugation (via pilus/plasmid).",
      "Conjugation needs cell-to-cell contact and a sex (F) pilus; it is the main route of resistance spread.",
      "Plasmids = extrachromosomal, self-replicating circular DNA (R factor carries resistance).",
      "Transduction is mediated by bacteriophages (generalised or specialised).",
      "Transposons ('jumping genes') can move resistance genes between plasmid and chromosome.",
    ],
    diagram:
      "GENE TRANSFER IN BACTERIA\n 1. TRANSFORMATION  → free DNA in medium → taken up by cell\n 2. TRANSDUCTION    → bacteriophage carries DNA donor → recipient\n 3. CONJUGATION     → donor ==pilus==> recipient (plasmid crosses)\n\n Source of variation: MUTATION + these 3 transfers\n Plasmid (R factor) = mobile resistance packet",
    mnemonic: "Three transfers → 'Naked phones make Contact' = Transformation (Naked DNA), Transduction (phage), Conjugation (Contact).",
    viva: [
      { q: "What is a plasmid?", a: "A small, circular, extrachromosomal piece of double-stranded DNA that replicates independently and often carries antibiotic-resistance (R) or virulence genes." },
      { q: "Name the three mechanisms of genetic transfer in bacteria.", a: "Transformation (uptake of naked DNA), Transduction (transfer by bacteriophage), and Conjugation (direct transfer via a sex pilus)." },
      { q: "What is transduction?", a: "Transfer of bacterial DNA from one cell to another by a bacteriophage (virus) acting as the vector; it may be generalised or specialised." },
      { q: "Why is conjugation clinically important?", a: "It transfers R-plasmids carrying multiple antibiotic-resistance genes between bacteria (even across species), rapidly spreading resistance." },
    ],
    mcqs: [
      {
        id: "micro-gen-1",
        question: "Transfer of bacterial DNA by a bacteriophage is called:",
        options: ["Transformation", "Transduction", "Conjugation", "Translation"],
        answerIndex: 1,
        explanation: "Transduction uses a bacteriophage as the vector to carry DNA from a donor to a recipient bacterium.",
      },
      {
        id: "micro-gen-2",
        question: "Uptake of free (naked) DNA from the environment by a bacterium is:",
        options: ["Conjugation", "Transduction", "Transformation", "Transposition"],
        answerIndex: 2,
        explanation: "Transformation is the uptake and incorporation of naked DNA from the surroundings (first shown by Griffith with pneumococci).",
      },
      {
        id: "micro-gen-3",
        question: "Conjugation in bacteria requires:",
        options: [
          "A bacteriophage",
          "Direct cell-to-cell contact via a sex pilus",
          "Free DNA in the medium",
          "Ultraviolet light",
        ],
        answerIndex: 1,
        explanation: "Conjugation transfers a plasmid through a sex (F) pilus and needs physical contact between donor and recipient cells.",
      },
      {
        id: "micro-gen-4",
        question: "The R factor in bacteria is a plasmid that carries genes for:",
        options: ["Sporulation", "Antibiotic resistance", "Flagellar movement", "Capsule formation"],
        answerIndex: 1,
        explanation: "R (resistance) factors are plasmids carrying antibiotic-resistance genes, transferable by conjugation.",
      },
    ],
    flashcards: [
      { front: "Three ways bacteria transfer genes?", back: "Transformation (naked DNA), Transduction (bacteriophage), Conjugation (sex pilus / plasmid)." },
      { front: "What is an R factor?", back: "A resistance plasmid carrying antibiotic-resistance genes, spread by conjugation." },
      { front: "Which transfer needs a virus?", back: "Transduction — a bacteriophage carries the DNA." },
      { front: "Transposons are…?", back: "'Jumping genes' — DNA segments that move within/between molecules, helping spread resistance." },
    ],
  },

  // 8 ─────────────────────────────────────────────────────────────────────────
  {
    slug: "micro-infectious-process",
    title: "Infectious Process",
    icon: "🦠",
    order: 8,
    summary: "How microbes cause disease — the host–parasite relationship, virulence factors and stages of infection.",
    lectureRef: "Smolensk · Lecture 9 (Infectious process)",
    bookRef: "Paniker — Infection & Pathogenicity",
    importantForExam: true,
    easyNotes: [
      "Infection = a microbe enters the body, multiplies, and interacts with the host. Disease happens only when this damages the host.",
      "Terms: PATHOGEN (a microbe that can cause disease), PATHOGENICITY (its ability to cause disease), VIRULENCE (the DEGREE of that ability), COMMENSAL/NORMAL FLORA (lives on us harmlessly), OPPORTUNIST (harmless normally but causes disease when defences drop).",
      "Steps of infection: (1) entry through a portal (mouth, nose, skin break, urogenital), (2) adhesion/colonisation, (3) invasion & multiplication, (4) damage (toxins/immune response), (5) exit and spread to a new host.",
      "VIRULENCE FACTORS = the 'weapons': adhesins (attach), capsule (hide from phagocytes), enzymes (coagulase, hyaluronidase — spread), and TOXINS.",
      "TOXINS: EXOTOXINS are proteins secreted by (mostly Gram-positive) live bacteria — very potent, specific, often treatable with antitoxin (tetanus, diphtheria, botulism). ENDOTOXIN is the LPS of the Gram-negative wall, released when the cell dies — causes fever, shock (less specific, no antitoxin).",
      "Sources & spread: source can be a patient, carrier, animal (zoonosis) or environment; routes include contact, droplet/airborne, faeco-oral, vector-borne, and blood/body-fluid.",
    ],
    keyPoints: [
      "Pathogenicity = ABILITY to cause disease; virulence = DEGREE of pathogenicity.",
      "Opportunists cause disease only when host defences are lowered (e.g. immunocompromised).",
      "Exotoxin = secreted protein (Gram +, potent, specific, antitoxin available); Endotoxin = LPS of Gram − wall (heat-stable, causes fever/shock).",
      "Virulence factors: adhesins, capsule (anti-phagocytic), spreading enzymes, toxins.",
      "Carrier = a person harbouring & shedding a pathogen without symptoms (e.g. typhoid carrier).",
    ],
    diagram:
      "CHAIN / STAGES OF INFECTION\n Source → Portal of ENTRY → Adhesion → Invasion & multiply → Damage (toxins) → Portal of EXIT → new host\n\n EXOTOXIN vs ENDOTOXIN\n Exotoxin : protein, secreted, Gram +, potent/specific, antitoxin ✔\n Endotoxin: LPS, in Gram − wall, released on lysis, fever/shock, no antitoxin",
    mnemonic: "ExOtoxin = secreted Out & is a prOtein; eNdotoxin = iN the wall (LPS).",
    viva: [
      { q: "Differentiate pathogenicity and virulence.", a: "Pathogenicity is the ability of a microbe to cause disease (qualitative); virulence is the degree or measure of that pathogenicity (quantitative)." },
      { q: "What is an opportunistic pathogen? Give an example.", a: "A microbe that normally does not cause disease but does so when host defences are weakened — e.g. Candida albicans or Pseudomonas aeruginosa in immunocompromised patients." },
      { q: "Compare exotoxins and endotoxins.", a: "Exotoxins are secreted proteins from (mainly) Gram-positive bacteria — highly potent, specific, heat-labile, and neutralised by antitoxins. Endotoxin is the lipopolysaccharide of the Gram-negative wall, released on lysis — heat-stable, causes fever and shock, and has no specific antitoxin." },
      { q: "What is a carrier?", a: "A person (or animal) who harbours and sheds a pathogen without showing symptoms, acting as a reservoir of infection — e.g. a typhoid carrier." },
    ],
    mcqs: [
      {
        id: "micro-inf-1",
        question: "Endotoxin of Gram-negative bacteria is chemically a:",
        options: ["Protein", "Lipopolysaccharide", "Polysaccharide capsule", "Nucleic acid"],
        answerIndex: 1,
        explanation: "Endotoxin is the lipopolysaccharide (LPS) of the Gram-negative outer membrane, released on cell lysis; lipid A is its toxic part.",
      },
      {
        id: "micro-inf-2",
        question: "Which statement about exotoxins is TRUE?",
        options: [
          "They are part of the cell wall",
          "They are heat-stable lipopolysaccharides",
          "They are secreted proteins neutralised by antitoxin",
          "They are produced only by Gram-negative bacteria",
        ],
        answerIndex: 2,
        explanation: "Exotoxins are secreted proteins (mainly from Gram-positive bacteria), highly potent and specific, and can be neutralised by antitoxins/toxoids.",
      },
      {
        id: "micro-inf-3",
        question: "Virulence of an organism refers to:",
        options: [
          "Its ability to be cultured",
          "The degree or intensity of its pathogenicity",
          "Its Gram-staining property",
          "Its resistance to antibiotics",
        ],
        answerIndex: 1,
        explanation: "Virulence is the quantitative degree of pathogenicity — how severely an organism can cause disease.",
      },
      {
        id: "micro-inf-4",
        question: "A capsule contributes to virulence mainly by:",
        options: [
          "Producing toxins",
          "Resisting phagocytosis",
          "Fermenting sugars",
          "Forming spores",
        ],
        answerIndex: 1,
        explanation: "The polysaccharide capsule is anti-phagocytic — it helps the organism evade engulfment by host phagocytes (e.g. pneumococcus).",
      },
    ],
    flashcards: [
      { front: "Exotoxin vs endotoxin — chemical nature?", back: "Exotoxin = secreted protein (Gram +). Endotoxin = LPS of Gram-negative wall (released on lysis)." },
      { front: "Pathogenicity vs virulence?", back: "Pathogenicity = ability to cause disease; virulence = the degree of that ability." },
      { front: "What is an opportunistic pathogen?", back: "A microbe that causes disease only when host defences are lowered (e.g. Candida in immunocompromised)." },
      { front: "Role of a bacterial capsule in disease?", back: "Anti-phagocytic — helps the microbe evade the immune system." },
    ],
  },

  // 9 ─────────────────────────────────────────────────────────────────────────
  {
    slug: "micro-applied-immunology",
    title: "Applied Immunology: Prevention & Treatment",
    icon: "🛡️",
    order: 9,
    summary: "Immunity, vaccines and antisera — how we prevent and treat infection by using the immune system.",
    lectureRef: "Smolensk · Lecture 12 (Applied immunology — prevention & treatment)",
    bookRef: "Paniker — Immunoprophylaxis & Immunotherapy",
    importantForExam: true,
    easyNotes: [
      "Immunity = the body's defence against infection. It is INNATE (born with it: skin, phagocytes, inflammation — fast, non-specific) or ACQUIRED (developed: specific, has memory).",
      "Acquired immunity is ACTIVE (your own body makes antibodies — slow but long-lasting, has memory) or PASSIVE (ready-made antibodies are given — fast but short-lived, no memory).",
      "ACTIVE can be natural (recovering from infection) or artificial (VACCINE). PASSIVE can be natural (mother→baby via placenta/breast milk) or artificial (ANTISERUM / immunoglobulin injection).",
      "VACCINE TYPES: live-attenuated (weakened — BCG, MMR, OPV, strong lasting immunity but not for pregnancy/immunocompromised), killed/inactivated (whole dead — rabies, IPV), toxoid (inactivated toxin — tetanus, diphtheria), subunit/conjugate (piece of microbe — HepB, Hib, HPV).",
      "PROPHYLAXIS (prevention) = vaccinate BEFORE exposure. THERAPY (treatment) = for an already-exposed patient give antiserum/antitoxin (fast passive protection) e.g. tetanus/rabies/diphtheria — often WITH the vaccine (combined active+passive).",
      "Herd immunity: when enough of a population is vaccinated, spread stops and even the unvaccinated are protected — the basis of eradication (smallpox eradicated; polio nearly).",
    ],
    keyPoints: [
      "Active immunity: own antibodies, slow onset, long-lasting, has memory (vaccines).",
      "Passive immunity: ready-made antibodies, immediate, short-lived, NO memory (antisera, mother→baby).",
      "Toxoid = inactivated toxin used as a vaccine (tetanus, diphtheria).",
      "Live-attenuated vaccines (BCG, OPV, MMR) give strong lasting immunity but are contraindicated in pregnancy & immunodeficiency.",
      "Post-exposure (e.g. tetanus/rabies): give antiserum (passive, immediate) + vaccine (active, lasting) = combined immunisation.",
    ],
    diagram:
      "IMMUNITY\n ├─ Innate (non-specific, no memory)\n └─ Acquired (specific, memory)\n      ├─ ACTIVE  → body makes Ab (slow, lasting)\n      │    ├─ natural  = infection\n      │    └─ artificial = VACCINE\n      └─ PASSIVE → ready-made Ab (fast, short)\n           ├─ natural  = placenta/breast milk\n           └─ artificial = ANTISERUM / Ig\n\n VACCINES: Live-attenuated · Killed · Toxoid · Subunit/Conjugate",
    mnemonic: "ACTIVE = your Army trains (slow, remembers). PASSIVE = borrowed Protection (instant, forgets).",
    viva: [
      { q: "Differentiate active and passive immunity.", a: "Active immunity is produced by the host's own immune system after infection or vaccination — slow to develop, long-lasting, with memory. Passive immunity is conferred by ready-made antibodies given from outside (antiserum or maternal) — immediate but short-lived, without memory." },
      { q: "What is a toxoid? Give examples.", a: "A toxoid is an exotoxin that has been inactivated (e.g. by formalin) so it loses toxicity but keeps antigenicity — used as a vaccine. Examples: tetanus and diphtheria toxoids." },
      { q: "Give an example of a live-attenuated vaccine and a contraindication.", a: "BCG, oral polio (OPV) or MMR are live-attenuated; they are contraindicated in pregnancy and in immunocompromised individuals." },
      { q: "How would you protect an unimmunised person with a dirty wound against tetanus?", a: "Give both — human tetanus immunoglobulin/antitoxin (passive, immediate protection) and tetanus toxoid (active, lasting protection): combined immunisation." },
      { q: "What is herd immunity?", a: "When a high proportion of a population is immune, transmission is interrupted, indirectly protecting the non-immune minority — the principle behind disease eradication." },
    ],
    mcqs: [
      {
        id: "micro-imm-1",
        question: "Passive immunity is characterised by:",
        options: [
          "Slow onset and long duration",
          "Immediate protection but short duration",
          "Production of memory cells",
          "Being generated by vaccination",
        ],
        answerIndex: 1,
        explanation: "Passive immunity gives ready-made antibodies — protection is immediate but short-lived and there is no immunological memory.",
      },
      {
        id: "micro-imm-2",
        question: "Which of the following is a live-attenuated vaccine?",
        options: ["Tetanus toxoid", "Inactivated (Salk) polio vaccine", "BCG", "Hepatitis B vaccine"],
        answerIndex: 2,
        explanation: "BCG (against TB) is live-attenuated. Tetanus is a toxoid, Salk/IPV is inactivated, and Hepatitis B is a recombinant subunit vaccine.",
      },
      {
        id: "micro-imm-3",
        question: "A toxoid is:",
        options: [
          "A live weakened organism",
          "An inactivated exotoxin used as a vaccine",
          "A ready-made antibody preparation",
          "A killed whole bacterium",
        ],
        answerIndex: 1,
        explanation: "A toxoid is an exotoxin inactivated to remove toxicity while retaining antigenicity — e.g. tetanus and diphtheria toxoids.",
      },
      {
        id: "micro-imm-4",
        question: "Transfer of maternal antibodies to the fetus across the placenta is an example of:",
        options: [
          "Natural active immunity",
          "Artificial active immunity",
          "Natural passive immunity",
          "Artificial passive immunity",
        ],
        answerIndex: 2,
        explanation: "Maternal (placental/breast-milk) antibody transfer is naturally acquired passive immunity — immediate but temporary protection for the infant.",
      },
    ],
    flashcards: [
      { front: "Active vs passive immunity — onset & memory?", back: "Active: slow onset, long-lasting, HAS memory (vaccine). Passive: immediate, short-lived, NO memory (antiserum)." },
      { front: "Name the 4 vaccine types.", back: "Live-attenuated (BCG/MMR/OPV), Killed/inactivated (rabies/IPV), Toxoid (tetanus/diphtheria), Subunit/conjugate (HepB/Hib/HPV)." },
      { front: "What is a toxoid?", back: "An inactivated exotoxin used as a vaccine (tetanus, diphtheria)." },
      { front: "Live-attenuated vaccines — key contraindications?", back: "Pregnancy and immunocompromised states." },
    ],
  },
];

export function getMicroTopic(slug: string): MicroTopic | undefined {
  return MICRO_TOPICS.find((t) => t.slug === slug);
}

export const MICRO_STATS = {
  topicCount: MICRO_TOPICS.length,
  mcqCount: MICRO_TOPICS.reduce((n, t) => n + t.mcqs.length, 0),
  vivaCount: MICRO_TOPICS.reduce((n, t) => n + t.viva.length, 0),
  flashcardCount: MICRO_TOPICS.reduce((n, t) => n + t.flashcards.length, 0),
};

// ── MCQ data validation ──────────────────────────────────────────────────────
// Dev-only structural check over the Microbiology MCQs (delegates to the shared
// generic validator so every subject uses identical rules).
export type { MCQProblem };
export function validateMCQs(): MCQProblem[] {
  return validateSubjectMCQs(MICRO_TOPICS);
}

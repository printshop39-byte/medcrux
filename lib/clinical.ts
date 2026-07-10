import type { MCQ } from "./types";
import { validateMCQs as validateSubjectMCQs, type MCQProblem } from "./mcq-validate";

// ── Clinical Examination module (self-contained subject, same pattern) ─────────
// Indian/international reference: Macleod's Clinical Examination. Content is
// written from scratch in our own words (concept mapping only) — NOT copied.
//
// No Russian lecture PDFs for this subject, so `lectureRef` is undefined and each
// topic carries a `syllabusRef` = the standard Russian propaedeutics discipline
// (Пропедевтика внутренних болезней), shown as an honest "Std. syllabus" badge.
// bookRef cites the Macleod chapter (topic level; no fabricated page numbers).

export interface ClinicalFlashcard {
  front: string;
  back: string;
}

export interface ClinicalTopic {
  slug: string; // namespaced "clin-*"
  title: string;
  icon: string;
  order: number;
  summary: string;
  lectureRef?: string; // set only when matched to an actual uploaded lecture PDF
  syllabusRef?: string; // standard Russian MBBS propaedeutics discipline/module
  bookRef: string; // Macleod chapter pointer
  importantForExam: boolean;
  easyNotes: string[];
  keyPoints: string[];
  diagram: string;
  mnemonic?: string;
  viva: { q: string; a: string }[];
  mcqs: MCQ[];
  flashcards: ClinicalFlashcard[];
}

export const CLINICAL_TOPICS: ClinicalTopic[] = [
  // 1 ───────────────────────────────────────────────────────────────────────
  {
    slug: "clin-history",
    title: "History Taking",
    icon: "💬",
    order: 1,
    summary: "How to take a full medical history — the structure, pain analysis (SOCRATES), and systemic enquiry.",
    syllabusRef: "Пропедевтика внутренних болезней — Расспрос больного, анамнез (History taking)",
    bookRef: "Macleod's Clinical Examination — The history",
    importantForExam: true,
    easyNotes: [
      "History taking = talking to the patient in a set order to find the diagnosis. It often gives the diagnosis BEFORE you even examine.",
      "Standard sequence: Presenting Complaint (PC) → History of Presenting Complaint (HPC) → Past Medical History (PMH) → Drug history & allergies → Family history → Social history → Systemic enquiry.",
      "For any PAIN, analyse it with SOCRATES: Site, Onset, Character, Radiation, Associated symptoms, Timing, Exacerbating/relieving factors, Severity.",
      "Social history matters a lot: smoking (pack-years), alcohol (units), occupation, travel, and living situation — these change the differential.",
      "Always start by introducing yourself, confirming the patient's name and consent, and using open questions first, then closed questions to fill gaps.",
    ],
    keyPoints: [
      "Order: PC → HPC → PMH → Drugs/allergies → Family → Social → Systemic enquiry.",
      "SOCRATES analyses pain (Site, Onset, Character, Radiation, Associations, Timing, Exacerbating/relieving, Severity).",
      "Smoking = pack-years (packs/day × years); alcohol = units/week.",
      "Open questions first ('Tell me about…'), then closed questions to clarify.",
      "A good history alone suggests the diagnosis in the majority of cases.",
    ],
    diagram:
      "HISTORY STRUCTURE\n PC → HPC → PMH → Drugs/Allergies → Family Hx → Social Hx → Systemic enquiry\n\n PAIN = SOCRATES\n Site · Onset · Character · Radiation · Associations · Timing · Exacerbating/relieving · Severity",
    mnemonic: "Pain → 'SOCRATES'. Social history → 'SAD' = Smoking, Alcohol, Drugs (+ occupation/travel).",
    viva: [
      { q: "What does the mnemonic SOCRATES stand for?", a: "Site, Onset, Character, Radiation, Associated symptoms, Timing, Exacerbating/relieving factors, and Severity — used to analyse any pain." },
      { q: "List the components of a full medical history in order.", a: "Presenting complaint, history of presenting complaint, past medical history, drug history and allergies, family history, social history, and systemic enquiry." },
      { q: "How do you quantify a patient's smoking?", a: "In pack-years = number of packs smoked per day multiplied by the number of years smoked (1 pack = 20 cigarettes)." },
      { q: "Why is the history so important?", a: "Because a carefully taken history alone provides the correct diagnosis in the majority of patients, guiding targeted examination and investigations." },
    ],
    mcqs: [
      {
        id: "clin-hist-1",
        question: "The mnemonic SOCRATES is used to analyse a patient's:",
        options: ["Drug history", "Pain", "Family history", "Nutritional status"],
        answerIndex: 1,
        explanation: "SOCRATES (Site, Onset, Character, Radiation, Associations, Timing, Exacerbating/relieving, Severity) is the standard framework for analysing pain.",
      },
      {
        id: "clin-hist-2",
        question: "In a standard history, the drug history and allergies are usually recorded:",
        options: [
          "Before the presenting complaint",
          "After the past medical history",
          "Only if the patient asks",
          "During the systemic enquiry",
        ],
        answerIndex: 1,
        explanation: "The conventional order is PC → HPC → PMH → drug history & allergies → family → social → systemic enquiry.",
      },
      {
        id: "clin-hist-3",
        question: "One pack-year is equivalent to smoking:",
        options: [
          "20 cigarettes per day for 1 year",
          "1 cigarette per day for 20 years",
          "20 cigarettes total",
          "1 pack per week for 1 year",
        ],
        answerIndex: 0,
        explanation: "A pack-year = 20 cigarettes (1 pack) per day for one year; multiply packs/day by years smoked.",
      },
    ],
    flashcards: [
      { front: "SOCRATES — what is it for?", back: "Analysing pain: Site, Onset, Character, Radiation, Associations, Timing, Exacerbating/relieving, Severity." },
      { front: "Order of a full history?", back: "PC → HPC → PMH → Drugs/allergies → Family → Social → Systemic enquiry." },
      { front: "How to quantify smoking?", back: "Pack-years = packs/day × years (1 pack = 20 cigarettes)." },
    ],
  },

  // 2 ───────────────────────────────────────────────────────────────────────
  {
    slug: "clin-general",
    title: "General Physical Examination",
    icon: "👤",
    order: 2,
    summary: "The general survey, vital signs, and the peripheral signs found in the hands, face and neck.",
    syllabusRef: "Пропедевтика внутренних болезней — Общий осмотр больного (General examination)",
    bookRef: "Macleod's Clinical Examination — The general examination",
    importantForExam: true,
    easyNotes: [
      "Start every examination with a GENERAL SURVEY from the end of the bed: is the patient comfortable or distressed, conscious, well or ill, their build and nutrition, and any obvious clues (oxygen, drips, inhalers).",
      "VITAL SIGNS: pulse (rate, rhythm, volume), blood pressure, respiratory rate, temperature, and oxygen saturation (SpO₂).",
      "Then examine the HANDS for peripheral signs: clubbing, cyanosis, pallor of palmar creases (anaemia), koilonychia, leuconychia, tremor, and signs like splinter haemorrhages.",
      "Move to the FACE & EYES: conjunctival pallor (anaemia), scleral icterus (jaundice), and central cyanosis (tongue/lips).",
      "Then the NECK: lymph nodes and the jugular venous pressure (JVP). Finally check for pedal (ankle) oedema.",
      "The classic quick-screen signs are remembered as: Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema (and dehydration).",
    ],
    keyPoints: [
      "Always begin with an end-of-the-bed general survey before touching the patient.",
      "Vital signs: pulse, BP, respiratory rate, temperature, SpO₂.",
      "Quick screen: Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema (PICCLE).",
      "Central cyanosis is seen in the tongue/lips; peripheral cyanosis in the fingers/toes.",
      "Clubbing = loss of the normal nail-bed angle (Schamroth's window sign disappears).",
    ],
    diagram:
      "GENERAL EXAMINATION\n 1. General survey (end of bed): comfortable? conscious? well/ill? build/nutrition\n 2. Vitals: Pulse · BP · RR · Temp · SpO₂\n 3. Hands: clubbing, cyanosis, pallor, koilonychia, tremor\n 4. Face/eyes: pallor (anaemia), icterus (jaundice), central cyanosis\n 5. Neck: lymph nodes, JVP → then pedal oedema\n Quick screen = PICCLE (Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema)",
    mnemonic: "Quick head-to-toe screen → 'PICCLE' = Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema.",
    viva: [
      { q: "What is the difference between central and peripheral cyanosis?", a: "Central cyanosis is bluish discolouration of the tongue and lips due to low arterial oxygen saturation; peripheral cyanosis affects the extremities (fingers, toes) and is due to reduced peripheral blood flow, with normal central colour." },
      { q: "Where do you look for pallor and jaundice?", a: "Pallor is best seen in the lower conjunctiva and palmar creases; jaundice (icterus) is best seen in the sclera in good daylight." },
      { q: "What is clubbing and how do you demonstrate it?", a: "Clubbing is bulbous enlargement of the finger-tips with loss of the normal nail-fold angle. Schamroth's sign: placing the dorsal surfaces of two opposite nails together normally leaves a diamond-shaped window, which is lost in clubbing." },
      { q: "List the five standard vital signs.", a: "Pulse (heart rate), blood pressure, respiratory rate, temperature, and oxygen saturation (SpO₂)." },
    ],
    mcqs: [
      {
        id: "clin-gen-1",
        question: "Central cyanosis is best detected by examining the:",
        options: ["Finger nails", "Tongue and lips", "Palmar creases", "Sclera"],
        answerIndex: 1,
        explanation: "Central cyanosis (low arterial O₂) is seen in the tongue and lips; peripheral cyanosis affects the fingers/toes.",
      },
      {
        id: "clin-gen-2",
        question: "Jaundice (icterus) is most reliably detected in the:",
        options: ["Palms", "Sclera", "Nail beds", "Ear lobes"],
        answerIndex: 1,
        explanation: "Scleral icterus, examined in good daylight, is the most reliable clinical sign of jaundice.",
      },
      {
        id: "clin-gen-3",
        question: "Schamroth's window sign is used to detect:",
        options: ["Cyanosis", "Clubbing", "Koilonychia", "Splinter haemorrhages"],
        answerIndex: 1,
        explanation: "Loss of the diamond-shaped window when opposing nail beds are apposed indicates finger clubbing.",
      },
      {
        id: "clin-gen-4",
        question: "Which of these is NOT one of the standard vital signs?",
        options: ["Blood pressure", "Respiratory rate", "Oxygen saturation", "Jugular venous pressure"],
        answerIndex: 3,
        explanation: "Vital signs are pulse, BP, respiratory rate, temperature and SpO₂. JVP is part of the cardiovascular examination.",
      },
    ],
    flashcards: [
      { front: "PICCLE screen?", back: "Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema — the quick general screen." },
      { front: "Central vs peripheral cyanosis site?", back: "Central: tongue/lips (low arterial O₂). Peripheral: fingers/toes (poor flow)." },
      { front: "Where to look for jaundice?", back: "Sclera, in good daylight." },
      { front: "Schamroth's sign tests for?", back: "Finger clubbing (loss of the nail-bed diamond window)." },
    ],
  },

  // 3 ───────────────────────────────────────────────────────────────────────
  {
    slug: "clin-cardiovascular",
    title: "Cardiovascular Examination",
    icon: "❤️",
    order: 3,
    summary: "Examining the heart — pulse, JVP, apex beat, heart sounds and the four auscultation areas.",
    syllabusRef: "Пропедевтика внутренних болезней — Исследование сердечно-сосудистой системы (CVS)",
    bookRef: "Macleod's Clinical Examination — The cardiovascular system",
    importantForExam: true,
    easyNotes: [
      "Examine in the standard order (IPPA) after general/hands: pulse and blood pressure, jugular venous pressure (JVP), then Inspection, Palpation, Percussion (rarely) and Auscultation of the precordium.",
      "The APEX BEAT is normally in the 5th intercostal space, mid-clavicular line. Displaced/heaving apex suggests cardiomegaly or hypertrophy.",
      "Palpate for a heaving/thrusting apex (pressure overload), a diffuse apex (volume overload), thrills (palpable murmurs) and parasternal heaves (right ventricular enlargement).",
      "AUSCULTATE the 4 valve areas: Mitral (apex, 5th ICS MCL), Tricuspid (lower left sternal edge), Pulmonary (2nd ICS left), Aortic (2nd ICS right). Listen for S1, S2, added sounds (S3, S4) and murmurs.",
      "S1 = closure of mitral & tricuspid valves (start of systole); S2 = closure of aortic & pulmonary valves (end of systole).",
      "Describe a murmur by: timing (systolic/diastolic), site of maximal intensity, radiation, character, and grade (1–6).",
    ],
    keyPoints: [
      "Normal apex beat: 5th intercostal space, mid-clavicular line.",
      "Four auscultation areas: Aortic (2nd R), Pulmonary (2nd L), Tricuspid (lower L sternal edge), Mitral (apex).",
      "S1 = mitral + tricuspid closure (systole begins); S2 = aortic + pulmonary closure (systole ends).",
      "A thrill = a palpable murmur; a heave = sustained lift (ventricular hypertrophy/enlargement).",
      "Murmur description: timing, site, radiation, character, grade (1–6).",
    ],
    diagram:
      "CVS EXAMINATION (IPPA)\n Pulse · BP · JVP\n Inspection: scars, visible pulsations\n Palpation: APEX (5th ICS, MCL) · thrills · heaves\n Auscultation (4 areas):\n   Aortic (2nd R) · Pulmonary (2nd L) · Tricuspid (LLSE) · Mitral (apex)\n   S1 (mitral+tricuspid) → S2 (aortic+pulmonary) → murmurs",
    mnemonic: "Valve areas top→down, R→L → 'APT-M' = Aortic, Pulmonary, Tricuspid, Mitral. 'All Physicians Take Money.'",
    viva: [
      { q: "Where is the normal apex beat located?", a: "In the 5th intercostal space in the mid-clavicular line." },
      { q: "Name the four cardiac auscultation areas and their positions.", a: "Aortic — 2nd intercostal space, right sternal edge; Pulmonary — 2nd intercostal space, left sternal edge; Tricuspid — lower left sternal edge; Mitral — cardiac apex (5th ICS, mid-clavicular line)." },
      { q: "What produces the first and second heart sounds?", a: "S1 is produced by closure of the mitral and tricuspid (atrioventricular) valves at the start of systole; S2 by closure of the aortic and pulmonary (semilunar) valves at the end of systole." },
      { q: "What is the difference between a thrill and a heave?", a: "A thrill is a palpable murmur (vibration) felt over the precordium; a heave is a sustained, forceful lift of the chest wall indicating ventricular hypertrophy or enlargement." },
    ],
    mcqs: [
      {
        id: "clin-cvs-1",
        question: "The normal apex beat is located in the:",
        options: [
          "4th intercostal space, mid-clavicular line",
          "5th intercostal space, mid-clavicular line",
          "5th intercostal space, anterior axillary line",
          "2nd intercostal space, right sternal edge",
        ],
        answerIndex: 1,
        explanation: "The normal apex beat is in the 5th intercostal space in the mid-clavicular line.",
      },
      {
        id: "clin-cvs-2",
        question: "The first heart sound (S1) is caused by closure of the:",
        options: [
          "Aortic and pulmonary valves",
          "Mitral and tricuspid valves",
          "Aortic valve only",
          "Pulmonary valve only",
        ],
        answerIndex: 1,
        explanation: "S1 is due to closure of the mitral and tricuspid (AV) valves at the onset of systole; S2 is due to aortic and pulmonary valve closure.",
      },
      {
        id: "clin-cvs-3",
        question: "The aortic area for auscultation is at the:",
        options: [
          "2nd intercostal space, right sternal edge",
          "2nd intercostal space, left sternal edge",
          "5th intercostal space, mid-clavicular line",
          "Lower left sternal edge",
        ],
        answerIndex: 0,
        explanation: "The aortic area is the 2nd intercostal space at the right sternal edge; pulmonary is the 2nd ICS left.",
      },
      {
        id: "clin-cvs-4",
        question: "A palpable murmur felt over the precordium is called a:",
        options: ["Heave", "Thrill", "Bruit", "Tap"],
        answerIndex: 1,
        explanation: "A thrill is a palpable murmur; a heave is a sustained precordial lift from ventricular enlargement.",
      },
    ],
    flashcards: [
      { front: "Normal apex beat position?", back: "5th intercostal space, mid-clavicular line." },
      { front: "S1 and S2 — valve closures?", back: "S1 = mitral + tricuspid (systole starts). S2 = aortic + pulmonary (systole ends)." },
      { front: "Four auscultation areas?", back: "Aortic (2nd R), Pulmonary (2nd L), Tricuspid (lower L sternal edge), Mitral (apex)." },
      { front: "Thrill vs heave?", back: "Thrill = palpable murmur. Heave = sustained lift (ventricular hypertrophy/enlargement)." },
    ],
  },

  // 4 ───────────────────────────────────────────────────────────────────────
  {
    slug: "clin-respiratory",
    title: "Respiratory Examination",
    icon: "🫁",
    order: 4,
    summary: "Examining the chest — inspection, palpation, percussion and auscultation, and the classic sign patterns.",
    syllabusRef: "Пропедевтика внутренних болезней — Исследование органов дыхания (Respiratory)",
    bookRef: "Macleod's Clinical Examination — The respiratory system",
    importantForExam: true,
    easyNotes: [
      "Follow IPPA on the chest: Inspection, Palpation, Percussion, Auscultation — comparing the two sides at each step.",
      "INSPECTION: rate and pattern of breathing, chest shape (barrel chest in COPD), scars, symmetry of movement, and use of accessory muscles.",
      "PALPATION: check the trachea is central, assess chest expansion (reduced on the affected side), and feel tactile vocal fremitus.",
      "PERCUSSION: normal = resonant; DULL = consolidation/collapse/fibrosis; STONY DULL = pleural effusion; HYPER-RESONANT = pneumothorax or emphysema.",
      "AUSCULTATION: normal breath sounds are vesicular; BRONCHIAL breath sounds suggest consolidation. Added sounds: crackles (crepitations) in consolidation/oedema/fibrosis, and wheeze in airway narrowing (asthma/COPD).",
      "Vocal resonance mirrors fremitus: increased over consolidation, decreased/absent over an effusion.",
    ],
    keyPoints: [
      "Percussion: dull → consolidation; STONY dull → pleural effusion; hyper-resonant → pneumothorax.",
      "Bronchial breath sounds + increased vocal resonance = consolidation.",
      "Reduced expansion is on the side of the pathology.",
      "Trachea deviates AWAY from a tension pneumothorax/large effusion, and TOWARDS collapse/fibrosis.",
      "Wheeze = airway narrowing (asthma/COPD); fine crackles = pulmonary oedema/fibrosis.",
    ],
    diagram:
      "RESPIRATORY EXAM (IPPA, compare both sides)\n Inspect: rate, chest shape, movement, scars\n Palpate: trachea (central?), expansion, tactile vocal fremitus\n Percuss: resonant | DULL (consolidation) | STONY DULL (effusion) | HYPER-RESONANT (pneumothorax)\n Auscultate: vesicular vs BRONCHIAL breath sounds; crackles, wheeze; vocal resonance\n\n Trachea: AWAY from effusion/tension pneumothorax; TOWARDS collapse/fibrosis",
    mnemonic: "Chest exam order → 'IPPA' = Inspect, Palpate, Percuss, Auscultate. 'Stony dull = effusion.'",
    viva: [
      { q: "What percussion note is characteristic of a pleural effusion?", a: "A 'stony dull' percussion note over the effusion; consolidation gives a dull (but not stony) note, and pneumothorax gives a hyper-resonant note." },
      { q: "What are the auscultatory findings of lobar consolidation?", a: "Bronchial breath sounds, increased vocal resonance and tactile fremitus, and coarse crackles over the affected area, with dull percussion." },
      { q: "In which direction does the trachea deviate with a large pleural effusion versus lung collapse?", a: "A large effusion (or tension pneumothorax) pushes the trachea AWAY from the affected side; lung collapse or fibrosis pulls the trachea TOWARDS the affected side." },
      { q: "What does a wheeze indicate?", a: "Wheeze is a musical sound produced by narrowed airways, typically in asthma or COPD (and sometimes localised, e.g. from a tumour)." },
    ],
    mcqs: [
      {
        id: "clin-resp-1",
        question: "A 'stony dull' percussion note is most characteristic of:",
        options: ["Consolidation", "Pleural effusion", "Pneumothorax", "Normal lung"],
        answerIndex: 1,
        explanation: "Stony dullness indicates fluid (pleural effusion); consolidation is dull, pneumothorax is hyper-resonant.",
      },
      {
        id: "clin-resp-2",
        question: "Bronchial breath sounds with increased vocal resonance suggest:",
        options: ["Pleural effusion", "Pneumothorax", "Consolidation", "Asthma"],
        answerIndex: 2,
        explanation: "Consolidation transmits bronchial breath sounds and increases vocal resonance/fremitus over the affected lobe.",
      },
      {
        id: "clin-resp-3",
        question: "In a large left-sided pleural effusion, the trachea typically deviates:",
        options: [
          "Towards the left (affected) side",
          "Away from the affected side (to the right)",
          "It does not move",
          "Downwards",
        ],
        answerIndex: 1,
        explanation: "A large effusion or tension pneumothorax pushes the trachea away from the affected side; collapse/fibrosis pulls it towards.",
      },
      {
        id: "clin-resp-4",
        question: "A hyper-resonant percussion note on one side of the chest suggests:",
        options: ["Consolidation", "Pleural effusion", "Pneumothorax", "Lobar collapse"],
        answerIndex: 2,
        explanation: "Hyper-resonance indicates increased air, as in a pneumothorax (or emphysema).",
      },
    ],
    flashcards: [
      { front: "Chest examination sequence?", back: "IPPA: Inspection, Palpation, Percussion, Auscultation (compare both sides)." },
      { front: "Stony dull percussion = ?", back: "Pleural effusion." },
      { front: "Signs of consolidation?", back: "Dull percussion, bronchial breath sounds, increased vocal resonance/fremitus, crackles." },
      { front: "Trachea in effusion vs collapse?", back: "Effusion/tension pneumothorax → away. Collapse/fibrosis → towards." },
    ],
  },

  // 5 ───────────────────────────────────────────────────────────────────────
  {
    slug: "clin-abdominal",
    title: "Abdominal Examination",
    icon: "🫄",
    order: 5,
    summary: "Examining the abdomen — the nine regions, organ palpation, and detecting ascites.",
    syllabusRef: "Пропедевтика внутренних болезней — Исследование органов пищеварения (GI)",
    bookRef: "Macleod's Clinical Examination — The gastrointestinal system",
    importantForExam: true,
    easyNotes: [
      "Position the patient flat with the abdomen exposed from nipples to knees (in practice, mid-chest to symphysis). Examine in the order Inspection → Palpation → Percussion → Auscultation.",
      "The abdomen is divided into 9 REGIONS by two vertical (mid-clavicular) and two horizontal (subcostal & transtubercular) planes — useful for locating pain and masses.",
      "INSPECTION: distension, scars, visible peristalsis, dilated veins, and everted umbilicus.",
      "PALPATION: light palpation first (for tenderness/guarding), then deep palpation for masses, then examine LIVER (up from the right iliac fossa on inspiration), SPLEEN (towards the right iliac fossa), and KIDNEYS (ballot bimanually).",
      "PERCUSSION: liver span, splenic dullness, and SHIFTING DULLNESS to detect ascites (free fluid).",
      "AUSCULTATION: bowel sounds (absent in ileus, tinkling in obstruction) and bruits over the aorta/renal arteries.",
    ],
    keyPoints: [
      "9 regions: right/left hypochondrium, epigastric; right/left lumbar (flank), umbilical; right/left iliac (inguinal), hypogastric (suprapubic).",
      "Palpate the liver from the RIGHT ILIAC FOSSA upward; the spleen enlarges towards the right iliac fossa.",
      "The spleen is dull to percussion, has a notch, moves with respiration, and you cannot get above it — this distinguishes it from a kidney.",
      "Shifting dullness = free fluid (ascites).",
      "Absent bowel sounds → paralytic ileus; high-pitched tinkling → mechanical obstruction.",
    ],
    diagram:
      "ABDOMINAL EXAM (I-P-P-A)\n 9 regions (2 vertical + 2 horizontal planes):\n  R.hypochondrium | Epigastric | L.hypochondrium\n  R.lumbar        | Umbilical  | L.lumbar\n  R.iliac         | Hypogastric| L.iliac\n Palpate: light → deep → Liver (from RIF up) · Spleen (to RIF) · Kidneys (ballot)\n Percuss: liver span, SHIFTING DULLNESS (ascites)\n Auscultate: bowel sounds, bruits",
    mnemonic: "Spleen vs kidney → spleen: has a Notch, you Can't get above it, dull, moves with breathing. Kidney: ballotable, resonant (bowel in front), can get above it.",
    viva: [
      { q: "Into how many regions is the abdomen divided and by which planes?", a: "Nine regions, divided by two vertical (mid-clavicular) planes and two horizontal planes — the subcostal and the transtubercular (intertubercular) planes." },
      { q: "How do you distinguish an enlarged spleen from an enlarged left kidney?", a: "The spleen has a notch, is dull to percussion, moves down with inspiration, you cannot get above it, and it enlarges towards the right iliac fossa. A kidney is ballotable, resonant to percussion (overlying bowel), and you can get above it." },
      { q: "Which sign detects free fluid in the abdomen?", a: "Shifting dullness (and, for larger volumes, a fluid thrill) indicates ascites." },
      { q: "In which direction do you palpate for the liver and spleen?", a: "Begin in the right iliac fossa and move upward towards the right costal margin for the liver; for the spleen, palpate from the right iliac fossa up towards the left hypochondrium as it enlarges." },
    ],
    mcqs: [
      {
        id: "clin-abd-1",
        question: "Palpation for hepatomegaly should begin in the:",
        options: ["Epigastrium", "Right iliac fossa", "Left hypochondrium", "Suprapubic region"],
        answerIndex: 1,
        explanation: "Start in the right iliac fossa and move up on inspiration so an enlarged liver edge is not missed.",
      },
      {
        id: "clin-abd-2",
        question: "Which feature helps distinguish the spleen from the left kidney on examination?",
        options: [
          "The spleen is ballotable",
          "You cannot get above the spleen",
          "The spleen is resonant to percussion",
          "The kidney has a notch",
        ],
        answerIndex: 1,
        explanation: "You cannot get above an enlarged spleen; it is dull, notched and moves with respiration, unlike the ballotable, resonant kidney.",
      },
      {
        id: "clin-abd-3",
        question: "Shifting dullness on abdominal percussion indicates:",
        options: ["Hepatomegaly", "Ascites (free fluid)", "A solid mass", "Bowel obstruction"],
        answerIndex: 1,
        explanation: "Shifting dullness is the classic bedside sign of ascites (free peritoneal fluid).",
      },
      {
        id: "clin-abd-4",
        question: "High-pitched 'tinkling' bowel sounds are characteristic of:",
        options: ["Paralytic ileus", "Mechanical intestinal obstruction", "Ascites", "Normal bowel"],
        answerIndex: 1,
        explanation: "Tinkling, hyperactive bowel sounds suggest mechanical obstruction; absent sounds suggest paralytic ileus.",
      },
    ],
    flashcards: [
      { front: "How many abdominal regions?", back: "Nine — divided by 2 vertical (mid-clavicular) and 2 horizontal (subcostal, transtubercular) planes." },
      { front: "Spleen vs kidney — key sign?", back: "Can't get above the spleen (dull, notched, moves with breathing). Kidney is ballotable and resonant." },
      { front: "Sign of ascites?", back: "Shifting dullness (± fluid thrill)." },
      { front: "Palpate liver from where?", back: "From the right iliac fossa upward, on inspiration." },
    ],
  },

  // 6 ───────────────────────────────────────────────────────────────────────
  {
    slug: "clin-nervous",
    title: "Nervous System Examination",
    icon: "🧠",
    order: 6,
    summary: "The neurological examination — tone, power, reflexes, and telling upper from lower motor neuron lesions.",
    syllabusRef: "Пропедевтика / Неврология — Неврологическое исследование (Neurological exam)",
    bookRef: "Macleod's Clinical Examination — The nervous system",
    importantForExam: true,
    easyNotes: [
      "A full neuro exam runs: higher mental functions & speech → cranial nerves → then the limbs in the order tone → power → reflexes → coordination → sensation → gait.",
      "POWER is graded by the MRC scale 0–5: 0 = no movement, 1 = flicker, 2 = movement with gravity eliminated, 3 = against gravity, 4 = against resistance (reduced), 5 = normal power.",
      "REFLEXES are graded: absent, reduced, normal, brisk, or with clonus. The plantar response is normally flexor (down-going); an UP-going (extensor) plantar = Babinski sign = upper motor neuron lesion.",
      "UPPER motor neuron (UMN) lesion: increased tone (spasticity), brisk reflexes, up-going plantars, no wasting, weakness in a 'pyramidal' pattern.",
      "LOWER motor neuron (LMN) lesion: reduced tone (flaccid), reduced/absent reflexes, muscle wasting and fasciculations, down-going plantars.",
      "Always compare the two sides and correlate motor, reflex and sensory findings to localise the lesion.",
    ],
    keyPoints: [
      "MRC power grades 0–5 (0 = none, 3 = against gravity, 5 = normal).",
      "Babinski sign (extensor/up-going plantar) = UMN lesion; normal plantar is flexor.",
      "UMN lesion: ↑tone, ↑reflexes, up-going plantar, NO wasting.",
      "LMN lesion: ↓tone, ↓reflexes, wasting + fasciculations, down-going plantar.",
      "Examine limbs in order: tone → power → reflexes → coordination → sensation → gait.",
    ],
    diagram:
      "NEURO EXAM: higher functions → cranial nerves → limbs\n Limb order: TONE → POWER (MRC 0–5) → REFLEXES → COORDINATION → SENSATION → GAIT\n\n UMN lesion          LMN lesion\n ↑ tone (spastic)    ↓ tone (flaccid)\n ↑ reflexes          ↓/absent reflexes\n up-going plantar    down-going plantar\n no wasting          wasting + fasciculations",
    mnemonic: "UMN = 'everything UP' (tone, reflexes, plantar). LMN = 'everything DOWN' + wasting/fasciculations.",
    viva: [
      { q: "Describe the MRC scale for muscle power.", a: "0 = no contraction; 1 = flicker of contraction; 2 = active movement with gravity eliminated; 3 = movement against gravity; 4 = movement against resistance but weaker than normal; 5 = normal power." },
      { q: "What is the Babinski sign and what does it indicate?", a: "The Babinski sign is an extensor (up-going) plantar response — dorsiflexion of the big toe with fanning of the others on stroking the sole. It indicates an upper motor neuron (pyramidal tract) lesion. The normal response is flexor (down-going)." },
      { q: "Contrast the signs of an upper and a lower motor neuron lesion.", a: "UMN: increased tone (spasticity), brisk reflexes, extensor plantar, and no muscle wasting. LMN: reduced tone (flaccidity), diminished or absent reflexes, muscle wasting and fasciculations, and flexor plantar." },
      { q: "In what order do you examine a limb neurologically?", a: "Inspection, then tone, power, reflexes, coordination, sensation, and finally gait." },
    ],
    mcqs: [
      {
        id: "clin-neuro-1",
        question: "On the MRC scale, movement against gravity but not against resistance is grade:",
        options: ["Grade 2", "Grade 3", "Grade 4", "Grade 5"],
        answerIndex: 1,
        explanation: "Grade 3 = active movement against gravity; grade 4 = against resistance; grade 2 = only with gravity eliminated.",
      },
      {
        id: "clin-neuro-2",
        question: "An extensor (up-going) plantar response indicates:",
        options: [
          "A lower motor neuron lesion",
          "An upper motor neuron lesion",
          "A cerebellar lesion",
          "A normal finding in adults",
        ],
        answerIndex: 1,
        explanation: "The Babinski sign (up-going plantar) indicates an upper motor neuron (pyramidal) lesion; the normal adult response is flexor.",
      },
      {
        id: "clin-neuro-3",
        question: "Muscle wasting with fasciculations and absent reflexes is typical of a:",
        options: [
          "Upper motor neuron lesion",
          "Lower motor neuron lesion",
          "Cerebellar lesion",
          "Sensory neuropathy only",
        ],
        answerIndex: 1,
        explanation: "Wasting, fasciculations, flaccidity and absent reflexes are hallmarks of a lower motor neuron lesion.",
      },
      {
        id: "clin-neuro-4",
        question: "Which finding is characteristic of an upper motor neuron lesion?",
        options: ["Reduced tone", "Muscle fasciculations", "Increased (brisk) reflexes", "Marked muscle wasting"],
        answerIndex: 2,
        explanation: "UMN lesions cause increased tone and brisk reflexes with up-going plantars; wasting and fasciculations point to LMN lesions.",
      },
    ],
    flashcards: [
      { front: "MRC power grade 3?", back: "Movement against gravity (but not against resistance)." },
      { front: "Babinski (up-going plantar) means?", back: "Upper motor neuron (pyramidal) lesion. Normal = flexor/down-going." },
      { front: "UMN vs LMN — tone & reflexes?", back: "UMN: ↑tone, ↑reflexes, no wasting. LMN: ↓tone, ↓reflexes, wasting + fasciculations." },
      { front: "Order of limb neuro exam?", back: "Tone → Power → Reflexes → Coordination → Sensation → Gait." },
    ],
  },

  // 7 ───────────────────────────────────────────────────────────────────────
  {
    slug: "clin-cranial-nerves",
    title: "Cranial Nerves Examination",
    icon: "👁️",
    order: 7,
    summary: "The twelve cranial nerves — their names, functions and how each is tested at the bedside.",
    syllabusRef: "Неврология — Черепные нервы (Cranial nerves)",
    bookRef: "Macleod's Clinical Examination — The nervous system (cranial nerves)",
    importantForExam: true,
    easyNotes: [
      "There are 12 cranial nerves (I–XII). Learn each by name, whether it is Sensory/Motor/Both, and one bedside test.",
      "I Olfactory (smell), II Optic (vision, acuity, fields, fundi), III Oculomotor + IV Trochlear + VI Abducens (eye movements, pupils, ptosis).",
      "V Trigeminal (facial sensation + muscles of mastication), VII Facial (facial expression + taste anterior tongue), VIII Vestibulocochlear (hearing & balance).",
      "IX Glossopharyngeal + X Vagus (gag reflex, swallowing, palate movement — 'say aah'), XI Accessory (trapezius shrug, sternocleidomastoid), XII Hypoglossal (tongue movement — protrude, look for deviation).",
      "A UMN (central) VII palsy spares the forehead (bilateral cortical supply); a LMN (Bell's) palsy affects the whole half of the face including the forehead — a classic exam point.",
      "Function type: remember 'Some Say Marry Money But My Brother Says Big Brains Matter More' for Sensory/Motor/Both of I–XII.",
    ],
    keyPoints: [
      "12 cranial nerves I–XII; test name + function + one bedside test each.",
      "Eye movements = III (oculomotor), IV (trochlear – superior oblique), VI (abducens – lateral rectus).",
      "UMN facial (VII) palsy spares the forehead; LMN (Bell's) palsy involves the forehead.",
      "IX & X: gag reflex and palatal movement ('say aah' — uvula deviates AWAY from the lesion).",
      "XII lesion: protruded tongue deviates TOWARDS the side of the lesion.",
    ],
    diagram:
      "12 CRANIAL NERVES\n I Olfactory · II Optic · III Oculomotor · IV Trochlear · V Trigeminal · VI Abducens\n VII Facial · VIII Vestibulocochlear · IX Glossopharyngeal · X Vagus · XI Accessory · XII Hypoglossal\n\n Eye movement: III, IV (SO4), VI (LR6)\n VII: UMN spares forehead | LMN (Bell's) involves forehead\n XII: tongue deviates TOWARDS the lesion",
    mnemonic: "Names → 'On Old Olympus' Towering Tops A Finn And German Viewed Some Hops' (I–XII). Type (S/M/B) → 'Some Say Marry Money But My Brother Says Big Brains Matter Most.'",
    viva: [
      { q: "Which cranial nerves control eye movements?", a: "The oculomotor (III), trochlear (IV — supplies superior oblique), and abducens (VI — supplies lateral rectus) nerves. 'LR6, SO4, all the rest 3.'" },
      { q: "How do you distinguish an upper from a lower motor neuron facial (VII) palsy?", a: "In an UMN (central) lesion the forehead is spared because it has bilateral cortical innervation, so the patient can still wrinkle the forehead; in an LMN lesion (e.g. Bell's palsy) the whole half of the face including the forehead is weak." },
      { q: "In a hypoglossal (XII) nerve lesion, which way does the tongue deviate?", a: "On protrusion, the tongue deviates towards the side of the lesion (the weak side)." },
      { q: "How is the vagus/glossopharyngeal function tested?", a: "By the gag reflex and by asking the patient to 'say aah' and watching the soft palate and uvula — the uvula deviates away from the side of a vagal lesion." },
    ],
    mcqs: [
      {
        id: "clin-cn-1",
        question: "The lateral rectus muscle of the eye is supplied by which cranial nerve?",
        options: ["Oculomotor (III)", "Trochlear (IV)", "Abducens (VI)", "Optic (II)"],
        answerIndex: 2,
        explanation: "The abducens nerve (VI) supplies the lateral rectus ('LR6'); the trochlear (IV) supplies superior oblique ('SO4').",
      },
      {
        id: "clin-cn-2",
        question: "In an upper motor neuron facial nerve palsy, the forehead is:",
        options: ["Completely paralysed", "Spared (still wrinkles)", "More affected than the lower face", "Not testable"],
        answerIndex: 1,
        explanation: "The forehead has bilateral cortical supply, so it is spared in an UMN (central) VII palsy but involved in an LMN (Bell's) palsy.",
      },
      {
        id: "clin-cn-3",
        question: "In a hypoglossal (XII) nerve lesion, the protruded tongue deviates:",
        options: [
          "Away from the side of the lesion",
          "Towards the side of the lesion",
          "Straight, with no deviation",
          "Upwards",
        ],
        answerIndex: 1,
        explanation: "A lower motor neuron XII lesion causes the tongue to deviate towards the weak (lesioned) side on protrusion.",
      },
      {
        id: "clin-cn-4",
        question: "The sense of smell is carried by which cranial nerve?",
        options: ["Optic (II)", "Olfactory (I)", "Trigeminal (V)", "Facial (VII)"],
        answerIndex: 1,
        explanation: "The olfactory nerve (I) carries the sense of smell; the optic nerve (II) carries vision.",
      },
    ],
    flashcards: [
      { front: "Which nerves move the eyes?", back: "III oculomotor, IV trochlear (superior oblique), VI abducens (lateral rectus). 'LR6 SO4 rest 3.'" },
      { front: "UMN vs LMN facial palsy — forehead?", back: "UMN spares the forehead; LMN (Bell's) involves the forehead." },
      { front: "XII lesion — tongue deviates?", back: "Towards the side of the lesion (on protrusion)." },
      { front: "Cranial nerve names mnemonic?", back: "'On Old Olympus' Towering Tops A Finn And German Viewed Some Hops' (I–XII)." },
    ],
  },

  // 8 ───────────────────────────────────────────────────────────────────────
  {
    slug: "clin-musculoskeletal",
    title: "Musculoskeletal (GALS) Examination",
    icon: "🦴",
    order: 8,
    summary: "The GALS screen and the look–feel–move approach to joints.",
    syllabusRef: "Пропедевтика внутренних болезней — Опорно-двигательный аппарат (Musculoskeletal)",
    bookRef: "Macleod's Clinical Examination — The musculoskeletal system",
    importantForExam: true,
    easyNotes: [
      "GALS is a quick screening examination of the musculoskeletal system: Gait, Arms, Legs, Spine.",
      "Start with three screening questions: any pain/stiffness in muscles/joints? any difficulty dressing? any difficulty with stairs?",
      "GAIT: watch the patient walk and turn — looking for symmetry, smoothness, and any limp or abnormality.",
      "Each individual joint is examined by LOOK – FEEL – MOVE: Look (swelling, deformity, redness, wasting), Feel (warmth, tenderness, effusion), Move (active then passive range, and function).",
      "Record the range of movement and compare with the other side; note any deformity, instability or crepitus.",
      "Common patterns: rheumatoid arthritis affects small joints symmetrically (MCP/PIP, spares DIP); osteoarthritis affects weight-bearing and DIP joints.",
    ],
    keyPoints: [
      "GALS = Gait, Arms, Legs, Spine — the MSK screening exam.",
      "Every joint: LOOK – FEEL – MOVE (active then passive).",
      "Three screening questions cover pain/stiffness, dressing, and stairs.",
      "Rheumatoid arthritis: symmetrical small joints (MCP, PIP), spares DIP; OA involves DIP (Heberden's nodes).",
      "Always compare both sides and assess function, not just range.",
    ],
    diagram:
      "GALS SCREEN = Gait · Arms · Legs · Spine\n Screening Qs: pain/stiffness? dressing? stairs?\n\n Each JOINT → LOOK (swelling, deformity, wasting)\n            → FEEL (warmth, tenderness, effusion)\n            → MOVE (active → passive range; function)",
    mnemonic: "Screen → 'GALS' (Gait, Arms, Legs, Spine). Each joint → 'Look, Feel, Move.'",
    viva: [
      { q: "What does the GALS acronym stand for?", a: "Gait, Arms, Legs, Spine — a rapid screening examination of the musculoskeletal system." },
      { q: "Describe the general approach to examining any single joint.", a: "Look (for swelling, deformity, redness, muscle wasting), Feel (for warmth, tenderness, effusion, crepitus), and Move (active then passive range of movement, plus assessment of function), always comparing with the opposite side." },
      { q: "How does the joint distribution of rheumatoid arthritis differ from osteoarthritis?", a: "Rheumatoid arthritis affects the small joints symmetrically (metacarpophalangeal and proximal interphalangeal joints) and spares the DIP joints; osteoarthritis typically affects weight-bearing joints and the DIP joints (Heberden's nodes)." },
      { q: "What three screening questions begin a GALS assessment?", a: "Do you have any pain or stiffness in your muscles, joints or back? Can you dress yourself completely without difficulty? Can you walk up and down stairs without difficulty?" },
    ],
    mcqs: [
      {
        id: "clin-msk-1",
        question: "The GALS musculoskeletal screen stands for:",
        options: [
          "Gait, Arms, Legs, Spine",
          "General, Arms, Limbs, Skin",
          "Gait, Ankle, Leg, Shoulder",
          "Grip, Arms, Legs, Stance",
        ],
        answerIndex: 0,
        explanation: "GALS = Gait, Arms, Legs, Spine — a quick screening examination for musculoskeletal disease.",
      },
      {
        id: "clin-msk-2",
        question: "The standard sequence for examining an individual joint is:",
        options: ["Inspect, Percuss, Auscultate", "Look, Feel, Move", "Palpate, Percuss, Move", "Feel, Move, Look"],
        answerIndex: 1,
        explanation: "Joints are examined by Look, Feel, Move (active then passive), comparing with the opposite side.",
      },
      {
        id: "clin-msk-3",
        question: "Which joints are characteristically SPARED in rheumatoid arthritis?",
        options: [
          "Metacarpophalangeal (MCP) joints",
          "Proximal interphalangeal (PIP) joints",
          "Distal interphalangeal (DIP) joints",
          "Wrists",
        ],
        answerIndex: 2,
        explanation: "Rheumatoid arthritis typically spares the DIP joints (which are characteristically involved in osteoarthritis — Heberden's nodes).",
      },
    ],
    flashcards: [
      { front: "GALS stands for?", back: "Gait, Arms, Legs, Spine — the MSK screening exam." },
      { front: "How to examine any joint?", back: "Look, Feel, Move (active then passive) — compare both sides." },
      { front: "RA vs OA joint distribution?", back: "RA: symmetrical MCP/PIP, spares DIP. OA: DIP (Heberden's) + weight-bearing joints." },
    ],
  },

  // 9 ───────────────────────────────────────────────────────────────────────
  {
    slug: "clin-thyroid",
    title: "Thyroid Examination",
    icon: "🦋",
    order: 9,
    summary: "Examining the thyroid gland and recognising the signs of over- and under-activity.",
    syllabusRef: "Пропедевтика / Эндокринология — Исследование щитовидной железы (Thyroid)",
    bookRef: "Macleod's Clinical Examination — The endocrine system",
    importantForExam: true,
    easyNotes: [
      "The thyroid is examined by inspection, palpation (from BEHIND), percussion and auscultation — plus a check of thyroid status (hyper/hypo).",
      "INSPECTION: look at the neck for a swelling; ask the patient to SWALLOW a sip of water — a thyroid swelling moves UP with swallowing (it is attached to the larynx). Ask them to stick out the TONGUE — a thyroglossal cyst moves up with tongue protrusion.",
      "PALPATION from behind: assess size, symmetry, consistency, nodules (solitary vs multinodular), tenderness, and whether you can get below it (retrosternal extension).",
      "PERCUSSION over the manubrium for retrosternal goitre; AUSCULTATION for a bruit (increased vascularity in Graves' disease).",
      "HYPERthyroidism signs: weight loss, heat intolerance, tremor, tachycardia/AF, sweating, and (in Graves') eye signs — exophthalmos, lid lag.",
      "HYPOthyroidism signs: weight gain, cold intolerance, dry skin, slow relaxing reflexes, bradycardia, and hoarse voice.",
    ],
    keyPoints: [
      "A thyroid swelling moves UP on SWALLOWING; a thyroglossal cyst moves up on TONGUE PROTRUSION.",
      "Palpate the thyroid from BEHIND the patient.",
      "A bruit over the thyroid suggests Graves' disease (increased vascularity).",
      "Hyperthyroid: weight loss, heat intolerance, tremor, tachycardia/AF, lid lag/exophthalmos (Graves').",
      "Hypothyroid: weight gain, cold intolerance, bradycardia, slow-relaxing reflexes, dry skin.",
    ],
    diagram:
      "THYROID EXAM\n Inspect: neck swelling → SWALLOW (thyroid moves up) → TONGUE OUT (thyroglossal cyst moves up)\n Palpate (from BEHIND): size, nodules, consistency, retrosternal (can you get below?)\n Percuss: retrosternal goitre | Auscultate: bruit (Graves')\n\n HYPER: weight↓, heat intolerance, tremor, AF, lid lag/exophthalmos\n HYPO:  weight↑, cold intolerance, bradycardia, slow reflexes, dry skin",
    mnemonic: "Swallow → thyroid moves up. Tongue out → thyroglossal cyst moves up. Bruit → Graves'.",
    viva: [
      { q: "How do you clinically confirm that a neck swelling is thyroid in origin?", a: "Ask the patient to swallow a sip of water — a thyroid swelling moves upward with swallowing because it is bound to the larynx by the pretracheal fascia." },
      { q: "How do you distinguish a thyroglossal cyst from a thyroid swelling?", a: "A thyroglossal cyst moves upward when the patient protrudes the tongue (as well as on swallowing), because of its attachment to the base of the tongue via the thyroglossal tract; a thyroid swelling moves only on swallowing." },
      { q: "Why do you palpate the thyroid from behind?", a: "Standing behind the seated patient allows you to use the fingers of both hands to palpate the lobes and isthmus symmetrically and comfortably while the patient swallows." },
      { q: "Name three signs of hyperthyroidism.", a: "Weight loss with increased appetite, heat intolerance and sweating, fine tremor, tachycardia or atrial fibrillation, and (in Graves' disease) exophthalmos and lid lag." },
    ],
    mcqs: [
      {
        id: "clin-thy-1",
        question: "A thyroid swelling characteristically moves upward when the patient:",
        options: ["Protrudes the tongue", "Swallows", "Turns the head", "Coughs"],
        answerIndex: 1,
        explanation: "The thyroid is attached to the larynx, so a thyroid swelling moves up on swallowing. A thyroglossal cyst also moves on tongue protrusion.",
      },
      {
        id: "clin-thy-2",
        question: "The thyroid gland is best palpated with the examiner positioned:",
        options: ["In front of the patient", "Behind the patient", "To the patient's left only", "Below the patient"],
        answerIndex: 1,
        explanation: "Palpating from behind allows symmetrical bimanual assessment of both lobes and the isthmus while the patient swallows.",
      },
      {
        id: "clin-thy-3",
        question: "An audible bruit over the thyroid gland most suggests:",
        options: ["Hashimoto's thyroiditis", "Graves' disease", "A simple cyst", "Hypothyroidism"],
        answerIndex: 1,
        explanation: "A thyroid bruit reflects increased vascularity, classically in Graves' disease (hyperthyroidism).",
      },
      {
        id: "clin-thy-4",
        question: "Which finding suggests HYPOthyroidism rather than hyperthyroidism?",
        options: ["Fine tremor", "Heat intolerance", "Slow-relaxing reflexes", "Atrial fibrillation"],
        answerIndex: 2,
        explanation: "Slow-relaxing reflexes, bradycardia, cold intolerance and weight gain indicate hypothyroidism; tremor, heat intolerance and AF indicate hyperthyroidism.",
      },
    ],
    flashcards: [
      { front: "Thyroid swelling — moves with?", back: "Swallowing (attached to the larynx). Thyroglossal cyst also moves on tongue protrusion." },
      { front: "Palpate thyroid from?", back: "Behind the patient (bimanual), while they swallow." },
      { front: "Thyroid bruit suggests?", back: "Graves' disease (increased vascularity)." },
      { front: "Hyper- vs hypo-thyroid reflexes?", back: "Hyper: brisk. Hypo: slow-relaxing reflexes." },
    ],
  },
];

export function getClinicalTopic(slug: string): ClinicalTopic | undefined {
  return CLINICAL_TOPICS.find((t) => t.slug === slug);
}

export const CLINICAL_STATS = {
  topicCount: CLINICAL_TOPICS.length,
  mcqCount: CLINICAL_TOPICS.reduce((n, t) => n + t.mcqs.length, 0),
  vivaCount: CLINICAL_TOPICS.reduce((n, t) => n + t.viva.length, 0),
  flashcardCount: CLINICAL_TOPICS.reduce((n, t) => n + t.flashcards.length, 0),
};

export type { MCQProblem };
export function validateMCQs(): MCQProblem[] {
  return validateSubjectMCQs(CLINICAL_TOPICS);
}

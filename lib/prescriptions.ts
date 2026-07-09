import { Prescription } from "./types";

// Prescription-writing (рецептура) practice — model answers in the classic
// Latin Rp. / D.t.d. / S. format used in Russian medical university exams.
export const PRESCRIPTIONS: Prescription[] = [
  {
    id: "rx-paracetamol",
    drug: "Paracetamol",
    indication: "Fever / mild pain",
    form: "Tablets",
    rx: "Rp.: Tab. Paracetamoli 0,5\nD.t.d. N. 10\nS. 1 tablet 3 times a day after meals.",
  },
  {
    id: "rx-amoxicillin",
    drug: "Amoxicillin",
    indication: "Bacterial respiratory infection",
    form: "Capsules",
    rx: "Rp.: Caps. Amoxicillini 0,5\nD.t.d. N. 20\nS. 1 capsule 3 times a day.",
  },
  {
    id: "rx-furosemide",
    drug: "Furosemide",
    indication: "Oedema / acute pulmonary oedema",
    form: "Injection",
    rx: "Rp.: Sol. Furosemidi 1% - 2 ml\nD.t.d. N. 5 in amp.\nS. Inject 2 ml intravenously.",
  },
  {
    id: "rx-enalapril",
    drug: "Enalapril",
    indication: "Hypertension",
    form: "Tablets",
    rx: "Rp.: Tab. Enalaprili 0,01\nD.t.d. N. 20\nS. 1 tablet once a day.",
  },
  {
    id: "rx-nitroglycerin",
    drug: "Nitroglycerin",
    indication: "Acute angina attack",
    form: "Sublingual tablets",
    rx: "Rp.: Tab. Nitroglycerini 0,0005\nD.t.d. N. 40\nS. 1 tablet under the tongue during an anginal attack.",
  },
  {
    id: "rx-salbutamol",
    drug: "Salbutamol",
    indication: "Acute asthma / bronchospasm",
    form: "Metered aerosol",
    rx: "Rp.: Aerosol. Salbutamoli 0,1 - 10 ml\nD.t.d. N. 1\nS. 1–2 inhalations during an attack.",
  },
  {
    id: "rx-diazepam",
    drug: "Diazepam",
    indication: "Status epilepticus / anxiety",
    form: "Injection",
    rx: "Rp.: Sol. Diazepami 0,5% - 2 ml\nD.t.d. N. 5 in amp.\nS. Inject 2 ml intravenously slowly.",
  },
  {
    id: "rx-ceftriaxone",
    drug: "Ceftriaxone",
    indication: "Severe bacterial infection",
    form: "Powder for injection",
    rx: "Rp.: Ceftriaxoni 1,0\nD.t.d. N. 10\nS. Dissolve in 3.5 ml lidocaine 1%; inject IM once daily.",
  },
  {
    id: "rx-insulin",
    drug: "Insulin (soluble)",
    indication: "Diabetes mellitus",
    form: "Injection",
    rx: "Rp.: Insulini 5 ml (40 ED - 1 ml)\nD.t.d. N. 5\nS. Inject subcutaneously per the prescribed regimen.",
  },
  {
    id: "rx-prednisolone",
    drug: "Prednisolone",
    indication: "Severe inflammation / anaphylaxis",
    form: "Tablets",
    rx: "Rp.: Tab. Prednisoloni 0,005\nD.t.d. N. 20\nS. Per the tapering schedule with morning dosing.",
  },
  {
    id: "rx-aspirin",
    drug: "Aspirin (antiplatelet)",
    indication: "Prevention of MI / stroke",
    form: "Tablets",
    rx: "Rp.: Tab. Acidi acetylsalicylici 0,1\nD.t.d. N. 30\nS. 1 tablet once a day after food.",
  },
  {
    id: "rx-ciprofloxacin",
    drug: "Ciprofloxacin",
    indication: "Urinary tract infection",
    form: "Tablets",
    rx: "Rp.: Tab. Ciprofloxacini 0,5\nD.t.d. N. 10\nS. 1 tablet twice a day.",
  },
];

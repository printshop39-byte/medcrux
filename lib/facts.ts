// "Med Fact of the Day" — short medical facts and study motivation, rotated
// deterministically by calendar day. No external data, no schema, no storage.

export interface DailyFact {
  emoji: string;
  text: string;
  tag: "fact" | "quote";
}

export const DAILY_FACTS: DailyFact[] = [
  { emoji: "❤️", text: "The heart beats about 100,000 times a day, pumping roughly 7,500 litres of blood.", tag: "fact" },
  { emoji: "🧠", text: "Neurons never quite touch — signals leap across the synapse using neurotransmitters.", tag: "fact" },
  { emoji: "🦠", text: "Penicillin, the first true antibiotic, was discovered by Alexander Fleming in 1928.", tag: "fact" },
  { emoji: "🫁", text: "The lungs hold about 300 million alveoli — a surface area close to a tennis court.", tag: "fact" },
  { emoji: "🩸", text: "A single drop of blood contains roughly 5 million red blood cells.", tag: "fact" },
  { emoji: "🦴", text: "Adults have 206 bones; babies are born with about 270 that later fuse together.", tag: "fact" },
  { emoji: "💊", text: "Bioavailability of an IV drug is 100% by definition — no absorption barrier to cross.", tag: "fact" },
  { emoji: "🧫", text: "Koch's postulates are the classic proof that a specific microbe causes a specific disease.", tag: "fact" },
  { emoji: "🩺", text: "The normal adult resting heart rate is 60–100 beats per minute.", tag: "fact" },
  { emoji: "🔬", text: "Gram staining, devised in 1884, still guides antibiotic choice on the very first day.", tag: "fact" },
  { emoji: "🎯", text: "Study quote: “Repetition is the mother of retention.” Review beats re-reading.", tag: "quote" },
  { emoji: "⏳", text: "Study quote: “Little and often” — short daily sessions beat one long cram.", tag: "quote" },
  { emoji: "🧩", text: "Study quote: understand the mechanism first; the facts then stick to it on their own.", tag: "quote" },
  { emoji: "🚀", text: "Study quote: testing yourself is stronger than highlighting. Do MCQs, don't just read.", tag: "quote" },
  { emoji: "🌙", text: "Sleep consolidates memory — a good night's rest is part of your revision, not a break from it.", tag: "quote" },
  { emoji: "🌟", text: "Study quote: you don't have to be perfect today — just one topic better than yesterday.", tag: "quote" },
];

// Day-of-year based index → the same fact for the whole day, changes each day.
export function dailyFactIndex(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const len = DAILY_FACTS.length;
  return ((day % len) + len) % len;
}

export function getDailyFact(d: Date): DailyFact {
  return DAILY_FACTS[dailyFactIndex(d)];
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createBrowserSupabase } from "@/lib/supabase/client";

const UNIVERSITIES = [
  "Kazan State Medical University",
  "Kazan Federal University",
  "Bashkir State Medical University",
  "Crimea Federal University",
  "Pirogov Russian National Research Medical University",
  "Sechenov University (First Moscow State Medical University)",
  "RUDN University (Peoples' Friendship University)",
  "Kursk State Medical University",
  "Tver State Medical University",
  "Perm State Medical University",
  "Orenburg State Medical University",
  "Volgograd State Medical University",
];

const SUBJECTS = [
  "Pharmacology",
  "Anatomy",
  "Physiology",
  "Biochemistry",
  "Microbiology",
  "Pathology",
];

const LANGUAGES = ["English", "Hinglish", "Russian"];

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("India");
  const [university, setUniversity] = useState("");
  const [mbbsYear, setMbbsYear] = useState<number | "">("");
  const [subjectFocus, setSubjectFocus] = useState<string[]>(["Pharmacology"]);
  const [examDate, setExamDate] = useState("");
  const [aiLanguage, setAiLanguage] = useState("English");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from an existing profile (also lets this page act as "edit profile").
  useEffect(() => {
    if (!user) return;
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setFullName(data.full_name ?? "");
        setCountry(data.country ?? "India");
        setUniversity(data.university ?? "");
        setMbbsYear(data.mbbs_year ?? "");
        setSubjectFocus(data.subject_focus?.length ? data.subject_focus : ["Pharmacology"]);
        setExamDate(data.exam_date ?? "");
        setAiLanguage(data.ai_language ?? "English");
      });
  }, [user]);

  function toggleSubject(s: string) {
    setSubjectFocus((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createBrowserSupabase();
    if (!supabase || !user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: fullName || null,
        country: country || null,
        university: university || null,
        mbbs_year: mbbsYear === "" ? null : mbbsYear,
        subject_focus: subjectFocus,
        exam_date: examDate || null,
        ai_language: aiLanguage,
        onboarded: true,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="p-6 text-sm text-slate-400">Loading…</div>;
  if (!user)
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-sm text-slate-600">Please sign in to set up your profile.</p>
        <Link href="/login?redirect=/onboarding" className="btn-primary mt-3 inline-flex">Sign in</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-lg space-y-5 py-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Set up your profile</h1>
        <p className="text-sm text-slate-500">Personalises your syllabus, plan and tutor language.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <Field label="Full name">
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="e.g. Ananya Sharma" />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country">
            <input value={country} onChange={(e) => setCountry(e.target.value)} className="input" />
          </Field>
          <Field label="MBBS year">
            <select value={mbbsYear} onChange={(e) => setMbbsYear(e.target.value === "" ? "" : Number(e.target.value))} className="input">
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="University (Russia)">
          <input
            list="universities"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="input"
            placeholder="Start typing…"
          />
          <datalist id="universities">
            {UNIVERSITIES.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </Field>

        <Field label="Subject focus">
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => {
              const on = subjectFocus.includes(s);
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSubject(s)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Exam date (optional)">
            <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="input" />
          </Field>
          <Field label="Explanation language">
            <select value={aiLanguage} onChange={(e) => setAiLanguage(e.target.value)} className="input">
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>
        </div>

        {error && <p className="rounded-lg bg-rose-50 p-2 text-center text-xs text-rose-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={busy} className="btn-primary">
            {busy ? "Saving…" : "Save & continue →"}
          </button>
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-600">Skip for now</Link>
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          background: white;
        }
        .input:focus {
          border-color: rgb(47 133 127);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

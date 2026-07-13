"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMCQs, getVivaQuestions, getShortAnswers, seededShuffle, shuffleMCQOptions, hashString, MCQWithMeta, ShortAnswerQ } from "@/lib/content";
import { getImportantDrugs } from "@/lib/drugs";
import { PRESCRIPTIONS } from "@/lib/prescriptions";
import { TOPICS, getTopic } from "@/lib/topics";
import { addMCQAttempt, getMCQHistory, useStoreTick, useHydrated } from "@/lib/store";
import { ShortcutsBar } from "@/components/Shortcuts";

type Mode = "menu" | "test" | "result" | "viva" | "shortanswer" | "prescription";

function ExamInner() {
  const params = useSearchParams();
  const initialTopic = params.get("topic") ?? "";
  useStoreTick();

  const [mode, setMode] = useState<Mode>("menu");
  const [topic, setTopic] = useState(initialTopic);
  const [importantOnly, setImportantOnly] = useState(false);
  const [questions, setQuestions] = useState<MCQWithMeta[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);

  function startTest(count: number) {
    let pool = getMCQs(topic || undefined);
    if (importantOnly) {
      const important = new Set(getImportantDrugs().map((d) => d.id));
      pool = pool.filter((q) => important.has(q.drugId));
    }
    const shuffled = seededShuffle(pool, pool.length * 7 + count);
    // Shuffle each question's options too — the source data puts the correct
    // answer at option B ~3/4 of the time, so without this a student can pass
    // by always picking B. Seeded per-question id so the order stays stable.
    const picked = shuffled
      .slice(0, Math.min(count, shuffled.length))
      .map((q) => shuffleMCQOptions(q, hashString(q.id)));
    setQuestions(picked);
    setAnswers({});
    setCurrent(0);
    setMode("test");
  }

  const score = useMemo(
    () => questions.reduce((s, q, i) => s + (answers[i] === q.answerIndex ? 1 : 0), 0),
    [questions, answers],
  );

  function finish() {
    const now = new Date();
    addMCQAttempt({
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
      total: questions.length,
      correct: score,
      topic: topic || undefined,
    });
    setMode("result");
  }

  // MCQ test-mode shortcuts: 1–4 select an option, → advance once answered.
  useEffect(() => {
    if (mode !== "test") return;
    function onKey(e: KeyboardEvent) {
      if (isTyping(e)) return;
      const q = questions[current];
      if (!q) return;
      const answered = answers[current] !== undefined;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (!answered && idx < q.options.length) {
          e.preventDefault();
          setAnswers((a) => ({ ...a, [current]: idx }));
        }
      } else if (e.key === "ArrowRight") {
        if (answered) {
          e.preventDefault();
          if (current < questions.length - 1) setCurrent((c) => c + 1);
          else finish();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, current, questions, answers]);

  if (mode === "menu")
    return (
      <Menu
        topic={topic}
        setTopic={setTopic}
        importantOnly={importantOnly}
        setImportantOnly={setImportantOnly}
        startTest={startTest}
        openViva={() => setMode("viva")}
        openShort={() => setMode("shortanswer")}
        openRx={() => setMode("prescription")}
      />
    );
  if (mode === "viva") return <VivaMode topic={topic} back={() => setMode("menu")} />;
  if (mode === "shortanswer") return <ShortAnswerMode topic={topic} back={() => setMode("menu")} />;
  if (mode === "prescription") return <PrescriptionMode back={() => setMode("menu")} />;
  if (mode === "result")
    return <Result score={score} total={questions.length} questions={questions} answers={answers} retry={() => setMode("menu")} />;

  // test mode
  const q = questions[current];
  const picked = answers[current];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setMode("menu")} className="text-sm text-slate-500">← Quit</button>
        <span className="text-sm font-medium text-slate-500">
          Q {current + 1} / {questions.length}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="card p-5">
        <div className="mb-1 text-[11px] text-slate-400">{q.drugName} · {getTopic(q.topic)?.title}</div>
        <p className="font-medium text-slate-800">{q.question}</p>
        <div className="mt-4 space-y-2">
          {q.options.map((opt, i) => {
            const answered = picked !== undefined;
            const isCorrect = i === q.answerIndex;
            let cls = "border-slate-200 hover:bg-slate-50";
            if (answered && isCorrect) cls = "border-green-400 bg-green-50 text-green-800";
            else if (answered && i === picked && !isCorrect) cls = "border-red-300 bg-red-50 text-red-700";
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => setAnswers((a) => ({ ...a, [current]: i }))}
                className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[11px]">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
        {picked !== undefined && (
          <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <span className="font-semibold">Explanation: </span>{q.explanation}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {current < questions.length - 1 ? (
          <button
            disabled={picked === undefined}
            onClick={() => setCurrent((c) => c + 1)}
            className="btn-primary flex-1"
          >
            Next question →
          </button>
        ) : (
          <button disabled={picked === undefined} onClick={finish} className="btn-primary flex-1">
            Finish & see score
          </button>
        )}
      </div>

      <ShortcutsBar
        items={[
          { keyLabel: "1 2 3 4", action: "select option" },
          { keyLabel: "→", action: "next (after answering)" },
        ]}
      />
    </div>
  );
}

function Menu({
  topic,
  setTopic,
  importantOnly,
  setImportantOnly,
  startTest,
  openViva,
  openShort,
  openRx,
}: {
  topic: string;
  setTopic: (t: string) => void;
  importantOnly: boolean;
  setImportantOnly: (v: boolean) => void;
  startTest: (n: number) => void;
  openViva: () => void;
  openShort: () => void;
  openRx: () => void;
}) {
  // localStorage is empty during SSR, so defer reading history until mounted to
  // keep the first client render identical to the server (avoids hydration error).
  const hydrated = useHydrated();
  const history = hydrated ? getMCQHistory() : [];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Exam Mode</h1>
        <p className="text-sm text-slate-500">MCQs, oral viva, short-answer & prescription writing — Russian-exam style.</p>
      </div>

      <div className="card p-5">
        <div className="section-title mb-2">Choose topic</div>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        >
          <option value="">All topics (mixed)</option>
          {TOPICS.map((t) => (
            <option key={t.slug} value={t.slug}>{t.title}</option>
          ))}
        </select>

        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={importantOnly}
            onChange={(e) => setImportantOnly(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          ⭐ Important-for-exam drugs only
        </label>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button onClick={() => startTest(10)} className="btn-ghost">10 Qs</button>
          <button onClick={() => startTest(20)} className="btn-primary">Random 20</button>
          <button onClick={openViva} className="btn-ghost">🎤 Viva</button>
        </div>
      </div>

      <div className="card p-5">
        <div className="section-title mb-3">Russian university exam modes</div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={openViva} className="btn-ghost">🎤 Oral viva</button>
          <button onClick={openShort} className="btn-ghost">✍️ Short answers</button>
          <button onClick={openRx} className="btn-ghost">℞ Prescription writing</button>
          <button onClick={() => startTest(20)} className="btn-ghost">📝 MCQ test</button>
        </div>
      </div>

      <div className="card p-5">
        <div className="section-title mb-3">Score history</div>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">No tests yet. Take your first test above.</p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 8).map((h, i) => {
              const pct = Math.round((h.correct / h.total) * 100);
              return (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    {h.date} · {h.topic ? getTopic(h.topic)?.title : "Mixed"}
                  </span>
                  <span className={`font-semibold ${pct >= 60 ? "text-green-600" : "text-rose-500"}`}>
                    {h.correct}/{h.total} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Result({
  score,
  total,
  questions,
  answers,
  retry,
}: {
  score: number;
  total: number;
  questions: MCQWithMeta[];
  answers: Record<number, number>;
  retry: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  return (
    <div className="space-y-5">
      <div className="card p-8 text-center">
        <div className="text-5xl font-bold text-brand-700">{pct}%</div>
        <p className="mt-2 text-slate-600">
          You scored <b>{score}</b> out of <b>{total}</b>
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {pct >= 80 ? "🌟 Excellent!" : pct >= 60 ? "👍 Good — revise the misses." : "📖 Keep revising, you’ll get there."}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={retry} className="btn-primary">Take another test</button>
          <Link href="/progress" className="btn-ghost">View progress</Link>
        </div>
      </div>

      <div className="card p-5">
        <div className="section-title mb-3">Review</div>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const correct = answers[i] === q.answerIndex;
            return (
              <div key={i} className="rounded-lg border border-slate-200 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <span>{correct ? "✅" : "❌"}</span>
                  <div>
                    <p className="font-medium text-slate-800">{q.question}</p>
                    <p className="mt-1 text-green-700">Ans: {q.options[q.answerIndex]}</p>
                    {!correct && answers[i] !== undefined && (
                      <p className="text-rose-500">You: {q.options[answers[i]]}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VivaMode({ topic, back }: { topic: string; back: () => void }) {
  const list = useMemo(() => getVivaQuestions(topic || undefined), [topic]);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const v = list[i];

  // Shortcuts: Space toggle answer, ←/→ prev/next.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTyping(e)) return;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setShow((s) => !s);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setShow(false);
        setI((n) => (n + 1) % list.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setShow(false);
        setI((n) => (n - 1 + list.length) % list.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list.length]);

  if (!v) return <div className="card p-6 text-center text-slate-500">No viva questions.</div>;

  return (
    <div className="space-y-5">
      <button onClick={back} className="text-sm text-slate-500">← Exam menu</button>
      <div className="card p-6">
        <div className="section-title mb-2">🎤 Viva · {i + 1}/{list.length} · {v.drugName}</div>
        <p className="text-lg font-semibold text-slate-800">{v.q}</p>
        {show ? (
          <p className="mt-4 rounded-xl bg-brand-50 p-4 text-brand-800">✅ {v.a}</p>
        ) : (
          <button onClick={() => setShow(true)} className="btn-primary mt-4">Show answer</button>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { setShow(false); setI((n) => (n - 1 + list.length) % list.length); }}
          className="btn-ghost flex-1"
        >
          ← Prev
        </button>
        <button
          onClick={() => { setShow(false); setI((n) => (n + 1) % list.length); }}
          className="btn-primary flex-1"
        >
          Next →
        </button>
      </div>

      <ShortcutsBar
        items={[
          { keyLabel: "Space", action: "show / hide answer" },
          { keyLabel: "← →", action: "prev / next" },
        ]}
      />
    </div>
  );
}

function ShortAnswerMode({ topic, back }: { topic: string; back: () => void }) {
  const list = useMemo<ShortAnswerQ[]>(() => seededShuffle(getShortAnswers(topic || undefined), 42), [topic]);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const q = list[i];

  // Shortcuts: Space toggle answer, ←/→ prev/next.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTyping(e)) return;
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setShow((s) => !s);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setShow(false);
        setI((n) => (n + 1) % list.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setShow(false);
        setI((n) => (n - 1 + list.length) % list.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list.length]);

  if (!q) return <div className="card p-6 text-center text-slate-500">No short-answer questions.</div>;

  return (
    <div className="space-y-5">
      <button onClick={back} className="text-sm text-slate-500">← Exam menu</button>
      <div className="card p-6">
        <div className="section-title mb-2">✍️ Short answer · {i + 1}/{list.length} · {q.source}</div>
        <p className="text-lg font-semibold text-slate-800">{q.prompt}</p>
        {show ? (
          <p className="mt-4 whitespace-pre-line rounded-xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-800">{q.answer}</p>
        ) : (
          <button onClick={() => setShow(true)} className="btn-primary mt-4">Show model answer</button>
        )}
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setShow(false); setI((n) => (n - 1 + list.length) % list.length); }} className="btn-ghost flex-1">← Prev</button>
        <button onClick={() => { setShow(false); setI((n) => (n + 1) % list.length); }} className="btn-primary flex-1">Next →</button>
      </div>

      <ShortcutsBar
        items={[
          { keyLabel: "Space", action: "show / hide answer" },
          { keyLabel: "← →", action: "prev / next" },
        ]}
      />

      <p className="text-center text-xs text-slate-400">Write your answer first, then reveal to self-check.</p>
    </div>
  );
}

function PrescriptionMode({ back }: { back: () => void }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const p = PRESCRIPTIONS[i];

  return (
    <div className="space-y-5">
      <button onClick={back} className="text-sm text-slate-500">← Exam menu</button>
      <div className="card p-6">
        <div className="section-title mb-2">℞ Prescription writing · {i + 1}/{PRESCRIPTIONS.length}</div>
        <p className="text-lg font-semibold text-slate-800">
          Write a prescription for <span className="text-brand-700">{p.drug}</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">Indication: {p.indication} · Form: {p.form}</p>
        {show ? (
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 font-mono text-sm text-slate-100">{p.rx}</pre>
        ) : (
          <button onClick={() => setShow(true)} className="btn-primary mt-4">Show model prescription</button>
        )}
        {p.note && show && <p className="mt-2 text-xs text-slate-400">{p.note}</p>}
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setShow(false); setI((n) => (n - 1 + PRESCRIPTIONS.length) % PRESCRIPTIONS.length); }} className="btn-ghost flex-1">← Prev</button>
        <button onClick={() => { setShow(false); setI((n) => (n + 1) % PRESCRIPTIONS.length); }} className="btn-primary flex-1">Next →</button>
      </div>
      <p className="text-center text-xs text-slate-400">Format: Rp. (drug + strength) → D.t.d. N. (quantity) → S. (directions).</p>
    </div>
  );
}

// Ignore shortcuts while the user is typing in a form field.
function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!(t && (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA" || t.isContentEditable));
}

export default function ExamPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
      <ExamInner />
    </Suspense>
  );
}

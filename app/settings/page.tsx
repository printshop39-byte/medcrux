"use client";

import { useEffect, useState } from "react";
import { getSettings, saveSettings, getExamDate, setExamDate, Settings } from "@/lib/store";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ name: "", university: "", aiLanguage: "English" });
  const [exam, setExam] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    setExam(getExamDate());
  }, []);

  function save() {
    saveSettings(settings);
    setExamDate(exam);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function resetProgress() {
    if (!confirm("Reset all progress, bookmarks and history on this device?")) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith("pharmaos."))
      .forEach((k) => localStorage.removeItem(k));
    window.dispatchEvent(new Event("pharmaos:update"));
    setSettings({ name: "", university: "", aiLanguage: "English" });
    setExam("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500">Personalise PharmaOS. Data is stored on this device.</p>
      </div>

      <div className="card space-y-4 p-5">
        <Field label="Your name">
          <input
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            className="input"
            placeholder="e.g. Ivan"
          />
        </Field>
        <Field label="University">
          <input
            value={settings.university}
            onChange={(e) => setSettings({ ...settings, university: e.target.value })}
            className="input"
            placeholder="e.g. Kazan State Medical University"
          />
        </Field>
        <Field label="Exam date (for countdown)">
          <input type="date" value={exam} onChange={(e) => setExam(e.target.value)} className="input" />
        </Field>
        <Field label="AI Tutor language">
          <select
            value={settings.aiLanguage}
            onChange={(e) => setSettings({ ...settings, aiLanguage: e.target.value as "English" | "Russian" })}
            className="input"
          >
            <option>English</option>
            <option>Russian</option>
          </select>
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} className="btn-primary">Save settings</button>
          {saved && <span className="text-sm text-green-600">✓ Saved</span>}
        </div>
      </div>

      <div className="card p-5">
        <div className="section-title mb-2">Account & sync</div>
        <p className="text-sm text-slate-500">
          Google / Email login and cloud sync activate when Supabase is connected. See{" "}
          <code className="rounded bg-slate-100 px-1">README.md</code> for setup. Until then, progress is saved
          locally on this device and works offline.
        </p>
      </div>

      <div className="card p-5">
        <div className="section-title mb-2 text-rose-500">Danger zone</div>
        <button onClick={resetProgress} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100">
          Reset all local data
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: rgb(37 106 102);
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

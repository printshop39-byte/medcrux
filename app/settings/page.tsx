"use client";

import { useEffect, useState } from "react";
import {
  getSettings,
  saveSettings,
  getExamDate,
  setExamDate,
  getTheme,
  setTheme,
  Settings,
  ThemeMode,
} from "@/lib/store";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ name: "", university: "", aiLanguage: "English" });
  const [exam, setExam] = useState("");
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    setExam(getExamDate());
    setThemeState(getTheme());
  }, []);

  function changeTheme(t: ThemeMode) {
    setThemeState(t);
    setTheme(t); // persists + applies to <html> immediately
  }

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
        <p className="text-sm text-slate-500">Personalise MedCrux. Data is stored on this device.</p>
      </div>

      <div className="card space-y-4 p-5">
        <Field label="Your name">
          <input
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500"
            placeholder="e.g. Ivan"
          />
        </Field>
        <Field label="University">
          <input
            value={settings.university}
            onChange={(e) => setSettings({ ...settings, university: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500"
            placeholder="e.g. Kazan State Medical University"
          />
        </Field>
        <Field label="Exam date (for countdown)">
          <input type="date" value={exam} onChange={(e) => setExam(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500" />
        </Field>
        <Field label="AI Tutor language">
          <select
            value={settings.aiLanguage}
            onChange={(e) => setSettings({ ...settings, aiLanguage: e.target.value as "English" | "Russian" })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-brand-500"
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
        <div className="section-title mb-3">Appearance</div>
        <div className="grid grid-cols-3 gap-2">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => changeTheme(t)}
              aria-pressed={theme === t}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                theme === t
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t === "light" ? "☀️ Light" : t === "dark" ? "🌙 Dark" : "🖥️ System"}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          “System” follows your device’s light/dark setting.
        </p>
      </div>

      <div className="card p-5">
        <div className="section-title mb-2">Account & sync</div>
        <p className="text-sm text-slate-500">
          Cloud login and sync aren&apos;t available in this version yet. Your progress is saved
          securely on this device and works fully offline.
        </p>
      </div>

      <div className="card p-5">
        <div className="section-title mb-2 text-rose-500">Danger zone</div>
        <button onClick={resetProgress} className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100">
          Reset all local data
        </button>
      </div>
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

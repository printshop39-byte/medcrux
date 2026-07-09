import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card p-10 text-center">
      <div className="text-4xl">🔍</div>
      <h1 className="mt-3 text-xl font-bold text-slate-800">Not found</h1>
      <p className="mt-1 text-sm text-slate-500">This drug or topic doesn’t exist in your library yet.</p>
      <div className="mt-4 flex justify-center gap-2">
        <Link href="/dashboard" className="btn-primary">Dashboard</Link>
        <Link href="/topics" className="btn-ghost">Browse topics</Link>
      </div>
    </div>
  );
}

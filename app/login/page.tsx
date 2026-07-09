import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading…</div>}>
      <AuthForm mode="login" />
    </Suspense>
  );
}

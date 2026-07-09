import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading…</div>}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}

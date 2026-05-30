"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export function GoogleLoginButton({ role }: { role: "member" | "group" }) {
  const signIn = async () => {
    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?role=${role}`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  };

  return (
    <button onClick={signIn} className="w-full rounded-2xl bg-slate-900 px-5 py-4 font-semibold text-white shadow-sm">
      Login as {role === "member" ? "a Searcher" : "a Group"}
    </button>
  );
}

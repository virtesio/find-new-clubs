"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Find New Clubs</h1>
            <p className="text-sm text-slate-500">
              Find groups. Join communities. Build membership.
            </p>
          </div>
        </div>

        {user ? (
          <button
            onClick={signOut}
            className="rounded-2xl border bg-white px-5 py-3 text-sm font-semibold"
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Google Login
          </button>
        )}
      </div>
    </header>
  );
}
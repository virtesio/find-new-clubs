"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function UserAccount() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!user) return null;

 return (
  <div className="flex items-center gap-3 rounded-lg border p-2">
    {user.user_metadata?.avatar_url && (
      <img
        src={user.user_metadata.avatar_url}
        alt=""
        className="h-8 w-8 rounded-full"
      />
    )}

    <div>
      <div className="text-sm font-semibold">
        {user.user_metadata?.full_name}
      </div>

      <div className="text-xs text-gray-500">
        {user.email}
      </div>
    </div>

    <button
      className="rounded bg-gray-200 px-2 py-1 text-xs"
      onClick={async () => {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        window.location.reload();
      }}
    >
      Sign Out
    </button>
  </div>
);
}
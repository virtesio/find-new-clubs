import Link from "next/link";
import { Users } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 p-2 text-white"><Users className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Find New Clubs</h1>
            <p className="text-sm text-slate-500">Find groups. Join communities. Build membership.</p>
          </div>
        </Link>
        <nav className="flex gap-2 text-sm font-medium">
          <Link className="rounded-2xl border bg-white px-4 py-2 shadow-sm" href="/search">Search</Link>
          <Link className="rounded-2xl bg-slate-900 px-4 py-2 text-white shadow-sm" href="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}

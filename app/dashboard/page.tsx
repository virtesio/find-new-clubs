import { Header } from "@/components/Header";
import { AppPrototype } from "@/components/AppPrototype";

export default function DashboardPage({ searchParams }: { searchParams: { role?: string } }) {
  const role = searchParams.role === "group" ? "group" : "member";
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <AppPrototype initialRole={role} />
    </div>
  );
}

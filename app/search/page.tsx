import { Header } from "@/components/Header";
import { AppPrototype } from "@/components/AppPrototype";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <AppPrototype initialRole="member" />
    </div>
  );
}

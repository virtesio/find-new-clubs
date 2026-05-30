import  Header  from "@/components/Header";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { CheckCircle, CreditCard, MapPin, Bell } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="grid gap-5 md:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
            <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm">Mobile-friendly web app</p>
            <h2 className="mb-3 text-4xl font-bold leading-tight">Find clubs looking for people like you.</h2>
            <p className="max-w-2xl text-slate-200">
              Members register for free, set their criteria, and receive email alerts when matching clubs are posted.
              Groups pay $10/month to list openings and see interested people.
            </p>
          </div>
          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-xl font-semibold">Google login only</h3>
            <div className="grid gap-3">
              <GoogleLoginButton role="member" />
              <GoogleLoginButton role="group" />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><CheckCircle className="mb-3 h-5 w-5" /><h3 className="font-semibold">Free search</h3><p className="text-sm text-slate-500">Members search by type, location, and radius.</p></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><CreditCard className="mb-3 h-5 w-5" /><h3 className="font-semibold">$10/month</h3><p className="text-sm text-slate-500">Groups pay to keep listings active.</p></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><MapPin className="mb-3 h-5 w-5" /><h3 className="font-semibold">Radius matching</h3><p className="text-sm text-slate-500">Example: within 35 miles of Aurora.</p></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><Bell className="mb-3 h-5 w-5" /><h3 className="font-semibold">Email alerts</h3><p className="text-sm text-slate-500">Push notifications can come later.</p></div>
        </section>
      </main>
    </div>
  );
}

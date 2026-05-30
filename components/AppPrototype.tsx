"use client";

import { useMemo, useState } from "react";
import { Bell, BookOpen, Clock, Dumbbell, Mail, MapPin, MessageSquare, Music, PlusCircle, Search, Send, Theater, UserCircle, Users } from "lucide-react";
import { clubTypes } from "@/lib/types";
import { getDistanceMiles } from "@/lib/distance";

const iconMap: Record<string, any> = {
  Group: Users,
  Orchestra: Music,
  "Theatre Group": Theater,
  "Sports Club": Dumbbell,
  "Book Club": BookOpen,
};

const starterListings = [
  { id: 1, ownerId: "group-demo", name: "Denver Community Orchestra", type: "Orchestra", location: "Denver, CO", lookingFor: "String players, brass, and percussion for a friendly adult orchestra.", contact: "membership@denvercommunity.org", status: "Active", expiresOn: "2026-07-01" },
  { id: 2, ownerId: "group-demo", name: "Lakewood Readers Circle", type: "Book Club", location: "Lakewood, CO", lookingFor: "New members who enjoy fiction, memoirs, and relaxed monthly discussions.", contact: "hello@lakewoodreaders.org", status: "Expired", expiresOn: "2026-04-30" },
  { id: 3, ownerId: "group-2", name: "Front Range Theatre Makers", type: "Theatre Group", location: "Golden, CO", lookingFor: "Actors, stage managers, designers, and volunteers for local productions.", contact: "join@frtheatre.org", status: "Active", expiresOn: "2026-07-15" },
  { id: 4, ownerId: "group-3", name: "Mile High Social Tennis", type: "Sports Club", location: "Denver, CO", lookingFor: "Beginner to intermediate players for weekly social tennis sessions.", contact: "play@milehightennis.org", status: "Active", expiresOn: "2026-07-20" },
];

const starterInterests = [
  { id: 101, listingId: 1, personName: "Alex Morgan", email: "alex@example.com", phone: "303-555-0101", notes: "I play cello and would like to know the rehearsal schedule. I am available most weeknights.", submittedOn: "2026-05-29" },
  { id: 102, listingId: 1, personName: "Jamie Patel", email: "jamie@example.com", phone: "720-555-0188", notes: "I played trumpet in college and want to get back into community music.", submittedOn: "2026-05-28" },
];

const starterMembers = [
  { id: "member-demo", name: "Andy Clark", email: "andy@example.com", preferredType: "Orchestra", location: "Aurora", radiusMiles: 35, emailAlerts: true },
  { id: "member-2", name: "Taylor Reed", email: "taylor@example.com", preferredType: "Book Club", location: "Lakewood", radiusMiles: 15, emailAlerts: true },
];

export function AppPrototype({ initialRole }: { initialRole: "member" | "group" }) {
  const [role] = useState(initialRole);
  const [mode, setMode] = useState(initialRole === "member" ? "criteria" : "groupDashboard");
  const [memberCriteria, setMemberCriteria] = useState({ type: "Orchestra", location: "Aurora", radiusMiles: 35, email: "andy@example.com", emailAlerts: true });
  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [radiusFilter, setRadiusFilter] = useState(35);
  const [listings, setListings] = useState(starterListings);
  const [interests, setInterests] = useState(starterInterests);
  const [members, setMembers] = useState(starterMembers);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [interestForm, setInterestForm] = useState({ personName: "", email: "", phone: "", notes: "" });
  const [listingForm, setListingForm] = useState({ name: "", type: "Orchestra", location: "", lookingFor: "", contact: "" });
  const [notifications, setNotifications] = useState([{ id: 201, recipient: "andy@example.com", subject: "New orchestra match near Denver", body: "Denver Community Orchestra is looking for new members.", status: "Sent", createdOn: "2026-05-29" }]);

  const groupOwnerId = "group-demo";
  const activeListings = listings.filter((listing) => listing.status === "Active");
  const groupListings = listings.filter((listing) => listing.ownerId === groupOwnerId);

  const filteredListings = useMemo(() => activeListings.filter((listing) => {
    const matchesType = typeFilter === "All" || listing.type === typeFilter;
    const distance = getDistanceMiles(locationFilter, listing.location);
    const matchesLocation = !locationFilter || distance === null || distance <= Number(radiusFilter);
    return matchesType && matchesLocation;
  }), [activeListings, typeFilter, locationFilter, radiusFilter]);

  const saveCriteria = (event: React.FormEvent) => {
    event.preventDefault();
    setTypeFilter(memberCriteria.type);
    setLocationFilter(memberCriteria.location);
    setRadiusFilter(memberCriteria.radiusMiles);
    setMembers((current) => current.map((member) => member.id === "member-demo" ? { ...member, email: memberCriteria.email, preferredType: memberCriteria.type, location: memberCriteria.location, radiusMiles: memberCriteria.radiusMiles, emailAlerts: memberCriteria.emailAlerts } : member));
    setMode("search");
  };

  const findMatchingMembers = (listing: any) => members.filter((member) => {
    const typeMatch = member.preferredType === "All" || member.preferredType === listing.type;
    const distance = getDistanceMiles(member.location, listing.location);
    const locationMatch = distance === null || distance <= Number(member.radiusMiles || 35);
    return member.emailAlerts && typeMatch && locationMatch;
  });

  const addListing = (event: React.FormEvent) => {
    event.preventDefault();
    if (!listingForm.name || !listingForm.location || !listingForm.lookingFor || !listingForm.contact) return;
    const newListing = { id: Date.now(), ownerId: groupOwnerId, ...listingForm, status: "Active", expiresOn: "2026-07-30" };
    const matchingMembers = findMatchingMembers(newListing);
    setListings([newListing, ...listings]);
    setNotifications([
      ...matchingMembers.map((member) => ({ id: Date.now() + Math.random(), recipient: member.email, subject: `New ${newListing.type.toLowerCase()} match near ${member.location}`, body: `${newListing.name} is looking for new members: ${newListing.lookingFor}`, status: "Queued", createdOn: new Date().toISOString().slice(0, 10) })),
      ...notifications,
    ]);
    setListingForm({ name: "", type: "Orchestra", location: "", lookingFor: "", contact: "" });
    setMode("groupDashboard");
  };

  const submitInterest = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedListing || !interestForm.personName || !interestForm.email || !interestForm.notes) return;
    setInterests([{ id: Date.now(), listingId: selectedListing.id, ...interestForm, submittedOn: new Date().toISOString().slice(0, 10) }, ...interests]);
    setInterestForm({ personName: "", email: "", phone: "", notes: "" });
    setSelectedListing(null);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap gap-2">
        {role === "member" ? <><button onClick={() => setMode("criteria")} className="rounded-2xl border bg-white px-4 py-2 text-sm font-medium">Criteria</button><button onClick={() => setMode("search")} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Search</button></> : <><button onClick={() => setMode("groupDashboard")} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Dashboard</button><button onClick={() => setMode("list")} className="rounded-2xl border bg-white px-4 py-2 text-sm font-medium">New Listing</button></>}
      </div>

      {role === "member" && mode === "criteria" && (
        <section className="mx-auto max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold">Set up your search criteria</h2>
          <p className="mb-5 text-slate-500">Tell us what kind of club you want before viewing matching groups.</p>
          <form onSubmit={saveCriteria} className="space-y-4">
            <select value={memberCriteria.type} onChange={(e) => setMemberCriteria({ ...memberCriteria, type: e.target.value })} className="w-full rounded-2xl border px-4 py-3">{clubTypes.map((type) => <option key={type}>{type}</option>)}</select>
            <input value={memberCriteria.location} onChange={(e) => setMemberCriteria({ ...memberCriteria, location: e.target.value })} className="w-full rounded-2xl border px-4 py-3" placeholder="Aurora, Denver, Lakewood..." />
            <select value={memberCriteria.radiusMiles} onChange={(e) => setMemberCriteria({ ...memberCriteria, radiusMiles: Number(e.target.value) })} className="w-full rounded-2xl border px-4 py-3">{[5,10,20,35,50,100].map((m) => <option key={m} value={m}>Within {m} miles</option>)}</select>
            <input value={memberCriteria.email} onChange={(e) => setMemberCriteria({ ...memberCriteria, email: e.target.value })} className="w-full rounded-2xl border px-4 py-3" placeholder="you@example.com" />
            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><input type="checkbox" checked={memberCriteria.emailAlerts} onChange={(e) => setMemberCriteria({ ...memberCriteria, emailAlerts: e.target.checked })} className="h-5 w-5" /><span><span className="block font-medium">Email me when new matching clubs are posted</span><span className="text-sm text-slate-500">Later this can become iPhone / Android push notifications.</span></span></label>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white"><Search className="h-5 w-5" /> Save criteria and show groups</button>
          </form>
        </section>
      )}

      {role === "member" && mode === "search" && (
        <section>
          <div className="mb-5 rounded-3xl border bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm text-slate-600">Your saved criteria: {typeFilter} within {radiusFilter} miles of “{locationFilter || "Any location"}”</div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full rounded-2xl border px-4 py-3">{clubTypes.map((type) => <option key={type}>{type}</option>)}</select>
              <input value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder="Aurora, Denver, Lakewood..." className="w-full rounded-2xl border px-4 py-3" />
              <select value={radiusFilter} onChange={(e) => setRadiusFilter(Number(e.target.value))} className="w-full rounded-2xl border px-4 py-3">{[5,10,20,35,50,100].map((m) => <option key={m} value={m}>{m} miles</option>)}</select>
              <button className="rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white">Search</button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">{filteredListings.map((listing) => { const Icon = iconMap[listing.type] || Users; return <article key={listing.id} className="rounded-3xl border bg-white p-5 shadow-sm"><div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="text-xl font-semibold">{listing.name}</h3><p className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" /> {listing.location}{locationFilter ? ` · ${getDistanceMiles(locationFilter, listing.location) ?? "?"} miles away` : ""}</p></div><div className="rounded-2xl bg-slate-100 p-3"><Icon className="h-5 w-5" /></div></div><p className="mb-4 rounded-2xl bg-slate-50 p-4 text-slate-700">{listing.lookingFor}</p><div className="flex items-center justify-between"><span className="rounded-full bg-slate-100 px-3 py-1 text-sm">{listing.type}</span><button onClick={() => setSelectedListing(listing)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">I’m interested</button></div></article>; })}</div>
        </section>
      )}

      {selectedListing && <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={submitInterest} className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl"><h2 className="mb-1 text-2xl font-bold">Share your interest</h2><p className="mb-5 text-slate-500">Your contact details and notes will be shared with {selectedListing.name}.</p><div className="space-y-3"><input value={interestForm.personName} onChange={(e) => setInterestForm({ ...interestForm, personName: e.target.value })} className="w-full rounded-2xl border px-4 py-3" placeholder="Your name" /><input value={interestForm.email} onChange={(e) => setInterestForm({ ...interestForm, email: e.target.value })} className="w-full rounded-2xl border px-4 py-3" placeholder="Email" /><input value={interestForm.phone} onChange={(e) => setInterestForm({ ...interestForm, phone: e.target.value })} className="w-full rounded-2xl border px-4 py-3" placeholder="Phone number, optional" /><textarea value={interestForm.notes} onChange={(e) => setInterestForm({ ...interestForm, notes: e.target.value })} className="min-h-28 w-full rounded-2xl border px-4 py-3" placeholder="Notes, background, availability, questions, or anything else you want the group to know." /></div><div className="mt-5 flex gap-3"><button type="button" onClick={() => setSelectedListing(null)} className="w-full rounded-2xl border px-5 py-3 font-semibold">Cancel</button><button className="w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">Send to group</button></div></form></div>}

      {role === "group" && mode === "groupDashboard" && (
        <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-3xl border bg-white p-5 shadow-sm lg:col-span-2"><div className="mb-4 flex items-center gap-2"><Bell className="h-5 w-5" /><h2 className="text-2xl font-bold">Automatic matching notifications</h2></div><p className="mb-4 text-slate-500">For the web app version, matching members receive email alerts when a new active listing matches their saved type, location, and radius.</p><div className="grid gap-3 md:grid-cols-2">{notifications.slice(0,4).map((notification) => <div key={notification.id} className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 flex items-center justify-between gap-3"><p className="flex items-center gap-2 font-semibold"><Send className="h-4 w-4" /> {notification.subject}</p><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{notification.status}</span></div><p className="text-sm text-slate-500">To: {notification.recipient}</p><p className="mt-2 text-sm text-slate-700">{notification.body}</p></div>)}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><h2 className="mb-4 text-2xl font-bold">Your posting history</h2><div className="space-y-3">{groupListings.map((listing) => { const count = interests.filter((interest) => interest.listingId === listing.id).length; return <div key={listing.id} className="rounded-2xl border p-4"><div className="mb-2 flex items-start justify-between gap-3"><div><h3 className="font-semibold">{listing.name}</h3><p className="text-sm text-slate-500">{listing.type} · {listing.location}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${listing.status === "Active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>{listing.status}</span></div><p className="mb-3 flex items-center gap-1 text-sm text-slate-500"><Clock className="h-4 w-4" /> Expires {listing.expiresOn}</p><p className="text-sm font-medium">{count} interested {count === 1 ? "person" : "people"}</p></div>; })}</div></div>
          <div className="rounded-3xl border bg-white p-5 shadow-sm"><h2 className="mb-4 text-2xl font-bold">Interested people</h2><div className="space-y-4">{groupListings.flatMap((listing) => interests.filter((interest) => interest.listingId === listing.id).map((interest) => <div key={interest.id} className="rounded-2xl bg-slate-50 p-4"><div className="mb-2 flex items-start justify-between gap-3"><div><h3 className="font-semibold">{interest.personName}</h3><p className="text-sm text-slate-500">Interested in {listing.name}</p></div><span className="text-xs text-slate-500">{interest.submittedOn}</span></div><div className="mb-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2"><p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {interest.email}</p><p className="flex items-center gap-2"><UserCircle className="h-4 w-4" /> {interest.phone || "No phone provided"}</p></div><p className="flex gap-2 rounded-2xl bg-white p-3 text-sm text-slate-700"><MessageSquare className="mt-0.5 h-4 w-4 shrink-0" /> {interest.notes}</p></div>))}</div></div>
        </section>
      )}

      {role === "group" && mode === "list" && <section className="mx-auto max-w-3xl rounded-3xl border bg-white p-6 shadow-sm"><h2 className="text-2xl font-bold">Create a club listing</h2><p className="mb-5 text-slate-500">Listings cost $10/month. Payment will connect to Stripe in the production version.</p><form onSubmit={addListing} className="space-y-4"><input value={listingForm.name} onChange={(e) => setListingForm({ ...listingForm, name: e.target.value })} className="w-full rounded-2xl border px-4 py-3" placeholder="Club / group name" /><div className="grid gap-4 md:grid-cols-2"><select value={listingForm.type} onChange={(e) => setListingForm({ ...listingForm, type: e.target.value })} className="w-full rounded-2xl border px-4 py-3">{clubTypes.filter((type) => type !== "All").map((type) => <option key={type}>{type}</option>)}</select><input value={listingForm.location} onChange={(e) => setListingForm({ ...listingForm, location: e.target.value })} className="w-full rounded-2xl border px-4 py-3" placeholder="City, State" /></div><textarea value={listingForm.lookingFor} onChange={(e) => setListingForm({ ...listingForm, lookingFor: e.target.value })} className="min-h-28 w-full rounded-2xl border px-4 py-3" placeholder="Who are you looking for?" /><input value={listingForm.contact} onChange={(e) => setListingForm({ ...listingForm, contact: e.target.value })} className="w-full rounded-2xl border px-4 py-3" placeholder="Contact email" /><button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white"><PlusCircle className="h-5 w-5" /> Create paid listing preview</button></form></section>}
    </main>
  );
}

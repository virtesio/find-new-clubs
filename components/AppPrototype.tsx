"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Music,
  Theater,
  Dumbbell,
  BookOpen,
  Users,
  PlusCircle,
  UserCircle,
  ClipboardList,
  Clock,
  Mail,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Role = "member" | "group";
type Mode = "criteria" | "search" | "groupDashboard" | "list";

type Listing = {
  id: string;
  owner_id: string | null;
  name: string;
  type: string;
  location: string;
  description: string;
  contact_email: string | null;
  status: string;
  expires_at: string | null;
  created_at?: string;
};

type Interest = {
  id: string;
  listing_id: string;
  member_user_id: string | null;
  person_name: string;
  email: string;
  phone: string | null;
  notes: string;
  created_at: string;
};

const clubTypes = [
  "All",
  "Group",
  "Orchestra",
  "Theatre Group",
  "Sports Club",
  "Book Club",
];

const iconMap: Record<string, any> = {
  Group: Users,
  Orchestra: Music,
  "Theatre Group": Theater,
  "Sports Club": Dumbbell,
  "Book Club": BookOpen,
};

const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  "Aurora, CO": { lat: 39.7294, lng: -104.8319 },
  "Denver, CO": { lat: 39.7392, lng: -104.9903 },
  "Lakewood, CO": { lat: 39.7047, lng: -105.0814 },
  "Golden, CO": { lat: 39.7555, lng: -105.2211 },
};

const normalizeLocation = (location: string) => {
  const trimmed = location.trim();
  if (!trimmed) return "";
  return trimmed.includes(",") ? trimmed : `${trimmed}, CO`;
};

const getCoordinates = (location: string) => {
  return locationCoordinates[normalizeLocation(location)] || null;
};

const getDistanceMiles = (fromLocation: string, toLocation: string) => {
  const from = getCoordinates(fromLocation);
  const to = getCoordinates(toLocation);
  if (!from || !to) return null;

  const earthRadiusMiles = 3958.8;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadiusMiles * c);
};

export default function AppPrototype() {
  const supabase = createSupabaseBrowserClient();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>("member");
  const [mode, setMode] = useState<Mode>("criteria");

  const [memberCriteria, setMemberCriteria] = useState({
    type: "Orchestra",
    location: "Aurora",
    radiusMiles: 35,
    email: "",
    emailAlerts: true,
  });

  const [typeFilter, setTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [radiusFilter, setRadiusFilter] = useState(35);

  const [listings, setListings] = useState<Listing[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [interestForm, setInterestForm] = useState({
    personName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [listingForm, setListingForm] = useState({
    name: "",
    type: "Orchestra",
    location: "",
    lookingFor: "",
    contact: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user || null);

      if (user?.email) {
        setMemberCriteria((current) => ({
          ...current,
          email: user.email || "",
        }));
        setInterestForm((current) => ({
          ...current,
          personName: user.user_metadata?.full_name || "",
          email: user.email || "",
        }));
      }

      await loadListings();
      await loadInterests();
      setLoading(false);
    }

    init();
  }, []);

  async function loadListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadListings error", error);
      setMessage(error.message);
      return;
    }

    setListings(data || []);
  }

  async function loadInterests() {
    const { data, error } = await supabase
      .from("interests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("loadInterests error", error);
      return;
    }

    setInterests(data || []);
  }

  const activeListings = listings.filter((listing) => listing.status === "Active");

  const filteredListings = useMemo(() => {
    return activeListings.filter((listing) => {
      const matchesType = typeFilter === "All" || listing.type === typeFilter;
      const distance = getDistanceMiles(locationFilter, listing.location);
      const matchesLocation =
        !locationFilter || distance === null || distance <= Number(radiusFilter);

      return matchesType && matchesLocation;
    });
  }, [activeListings, typeFilter, locationFilter, radiusFilter]);

  const groupListings = listings.filter((listing) => listing.owner_id === user?.id);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  function chooseRole(newRole: Role) {
    setRole(newRole);
    setMode(newRole === "member" ? "criteria" : "groupDashboard");
  }

  function saveCriteria(event: React.FormEvent) {
    event.preventDefault();
    setTypeFilter(memberCriteria.type);
    setLocationFilter(memberCriteria.location);
    setRadiusFilter(memberCriteria.radiusMiles);
    setMode("search");
  }

  async function addListing(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("Please sign in first.");
      return;
    }

    if (
      !listingForm.name ||
      !listingForm.location ||
      !listingForm.lookingFor ||
      !listingForm.contact
    ) {
      setMessage("Please complete all listing fields.");
      return;
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error } = await supabase.from("listings").insert([
      {
        owner_id: user.id,
        name: listingForm.name,
        type: listingForm.type,
        location: normalizeLocation(listingForm.location),
        description: listingForm.lookingFor,
        contact_email: listingForm.contact,
        status: "Active",
        expires_at: expiresAt.toISOString(),
      },
    ]);

    if (error) {
      console.error("addListing error", error);
      setMessage(error.message);
      return;
    }

    setListingForm({
      name: "",
      type: "Orchestra",
      location: "",
      lookingFor: "",
      contact: "",
    });

    await loadListings();
    setMode("groupDashboard");
  }

  async function submitInterest(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    if (!selectedListing) return;

    if (!interestForm.personName || !interestForm.email || !interestForm.notes) {
      setMessage("Please provide your name, email, and notes.");
      return;
    }

    const { error } = await supabase.from("interests").insert([
      {
        listing_id: selectedListing.id,
        member_user_id: user?.id || null,
        person_name: interestForm.personName,
        email: interestForm.email,
        phone: interestForm.phone || null,
        notes: interestForm.notes,
      },
    ]);

    if (error) {
      console.error("submitInterest error", error);
      setMessage(error.message);
      return;
    }

    setInterestForm({
      personName: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      phone: "",
      notes: "",
    });

    setSelectedListing(null);
    await loadInterests();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-slate-700">
        Loading Find New Clubs...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Find New Clubs</h1>
            <p className="text-sm text-slate-500">
              Find groups. Join communities. Build membership.
            </p>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="hidden h-9 w-9 rounded-full md:block"
                />
              ) : null}
              <div className="hidden text-right md:block">
                <div className="text-sm font-semibold">
                  {user.user_metadata?.full_name || "Signed in"}
                </div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <button
                onClick={signOut}
                className="rounded-2xl border bg-white px-4 py-2 text-sm font-medium shadow-sm"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {message ? (
          <div className="mb-4 rounded-2xl border bg-white p-4 text-sm text-red-700 shadow-sm">
            {message}
          </div>
        ) : null}

        {!user ? (
          <section className="grid gap-4 md:grid-cols-[1.2fr_.8fr]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg"
            >
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm">
                Mobile-friendly web app
              </p>
              <h2 className="mb-3 text-4xl font-bold leading-tight">
                Find clubs looking for people like you.
              </h2>
              <p className="max-w-2xl text-slate-200">
                Members search for free. Groups publish listings and review interested
                people.
              </p>
            </motion.div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold">Get started</h3>
              <button
                onClick={signInWithGoogle}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 font-semibold text-white"
              >
                <UserCircle className="h-5 w-5" /> Sign in with Google
              </button>
            </div>
          </section>
        ) : (
          <>
            <section className="mb-6 rounded-3xl border bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">What do you want to do?</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => chooseRole("member")}
                  className={`rounded-2xl px-5 py-3 font-semibold ${
                    role === "member"
                      ? "bg-slate-900 text-white"
                      : "border bg-white text-slate-800"
                  }`}
                >
                  <UserCircle className="mr-2 inline h-5 w-5" />
                  Find clubs
                </button>
                <button
                  onClick={() => chooseRole("group")}
                  className={`rounded-2xl px-5 py-3 font-semibold ${
                    role === "group"
                      ? "bg-slate-900 text-white"
                      : "border bg-white text-slate-800"
                  }`}
                >
                  <Users className="mr-2 inline h-5 w-5" />
                  List a club
                </button>
              </div>
            </section>

            {role === "member" && mode === "criteria" ? (
              <section className="mx-auto max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-2xl font-bold">Set up your search criteria</h2>
                <p className="mb-5 text-slate-500">
                  Tell us what kind of club you want before viewing matching groups.
                </p>

                <form onSubmit={saveCriteria} className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Club type</span>
                    <select
                      value={memberCriteria.type}
                      onChange={(e) =>
                        setMemberCriteria({ ...memberCriteria, type: e.target.value })
                      }
                      className="w-full rounded-2xl border px-4 py-3"
                    >
                      {clubTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">
                      Starting location
                    </span>
                    <input
                      value={memberCriteria.location}
                      onChange={(e) =>
                        setMemberCriteria({
                          ...memberCriteria,
                          location: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border px-4 py-3"
                      placeholder="Aurora, Denver, Lakewood..."
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">
                      Maximum distance
                    </span>
                    <select
                      value={memberCriteria.radiusMiles}
                      onChange={(e) =>
                        setMemberCriteria({
                          ...memberCriteria,
                          radiusMiles: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-2xl border px-4 py-3"
                    >
                      <option value={5}>Within 5 miles</option>
                      <option value={10}>Within 10 miles</option>
                      <option value={20}>Within 20 miles</option>
                      <option value={35}>Within 35 miles</option>
                      <option value={50}>Within 50 miles</option>
                      <option value={100}>Within 100 miles</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">
                      Email for match alerts
                    </span>
                    <input
                      value={memberCriteria.email}
                      onChange={(e) =>
                        setMemberCriteria({ ...memberCriteria, email: e.target.value })
                      }
                      className="w-full rounded-2xl border px-4 py-3"
                      placeholder="you@example.com"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <input
                      type="checkbox"
                      checked={memberCriteria.emailAlerts}
                      onChange={(e) =>
                        setMemberCriteria({
                          ...memberCriteria,
                          emailAlerts: e.target.checked,
                        })
                      }
                      className="h-5 w-5"
                    />
                    <span>
                      <span className="block font-medium">
                        Email me when new matching clubs are posted
                      </span>
                      <span className="text-sm text-slate-500">
                        Later, this can become iPhone / Android push notifications.
                      </span>
                    </span>
                  </label>

                  <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">
                    <Search className="h-5 w-5" /> Save criteria and show groups
                  </button>
                </form>
              </section>
            ) : null}

            {role === "member" && mode === "search" ? (
              <section>
                <div className="mb-5 rounded-3xl border bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                    <ClipboardList className="h-4 w-4" />
                    Your saved criteria: {typeFilter} within {radiusFilter} miles of “
                    {locationFilter || "Any location"}”
                  </div>

                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full rounded-2xl border px-4 py-3"
                    >
                      {clubTypes.map((type) => (
                        <option key={type}>{type}</option>
                      ))}
                    </select>

                    <input
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      placeholder="Aurora, Denver, Lakewood..."
                      className="w-full rounded-2xl border px-4 py-3"
                    />

                    <select
                      value={radiusFilter}
                      onChange={(e) => setRadiusFilter(Number(e.target.value))}
                      className="w-full rounded-2xl border px-4 py-3"
                    >
                      <option value={5}>5 miles</option>
                      <option value={10}>10 miles</option>
                      <option value={20}>20 miles</option>
                      <option value={35}>35 miles</option>
                      <option value={50}>50 miles</option>
                      <option value={100}>100 miles</option>
                    </select>

                    <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-medium text-white">
                      <Search className="h-4 w-4" /> Search
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {filteredListings.map((listing) => {
                    const Icon = iconMap[listing.type] || Users;
                    return (
                      <motion.article
                        key={listing.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border bg-white p-5 shadow-sm"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold">{listing.name}</h3>
                            <p className="flex items-center gap-1 text-sm text-slate-500">
                              <MapPin className="h-4 w-4" />
                              {listing.location}
                              {locationFilter
                                ? ` · ${
                                    getDistanceMiles(locationFilter, listing.location) ??
                                    "?"
                                  } miles away`
                                : ""}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-100 p-3">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>

                        <p className="mb-4 rounded-2xl bg-slate-50 p-4 text-slate-700">
                          {listing.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                            {listing.type}
                          </span>
                          <button
                            onClick={() => setSelectedListing(listing)}
                            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                          >
                            I’m interested
                          </button>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>

                {filteredListings.length === 0 ? (
                  <div className="rounded-3xl border bg-white p-8 text-center text-slate-500">
                    No clubs match that search yet.
                  </div>
                ) : null}
              </section>
            ) : null}

            {selectedListing ? (
              <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 p-4">
                <form
                  onSubmit={submitInterest}
                  className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl"
                >
                  <h2 className="mb-1 text-2xl font-bold">Share your interest</h2>
                  <p className="mb-5 text-slate-500">
                    Your contact details and notes will be shared with{" "}
                    {selectedListing.name}.
                  </p>

                  <div className="space-y-3">
                    <input
                      value={interestForm.personName}
                      onChange={(e) =>
                        setInterestForm({
                          ...interestForm,
                          personName: e.target.value,
                        })
                      }
                      className="w-full rounded-2xl border px-4 py-3"
                      placeholder="Your name"
                    />

                    <input
                      value={interestForm.email}
                      onChange={(e) =>
                        setInterestForm({ ...interestForm, email: e.target.value })
                      }
                      className="w-full rounded-2xl border px-4 py-3"
                      placeholder="Email"
                    />

                    <input
                      value={interestForm.phone}
                      onChange={(e) =>
                        setInterestForm({ ...interestForm, phone: e.target.value })
                      }
                      className="w-full rounded-2xl border px-4 py-3"
                      placeholder="Phone number, optional"
                    />

                    <textarea
                      value={interestForm.notes}
                      onChange={(e) =>
                        setInterestForm({ ...interestForm, notes: e.target.value })
                      }
                      className="min-h-28 w-full rounded-2xl border px-4 py-3"
                      placeholder="Notes, background, availability, questions, or anything else you want the group to know."
                    />
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedListing(null)}
                      className="w-full rounded-2xl border px-5 py-3 font-semibold"
                    >
                      Cancel
                    </button>
                    <button className="w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">
                      Send to group
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {role === "group" && mode === "groupDashboard" ? (
              <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">Your posting history</h2>
                    <button
                      onClick={() => setMode("list")}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      New Listing
                    </button>
                  </div>

                  <div className="space-y-3">
                    {groupListings.map((listing) => {
                      const count = interests.filter(
                        (interest) => interest.listing_id === listing.id
                      ).length;

                      return (
                        <div key={listing.id} className="rounded-2xl border p-4">
                          <div className="mb-2 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{listing.name}</h3>
                              <p className="text-sm text-slate-500">
                                {listing.type} · {listing.location}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                listing.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {listing.status}
                            </span>
                          </div>

                          <p className="mb-3 flex items-center gap-1 text-sm text-slate-500">
                            <Clock className="h-4 w-4" />
                            Expires{" "}
                            {listing.expires_at
                              ? new Date(listing.expires_at).toLocaleDateString()
                              : "not set"}
                          </p>

                          <p className="text-sm font-medium">
                            {count} interested {count === 1 ? "person" : "people"}
                          </p>
                        </div>
                      );
                    })}

                    {groupListings.length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                        You have not created any listings yet.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <h2 className="mb-4 text-2xl font-bold">Interested people</h2>

                  <div className="space-y-4">
                    {groupListings.flatMap((listing) =>
                      interests
                        .filter((interest) => interest.listing_id === listing.id)
                        .map((interest) => (
                          <div key={interest.id} className="rounded-2xl bg-slate-50 p-4">
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold">{interest.person_name}</h3>
                                <p className="text-sm text-slate-500">
                                  Interested in {listing.name}
                                </p>
                              </div>
                              <span className="text-xs text-slate-500">
                                {new Date(interest.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            <div className="mb-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                              <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4" /> {interest.email}
                              </p>
                              <p className="flex items-center gap-2">
                                <UserCircle className="h-4 w-4" />{" "}
                                {interest.phone || "No phone provided"}
                              </p>
                            </div>

                            <p className="flex gap-2 rounded-2xl bg-white p-3 text-sm text-slate-700">
                              <MessageSquare className="mt-0.5 h-4 w-4 shrink-0" />
                              {interest.notes}
                            </p>
                          </div>
                        ))
                    )}

                    {groupListings.flatMap((listing) =>
                      interests.filter((interest) => interest.listing_id === listing.id)
                    ).length === 0 ? (
                      <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
                        No interested people yet.
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}

            {role === "group" && mode === "list" ? (
              <section className="mx-auto max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold">Create a club listing</h2>
                  <p className="text-slate-500">
                    Listings cost $10/month. Payment will connect to Stripe later.
                  </p>
                </div>

                <form onSubmit={addListing} className="space-y-4">
                  <input
                    value={listingForm.name}
                    onChange={(e) =>
                      setListingForm({ ...listingForm, name: e.target.value })
                    }
                    className="w-full rounded-2xl border px-4 py-3"
                    placeholder="Club / group name"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <select
                      value={listingForm.type}
                      onChange={(e) =>
                        setListingForm({ ...listingForm, type: e.target.value })
                      }
                      className="w-full rounded-2xl border px-4 py-3"
                    >
                      {clubTypes
                        .filter((type) => type !== "All")
                        .map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                    </select>

                    <input
                      value={listingForm.location}
                      onChange={(e) =>
                        setListingForm({ ...listingForm, location: e.target.value })
                      }
                      className="w-full rounded-2xl border px-4 py-3"
                      placeholder="City, State"
                    />
                  </div>

                  <textarea
                    value={listingForm.lookingFor}
                    onChange={(e) =>
                      setListingForm({ ...listingForm, lookingFor: e.target.value })
                    }
                    className="min-h-28 w-full rounded-2xl border px-4 py-3"
                    placeholder="Who are you looking for?"
                  />

                  <input
                    value={listingForm.contact}
                    onChange={(e) =>
                      setListingForm({ ...listingForm, contact: e.target.value })
                    }
                    className="w-full rounded-2xl border px-4 py-3"
                    placeholder="Contact email"
                  />

                  <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white">
                    <PlusCircle className="h-5 w-5" /> Create listing
                  </button>
                </form>
              </section>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

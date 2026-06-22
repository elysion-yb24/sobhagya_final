"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ScrollText, Sparkles, ShieldCheck, MessageCircle, Star, Activity, Coins, Heart, Briefcase, Shield, Sun } from "lucide-react";
import {
  fetchCategories,
  fetchAllProducts,
  PoojaCategory,
  PoojaProduct,
} from "../utils/pooja-api";
import PoojaCard from "../components/pooja/PoojaCard";
import { Skeleton } from "../components/ui/SkeletonLoader";

const SORTS = [
  { value: "", label: "Recommended" },
  { value: "popular", label: "Most Booked" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const TRUST = [
  { icon: ShieldCheck, label: "Verified Pandits" },
  { icon: MessageCircle, label: "Live Chat Updates" },
  { icon: Star, label: "10,000+ Pujas Done" },
];

function CatIcon({ title, className }: { title: string, className?: string }) {
  const t = title.toLowerCase();
  if (t.includes("health") || t.includes("well")) return <Activity className={className} />;
  if (t.includes("wealth") || t.includes("prosper")) return <Coins className={className} />;
  if (t.includes("love") || t.includes("marri")) return <Heart className={className} />;
  if (t.includes("career") || t.includes("success")) return <Briefcase className={className} />;
  if (t.includes("dosh")) return <Shield className={className} />;
  if (t.includes("shanti") || t.includes("protect")) return <Sun className={className} />;
  return <Sparkles className={className} />;
}

function PoojaCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-orange-100/50 overflow-hidden">
      <Skeleton variant="rectangular" height={192} className="w-full" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" height={16} />
        <Skeleton variant="text" height={14} width="60%" />
        <Skeleton variant="text" height={20} width="40%" className="mt-2" />
        <Skeleton variant="rounded" height={42} className="mt-2" />
      </div>
    </div>
  );
}

export default function PoojaShopPage() {
  const [categories, setCategories] = useState<PoojaCategory[]>([]);
  const [products, setProducts] = useState<PoojaProduct[]>([]);
  const [activeCat, setActiveCat] = useState<string>(""); // "" = All
  const [sort, setSort] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // load categories once
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // load products on filter change
  useEffect(() => {
    setLoading(true);
    fetchAllProducts({ categoryId: activeCat || undefined, sort: sort || undefined, search: debounced || undefined, limit: 60 })
      .then((r) => {
        setProducts(r.items);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeCat, sort, debounced]);

  const chips = useMemo(() => [{ _id: "", title: "All" } as any, ...categories], [categories]);
  const activeTitle = useMemo(
    () => chips.find((c) => c._id === activeCat)?.title || "All",
    [chips, activeCat]
  );

  return (
    <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[#8b3a0e] text-white">
        {/* Deep, rich temple-like gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#9a3e0f] via-[#85340a] to-[#612204]" />
        
        {/* elegant decorative patterns */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, #fcd34d 0, transparent 40%), radial-gradient(circle at 85% 0%, #fef3c7 0, transparent 45%), radial-gradient(circle at 50% 100%, #fbbf24 0, transparent 50%)",
          }}
        />
        
        {/* subtle inner shadow */}
        <div className="absolute inset-0 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.2)] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 pt-12 sm:pt-16 pb-24 sm:pb-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-amber-100 text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Online Puja &amp; Remedies
          </div>
          
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold max-w-3xl leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-100">
            Book a Puja performed by verified pandits
          </h1>
          <p className="text-amber-100/80 mt-5 max-w-xl text-sm sm:text-lg mx-auto font-medium">
            Authentic Vedic rituals performed on your behalf — with live updates over chat.
          </p>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8">
            {TRUST.map((t) => (
              <div key={t.label} className="flex items-center gap-2 bg-black/10 backdrop-blur-sm border border-white/10 px-3.5 py-1.5 rounded-xl text-amber-50/90 text-xs sm:text-sm font-medium transition-colors hover:bg-black/20">
                <t.icon className="w-4 h-4 text-amber-400" /> {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Search card overlapping the hero */}
        <div className="-mt-14 sm:-mt-16 relative z-20 bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex-1 flex items-center gap-3 bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 rounded-2xl px-4 transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pujas (e.g. Shani, Lakshmi, Kaal Sarp)"
                className="flex-1 py-3.5 text-[15px] outline-none bg-transparent placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)} 
                className="bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 rounded-2xl px-4 py-3.5 text-[15px] outline-none focus:border-orange-300 transition-colors cursor-pointer appearance-none pr-8 relative"
                style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat' }}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <Link
                href="/pooja/orders"
                className="whitespace-nowrap text-[15px] font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-orange-100 transition-colors"
              >
                <ScrollText className="w-5 h-5" /> My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* category chips — sticky below the fixed header */}
        <div className="sticky top-[58px] md:top-16 lg:top-28 z-10 -mx-4 px-4 py-4 bg-gradient-to-b from-orange-50/95 to-orange-50/80 backdrop-blur supports-[backdrop-filter]:bg-orange-50/70 mt-2">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {chips.map((c) => {
              const isActive = activeCat === c._id;
              return (
                <button
                  key={c._id || "all"}
                  onClick={() => setActiveCat(c._id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600 shadow-md shadow-orange-500/20"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50"
                  }`}
                >
                  {c._id ? (
                    <CatIcon title={c.title} className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-500'}`} />
                  ) : (
                    <Sparkles className={`w-4 h-4 ${isActive ? 'text-white' : 'text-orange-500'}`} />
                  )}
                  {c.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* section heading */}
        <div className="flex items-end justify-between mt-4 mb-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
            {activeCat ? activeTitle : debounced ? "Search Results" : "Popular Pujas"}
          </h2>
          {!loading && !error && (
            <span className="text-xs text-gray-400">{products.length} {products.length === 1 ? "puja" : "pujas"}</span>
          )}
        </div>

        {/* grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PoojaCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-10">{error}</p>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500">No pujas found. Try a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {products.map((p) => (
              <PoojaCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

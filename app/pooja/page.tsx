"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ScrollText, Sparkles, ShieldCheck, MessageCircle, Star, Activity, Coins, Heart, Briefcase, Shield, Sun, Flame, Wand2, HandHeart, RefreshCw, WifiOff } from "lucide-react";
import {
  fetchCategories,
  fetchAllProducts,
  PoojaCategory,
  PoojaProduct,
} from "../utils/pooja-api";
import PoojaCard from "../components/pooja/PoojaCard";
import { Skeleton } from "../components/ui/SkeletonLoader";
import { usePullToRefresh } from "../hooks/usePullToRefresh";

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
  // Remedy-type categories (Poojas / Spells / Healings / Consultations).
  if (t.includes("pooja") || t.includes("puja")) return <Flame className={className} />;
  if (t.includes("spell")) return <Wand2 className={className} />;
  if (t.includes("healing")) return <HandHeart className={className} />;
  if (t.includes("consult")) return <ScrollText className={className} />;
  // Themed fallbacks (legacy categories).
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

  const loadProducts = useCallback(async (withSpinner = true) => {
    if (withSpinner) setLoading(true);
    try {
      const r = await fetchAllProducts({ categoryId: activeCat || undefined, sort: sort || undefined, search: debounced || undefined, limit: 60 });
      setProducts(r.items);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Couldn't load remedies.");
    } finally {
      if (withSpinner) setLoading(false);
    }
  }, [activeCat, sort, debounced]);

  // load products on filter change
  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Pull-to-refresh (mobile WebView): re-fetch categories + products.
  const { pullDistance, refreshing } = usePullToRefresh(async () => {
    await Promise.all([fetchCategories().then(setCategories).catch(() => {}), loadProducts(false)]);
  });

  const chips = useMemo(() => [{ _id: "", title: "All" } as any, ...categories], [categories]);
  const activeTitle = useMemo(
    () => chips.find((c) => c._id === activeCat)?.title || "All",
    [chips, activeCat]
  );

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32]">
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || refreshing) && (
        <div
          className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
          style={{ transform: `translateY(${refreshing ? 16 : Math.min(pullDistance, 80)}px)` }}
        >
          <div className="bg-white rounded-full p-2 shadow-[0_4px_15px_rgba(255,106,0,0.25)] border border-orange-100">
            <RefreshCw className={`w-5 h-5 text-[#FF8C00] ${refreshing ? "animate-spin" : ""}`} style={{ transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)` }} />
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden bg-[#F49C1C] text-white">
        {/* Deep, premium vibrant mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A00] via-[#FF8C00] to-[#FFD200]" />
        
        {/* elegant decorative patterns */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, #fcd34d 0, transparent 40%), radial-gradient(circle at 85% 0%, #fef3c7 0, transparent 45%), radial-gradient(circle at 50% 100%, #fbbf24 0, transparent 50%)",
          }}
        />
        
        {/* subtle inner shadow */}
        <div className="absolute inset-0 shadow-[inset_0_-20px_40px_rgba(0,0,0,0.1)] pointer-events-none" />

        {/* Abstract glowing orbs for a modern innovative feel */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FF6A00]/30 rounded-full blur-[80px] pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

        <div className="relative max-w-6xl mx-auto px-4 pt-12 sm:pt-16 pb-24 sm:pb-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-amber-100 text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Online Puja &amp; Remedies
          </div>
          
          <h1 className="font-bold text-4xl sm:text-6xl lg:text-7xl max-w-3xl leading-[1.1] text-white">
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
        <div className="-mt-14 sm:-mt-16 relative z-20 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgba(255,140,0,0.12)] border border-white/50 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1 flex items-center gap-3 bg-white/90 border border-orange-100 rounded-xl px-4 shadow-inner transition-colors">
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
                className="bg-white/90 border border-orange-100 rounded-xl px-4 py-3 text-[14px] text-[#4A3B32] outline-none focus:border-[#FF8C00] shadow-sm transition-colors cursor-pointer appearance-none pr-8 relative"
                style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%234A3B32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat' }}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <Link
                href="/pooja/orders"
                className="whitespace-nowrap text-[14px] font-bold text-[#FF8C00] bg-white hover:bg-orange-50 flex items-center gap-2 px-5 py-3 rounded-xl border border-orange-200 hover:border-[#FF8C00] shadow-sm transition-all"
              >
                <ScrollText className="w-5 h-5" /> My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* category chips — sticky below the fixed header */}
        <div className="sticky top-[58px] md:top-16 lg:top-28 z-10 -mx-4 px-4 py-3 bg-[#FFFAF0]/80 backdrop-blur-xl mt-2 border-b border-orange-100/50 shadow-[0_4px_20px_rgba(255,140,0,0.03)]">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {chips.map((c) => {
              const isActive = activeCat === c._id;
              return (
                <button
                  key={c._id || "all"}
                  onClick={() => setActiveCat(c._id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-[14px] font-medium border transition-all duration-300 flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] text-white border-transparent shadow-[0_4px_15px_rgba(255,106,0,0.3)] scale-105"
                      : "bg-white text-[#4A3B32] border-orange-100 hover:border-[#FF8C00] hover:text-[#FF8C00] shadow-sm hover:shadow"
                  }`}
                >
                  {c._id ? (
                    <CatIcon title={c.title} className={`w-4 h-4 ${isActive ? 'text-white drop-shadow-md' : 'text-[#FF8C00]'}`} />
                  ) : (
                    <Sparkles className={`w-4 h-4 ${isActive ? 'text-white drop-shadow-md' : 'text-[#FF8C00]'}`} />
                  )}
                  {c.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* section heading */}
        <div className="flex items-end justify-between mt-5 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#4A3B32]">
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
          <div className="text-center py-16 bg-white rounded-[2rem] border border-orange-50 shadow-[0_4px_20px_rgba(255,140,0,0.03)]">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center mb-4">
              <WifiOff className="w-7 h-7 text-[#FF8C00]" />
            </div>
            <p className="text-[#4A3B32] font-semibold">Couldn&apos;t reach our remedies</p>
            <p className="text-gray-400 text-sm mt-1">Please check your connection and try again.</p>
            <button
              onClick={() => loadProducts()}
              className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-bold px-6 py-2.5 rounded-2xl shadow-[0_4px_15px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
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

"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Search, Languages, CheckCircle2, Briefcase } from "lucide-react";
import {
  fetchRemedyAstrologers,
  fetchProduct,
  PoojaAstrologer,
  PoojaProduct,
  formatINR,
  poojaImg,
  POOJA_PLACEHOLDER,
} from "../../../../utils/pooja-api";
import BackButton from "../../../../components/ui/BackButton";
import { Skeleton } from "../../../../components/ui/SkeletonLoader";

function ProviderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-orange-50 shadow-[0_4px_20px_rgba(255,140,0,0.03)] p-4 flex gap-3">
      <Skeleton variant="circular" width={56} height={56} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height={16} width="50%" />
        <Skeleton variant="text" height={12} width="80%" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton variant="text" height={16} width={70} />
          <Skeleton variant="rounded" height={30} width={80} />
        </div>
      </div>
    </div>
  );
}

function ratingValue(r: PoojaAstrologer["rating"]): number {
  if (typeof r === "number") return r;
  if (r && typeof r === "object" && typeof r.avg === "number") return r.avg;
  return 0;
}

export default function PanditSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.productId as string) || "";

  const [astrologers, setAstrologers] = useState<PoojaAstrologer[]>([]);
  const [product, setProduct] = useState<PoojaProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // The puja price is fixed per product (the astrologer is *who* performs it).
  const pujaPrice = product?.startingPrice ?? 0;
  const pujaOriginal = product?.startingOriginalPrice ?? 0;

  // Initial load: product (for price) + the survey-driven per-remedy roster
  // (only astrologers who actually perform THIS remedy — requirement #4/#5).
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      fetchProduct(productId).catch(() => null),
      fetchRemedyAstrologers(productId),
    ])
      .then(([p, list]) => {
        setProduct(p);
        setAstrologers(list);
        setError(null);
      })
      .catch((e) => setError(e?.message || "Failed to load astrologers."))
      .finally(() => setLoading(false));
  }, [productId]);

  // Refresh the roster every 12s so the online badge / online-first ordering stays
  // current (online is a secondary signal — eligibility is the survey mapping).
  const searchRef = useRef(search);
  searchRef.current = search;
  useEffect(() => {
    if (!productId) return;
    const id = setInterval(async () => {
      try {
        const fresh = await fetchRemedyAstrologers(productId);
        setAstrologers(fresh);
      } catch {
        /* keep the current list on transient errors */
      }
    }, 12000);
    return () => clearInterval(id);
  }, [productId]);

  const filtered = astrologers.filter((a) => a.name?.toLowerCase().includes(search.toLowerCase()));

  const onSelect = (a: PoojaAstrologer) => {
    router.push(`/pooja/checkout?productId=${productId}&providerId=${a._id}`);
  };

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32]">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#4A3B32] mb-1">Select an Astrologer</h1>
        <p className="text-sm text-gray-500 mb-4">
          Choose from verified astrologers who perform <span className="text-[#FF8C00] font-semibold">{product?.title || "this remedy"}</span>.
        </p>

        <div className="flex gap-2 mb-5">
          <div className="flex-1 flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-3 shadow-sm focus-within:border-[#FF8C00] transition-colors">
            <Search className="w-4 h-4 text-[#FF8C00]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search astrologer"
              className="flex-1 py-3 text-sm outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProviderSkeleton key={i} />
            ))}
          </div>
        )}
        {error && <p className="text-center text-red-500 py-8">{error}</p>}

        <div className="space-y-3">
          {!loading &&
            filtered.map((a) => {
              const rating = ratingValue(a.rating);
              const hasRating = rating > 0;
              const orders = typeof a.ordersCount === "number" ? a.ordersCount : typeof a.calls === "number" ? a.calls : typeof a.callsCount === "number" ? a.callsCount : 0;
              const ordersLabel = orders >= 1000 ? `${Math.floor(orders / 1000)}k+` : orders;
              const languages = a.languages || [];
              const exp = a.experience;
              const hasDiscount = pujaOriginal > pujaPrice;
              return (
                <div
                  key={a._id}
                  className="bg-white rounded-2xl border border-orange-50 shadow-[0_4px_20px_rgba(255,140,0,0.03)] hover:shadow-[0_8px_30px_rgba(255,140,0,0.12)] hover:border-[#FF8C00]/40 p-4 flex gap-3 transition-all duration-300"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] ring-2 ring-orange-50 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={poojaImg(a.avatar || a.profileImage)}
                        alt={a.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = POOJA_PLACEHOLDER;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online is a secondary signal — show the live dot only when online. */}
                    {a.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Online now" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-[#4A3B32] truncate">{a.name}</h3>
                      {hasRating ? (
                        <div className="flex items-center gap-1 text-xs font-semibold text-[#4A3B32] flex-shrink-0 bg-[#FFFAF0] border border-orange-50 px-2 py-0.5 rounded-full">
                          <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" /> {rating.toFixed(1)}
                        </div>
                      ) : null}
                    </div>

                    {(a.specializations || a.talksAbout || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(a.specializations || a.talksAbout || []).slice(0, 3).map((s, i) => (
                          <span key={i} className="text-[10px] bg-[#FFF3E0] text-[#FF8C00] border border-orange-100 px-2 py-0.5 rounded-full font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-500">
                      {languages.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5 text-[#FF8C00]/70" /> {languages.join(", ")}
                        </span>
                      )}
                      {exp != null && exp !== "" && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-[#FF8C00]/70" /> {exp}{typeof exp === "number" ? " yrs" : ""}
                        </span>
                      )}
                      {orders > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {ordersLabel} orders
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm">
                        <span className="text-[#4A3B32] font-bold">{formatINR(pujaPrice)}</span>{" "}
                        {hasDiscount && <span className="text-gray-400 line-through text-xs">{formatINR(pujaOriginal)}</span>}
                      </div>
                      <button
                        onClick={() => onSelect(a)}
                        className="bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white text-sm font-bold px-7 py-2 rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(255,106,0,0.3)] hover:-translate-y-0.5"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-[2rem] border border-orange-50 shadow-[0_4px_20px_rgba(255,140,0,0.03)] mt-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-[#FF8C00]" />
            </div>
            <p className="text-[#4A3B32] font-semibold">No Astrologers found for this pooja.</p>
            <p className="text-gray-400 text-sm mt-1 px-6">Our astrologers for this remedy will be available soon. Please check back shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}

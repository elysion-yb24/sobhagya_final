"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Search, Languages, CheckCircle2, Briefcase } from "lucide-react";
import {
  fetchOnlineAstrologers,
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
    <div className="bg-white rounded-2xl border border-orange-100 p-4 flex gap-3">
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

  // Initial load: product (for price) + the live online astrologer roster.
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      fetchProduct(productId).catch(() => null),
      fetchOnlineAstrologers({ limit: 30 }),
    ])
      .then(([p, list]) => {
        setProduct(p);
        setAstrologers(list);
        setError(null);
      })
      .catch((e) => setError(e?.message || "Failed to load astrologers."))
      .finally(() => setLoading(false));
  }, [productId]);

  // Real-time status sync — re-fetch the online roster every 12s (same cadence as
  // the Call-with-Astrologer page) so the list reflects who is currently online.
  const searchRef = useRef(search);
  searchRef.current = search;
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const fresh = await fetchOnlineAstrologers({ search: searchRef.current || undefined, limit: 30 });
        if (fresh.length) setAstrologers(fresh);
      } catch {
        /* keep the current list on transient errors */
      }
    }, 12000);
    return () => clearInterval(id);
  }, []);

  const filtered = astrologers.filter((a) => a.name?.toLowerCase().includes(search.toLowerCase()));

  const onSelect = (a: PoojaAstrologer) => {
    router.push(`/pooja/checkout?productId=${productId}&providerId=${a._id}`);
  };

  return (
    <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-1">Select an Astrologer</h1>
        <p className="text-sm text-gray-500 mb-4">
          Choose from astrologers who are <span className="text-green-600 font-medium">online right now</span> to perform your puja.
        </p>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-3">
            <Search className="w-4 h-4 text-orange-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search astrologer"
              className="flex-1 py-2.5 text-sm outline-none bg-transparent"
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
              const orders = typeof a.calls === "number" ? a.calls : typeof a.callsCount === "number" ? a.callsCount : 0;
              const ordersLabel = orders >= 1000 ? `${Math.floor(orders / 1000)}k+` : orders;
              const languages = a.languages || [];
              const exp = a.experience;
              const hasDiscount = pujaOriginal > pujaPrice;
              return (
                <div
                  key={a._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-premium border border-orange-100 hover:border-orange-200 p-4 flex gap-3 transition-all"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden">
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
                    {/* Filtered to online astrologers only — always show the live dot. */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" title="Online now" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-800 truncate">{a.name}</h3>
                      {hasRating ? (
                        <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {rating.toFixed(1)}
                        </div>
                      ) : null}
                    </div>

                    {(a.specializations || a.talksAbout || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(a.specializations || a.talksAbout || []).slice(0, 3).map((s, i) => (
                          <span key={i} className="text-[10px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-500">
                      {languages.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Languages className="w-3.5 h-3.5 text-gray-400" /> {languages.join(", ")}
                        </span>
                      )}
                      {exp != null && exp !== "" && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {exp}{typeof exp === "number" ? " yrs" : ""}
                        </span>
                      )}
                      {orders > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" /> {ordersLabel} orders
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm">
                        <span className="text-orange-600 font-bold">{formatINR(pujaPrice)}</span>{" "}
                        {hasDiscount && <span className="text-gray-400 line-through text-xs">{formatINR(pujaOriginal)}</span>}
                      </div>
                      <button
                        onClick={() => onSelect(a)}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-all shadow-sm"
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
          <p className="text-center text-gray-500 py-12">
            No astrologers are online right now. Please check back in a little while.
          </p>
        )}
      </div>
    </div>
  );
}

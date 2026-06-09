"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Search, Briefcase, Languages, CheckCircle2 } from "lucide-react";
import { fetchProviders, PoojaProvider, formatINR, poojaImg, POOJA_PLACEHOLDER } from "../../../../utils/pooja-api";
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

export default function PanditSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.productId as string) || "";

  const [providers, setProviders] = useState<PoojaProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchProviders(productId, sort || undefined)
      .then((p) => {
        setProviders(p);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productId, sort]);

  const filtered = providers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const onSelect = (p: PoojaProvider) => {
    router.push(`/pooja/checkout?productId=${productId}&providerId=${p.providerId}`);
  };

  return (
    <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-1">Select a Pandit</h1>
        <p className="text-sm text-gray-500 mb-4">Verified pandits available to perform your puja.</p>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-white border border-orange-100 rounded-xl px-3">
            <Search className="w-4 h-4 text-orange-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pandit"
              className="flex-1 py-2.5 text-sm outline-none bg-transparent"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-orange-100 rounded-xl px-3 text-sm outline-none focus:border-orange-300"
          >
            <option value="">Sort</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Rating</option>
            <option value="experience">Experience</option>
          </select>
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
          {!loading && filtered.map((p) => {
            const hasRating = typeof p.rating === "number" && p.rating > 0;
            const orders = typeof p.orderCount === "number" ? p.orderCount : 0;
            const ordersLabel = orders >= 1000 ? `${Math.floor(orders / 1000)}k+` : orders;
            const skills = p.skills || [];
            const languages = p.languages || [];
            const hasDiscount = p.originalPrice > p.discountedPrice;
            return (
              <div key={p.providerId} className="bg-white rounded-2xl shadow-sm hover:shadow-premium border border-orange-100 hover:border-orange-200 p-4 flex gap-3 transition-all">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={poojaImg(p.avatar)}
                      alt={p.name}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = POOJA_PLACEHOLDER;
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {p.isAvailable ? (
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" title="Available" />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">{p.name}</h3>
                    {hasRating ? (
                      <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {(p.rating as number).toFixed(1)}
                      </div>
                    ) : null}
                  </div>

                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="text-[10px] bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-500">
                    {languages.length > 0 && (
                      <span className="flex items-center gap-1"><Languages className="w-3.5 h-3.5 text-gray-400" /> {languages.join(", ")}</span>
                    )}
                    {typeof p.experienceYears === "number" && (
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-gray-400" /> {p.experienceYears} yrs</span>
                    )}
                    {orders > 0 && (
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-gray-400" /> {ordersLabel} orders</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm">
                      <span className="text-orange-600 font-bold">{formatINR(p.discountedPrice)}</span>{" "}
                      {hasDiscount && (
                        <span className="text-gray-400 line-through text-xs">{formatINR(p.originalPrice)}</span>
                      )}
                    </div>
                    <button
                      onClick={() => onSelect(p)}
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
          <p className="text-center text-gray-500 py-12">No pandits available for this pooja.</p>
        )}
      </div>
    </div>
  );
}

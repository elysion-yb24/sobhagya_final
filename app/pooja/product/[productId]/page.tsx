"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ChevronDown, Check, ShieldCheck, UserCheck, CreditCard, MessageCircle } from "lucide-react";
import { fetchProduct, PoojaProduct, formatINR, poojaImg, POOJA_PLACEHOLDER } from "../../../utils/pooja-api";
import BackButton from "../../../components/ui/BackButton";
import { Skeleton } from "../../../components/ui/SkeletonLoader";

const STEPS = [
  { icon: UserCheck, title: "Select a Pandit", body: "Choose a verified pandit for your ritual." },
  { icon: CreditCard, title: "Pay Securely", body: "Pay from your wallet or via PhonePe." },
  { icon: MessageCircle, title: "Live Updates", body: "Get photos & updates over chat." },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.productId as string) || "";

  const [product, setProduct] = useState<PoojaProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (!productId) return;
    fetchProduct(productId)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white">
        <div className="max-w-5xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-6">
          <Skeleton variant="rounded" height={300} className="w-full" />
          <div className="space-y-3">
            <Skeleton variant="text" height={28} width="70%" />
            <Skeleton variant="text" height={16} width="40%" />
            <Skeleton variant="text" height={32} width="30%" />
            <Skeleton variant="rounded" height={120} className="w-full mt-2" />
          </div>
        </div>
      </div>
    );
  }
  if (error || !product) {
    return <p className="text-center text-red-500 py-16">{error || "Product not found."}</p>;
  }

  const hasDiscount =
    !!product.startingOriginalPrice && product.startingOriginalPrice > (product.startingPrice || 0);
  const hasRating = typeof product.rating === "number" && product.rating > 0;

  const PriceBlock = () => (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-gray-400">Starting from</span>
      <span className="text-orange-600 font-bold text-2xl">{formatINR(product.startingPrice)}</span>
      {hasDiscount ? <span className="text-gray-400 line-through text-sm">{formatINR(product.startingOriginalPrice)}</span> : null}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white pb-28">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Image + sticky price (right column on lg) */}
          <div className="lg:order-2 lg:sticky lg:top-28 space-y-4">
            <div className="relative h-60 sm:h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 shadow-sm border border-orange-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poojaImg(product.heroImage || product.thumbnail)}
                alt={product.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = POOJA_PLACEHOLDER;
                }}
                className="h-full w-full object-cover"
              />
              {product.badge ? (
                <span className="absolute top-3 left-3 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                  {product.badge}
                </span>
              ) : null}
            </div>

            {/* price card (desktop) */}
            <div className="hidden lg:block bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
              <PriceBlock />
              <button
                onClick={() => router.push(`/pooja/product/${product._id}/select`)}
                className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
              >
                Book Now — Select Pandit
              </button>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4" /> Verified pandits · Live updates over chat
              </div>
            </div>
          </div>

          {/* Content (left column on lg) */}
          <div className="lg:order-1 bg-white rounded-3xl shadow-sm border border-orange-100 p-5 sm:p-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">{product.title}</h1>
            {product.subtitle ? <p className="text-sm text-gray-500 mt-1">{product.subtitle}</p> : null}
            {hasRating ? (
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium text-gray-700">{(product.rating as number).toFixed(1)}</span>
                {product.reviewCount ? <span>· {product.reviewCount.toLocaleString("en-IN")} reviews</span> : null}
              </div>
            ) : null}

            {/* price (mobile only) */}
            <div className="mt-3 lg:hidden">
              <PriceBlock />
            </div>

            {product.description && (
              <div className="mt-5">
                <h2 className="font-semibold text-gray-800 text-sm mb-1">Details</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {product.benefits && product.benefits.length > 0 && (
              <div className="mt-5">
                <h2 className="font-semibold text-gray-800 text-sm mb-2">What you get</h2>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-orange-50/50 border border-orange-100/70 rounded-xl px-3 py-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* How it works */}
            <div className="mt-6">
              <h2 className="font-semibold text-gray-800 text-sm mb-3">How it works</h2>
              <div className="grid grid-cols-3 gap-2">
                {STEPS.map((s, i) => (
                  <div key={i} className="text-center px-1">
                    <div className="mx-auto w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center mb-2">
                      <s.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800">{s.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {product.faqs && product.faqs.length > 0 && (
              <div className="mt-6 space-y-2">
                <h2 className="font-semibold text-gray-800 text-sm mb-1">Frequently asked</h2>
                {product.faqs.map((f, i) => (
                  <div key={i} className="border border-orange-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-orange-50/50"
                    >
                      {f.heading}
                      <ChevronDown className={`w-4 h-4 text-orange-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">{f.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Book Now (mobile / tablet) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-orange-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="hidden sm:block">
            <span className="text-orange-600 font-bold text-lg">{formatINR(product.startingPrice)}</span>
            {hasDiscount ? <span className="text-gray-400 line-through text-xs ml-1">{formatINR(product.startingOriginalPrice)}</span> : null}
          </div>
          <button
            onClick={() => router.push(`/pooja/product/${product._id}/select`)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all shadow-md"
          >
            Book Now — Select Pandit
          </button>
        </div>
      </div>
    </div>
  );
}

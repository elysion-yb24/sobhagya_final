"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ChevronDown, Check, ShieldCheck, UserCheck, CreditCard, MessageCircle, BadgeCheck } from "lucide-react";
import { fetchProduct, fetchProductReviews, PoojaProduct, PoojaReview, formatINR, poojaImg, POOJA_PLACEHOLDER } from "../../../utils/pooja-api";
import BackButton from "../../../components/ui/BackButton";
import { Skeleton } from "../../../components/ui/SkeletonLoader";

const STEPS = [
  { icon: UserCheck, title: "Select a Pandit", body: "Choose a verified pandit for your remedy." },
  { icon: CreditCard, title: "Pay from Wallet", body: "Settle securely from your Sobhagya Wallet." },
  { icon: MessageCircle, title: "Live Puja", body: "Chat, schedule & join your Live Puja." },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = (params?.productId as string) || "";

  const [product, setProduct] = useState<PoojaProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<{ items: PoojaReview[]; total: number; avgRating: number } | null>(null);

  useEffect(() => {
    if (!productId) return;
    fetchProduct(productId)
      .then((p) => setProduct(p))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    fetchProductReviews(productId, 1, 10)
      .then((r) => setReviews({ items: r.items, total: r.total, avgRating: r.avgRating }))
      .catch(() => setReviews({ items: [], total: 0, avgRating: 0 }));
  }, [productId]);

  const onGalleryScroll = () => {
    const el = galleryRef.current;
    if (!el || !el.clientWidth) return;
    setGalleryIdx(Math.round(el.scrollLeft / el.clientWidth));
  };
  const scrollToImg = (i: number) => {
    const el = galleryRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32]">
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
  const discountPct =
    product.discountPct || (hasDiscount ? Math.round((1 - (product.startingPrice || 0) / (product.startingOriginalPrice || 1)) * 100) : 0);
  // Gallery: dedupe imageUrl + heroImage + thumbnail + extra gallery images.
  const gallery = Array.from(
    new Set([product.imageUrl, product.heroImage, product.thumbnail, ...(product.gallery || [])].filter(Boolean) as string[])
  );

  const PriceBlock = () => (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-xs text-gray-400">Price</span>
        <span className="text-[#4A3B32] font-bold text-2xl">{formatINR(product.startingPrice)}</span>
        {hasDiscount ? <span className="text-gray-400 line-through text-sm">{formatINR(product.startingOriginalPrice)}</span> : null}
        {discountPct > 0 ? <span className="text-emerald-600 text-xs font-bold">{discountPct}% OFF</span> : null}
      </div>
      <p className="text-[11px] text-gray-400 mt-1">+18% GST applied at checkout · Pay from Sobhagya Wallet</p>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] pb-28 font-sans text-[#4A3B32]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Image + sticky price (right column on lg) */}
          <div className="lg:order-2 lg:sticky lg:top-28 space-y-4">
            {/* Swipeable image carousel */}
            <div className="relative">
              <div
                ref={galleryRef}
                onScroll={onGalleryScroll}
                className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-[2rem] shadow-[0_8px_30px_rgba(255,140,0,0.12)] border border-orange-100"
              >
                {(gallery.length ? gallery : [POOJA_PLACEHOLDER]).map((g, i) => (
                  <div key={i} className="relative flex-shrink-0 w-full snap-center h-60 sm:h-80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={poojaImg(g)}
                      alt={`${product.title} ${i + 1}`}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = POOJA_PLACEHOLDER; }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {product.badge ? (
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[#4A3B32] text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-white/50">
                  {product.badge}
                </span>
              ) : null}
            </div>

            {/* Carousel dots */}
            {gallery.length > 1 && (
              <div className="flex justify-center gap-1.5">
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToImg(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${i === galleryIdx ? "w-6 bg-[#FF8C00]" : "w-2 bg-orange-200"}`}
                  />
                ))}
              </div>
            )}

            {/* price card (desktop) */}
            <div className="hidden lg:block bg-white rounded-[2rem] border border-orange-50 shadow-[0_4px_20px_rgba(255,140,0,0.05)] p-6 relative overflow-hidden">
              <PriceBlock />
              <button
                onClick={() => router.push(`/pooja/product/${product._id}/select`)}
                className="mt-6 w-full bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-[0_4px_15px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,106,0,0.4)]"
              >
                Book Now — Select Pandit
              </button>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified pandits · Live updates
              </div>
            </div>
          </div>

          <div className="lg:order-1 bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(255,140,0,0.03)] border border-orange-50 p-6 sm:p-8">
            <h1 className="font-bold text-3xl sm:text-4xl text-[#4A3B32] leading-tight">{product.title}</h1>
            {product.subtitle ? <p className="text-[15px] text-gray-500 mt-2 font-medium">{product.subtitle}</p> : null}
            {hasRating ? (
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700] drop-shadow-sm" />
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
                    <li key={i} className="flex items-start gap-2 text-sm text-[#4A3B32] bg-[#FFFAF0]/50 border border-orange-50 rounded-xl px-3 py-2 shadow-sm">
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
                    <div className="mx-auto w-10 h-10 rounded-full bg-[#F5F0E5] flex items-center justify-center mb-2">
                      <s.icon className="w-5 h-5 text-[#FF8C00]" />
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
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#4A3B32] hover:bg-[#FFFAF0]/50"
                    >
                      {f.heading}
                      <ChevronDown className={`w-4 h-4 text-[#FF8C00] transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    {openFaq === i && <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">{f.body}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <h2 className="font-bold text-[#4A3B32] text-lg mb-3">Ratings & reviews</h2>
              {hasRating ? (
                <div className="flex items-center gap-4 bg-[#FFFAF0]/50 border border-orange-50 rounded-2xl p-5 shadow-sm">
                  <div className="text-center bg-white rounded-xl shadow-sm border border-orange-50 px-4 py-2">
                    <div className="text-3xl font-bold text-[#4A3B32] leading-none">{(product.rating as number).toFixed(1)}</div>
                    <div className="flex items-center justify-center gap-0.5 mt-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating as number) ? "text-[#FFD700] fill-[#FFD700] drop-shadow-sm" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-gray-800 text-base">Loved by devotees</div>
                    <div className="text-xs text-gray-500 mt-0.5 font-medium">
                      {(reviews?.total ?? product.reviewCount)
                        ? `${(reviews?.total ?? product.reviewCount)!.toLocaleString("en-IN")} verified ratings`
                        : "Verified-booking ratings"}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Real testimonials (from completed-order feedback) */}
              {reviews && reviews.items.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {reviews.items.map((rv, i) => (
                    <div key={i} className="bg-white border border-orange-50 rounded-2xl p-4 shadow-[0_4px_20px_rgba(255,140,0,0.03)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] flex items-center justify-center text-[#FF8C00] font-bold text-sm">
                            {rv.name?.[0]?.toUpperCase() || "D"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#4A3B32] leading-tight">{rv.name}</p>
                            {rv.verified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                                <BadgeCheck className="w-3 h-3" /> Verified booking
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s < rv.rating ? "text-[#FFD700] fill-[#FFD700]" : "text-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      {rv.comment ? <p className="text-sm text-gray-600 mt-2 leading-relaxed">{rv.comment}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-3">Be the first to review this remedy after your booking.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Book Now (mobile / tablet) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="hidden sm:block">
            <span className="text-[#3E4042] font-bold text-xl">{formatINR(product.startingPrice)}</span>
            {hasDiscount ? <span className="text-gray-400 line-through text-xs ml-1.5 font-medium">{formatINR(product.startingOriginalPrice)}</span> : null}
          </div>
          <button
            onClick={() => router.push(`/pooja/product/${product._id}/select`)}
            className="flex-1 bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-[0_4px_15px_rgba(255,106,0,0.3)] hover:-translate-y-0.5"
          >
            Book Now — Select Pandit
          </button>
        </div>
      </div>
    </div>
  );
}

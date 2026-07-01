"use client";

import { useRouter } from "next/navigation";
import { Star, ArrowRight, ShieldCheck } from "lucide-react";
import { PoojaProduct, formatINR, poojaImg, POOJA_PLACEHOLDER } from "../../utils/pooja-api";

const BADGE_STYLES: Record<string, string> = {
  "Most Popular": "bg-gradient-to-r from-[#FF6A00] to-[#FF8C00]",
  "Best Seller": "bg-gradient-to-r from-[#FF6A00] to-[#FFD200]",
  "Most Booked": "bg-gradient-to-r from-[#FF6A00] to-[#FF8C00]",
  New: "bg-gradient-to-r from-emerald-500 to-teal-500",
};

export default function PoojaCard({ product }: { product: PoojaProduct }) {
  const router = useRouter();
  const badgeClass = (product.badge && BADGE_STYLES[product.badge]) || "bg-gradient-to-r from-[#FF6A00] to-[#FF8C00]";
  const hasDiscount =
    !!product.startingOriginalPrice && product.startingOriginalPrice > (product.startingPrice || 0);
  const off = hasDiscount
    ? Math.round((1 - (product.startingPrice || 0) / (product.startingOriginalPrice as number)) * 100)
    : 0;
  const hasRating = typeof product.rating === "number" && product.rating > 0;

  const go = () => router.push(`/pooja/product/${product._id}`);

  return (
    <div
      onClick={go}
      className="group cursor-pointer bg-white rounded-2xl shadow-[0_4px_20px_rgba(255,140,0,0.05)] hover:shadow-[0_12px_30px_rgba(255,106,0,0.15)] border border-orange-50 hover:border-[#FF8C00] flex flex-col transition-all duration-300 hover:-translate-y-1 p-3"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-xl bg-gray-50 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poojaImg(product.imageUrl || product.thumbnail || product.heroImage)}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = POOJA_PLACEHOLDER;
          }}
          className="h-full w-full object-cover group-hover:scale-[1.08] transition-transform duration-700 ease-out"
        />
        
        {/* Subtle overlay for better contrast of badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

        {/* Top Left: Main Badge */}
        {product.badge ? (
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-block ${badgeClass} text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20`}>
              {product.badge}
            </span>
          </div>
        ) : null}

        {/* Top Right: Rating */}
        {hasRating && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur text-[#4A3B32] text-[12px] font-bold px-2.5 py-1 rounded-md shadow-sm border border-white/50">
            <Star className="w-3.5 h-3.5 fill-[#FFD700] text-[#FFD700] drop-shadow-sm" />
            {(product.rating as number).toFixed(1)}
          </div>
        )}

        {/* Bottom Left: Trust Indicator */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded">
          <ShieldCheck className="w-3 h-3 text-[#FFD200]" />
          Verified Pandit
        </div>
      </div>

      {/* Content Area */}
      <div className="px-1 pt-4 pb-1 flex-1 flex flex-col relative">
        <h3 className="font-bold text-[#4A3B32] text-[16px] leading-snug line-clamp-2 group-hover:text-[#FF8C00] transition-colors duration-300">
          {product.title}
        </h3>
        
        {product.subtitle ? (
          <p className="text-[13px] text-gray-500 mt-2 line-clamp-2 leading-relaxed font-medium">{product.subtitle}</p>
        ) : null}

        <div className="mt-auto pt-6 pb-1 flex items-end justify-between">
          {/* Price Section */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[#4A3B32] font-bold text-xl">{formatINR(product.startingPrice)}</span>
            </div>
            {hasDiscount ? (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-gray-400 line-through text-[13px] font-semibold">{formatINR(product.startingOriginalPrice)}</span>
                {off > 0 && (
                  <span className="text-emerald-700 bg-emerald-100/80 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {off}% OFF
                  </span>
                )}
              </div>
            ) : null}
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              go();
            }}
            className="bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white h-10 px-5 rounded-lg font-bold transition-all duration-300 flex items-center gap-1.5 shadow-[0_4px_15px_rgba(255,106,0,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,106,0,0.4)]"
          >
            Book
            <ArrowRight className="w-4 h-4 drop-shadow-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}

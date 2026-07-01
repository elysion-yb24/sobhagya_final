"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { fetchAllProducts, fetchCategories, PoojaProduct, PoojaCategory } from "../../utils/pooja-api";
import PoojaCard from "../../components/pooja/PoojaCard";
import BackButton from "../../components/ui/BackButton";

export default function CategoryProductsPage() {
  const params = useParams();
  const categoryId = (params?.categoryId as string) || "";

  const [products, setProducts] = useState<PoojaProduct[]>([]);
  const [category, setCategory] = useState<PoojaCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    fetchAllProducts({ categoryId, limit: 60 })
      .then((r) => setProducts(r.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    fetchCategories()
      .then((cats) => setCategory(cats.find((c) => c._id === categoryId) || null))
      .catch(() => {});
  }, [categoryId]);

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-4">
          <BackButton />
        </div>

        {/* section heading */}
        <div className="flex items-end justify-between mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#4A3B32] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#FF8C00]" />
            {category?.title || "Remedies"}
          </h1>
          {!loading && !error && (
            <span className="text-xs text-gray-400">
              {products.length} {products.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin" />
          </div>
        )}
        {error && <p className="text-center text-red-500 py-10">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {products.map((p) => (
              <PoojaCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🪔</div>
            <p className="text-gray-500">No items in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

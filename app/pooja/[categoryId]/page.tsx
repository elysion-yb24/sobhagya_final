"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { fetchAllProducts, PoojaProduct } from "../../utils/pooja-api";
import PoojaCard from "../../components/pooja/PoojaCard";

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = (params?.categoryId as string) || "";

  const [products, setProducts] = useState<PoojaProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    fetchAllProducts({ categoryId, limit: 60 })
      .then((r) => setProducts(r.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [categoryId]);

  return (
    <div className="min-h-[calc(100vh-90px)] bg-gradient-to-br from-orange-50 via-amber-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <button onClick={() => router.push("/pooja")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> All Pujas
        </button>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}
        {error && <p className="text-center text-red-500 py-10">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((p) => (
              <PoojaCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-center text-gray-500 py-16">No pujas in this category yet.</p>
        )}
      </div>
    </div>
  );
}

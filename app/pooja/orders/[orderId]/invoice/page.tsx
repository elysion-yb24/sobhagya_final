"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Loader2, ArrowLeft } from "lucide-react";
import { isAuthenticated } from "../../../../utils/auth-utils";
import { fetchOrder, PoojaOrder, formatINR } from "../../../../utils/pooja-api";
import { INVOICE_SELLER, invoiceNumber } from "../../../../components/pooja/invoiceSeller";

function fmtDate(dt?: string | null) {
  return dt ? new Date(dt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—";
}

export default function PoojaInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || "";

  const [order, setOrder] = useState<PoojaOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace(`/login?next=${encodeURIComponent(`/pooja/orders/${orderId}/invoice`)}`);
      return;
    }
    fetchOrder(orderId)
      .then(setOrder)
      .catch((e) => setError(e?.message || "Couldn't load this invoice."))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-24 bg-[#FFFAF0] min-h-[calc(100vh-90px)]">
        <Loader2 className="w-8 h-8 text-[#FF8C00] animate-spin" />
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-red-500 text-sm">{error || "Invoice not available."}</p>
        <button onClick={() => router.back()} className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FFD200] text-white font-bold">Go Back</button>
      </div>
    );
  }

  const paid = ["PAID", "IN_PROGRESS", "COMPLETED"].includes(order.status);
  const invoiceDate = order.fulfilledAt || order.createdAt;
  const gstPct = ((order.gstRate ?? 0.18) * 100).toFixed(0);

  return (
    <div className="min-h-[calc(100vh-90px)] bg-[#FFFAF0] font-sans text-[#4A3B32] py-6 px-4">
      {/* Action bar (not printed) */}
      <div className="no-print max-w-3xl mx-auto mb-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#FF8C00]">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-gradient-to-r from-[#FF6A00] to-[#FFD200] hover:to-[#FF8C00] text-white font-bold px-5 py-2.5 rounded-2xl shadow-[0_4px_15px_rgba(255,106,0,0.3)]"
        >
          <Download className="w-4 h-4" /> Download / Print
        </button>
      </div>

      {/* The invoice sheet */}
      <div className="invoice-print max-w-3xl mx-auto bg-white rounded-2xl border border-orange-50 shadow-[0_8px_30px_rgba(255,140,0,0.10)] p-8 sm:p-10">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#FF8C00]">{INVOICE_SELLER.brand}</h1>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {INVOICE_SELLER.legalName}<br />
              GST: {INVOICE_SELLER.gst}<br />
              CIN: {INVOICE_SELLER.cin}<br />
              {INVOICE_SELLER.address}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold tracking-wide text-[#4A3B32]">TAX INVOICE</h2>
            <p className="text-xs text-gray-500 mt-1">Invoice No: <span className="font-semibold text-[#4A3B32]">{invoiceNumber(order._id)}</span></p>
            <p className="text-xs text-gray-500">Date: <span className="font-semibold text-[#4A3B32]">{fmtDate(invoiceDate)}</span></p>
            <span className={`inline-block mt-2 text-[11px] font-bold px-3 py-1 rounded-full ${paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {paid ? "PAID" : order.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Billed to */}
        <div className="grid grid-cols-2 gap-4 py-6 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Billed To</p>
            <p className="font-semibold text-[#4A3B32]">Order #{order._id.slice(-8).toUpperCase()}</p>
            <p className="text-gray-500 text-xs mt-0.5">Astrologer: {order.lineItems?.[0]?.providerName || "Assigned Astrologer"}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Payment</p>
            <p className="font-semibold text-[#4A3B32]">Sobhagya Wallet</p>
            {order.merchantOrderId && <p className="text-gray-500 text-xs mt-0.5">Ref: {order.merchantOrderId}</p>}
          </div>
        </div>

        {/* Items */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-gray-200 text-gray-500">
              <th className="text-left py-2.5 font-semibold">Remedy / Pooja</th>
              <th className="text-right py-2.5 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.lineItems.map((li, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3">
                  <p className="font-semibold text-[#4A3B32]">{li.title}</p>
                  <p className="text-xs text-gray-500">by {li.providerName}</p>
                </td>
                <td className="py-3 text-right font-medium text-[#4A3B32]">{formatINR(li.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end pt-4">
          <div className="w-full sm:w-72 space-y-2 text-sm">
            <Row label="Subtotal" value={formatINR(order.subtotal)} />
            {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`- ${formatINR(order.discount)}`} green />}
            <Row label={`GST (${gstPct}%)`} value={formatINR(order.gstAmount)} />
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="font-bold text-[#4A3B32]">Total {paid ? "Paid" : "Payable"}</span>
              <span className="font-bold text-[#FF8C00] text-lg">{formatINR(order.totalPayable)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">This is a computer-generated invoice and does not require a signature.</p>
          <p className="text-xs text-gray-400 mt-1">Thank you for choosing {INVOICE_SELLER.brand} 🙏 · {INVOICE_SELLER.email}</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={green ? "text-green-600 font-medium" : "text-gray-700 font-medium"}>{value}</span>
    </div>
  );
}

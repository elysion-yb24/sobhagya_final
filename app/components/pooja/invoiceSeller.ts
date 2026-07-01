// Seller / GST identity for pooja invoices. Mirrors the legal entity used by the
// existing wallet-recharge invoice (payment-service/src/controllers/invoices.js)
// so all Sobhagya invoices carry a consistent, GST-compliant seller block.
export const INVOICE_SELLER = {
  brand: "Sobhagya Bhakti",
  legalName: "Elysion Softwares Private Limited",
  gst: "09AAFCE8924R2ZQ",
  cin: "U72900DL2020PTC363606",
  address: "55 Street no.9, Panchsheel Colony, Garh Road, Meerut, Uttar Pradesh, 250002",
  email: "support@sobhagya.in",
} as const;

/** Human-friendly invoice number derived from the order id (stable per order). */
export function invoiceNumber(orderId: string): string {
  return `SB-${orderId.slice(-8).toUpperCase()}`;
}

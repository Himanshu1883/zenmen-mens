export const invoiceConfig = {
  legalName: process.env.INVOICE_LEGAL_NAME ?? "ZENmen Bespoke Tailoring",
  gstin: process.env.INVOICE_GSTIN ?? "",
  address: process.env.INVOICE_ADDRESS ?? "New Delhi, India",
  phone: process.env.INVOICE_PHONE ?? "",
  email: process.env.INVOICE_EMAIL ?? "support@zenmen.in",
  state: process.env.INVOICE_STATE ?? "Delhi",
  gstRate: Number(process.env.INVOICE_GST_RATE ?? 0.05),
};

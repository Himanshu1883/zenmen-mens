import { invoiceConfig } from "@/config/invoiceConfig";
import { getPublicEmail } from "@/lib/auth-contact";
import fs from "fs";
import { createRequire } from "module";
import path from "path";

/**
 * Load pdfkit from real node_modules (Turbopack otherwise rewrites AFM
 * paths to a fake root like C:\\ROOT\\node_modules\\pdfkit\\...).
 */
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit") as typeof import("pdfkit");

type InvoiceOrder = {
  orderNumber: string;
  total: number;
  subtotal: number;
  codFee?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  items: {
    title: string;
    qty: number;
    price: number;
  }[];
  shipping: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
};

const COLORS = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#e2e8f0",
  soft: "#f8fafc",
  accent: "#7da8c7",
  white: "#ffffff",
};

function resolveFontPair(): { regular: string; bold: string } {
  const regularCandidates = [
    path.join(process.cwd(), "assets", "fonts", "InvoiceSans.ttf"),
    "C:\\Windows\\Fonts\\arial.ttf",
    "C:\\Windows\\Fonts\\Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
  ];
  const boldCandidates = [
    path.join(process.cwd(), "assets", "fonts", "InvoiceSans-Bold.ttf"),
    "C:\\Windows\\Fonts\\arialbd.ttf",
    "C:\\Windows\\Fonts\\Arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
  ];

  const regular =
    regularCandidates.find((c) => {
      try {
        return fs.existsSync(c);
      } catch {
        return false;
      }
    }) ?? "Helvetica";

  const bold =
    boldCandidates.find((c) => {
      try {
        return fs.existsSync(c);
      } catch {
        return false;
      }
    }) ?? regular;

  return { regular, bold };
}

function resolveLogoPath(): string | null {
  const candidates = [
    process.env.INVOICE_LOGO_PATH,
    path.join(process.cwd(), "public", "logo_zenmen.png"),
    path.join(process.cwd(), "public", "logo_zenmen.jpg"),
    path.join(process.cwd(), "public", "zenmen_watermark.png"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      // ignore
    }
  }
  return null;
}

function inr(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function drawCenteredWatermark(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
  logoPath: string | null,
) {
  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const size = 260;
  const x = (pageW - size) / 2;
  const y = (pageH - size) / 2 - 20;

  doc.save();
  doc.opacity(0.07);

  if (logoPath) {
    try {
      doc.image(logoPath, x, y, {
        fit: [size, size],
        align: "center",
        valign: "center",
      });
    } catch {
      doc
        .fontSize(42)
        .fillColor(COLORS.ink)
        .text("ZENmen", 0, pageH / 2 - 24, {
          align: "center",
          width: pageW,
        });
    }
  } else {
    doc
      .fontSize(42)
      .fillColor(COLORS.ink)
      .text("ZENmen", 0, pageH / 2 - 24, {
        align: "center",
        width: pageW,
      });
  }

  doc.restore();
  doc.opacity(1);
  doc.fillColor(COLORS.ink);
}

export async function generateInvoiceBuffer(
  order: InvoiceOrder,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const { regular, bold } = resolveFontPair();
      const logoPath = resolveLogoPath();
      const doc = new PDFDocument({
        size: "A4",
        margin: 48,
        font: regular,
        info: {
          Title: `Invoice ${order.orderNumber}`,
          Author: invoiceConfig.legalName,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageW = doc.page.width;
      const margin = 48;
      const contentW = pageW - margin * 2;
      const { legalName, gstin, address, phone, email, state, gstRate } =
        invoiceConfig;

      // —— Centered logo watermark (behind content) ——
      drawCenteredWatermark(doc, logoPath);

      // —— Top accent bar ——
      doc.save();
      doc.rect(0, 0, pageW, 6).fill(COLORS.ink);
      doc.restore();

      // —— Header: logo + brand | invoice meta ——
      let y = 28;

      if (logoPath) {
        try {
          doc.image(logoPath, margin, y, { width: 44, height: 44, fit: [44, 44] });
        } catch {
          // skip header logo if image fails
        }
      }

      doc
        .font(bold)
        .fontSize(16)
        .fillColor(COLORS.ink)
        .text(legalName, margin + (logoPath ? 56 : 0), y + 4, {
          width: contentW * 0.55,
        });
      doc
        .font(regular)
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text("Bespoke Menswear · Made to Measure", margin + (logoPath ? 56 : 0), y + 24, {
          width: contentW * 0.55,
        });

      doc
        .font(bold)
        .fontSize(18)
        .fillColor(COLORS.ink)
        .text("TAX INVOICE", margin, y, {
          width: contentW,
          align: "right",
        });
      doc
        .font(regular)
        .fontSize(9)
        .fillColor(COLORS.muted)
        .text(order.orderNumber, margin, y + 22, {
          width: contentW,
          align: "right",
        });
      doc.text(
        new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        margin,
        y + 36,
        { width: contentW, align: "right" },
      );

      y = 90;
      doc
        .moveTo(margin, y)
        .lineTo(pageW - margin, y)
        .strokeColor(COLORS.line)
        .lineWidth(1)
        .stroke();

      // —— From / Bill To cards ——
      y = 108;
      const colGap = 16;
      const colW = (contentW - colGap) / 2;

      // Soft backgrounds
      doc.save();
      doc.roundedRect(margin, y, colW, 118, 4).fill(COLORS.soft);
      doc
        .roundedRect(margin + colW + colGap, y, colW, 118, 4)
        .fill(COLORS.soft);
      doc.restore();

      // FROM
      doc
        .font(bold)
        .fontSize(8)
        .fillColor(COLORS.accent)
        .text("FROM", margin + 12, y + 12);
      doc
        .font(bold)
        .fontSize(10)
        .fillColor(COLORS.ink)
        .text(legalName, margin + 12, y + 28, { width: colW - 24 });
      doc.font(regular).fontSize(9).fillColor(COLORS.muted);
      let fromY = y + 44;
      doc.text(address, margin + 12, fromY, { width: colW - 24 });
      fromY += 14;
      if (state) {
        doc.text(`State: ${state}`, margin + 12, fromY, { width: colW - 24 });
        fromY += 14;
      }
      if (gstin) {
        doc.text(`GSTIN: ${gstin}`, margin + 12, fromY, { width: colW - 24 });
        fromY += 14;
      }
      if (email) {
        doc.text(email, margin + 12, fromY, { width: colW - 24 });
        fromY += 14;
      }
      if (phone) doc.text(phone, margin + 12, fromY, { width: colW - 24 });

      // BILL TO
      const billX = margin + colW + colGap;
      const shipEmail = getPublicEmail(order.shipping.email) ?? "";
      doc
        .font(bold)
        .fontSize(8)
        .fillColor(COLORS.accent)
        .text("BILL TO", billX + 12, y + 12);
      doc
        .font(bold)
        .fontSize(10)
        .fillColor(COLORS.ink)
        .text(order.shipping.fullName || "Customer", billX + 12, y + 28, {
          width: colW - 24,
        });
      doc.font(regular).fontSize(9).fillColor(COLORS.muted);
      const billLines = [
        order.shipping.addressLine1,
        order.shipping.addressLine2,
        `${order.shipping.city}, ${order.shipping.state} ${order.shipping.pincode}`,
        order.shipping.country,
        shipEmail,
        order.shipping.phone,
      ].filter(Boolean) as string[];

      let billY = y + 44;
      for (const line of billLines) {
        doc.text(line, billX + 12, billY, { width: colW - 24 });
        billY += 13;
      }

      // —— Items table ——
      y = 250;
      const rowH = 28;
      const cols = {
        item: { x: margin, w: contentW * 0.48 },
        qty: { x: margin + contentW * 0.48, w: contentW * 0.12 },
        price: { x: margin + contentW * 0.6, w: contentW * 0.2 },
        amount: { x: margin + contentW * 0.8, w: contentW * 0.2 },
      };

      doc.save();
      doc.rect(margin, y, contentW, rowH).fill(COLORS.ink);
      doc.restore();

      doc.font(bold).fontSize(8).fillColor(COLORS.white);
      doc.text("ITEM", cols.item.x + 10, y + 10, { width: cols.item.w - 12 });
      doc.text("QTY", cols.qty.x, y + 10, {
        width: cols.qty.w,
        align: "center",
      });
      doc.text("PRICE", cols.price.x, y + 10, {
        width: cols.price.w - 8,
        align: "right",
      });
      doc.text("AMOUNT", cols.amount.x, y + 10, {
        width: cols.amount.w - 10,
        align: "right",
      });

      y += rowH;
      doc.fillColor(COLORS.ink);

      order.items.forEach((item, index) => {
        const lineTotal = item.price * item.qty;
        const zebra = index % 2 === 0;

        if (zebra) {
          doc.save();
          doc.rect(margin, y, contentW, rowH).fill(COLORS.soft);
          doc.restore();
        }

        doc
          .font(regular)
          .fontSize(9)
          .fillColor(COLORS.ink)
          .text(item.title, cols.item.x + 10, y + 9, {
            width: cols.item.w - 14,
            ellipsis: true,
            lineBreak: false,
          });
        doc.text(String(item.qty), cols.qty.x, y + 9, {
          width: cols.qty.w,
          align: "center",
        });
        doc.text(inr(item.price), cols.price.x, y + 9, {
          width: cols.price.w - 8,
          align: "right",
        });
        doc
          .font(bold)
          .text(inr(lineTotal), cols.amount.x, y + 9, {
            width: cols.amount.w - 10,
            align: "right",
          });

        y += rowH;
      });

      doc
        .moveTo(margin, y)
        .lineTo(pageW - margin, y)
        .strokeColor(COLORS.line)
        .lineWidth(1)
        .stroke();

      // —— Totals ——
      y += 16;
      const totalsX = margin + contentW * 0.52;
      const totalsW = contentW * 0.48;
      const gstAmount = order.total * (gstRate / (1 + gstRate));
      const paymentLabel =
        order.paymentMethod === "cod"
          ? "Cash on delivery"
          : order.paymentMethod === "online"
            ? "Online payment"
            : undefined;

      const totalRows: { label: string; value: string; strong?: boolean }[] = [
        { label: "Subtotal", value: inr(order.subtotal) },
      ];
      if (order.codFee && order.codFee > 0) {
        totalRows.push({ label: "COD fee", value: inr(order.codFee) });
      }
      totalRows.push({
        label: `GST (incl. ~${(gstRate * 100).toFixed(0)}%)`,
        value: inr(Number(gstAmount.toFixed(2))),
      });
      if (paymentLabel) {
        totalRows.push({ label: "Payment", value: paymentLabel });
      }

      for (const row of totalRows) {
        doc
          .font(regular)
          .fontSize(9)
          .fillColor(COLORS.muted)
          .text(row.label, totalsX, y, { width: totalsW * 0.55 });
        doc
          .fillColor(COLORS.ink)
          .text(row.value, totalsX + totalsW * 0.45, y, {
            width: totalsW * 0.55,
            align: "right",
          });
        y += 16;
      }

      y += 6;
      doc.save();
      doc.roundedRect(totalsX, y, totalsW, 36, 4).fill(COLORS.ink);
      doc.restore();
      doc
        .font(bold)
        .fontSize(10)
        .fillColor(COLORS.white)
        .text("Grand Total", totalsX + 12, y + 12, {
          width: totalsW * 0.45,
        });
      doc.text(inr(order.total), totalsX + totalsW * 0.4, y + 12, {
        width: totalsW * 0.55 - 12,
        align: "right",
      });

      // —— Footer ——
      const footerY = doc.page.height - 72;
      doc
        .moveTo(margin, footerY)
        .lineTo(pageW - margin, footerY)
        .strokeColor(COLORS.line)
        .lineWidth(1)
        .stroke();

      doc
        .font(regular)
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(
          "Cancellation: Contact support within 30 minutes of placement for instant cancellation on eligible orders.",
          margin,
          footerY + 12,
          { width: contentW, align: "center" },
        );
      doc.text("Thank you for choosing ZENmen.", margin, footerY + 26, {
        width: contentW,
        align: "center",
      });

      // Bottom accent
      doc.save();
      doc.rect(0, doc.page.height - 6, pageW, 6).fill(COLORS.accent);
      doc.restore();

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

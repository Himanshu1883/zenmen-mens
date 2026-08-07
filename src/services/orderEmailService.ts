import { emailConfig, isEmailConfigured } from "@/config/emailConfig";
import { getPublicEmail } from "@/lib/auth-contact";
import { generateInvoiceBuffer } from "@/utils/generateInvoiceBuffer";
import { Resend } from "resend";
import type mongoose from "mongoose";

type OrderDoc = {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  total: number;
  subtotal: number;
  codFee?: number;
  userEmail: string;
  items: { title: string; qty: number; price: number }[];
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
  emailLog?: {
    confirmationSentAt?: Date;
    resendCount?: number;
  };
};

function wrapHtml(body: string) {
  const { logoUrl, clientUrl } = emailConfig;
  return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;padding:24px">
  <img src="${logoUrl}" alt="ZENmen" height="40" style="margin-bottom:16px"/>
  ${body}
  <p style="margin-top:24px;font-size:12px;color:#64748b"><a href="${clientUrl}/profile">View your orders</a></p>
  </div></body></html>`;
}

/** Prefer shipping email; never send to synthetic @mobile.zenmen.local */
function customerEmailAddress(order: OrderDoc): string | null {
  return (
    getPublicEmail(order.shipping?.email) ?? getPublicEmail(order.userEmail)
  );
}

export async function sendOrderConfirmationEmail(
  order: OrderDoc,
  options?: { forceResend?: boolean },
) {
  if (!isEmailConfigured()) {
    console.warn("[email] RESEND_API_KEY not set — skipping confirmation");
    return { sent: false, reason: "not_configured" as const };
  }

  if (
    order.emailLog?.confirmationSentAt &&
    !options?.forceResend
  ) {
    return { sent: false, reason: "already_sent" as const };
  }

  const resend = new Resend(emailConfig.resendApiKey);
  let attachment: { filename: string; content: Buffer } | undefined;

  try {
    const pdf = await generateInvoiceBuffer(order);
    attachment = {
      filename: `invoice-${order.orderNumber}.pdf`,
      content: pdf,
    };
  } catch (e) {
    console.warn("[email] invoice PDF failed", e);
  }

  const itemsHtml = order.items
    .map(
      (i) =>
        `<li>${i.title} × ${i.qty} — ₹${(i.price * i.qty).toLocaleString("en-IN")}</li>`,
    )
    .join("");

  const html = wrapHtml(`
    <h2 style="color:#0f172a">Order confirmed</h2>
    <p>Thank you for your order <strong>${order.orderNumber}</strong>.</p>
    <ul>${itemsHtml}</ul>
    <p><strong>Total:</strong> ₹${order.total.toLocaleString("en-IN")}</p>
    <p>Deliver to: ${order.shipping.fullName}, ${order.shipping.addressLine1}, ${order.shipping.city}</p>
  `);

  try {
    const customerTo = customerEmailAddress(order);
    if (customerTo) {
      await resend.emails.send({
        from: emailConfig.mailFrom,
        to: customerTo,
        replyTo: emailConfig.mailReplyTo,
        subject: `Order Confirmed — ZENmen ${order.orderNumber}`,
        html,
        attachments: attachment
          ? [{ filename: attachment.filename, content: attachment.content }]
          : undefined,
      });
    } else {
      console.warn(
        "[email] no deliverable customer email — confirmation skipped for",
        order.orderNumber,
      );
    }

    if (emailConfig.adminOrderEmail) {
      await resend.emails.send({
        from: emailConfig.mailFrom,
        to: emailConfig.adminOrderEmail,
        subject: `[Admin] New order ${order.orderNumber}`,
        html: `<p>New order ${order.orderNumber} — ₹${order.total}</p>`,
      });
    }

    return { sent: true as const };
  } catch (err) {
    console.error("[email] confirmation failed", err);
    return {
      sent: false,
      reason: "send_failed" as const,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function sendOrderStatusEmail(
  order: OrderDoc,
  statusLabel: string,
  message: string,
) {
  if (!isEmailConfigured()) return { sent: false };

  const customerTo = customerEmailAddress(order);
  if (!customerTo) return { sent: false, reason: "no_deliverable_email" as const };

  const resend = new Resend(emailConfig.resendApiKey);
  const html = wrapHtml(`
    <h2>${statusLabel}</h2>
    <p>Order <strong>${order.orderNumber}</strong></p>
    <p>${message}</p>
  `);

  await resend.emails.send({
    from: emailConfig.mailFrom,
    to: customerTo,
    replyTo: emailConfig.mailReplyTo,
    subject: `${statusLabel} — ${order.orderNumber}`,
    html,
  });

  return { sent: true };
}

export async function sendCancellationEmail(
  order: OrderDoc,
  subject: string,
  body: string,
) {
  if (!isEmailConfigured()) return { sent: false };
  const resend = new Resend(emailConfig.resendApiKey);
  const customerTo = customerEmailAddress(order);
  if (customerTo) {
    await resend.emails.send({
      from: emailConfig.mailFrom,
      to: customerTo,
      replyTo: emailConfig.mailReplyTo,
      subject,
      html: wrapHtml(`<p>${body}</p><p>Order: ${order.orderNumber}</p>`),
    });
  }
  if (emailConfig.adminOrderEmail) {
    await resend.emails.send({
      from: emailConfig.mailFrom,
      to: emailConfig.adminOrderEmail,
      subject: `[Admin] ${subject}`,
      html: wrapHtml(`<p>${body}</p>`),
    });
  }
  return { sent: true };
}

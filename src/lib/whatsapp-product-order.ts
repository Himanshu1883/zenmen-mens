const WHATSAPP_NUMBER = "919650753273";

export type WhatsAppProductIntent = "order" | "inquiry" | "best_price";

export function buildProductWhatsAppMessage(opts: {
  productTitle: string;
  formattedPrice?: string;
  color: string;
  size: string;
  intent: WhatsAppProductIntent;
  wantsCustomization?: boolean;
  customizationNotes?: string;
}): string {
  const {
    productTitle,
    formattedPrice,
    color,
    size,
    intent,
    wantsCustomization,
    customizationNotes,
  } = opts;

  const lines: string[] = ["Hi ZENmen,"];

  if (intent === "order" || wantsCustomization) {
    lines.push("", "I'd like to order the following:");
  } else if (intent === "best_price") {
    lines.push("", "Could you share your best price for:");
  } else {
    lines.push("", "I'm interested in:");
  }

  lines.push(`• Product: ${productTitle}`);
  if (formattedPrice) lines.push(`• Price shown: ${formattedPrice}`);
  lines.push(`• Color: ${color}`);
  lines.push(`• Size: ${size}`);

  if (wantsCustomization) {
    lines.push("", "Customization request:");
    const notes = customizationNotes?.trim();
    if (notes) {
      lines.push(notes);
    } else {
      lines.push(
        "(I'll share measurements / monogram / design details here on chat.)",
      );
    }
  }

  lines.push("", "Thank you!");
  return lines.join("\n");
}

export function openWhatsAppWithMessage(message: string): void {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

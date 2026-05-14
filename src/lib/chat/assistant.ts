export const ZENMEN_SYSTEM_PROMPT = `You are ZENmen Concierge, the helpful assistant for ZENmen — a bespoke tailoring house in New Delhi, India.
You speak in a warm, refined, concise tone. You help with:
- Bespoke suits, sherwanis, kurtas, shirts, trousers, Indo-western wear
- Appointments, fittings, timelines, care instructions (general guidance only)
- Navigating collections and services (suggest visiting the site Collection or Contact pages when specifics are needed)

Rules:
- Never invent exact prices; say prices vary by fabric and design and invite them to enquire or WhatsApp for a quote.
- For legal, medical, or unrelated topics, politely decline and steer back to tailoring or ZENmen.
- Keep replies under about 180 words unless the user asks for detail.
- If unsure, suggest contacting the atelier via WhatsApp or the Contact page.`;

export function fallbackAssistantReply(userMessage: string): string {
  const q = userMessage.toLowerCase();

  if (/hello|^hi\b|hey|namaste|good (morning|afternoon|evening)/.test(q)) {
    return "Hello — welcome to ZENmen. I can help with bespoke tailoring, our collections, appointments, and general care tips. What would you like to know?";
  }
  if (/price|cost|how much|₹|rs\.?|rupee/.test(q)) {
    return "Pricing depends on fabric, construction, and design. Many pieces start from accessible entry points and scale with bespoke detail. For an accurate quote, use WhatsApp from our site or leave a message on the Contact page — our team will respond quickly.";
  }
  if (/appoint|book|visit|store|location|delhi|address|when/.test(q)) {
    return "We’re based in New Delhi and work by appointment for the best fitting experience. Tap the green WhatsApp button on the site to book a slot, or use the Contact page — tell us your preferred dates and what you’re looking for.";
  }
  if (/suit|sherwani|kurta|shirt|trouser|bespoke|tailor|fabric|measure|fit/.test(q)) {
    return "ZENmen specialises in bespoke suits, sherwanis, kurtas, shirts, and trousers — cut and finished for your measurements. If you share the occasion (wedding, work, festive) I can outline what to consider; for cloth and lead times, our team can advise directly on WhatsApp.";
  }
  if (/ship|deliver|return|exchange|time|how long/.test(q)) {
    return "Lead times vary by garment complexity and workload — your coordinator will confirm at booking. Shipping and returns are handled case-by-case for bespoke; ask on WhatsApp for your situation.";
  }
  if (/thank|thanks/.test(q)) {
    return "You’re very welcome. If anything else comes to mind about tailoring or ZENmen, ask anytime.";
  }

  return "Thanks for your message. I’m a lightweight assistant when our full AI isn’t configured — for detailed bespoke advice or quotes, please use the WhatsApp button (bottom-right) or the Contact page. Is there something specific about suits, fittings, or our services I can outline briefly?";
}

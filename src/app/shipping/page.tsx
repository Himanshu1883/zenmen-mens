import LegalDocument from "@/app/components/legal/LegalDocument";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Delivery, Cash on Delivery, Razorpay, made-to-order lead times, and return limits for ZENmen New Delhi.",
};

export default function ShippingPage() {
  return (
    <LegalDocument
      title="Shipping & Returns"
      description="How ZENmen delivers from New Delhi, what Cash on Delivery and Razorpay cover, and when a piece can be returned."
      updated="19 August 2026"
      sections={[
        {
          title: "Where we ship",
          body: (
            <>
              <p>
                Orders dispatch from our New Delhi atelier (E-39, Lajpat Nagar
                II). We deliver across India and, where arranged, onward to
                clients abroad — the house has sent garments to clients in many
                countries. International timing is confirmed on WhatsApp before
                we cut or ship.
              </p>
            </>
          ),
        },
        {
          title: "Delivery times",
          body: (
            <>
              <p>
                In-stock pieces: express delivery in 2–4 business days; standard
                delivery in 5–7 business days. Shipping is free on orders above
                Rs. 5,000.
              </p>
              <p>
                Made-to-order and bespoke pieces follow the lead time on the
                product page (for example “Ready in 3 weeks”). That clock starts
                after measurements and cloth are confirmed. Timelines can move
                with embroidery, peak wedding weeks, or a second fitting — we
                confirm on WhatsApp.
              </p>
            </>
          ),
        },
        {
          title: "Payment and Cash on Delivery",
          body: (
            <>
              <p>
                Pay online with Razorpay (UPI, cards, netbanking) or choose Cash
                on Delivery at checkout. COD adds a Rs. 200 handling fee. Please
                keep the same phone number you enter at checkout — the courier
                will use it.
              </p>
            </>
          ),
        },
        {
          title: "Cancelling an order",
          body: (
            <>
              <p>
                From{" "}
                <Link
                  href="/profile"
                  className="text-[#7da8c7] underline-offset-2 hover:underline"
                >
                  your profile
                </Link>{" "}
                you may cancel a pending or confirmed order within 30 minutes of
                placement, before it is packed or shipped. After that window, or
                once the order is out for delivery, cancellation needs our
                team’s approval. We cannot unwind cutting that has already
                started on a bespoke commission.
              </p>
            </>
          ),
        },
        {
          title: "Returns and exchanges",
          body: (
            <>
              <p>
                Unworn ready pieces in original packaging may be returned or
                exchanged within 30 days of delivery for size or colour, if the
                tags are intact.
              </p>
              <p>
                Bespoke, made-to-measure, monogrammed, or already-altered
                garments cannot be returned. They were cut for you. If a
                workshop fault appears, bring the piece to the atelier or write
                on WhatsApp — we will repair or remake at our discretion.
              </p>
            </>
          ),
        },
        {
          title: "Collecting in person",
          body: (
            <>
              <p>
                You may collect at E-39, Lajpat Nagar II, New Delhi – 110024,
                Monday to Saturday, 11 AM – 8 PM, or during a booked sitting in
                South Extension Part II. Use{" "}
                <Link
                  href="/appointment"
                  className="text-[#7da8c7] underline-offset-2 hover:underline"
                >
                  /appointment
                </Link>{" "}
                so a fitter is free.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

import LegalDocument from "@/app/components/legal/LegalDocument";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms for shopping, appointments, and bespoke tailoring with ZENmen in New Delhi.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      description="These terms govern use of the ZENmen storefront, appointments at our New Delhi atelier, and made-to-order menswear."
      updated="19 August 2026"
      sections={[
        {
          title: "The atelier",
          body: (
            <>
              <p>
                ZENmen is a bespoke menswear house in New Delhi. Ready pieces
                and made-to-order garments are listed on{" "}
                <Link
                  href="/collection"
                  className="text-[#7da8c7] underline-offset-2 hover:underline"
                >
                  /collection
                </Link>
                . Fittings are by appointment at E-39, Lajpat Nagar II, and in
                South Extension Part II, or by video consultation.
              </p>
            </>
          ),
        },
        {
          title: "Accounts and orders",
          body: (
            <>
              <p>
                You must be signed in to place an order. You are responsible for
                the accuracy of your shipping address and phone. We may refuse
                or cancel an order if stock cannot be confirmed, payment fails,
                or the request cannot be made to measure in good faith.
              </p>
              <p>
                Prices on the site are stored in Indian rupees. If you switch
                display currency, that figure is for convenience only; checkout
                still charges in INR.
              </p>
            </>
          ),
        },
        {
          title: "Payment",
          body: (
            <>
              <p>
                You may pay online through Razorpay (UPI, cards, netbanking) or
                choose Cash on Delivery where offered. COD adds a handling fee
                of Rs. 200 at checkout. An online order is confirmed after
                Razorpay verifies payment. A COD order is confirmed when we
                accept it and begin fulfilment.
              </p>
            </>
          ),
        },
        {
          title: "Made-to-order work",
          body: (
            <>
              <p>
                Many ZENmen pieces are cut to your measurements or finished
                after you order. Lead time is shown on the product when
                available; your coordinator confirms the date on WhatsApp or at
                the fitting. Once cutting or significant alteration has begun,
                the piece is treated as bespoke — see{" "}
                <Link
                  href="/shipping"
                  className="text-[#7da8c7] underline-offset-2 hover:underline"
                >
                  Shipping &amp; Returns
                </Link>
                .
              </p>
            </>
          ),
        },
        {
          title: "Appointments",
          body: (
            <>
              <p>
                Booking via{" "}
                <Link
                  href="/appointment"
                  className="text-[#7da8c7] underline-offset-2 hover:underline"
                >
                  /appointment
                </Link>{" "}
                sends a WhatsApp request. A slot is confirmed only when our team
                replies. Walk-ins at the atelier are welcome when a cutter is
                free; a booked sitting is the reliable way to reserve time.
              </p>
            </>
          ),
        },
        {
          title: "Acceptable use",
          body: (
            <>
              <p>
                Do not misuse the site, attempt to access other customers’
                orders, or place fraudulent checkouts. Product images, copy, and
                the ZENmen name belong to the atelier. You may not republish
                them as your own catalogue.
              </p>
            </>
          ),
        },
        {
          title: "Liability",
          body: (
            <>
              <p>
                We take care with cloth and construction. We are not liable for
                courier delays outside our control, for colour variation between
                screen and cloth, or for fit issues if measurements you supplied
                were incomplete. Statutory rights under Indian consumer law
                still apply.
              </p>
            </>
          ),
        },
        {
          title: "Governing law",
          body: (
            <>
              <p>
                These terms are governed by the laws of India. Disputes are
                subject to the courts in New Delhi. We may update this page;
                continued use of the site after a change means you accept the
                revised terms.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

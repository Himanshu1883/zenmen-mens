import LegalDocument from "@/app/components/legal/LegalDocument";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How ZENmen, the New Delhi bespoke menswear atelier, collects and uses your information.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      description="ZENmen is a bespoke tailoring house in New Delhi. This policy explains what we collect when you browse, book, or order — and how we use it."
      updated="19 August 2026"
      sections={[
        {
          title: "Who we are",
          body: (
            <>
              <p>
                ZENmen operates this storefront from our atelier at E-39, Lajpat
                Nagar II, New Delhi – 110024. We also see clients by appointment
                in South Extension Part II. You can reach us on{" "}
                <Link
                  href="/contact"
                  className="text-[#7da8c7] underline-offset-2 hover:underline"
                >
                  /contact
                </Link>{" "}
                or WhatsApp at +91 96507 53273.
              </p>
            </>
          ),
        },
        {
          title: "Information we collect",
          body: (
            <>
              <p>
                Account details you give us: name, email and/or mobile number,
                and a password if you register with credentials. Google sign-in
                shares the name and email your Google account provides.
              </p>
              <p>
                Order and shipping details: delivery name, address, city, PIN
                code, phone, and optional order notes. These are required to
                place Cash on Delivery or Razorpay orders.
              </p>
              <p>
                Appointment and contact messages: the form on{" "}
                <Link
                  href="/appointment"
                  className="text-[#7da8c7] underline-offset-2 hover:underline"
                >
                  /appointment
                </Link>{" "}
                opens WhatsApp with your name, occasion, and preferred time.
                The contact form stores the enquiry you submit so our team can
                reply.
              </p>
              <p>
                Usage data needed to run the site: session cookies for sign-in
                (NextAuth), cart contents on your device, and product pages you
                recently viewed.
              </p>
            </>
          ),
        },
        {
          title: "How we use it",
          body: (
            <>
              <p>
                We use this information to fulfil made-to-order garments,
                confirm fittings, send order and cancellation emails, show your
                orders in{" "}
                <Link
                  href="/profile"
                  className="text-[#7da8c7] underline-offset-2 hover:underline"
                >
                  your profile
                </Link>
                , and answer WhatsApp or contact enquiries. We do not sell your
                details to advertisers.
              </p>
            </>
          ),
        },
        {
          title: "Payments",
          body: (
            <>
              <p>
                Online payments are processed by Razorpay (UPI, cards,
                netbanking). ZENmen does not store full card numbers. Cash on
                Delivery orders include a handling fee shown at checkout; we
                keep the shipping address so the courier can collect payment on
                delivery.
              </p>
            </>
          ),
        },
        {
          title: "Who else sees your data",
          body: (
            <>
              <p>
                We share only what a provider needs to do its job: Razorpay for
                payment, our email service for order confirmation, Cloudinary
                for product images you see on the site, and WhatsApp when you
                choose to message us. Hosting and database providers hold
                account and order records so the store can run.
              </p>
            </>
          ),
        },
        {
          title: "How long we keep it",
          body: (
            <>
              <p>
                Order and invoice records are kept as long as we need them for
                fulfilment, returns, and tax. You can update name, email, and
                phone from your profile. To ask us to close an account, write
                from the Contact page or WhatsApp.
              </p>
            </>
          ),
        },
        {
          title: "Your choices",
          body: (
            <>
              <p>
                You can browse collections without an account. Checkout and
                saved orders require sign-in. Appointment WhatsApp messages are
                sent only when you tap send. You may decline cookies in your
                browser; doing so can sign you out of the storefront.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout",
  description: "Secure checkout for your ZENmen order.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}

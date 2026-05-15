import type { CurrencyCode } from "@/lib/currency";
import {
  DollarSign,
  Euro,
  IndianRupee,
  PoundSterling,
  type LucideIcon,
} from "lucide-react";

const CURRENCY_ICONS: Record<CurrencyCode, LucideIcon> = {
  INR: IndianRupee,
  USD: DollarSign,
  EUR: Euro,
  GBP: PoundSterling,
};

type CurrencyIconProps = {
  code: CurrencyCode;
  className?: string;
  strokeWidth?: number;
};

export default function CurrencyIcon({
  code,
  className = "w-5 h-5",
  strokeWidth = 1.5,
}: CurrencyIconProps) {
  const Icon = CURRENCY_ICONS[code];
  return <Icon className={className} strokeWidth={strokeWidth} />;
}

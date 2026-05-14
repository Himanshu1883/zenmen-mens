import { formatInrAsCurrency } from "@/lib/currency";
import { useAppSelector } from "@/store/hooks";
import { useCallback } from "react";

export function useDisplayPrice() {
  const code = useAppSelector((s) => s.currency.code);

  const format = useCallback(
    (amountInr: number) => formatInrAsCurrency(amountInr, code),
    [code],
  );

  return { format, currency: code };
}

export function formatPrice(centsOrAmount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
    centsOrAmount
  );
}

export const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  for_parts: "For parts / not working",
};

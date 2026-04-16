import type { Doc } from "../../../../convex/_generated/dataModel";

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function getInitials(name: string) {
  if (!name.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatReceiptDate(
  dateStr: string | undefined,
  createdAt: number,
): string {
  if (dateStr?.trim()) {
    const d = new Date(
      dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`,
    );
    if (!Number.isNaN(d.getTime())) {
      return d
        .toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase();
    }
  }
  return new Date(createdAt)
    .toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export function computeReceiptMeta(split: Doc<"splits">) {
  const subtotal = split.items.reduce(
    (acc, it) => acc + it.price * it.quantity,
    0,
  );
  const taxAmt = split.tax ?? 0;
  const tipAmt = split.tip ?? 0;
  const taxPct =
    subtotal > 0 && taxAmt > 0 ? (taxAmt / subtotal) * 100 : null;
  const tipPct =
    subtotal > 0 && tipAmt > 0 ? (tipAmt / subtotal) * 100 : null;
  return { subtotal, taxPct, tipPct };
}

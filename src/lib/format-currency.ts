/** Whole-dollar USD for large display (no sign). */
export function formatUsd(amount: number): string {
  const rounded = Math.round(Math.abs(amount));
  const withCommas = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${withCommas}`;
}

/** Plain USD string — avoids Hermes/Intl gaps with `toLocaleString({ style: "currency" })`. */
export function formatSignedUsd(
  amount: number,
  sign: "+" | "-",
): `${"+" | "-"}$${string}` {
  const rounded = Math.round(Math.abs(amount));
  const withCommas = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign === "+" ? `+$${withCommas}` : `-$${withCommas}`;
}

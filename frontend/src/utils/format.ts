// Shared formatting helpers used across consultation pages.

/** Formats elapsed seconds as MM:SS */
export const fmtDuration = (seconds: number): string =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

/** Formats a cost with 2 decimal places */
export const fmtCost = (amount: number): string => amount.toFixed(2);

/**
 * @packageDocumentation
 * @module BlocklyCategories.ArrayBitmapGrid
 * @description Pure helpers for Array_bitmap grid resize (no FieldBitmap import).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const MAX_DIM = 32;
const MIN_DIM = 1;

const clampDim = (n: number): number => {
  if (!Number.isFinite(n)) {
    return MIN_DIM;
  }
  return Math.min(MAX_DIM, Math.max(MIN_DIM, Math.trunc(n)));
};

/**
 * Builds an empty rows x cols grid of 0s.
 * @param rows - The `rows` argument.
 * @param cols - The `cols` argument.
 * @returns Numeric result.
 */
export const createEmptyBitmapGrid = (rows: number, cols: number): number[][] => {
  const safeRows = clampDim(rows);
  const safeCols = clampDim(cols);
  return Array.from({ length: safeRows }, () =>
    Array.from({ length: safeCols }, () => 0),
  );
};

/**
 * Resizes a bitmap grid, preserving overlapping pixels.
 * @param value - Value to set.
 * @param rows - The `rows` argument.
 * @param cols - The `cols` argument.
 * @returns Numeric result.
 */
export const resizeBitmapGrid = (
  value: number[][] | null | undefined,
  rows: number,
  cols: number,
): number[][] => {
  const safeRows = clampDim(rows);
  const safeCols = clampDim(cols);
  const next: number[][] = [];
  for (let r = 0; r < safeRows; r++) {
    const row: number[] = [];
    for (let c = 0; c < safeCols; c++) {
      row.push(value?.[r]?.[c] ? 1 : 0);
    }
    next.push(row);
  }
  return next;
};

export { clampDim, MAX_DIM, MIN_DIM };

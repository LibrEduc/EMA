/**
 * @packageDocumentation
 * @module WorkspaceLayoutUtils
 * @description Shared flex layout helpers for workspace panels and resizers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const FLEX_UP_RIGHT_LAST_OPEN_KEY = "flexContainerUpRightLastOpen";
export const FLEX_BOTTOM_LAST_OPEN_KEY = "flexContainerBottomLastOpen";
export const RIGHT_PANEL_TOGGLE_BUTTON_ID = "flex_up_right_toggle_button";
export const BOTTOM_PANEL_TOGGLE_BUTTON_ID = "flex_bottom_toggle_button";
export const FLEX_COLLAPSE_EPSILON = 0.01;

/**
 * Parse Positive Flex.
 * @param rawValue - The `rawValue` argument.
 * @param fallback - The `fallback` argument.
 * @returns Numeric result.
 */
export const parsePositiveFlex = (rawValue: string | null | undefined, fallback = 0): number => {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Snap Near Zero Flex.
 * @param previous - The `previous` argument.
 * @param next - The `next` argument.
 */
export const snapNearZeroFlex = (previous: HTMLElement, next: HTMLElement): void => {
  const prevGrow = parsePositiveFlex(previous.style.flexGrow, 0);
  const nextGrow = parsePositiveFlex(next.style.flexGrow, 0);
  const total = prevGrow + nextGrow;
  if (total <= 0) {
    return;
  }
  if (prevGrow <= FLEX_COLLAPSE_EPSILON) {
    previous.style.flexGrow = "0";
    next.style.flexGrow = String(total);
    return;
  }
  if (nextGrow <= FLEX_COLLAPSE_EPSILON) {
    next.style.flexGrow = "0";
    previous.style.flexGrow = String(total);
  }
};

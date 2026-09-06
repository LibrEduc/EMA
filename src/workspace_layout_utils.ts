/**
 * @packageDocumentation
 * @module WorkspaceLayoutUtils
 * @description Shared flex layout helpers for workspace panels and resizers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const FLEX_UP_RIGHT_LAST_OPEN_KEY = "flexContainerUpRightLastOpen";
export const FLEX_BOTTOM_LAST_OPEN_KEY = "flexContainerBottomLastOpen";
export const RIGHT_PANEL_TOGGLE_BUTTON_ID = "flex_up_right_toggle_button";
export const BOTTOM_PANEL_TOGGLE_BUTTON_ID = "flex_bottom_toggle_button";
export const FLEX_COLLAPSE_EPSILON = 0.01;

/**
 * Parse Positive Flex.
 * @param rawValue - `rawValue` value.
 * @param fallback - `fallback` value.
 * @returns Numeric result.
 */
export const parsePositiveFlex = (rawValue: string | null | undefined, fallback = 0): number => {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Snap Near Zero Flex.
 * @param previous - `previous` value.
 * @param next - `next` value.
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

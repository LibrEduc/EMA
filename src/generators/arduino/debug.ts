/**
 * @packageDocumentation
 * @module Arduino.Debug
 * @description Debug logging utilities for the Arduino generator.
 * @remarks
 * Lightweight logging helpers toggled via the debug flag.
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

type DebugGlobal = typeof globalThis & {
  __UCB_DEBUG__?: boolean;
};

/**
 * Indique si le mode debug (switch UI ou localStorage) est actif.
 * @returns True when the condition holds.
 */
export function isDebugEnabled(): boolean {
  const globalDebug = (globalThis as DebugGlobal).__UCB_DEBUG__;
  if (typeof globalDebug === "boolean") {
    return globalDebug;
  }
  try {
    return globalThis.localStorage?.getItem("ucbDebug") === "1";
  } catch {
    return false;
  }
}

/**
 * Logs debug output when the debug flag is enabled.
 * @param args - Values to log.
 */
export function debugLog(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.log(...args);
  }
}

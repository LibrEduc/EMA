/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

type DebugGlobal = typeof globalThis & {
  __UCB_DEBUG__?: boolean;
};

function isDebugEnabled(): boolean {
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

export function debugLog(...args: unknown[]): void {
  if (isDebugEnabled()) {
    console.log(...args);
  }
}

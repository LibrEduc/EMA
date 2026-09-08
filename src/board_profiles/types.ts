/**
 * @packageDocumentation
 * @module BoardProfilesTypes
 * @description Board profile types and default board id.
 * @author scanet@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const DEFAULT_BOARD_ID = "none" as const;

export type PinDropdownEntry = readonly [string, string];
export type PinEntry = string | PinDropdownEntry;

export interface BoardProfile {
  description: string;
  cpu: string;
  speed: string;
  digital: readonly PinEntry[];
  PWM: readonly PinEntry[];
  analog: readonly PinEntry[];
  interrupt: readonly PinEntry[];
  serial: readonly PinEntry[];
  serialPin: readonly PinEntry[];
  [key: string]: unknown;
}

export type BoardId = string;

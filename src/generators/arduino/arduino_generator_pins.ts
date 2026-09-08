/**
 * @packageDocumentation
 * @module Arduino.Generator.Pins
 * @description Pin usage tracking helpers for ArduinoGenerator.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/** Recorded pin mode for conflict detection. */
export type PinUsage = {
  number: string;
  mode: string;
  blockId: string;
};

/** Map of pin keys (`pin_<n>`) to usage records. */
export type PinUsageMap = Record<string, PinUsage>;

/** Outcome of attempting to record a pin usage. */
export type PinUsageResult =
  | { status: "conflict" }
  | { status: "exists" }
  | { status: "new"; setupTag: string; setupCode: string };

/**
 * Records a pin usage and reports whether setup code must be emitted.
 * @param pins - Mutable pin usage map (generator bag).
 * @param pinNumber - Pin number to use.
 * @param pinMode - Pin mode (INPUT, OUTPUT, INPUT_PULLUP).
 * @param blockId - ID of the block using this pin.
 * @returns Conflict, already configured, or new usage with setup snippet.
 */
export function recordPinUsage(
  pins: PinUsageMap,
  pinNumber: string,
  pinMode: string,
  blockId: string,
): PinUsageResult {
  const pinKey = `pin_${pinNumber}`;

  if (pins[pinKey]) {
    const existingUsage = pins[pinKey];
    if (existingUsage.mode !== pinMode) {
      console.warn(
        `Pin ${pinNumber} conflict: ${existingUsage.mode} vs ${pinMode}`,
      );
      return { status: "conflict" };
    }
    return { status: "exists" };
  }

  pins[pinKey] = {
    number: pinNumber,
    mode: pinMode,
    blockId,
  };

  return {
    status: "new",
    setupTag: `pin_${pinNumber}_mode`,
    setupCode: `pinMode(${pinNumber}, ${pinMode});`,
  };
}

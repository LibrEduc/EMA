/**
 * @packageDocumentation
 * @module BoardProfiles
 * @description Board pin/CPU profiles (data only), split by family.
 * @author scanet@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import type { BoardProfile } from "./types";
import { PROFILES_ARDUINO_AVR } from "./profiles_arduino_avr";
import { PROFILES_DAGU } from "./profiles_dagu";
import { PROFILES_DFROBOT } from "./profiles_dfrobot";
import { PROFILES_ESP32 } from "./profiles_esp32";
import { PROFILES_ESP8266 } from "./profiles_esp8266";
import { PROFILES_FRANZININHO } from "./profiles_franzininho";
import { PROFILES_MAKEBLOCK } from "./profiles_makeblock";
import { PROFILES_NONE } from "./profiles_none";
import { PROFILES_PI_PICO } from "./profiles_pi_pico";
import { PROFILES_STM32_NUCLEO } from "./profiles_stm32_nucleo";
import { PROFILES_TEENSY } from "./profiles_teensy";

export {
  DEFAULT_BOARD_ID,
  type BoardId,
  type BoardProfile,
  type PinDropdownEntry,
  type PinEntry,
} from "./types";

export const BOARD_PROFILES = {
  ...PROFILES_ARDUINO_AVR,
  ...PROFILES_DAGU,
  ...PROFILES_DFROBOT,
  ...PROFILES_ESP32,
  ...PROFILES_ESP8266,
  ...PROFILES_FRANZININHO,
  ...PROFILES_MAKEBLOCK,
  ...PROFILES_NONE,
  ...PROFILES_PI_PICO,
  ...PROFILES_STM32_NUCLEO,
  ...PROFILES_TEENSY,
} as Record<string, BoardProfile>;

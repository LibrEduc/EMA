/**
 * @packageDocumentation
 * @module BoardProfiles_none
 * @description Board profiles: none family.
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

export const PROFILES_NONE = {
  "none": {
    "description": "",
    "cpu": "",
    "speed": "",
    "digital": [],
    "PWM": [],
    "dropdownPWM": [],
    "analog": [],
    "dropdownAnalog": [],
    "I2C": [],
    "SPI": [],
    "interrupt": [],
    "picture": "media/boards/none.jpg",
    "serial": [],
    "serialPin": [],
    "upload_arg": "none",
    "help_link": ""
  }
} as const satisfies Record<string, BoardProfile>;

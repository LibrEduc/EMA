/**
 * @packageDocumentation
 * @module BoardProfiles_esp8266
 * @description Board profiles: esp8266 family.
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

export const PROFILES_ESP8266 = {
  "esp8266": {
    "description": "ESP8266",
    "cpu": "esp8266",
    "speed": "115200",
    "digital": ["0", "1", "2", "3", "4", "5", "12", "13", "14", "15", "16"],
    "dropdownDigital": [["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"]],
    "PWM": ["0", "1", "2", "3", "4", "5", "12", "13", "14", "15", "16"],
    "dropdownPWM": [["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"]],
    "analog": ["A0"],
    "dropdownAnalog": [["A0", "A0"]],
    "I2C": ["4", "5"],
    "SPI": [["13 (MOSI)", "13"], ["12 (MISO)", "12"], ["14 (SCK)", "14"]],
    "interrupt": ["0", "1", "2", "3", "4", "5", "12", "13", "14", "15"],
    "picture": "media/boards/esp8266.jpg",
    "serial": [["300", "300"], ["600", "600"], ["1200", "1200"], ["2400", "2400"], ["4800", "4800"], ["9600", "9600"], ["14400", "14400"], ["19200", "19200"], ["28800", "28800"], ["31250", "31250"], ["38400", "38400"], ["57600", "57600"], ["115200", "115200"]],
    "serialPin": [["Rx0 ; Tx0", "3 ; 1"]],
    "upload_arg": "esp8266:esp8266:nodemcuv2",
    "help_link": "https://arduino-esp8266.readthedocs.io/en/latest/"
  }
} as const satisfies Record<string, BoardProfile>;

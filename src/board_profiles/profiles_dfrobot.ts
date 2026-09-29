/**
 * @packageDocumentation
 * @module BoardProfiles_dfrobot
 * @description Board profiles: dfrobot family.
 * @author scanet@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { BoardProfile } from "./types";

export const PROFILES_DFROBOT = {
  "dfrobot_romeo": {
    "description": "RoMeo v2",
    "cpu": "atmega32u4",
    "speed": "57600",
    "digital": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
    "dropdownDigital": [["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]],
    "PWM": ["3", "5", "6", "9", "10", "11", "13"],
    "dropdownPWM": [["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"], ["13", "13"]],
    "analog": ["A0", "A1", "A2", "A3", "A4", "A5", "4", "6", "8", "9", "10", "12"],
    "dropdownAnalog": [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"], ["A6(D4)", "4"], ["A7(D6)", "6"], ["A8(D8)", "8"], ["A9(D9)", "9"], ["A10(D10)", "10"], ["A11(D12)", "12"]],
    "I2C": ["connect"],
    "SPI": [["16 (MOSI)", "16"], ["14 (MISO)", "14"], ["15 (SCK)", "15"]],
    "interrupt": ["3", "2", "0", "1", "7"],
    "picture": "media/boards/dfrobot_romeo.jpg",
    "serial": [["300", "300"], ["600", "600"], ["1200", "1200"], ["2400", "2400"], ["4800", "4800"], ["9600", "9600"], ["14400", "14400"], ["19200", "19200"], ["28800", "28800"], ["31250", "31250"], ["38400", "38400"], ["57600", "57600"], ["115200", "115200"]],
    "serialPin": [["0 (Rx) ; 1 (Tx)", "0"]],
    "upload_arg": "arduino:avr:leonardo",
    "help_link": "https://www.dfrobot.com/product-844.html"
  },
  "dfrobot_romeo_ble": {
    "description": "RoMeo BLE",
    "cpu": "atmega328p",
    "speed": "115200",
    "digital": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
    "dropdownDigital": [["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]],
    "PWM": ["3", "5", "6", "9", "10", "11", "13"],
    "dropdownPWM": [["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"], ["13", "13"]],
    "analog": ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"],
    "dropdownAnalog": [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"], ["A6", "A6"], ["A7", "A7"]],
    "I2C": ["A4", "A5"],
    "SPI": [["10 (SS)", "10"], ["11 (MOSI)", "11"], ["12 (MISO)", "12"], ["13 (SCK)", "13"]],
    "interrupt": ["2", "3"],
    "picture": "media/boards/dfrobot_romeo_ble.jpg",
    "serial": [["300", "300"], ["600", "600"], ["1200", "1200"], ["2400", "2400"], ["4800", "4800"], ["9600", "9600"], ["14400", "14400"], ["19200", "19200"], ["28800", "28800"], ["31250", "31250"], ["38400", "38400"], ["57600", "57600"], ["115200", "115200"]],
    "serialPin": [["0 (Rx) ; 1 (Tx)", "0"]],
    "upload_arg": "arduino:avr:uno",
    "help_link": "https://www.dfrobot.com/product-1176.html"
  }
} as const satisfies Record<string, BoardProfile>;

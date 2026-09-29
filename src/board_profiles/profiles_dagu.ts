/**
 * @packageDocumentation
 * @module BoardProfiles_dagu
 * @description Board profiles: dagu family.
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

export const PROFILES_DAGU = {
  "dagu_rs027": {
    "description": "Dagu RS027",
    "cpu": "atmega8",
    "speed": "19200",
    "digital": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
    "dropdownDigital": [["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]],
    "PWM": ["9", "10", "11"],
    "dropdownPWM": [["9", "9"], ["10", "10"], ["11", "11"]],
    "analog": ["A0", "A1", "A2", "A3", "A4", "A5"],
    "dropdownAnalog": [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]],
    "I2C": ["A4", "A5"],
    "SPI": [["10 (SS)", "10"], ["11 (MOSI)", "11"], ["12 (MISO)", "12"], ["13 (SCK)", "13"]],
    "interrupt": [["2", "2"], ["3", "3"]],
    "picture": "media/boards/dagu_rs027.jpg",
    "serial": [["300", "300"], ["600", "600"], ["1200", "1200"], ["2400", "2400"], ["4800", "4800"], ["9600", "9600"], ["14400", "14400"], ["19200", "19200"], ["28800", "28800"], ["31250", "31250"], ["38400", "38400"], ["57600", "57600"], ["115200", "115200"]],
    "serialPin": [["0 (Rx) ; 1 (Tx)", "0"]],
    "upload_arg": "arduino:avr:pro:cpu=8MHzatmega168",
    "help_link": "https://www.dagurobot.com/Robot-Controller/Arduino-controller/RS027"
  },
  "dagu_rs040": {
    "description": "Dagu RS040",
    "cpu": "atmega328p",
    "speed": "57600",
    "digital": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
    "dropdownDigital": [["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]],
    "PWM": ["3", "5", "6", "9", "10", "11"],
    "dropdownPWM": [["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]],
    "analog": ["A0", "A1", "A2", "A3", "A4", "A5"],
    "dropdownAnalog": [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]],
    "I2C": ["A4", "A5"],
    "SPI": [["10 (SS)", "10"], ["11 (MOSI)", "11"], ["12 (MISO)", "12"], ["13 (SCK)", "13"]],
    "interrupt": [["2", "2"], ["3", "3"]],
    "picture": "media/boards/dagu_rs040.jpg",
    "serial": [["300", "300"], ["600", "600"], ["1200", "1200"], ["2400", "2400"], ["4800", "4800"], ["9600", "9600"], ["14400", "14400"], ["19200", "19200"], ["28800", "28800"], ["31250", "31250"], ["38400", "38400"], ["57600", "57600"], ["115200", "115200"]],
    "serialPin": [["0 (Rx) ; 1 (Tx)", "0"]],
    "upload_arg": "arduino:avr:nano:cpu=atmega328",
    "help_link": "https://www.dagurobot.com/Robot-Controller/Arduino-controller/RS040"
  }
} as const satisfies Record<string, BoardProfile>;

/**
 * @packageDocumentation
 * @module BoardProfiles_stm32_nucleo
 * @description Board profiles: stm32_nucleo family.
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

export const PROFILES_STM32_NUCLEO = {
  "st-nucleo-c031c6": {
    "description": "STM32 NUCLEO-C031C6",
    "cpu": "stm32c031c6",
    "speed": "115200",
    "digital": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
    "dropdownDigital": [["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]],
    "PWM": ["3", "5", "6", "9", "10", "11"],
    "dropdownPWM": [["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]],
    "analog": ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"],
    "dropdownAnalog": [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"], ["A6", "A6"], ["A7", "A7"]],
    "I2C": ["A4", "A5"],
    "SPI": [["10 (SS)", "10"], ["11 (MOSI)", "11"], ["12 (MISO)", "12"], ["13 (SCK)", "13"]],
    "interrupt": ["2", "3"],
    "picture": "media/boards/st-nucleo-c031c6.svg",
    "serial": [["300", "300"], ["600", "600"], ["1200", "1200"], ["2400", "2400"], ["4800", "4800"], ["9600", "9600"], ["14400", "14400"], ["19200", "19200"], ["28800", "28800"], ["31250", "31250"], ["38400", "38400"], ["57600", "57600"], ["115200", "115200"]],
    "serialPin": [["0 (Rx) ; 1 (Tx)", "0"]],
    "upload_arg": "STMicroelectronics:stm32:Nucleo_32:pnum=NUCLEO_C031C6",
    "help_link": "https://www.st.com/en/evaluation-tools/nucleo-c031c6.html"
  },
  "st-nucleo-l031k6": {
    "description": "STM32 NUCLEO-L031K6",
    "cpu": "stm32l031k6",
    "speed": "115200",
    "digital": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
    "dropdownDigital": [["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"]],
    "PWM": ["3", "5", "6", "9", "10", "11"],
    "dropdownPWM": [["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]],
    "analog": ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"],
    "dropdownAnalog": [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"], ["A6", "A6"], ["A7", "A7"]],
    "I2C": ["A4", "A5"],
    "SPI": [["10 (SS)", "10"], ["11 (MOSI)", "11"], ["12 (MISO)", "12"], ["13 (SCK)", "13"]],
    "interrupt": ["2", "3"],
    "picture": "media/boards/st-nucleo-l031k6.svg",
    "serial": [["300", "300"], ["600", "600"], ["1200", "1200"], ["2400", "2400"], ["4800", "4800"], ["9600", "9600"], ["14400", "14400"], ["19200", "19200"], ["28800", "28800"], ["31250", "31250"], ["38400", "38400"], ["57600", "57600"], ["115200", "115200"]],
    "serialPin": [["0 (Rx) ; 1 (Tx)", "0"]],
    "upload_arg": "STMicroelectronics:stm32:Nucleo_32:pnum=NUCLEO_L031K6",
    "help_link": "https://www.st.com/en/evaluation-tools/nucleo-l031k6.html"
  }
} as const satisfies Record<string, BoardProfile>;

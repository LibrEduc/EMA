/**
 * @packageDocumentation
 * @module Arduino
 * @description Arduino generator helpers for µcBlockly blocks
 * @remarks
 * Exposes the generator instance and wiring helpers.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */
/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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
import { ArduinoGenerator } from './arduino/arduino_generator';
export * from './arduino/arduino_generator';
export * from './arduino/arduino_types';
export * from './arduino/block_types_registry';
/** Arduino code generator instance for all registered block emitters. */
export declare const arduinoGenerator: ArduinoGenerator;
//# sourceMappingURL=arduino.d.ts.map
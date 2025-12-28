/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Generating JavaScript for logic blocks.
 */
import type { Block } from "blockly/core/block";
import type { ArduinoGenerator } from "./arduino_generator";
import { Order } from "./arduino_generator";
export declare function controls_if(block: Block, generator: ArduinoGenerator): string;
export declare const controls_ifelse: typeof controls_if;
export declare function logic_compare(block: Block, generator: ArduinoGenerator): [string, Order];
export declare function logic_operation(block: Block, generator: ArduinoGenerator): [string, Order];
export declare function logic_negate(block: Block, generator: ArduinoGenerator): [string, Order];
export declare function logic_boolean(block: Block): [string, Order];
export declare function logic_null(): [string, Order];
export declare function logic_ternary(block: Block, generator: ArduinoGenerator): [string, Order];
//# sourceMappingURL=logic.d.ts.map
/**
 * @packageDocumentation
 * @module Arduino.ConfigureProcedureBlocks
 * @description Facade: typed configuration for procedure definition and call blocks.
 * @remarks
 * Split: configure_procedure_types / plus_minus / defs / calls.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { configureProcedureCallBlocks } from "./configure_procedure_calls";
import { configureProcedureDefBlocks } from "./configure_procedure_defs";

/**
 * Configures procedure blocks for the typed connection system.
 */
export function configureProcedureBlocks(): void {
  configureProcedureDefBlocks();
  configureProcedureCallBlocks();
}

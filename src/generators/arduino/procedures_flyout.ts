/**
 * @packageDocumentation
 * @module Arduino.ProceduresFlyout
 * @description Flyout de la catégorie Procédures & Fonctions (setup/loop Arduino + procédures Blockly).
 * @license GPL-3.0-or-later
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

import * as Blockly from "blockly";

export const PROCEDURES_CATEGORY_ID =
  Blockly.Procedures.CATEGORY_NAME ?? "PROCEDURE";

/**
 * Flyout : blocs setup()/loop() Arduino, puis séparateur, puis procédures Blockly.
 */
export function createProceduresFlyout(
  workspace: Blockly.WorkspaceSvg,
): Blockly.utils.toolbox.FlyoutItemInfo[] {
  const items: Blockly.utils.toolbox.FlyoutItemInfo[] = [
    { kind: "block", type: "board_base_setup_loop" },
    { kind: "block", type: "board_base_setup" },
    { kind: "block", type: "board_base_loop" },
    { kind: "sep", id: undefined, gap: 24, cssconfig: undefined },
  ];
  if (Blockly.Procedures && typeof Blockly.Procedures.flyoutCategory === "function") {
    items.push(...Blockly.Procedures.flyoutCategory(workspace, false));
  }
  return items;
}

/**
 * Enregistre le callback de la catégorie PROCEDURE dans la toolbox.
 */
export function registerProceduresCategory(
  workspace: Blockly.WorkspaceSvg,
): void {
  workspace.registerToolboxCategoryCallback(
    PROCEDURES_CATEGORY_ID,
    createProceduresFlyout,
  );
}

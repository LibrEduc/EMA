/**
 * @packageDocumentation
 * @module Arduino.ProceduresFlyout
 * @description Flyout for the Procedures & Functions category (Arduino setup/loop + Blockly procedures).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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
import { DEFAULT_TOOLBOX_BLOCK_LEVELS } from "../../toolbox";

export const PROCEDURES_CATEGORY_ID =
  Blockly.Procedures.CATEGORY_NAME ?? "PROCEDURE";

type FlyoutBlockItem = Blockly.utils.toolbox.FlyoutItemInfo & {
  levels?: string;
};

function withFlyoutBlockLevels(
  items: Blockly.utils.toolbox.FlyoutItemInfo[],
): FlyoutBlockItem[] {
  return items.map((item) =>
    item.kind === "block"
      ? { ...item, levels: DEFAULT_TOOLBOX_BLOCK_LEVELS }
      : item,
  );
}

/**
 * Flyout: Arduino setup()/loop() blocks, then a separator, then Blockly procedures.
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
    items.push(...Blockly.Procedures.flyoutCategory(workspace));
  }
  return withFlyoutBlockLevels(items);
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

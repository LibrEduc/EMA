/**
 * @packageDocumentation
 * @module Arduino.ProceduresFlyout
 * @description Flyout for the Procedures & Functions category (Arduino setup/loop + Blockly procedures).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
 * @param workspace - Blockly workspace.
 * @returns Result array.
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
 * @param workspace - Blockly workspace.
 */
export function registerProceduresCategory(
  workspace: Blockly.WorkspaceSvg,
): void {
  workspace.registerToolboxCategoryCallback(
    PROCEDURES_CATEGORY_ID,
    createProceduresFlyout,
  );
}

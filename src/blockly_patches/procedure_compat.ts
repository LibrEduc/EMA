/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * BlockChange mutation JSON/XML for procedures.
 */

import * as Blockly from "blockly";

/**
 * Patch Block Change For Procedure Compat.
 */
export function patchBlockChangeForProcedureCompat(): void {
  try {
    const BlockChange = Blockly.Events.BlockChange as typeof Blockly.Events.BlockChange & {
      prototype: Blockly.Events.BlockChange & {
        run: (forward: boolean) => void;
        __ucbProcedureCompat?: boolean;
      };
      getExtraBlockState_?: (block: Blockly.Block) => string;
    };
    const proto = BlockChange?.prototype;
    if (!proto || proto.__ucbProcedureCompat) {
      return;
    }

    const originalRun = proto.run;
    proto.run = function (this: Blockly.Events.BlockChange, forward: boolean) {
      const workspace = this.getEventWorkspace_();
      const blockId = this.blockId;
      if (!blockId) {
        originalRun.call(this, forward);
        return;
      }
      const block = workspace.getBlockById(blockId);
      if (!block) {
        originalRun.call(this, forward);
        return;
      }

      if (
        this.element === "field" &&
        typeof this.name === "string" &&
        this.name.endsWith("_TYPE") &&
        !block.getField(this.name)
      ) {
        return;
      }

      if (this.element === "mutation" && typeof block.loadExtraState === "function") {
        const value = forward ? this.newValue : this.oldValue;
        const raw = value != null ? String(value) : "";
        const mutator = block.getIcon(Blockly.icons.IconType.MUTATOR);
        if (
          mutator &&
          "bubbleIsVisible" in mutator &&
          (mutator as { bubbleIsVisible: () => boolean }).bubbleIsVisible()
        ) {
          (mutator as { setBubbleVisible: (visible: boolean) => void }).setBubbleVisible(false);
        }
        const getExtraState = BlockChange.getExtraBlockState_;
        const oldState = getExtraState ? getExtraState(block) : "";
        if (raw.trim().startsWith("<")) {
          if (typeof block.domToMutation === "function") {
            block.domToMutation(Blockly.utils.xml.textToDom(raw || "<mutation/>"));
          }
        } else {
          block.loadExtraState(JSON.parse(raw || "{}"));
        }
        Blockly.Events.fire(
          new Blockly.Events.BlockChange(block, "mutation", null, oldState, value),
        );
        return;
      }

      originalRun.call(this, forward);
    };
    proto.__ucbProcedureCompat = true;
  } catch (e) {
    console.debug("Error patching BlockChange for procedures:", e);
  }
}

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Authoring source for the servo pack UI.
 * Edit this file, then run: npm run build:extensions
 * Runtime loads the generated sibling `blocks.js` (ESM, no kernel imports).
 */

import type { ExtensionBlocksContext } from "../runtime_ctx";

type ServoBlock = {
  appendDummyInput: () => ServoInput;
  appendValueInput: (name: string) => ServoInput;
  setPreviousStatement: (v: boolean, check: null) => void;
  setNextStatement: (v: boolean, check: null) => void;
  setOutput: (v: boolean, check: string) => void;
  setStyle: (style: string) => void;
  setTooltip: (t: string) => void;
  setHelpUrl: (u: string) => void;
  setWarningText: (t: string | null) => void;
};

type ServoInput = {
  setAlign: (align: number) => ServoInput;
  setCheck: (checks: string[]) => ServoInput;
  appendField: (field: unknown, name?: string) => ServoInput;
};

/**
 * Registers servo UI blocks (FieldInstance). Loader injects `ctx`.
 * @param ctx - Injected Blockly helpers (no imports from µcBlockly).
 */
export function defineBlocks(ctx: ExtensionBlocksContext): void {
  const {
    Blockly,
    getBlocklyMsgOr,
    getBlocklyCompatibleChecks,
    enforceIntOnlyValueInputs,
    FieldInstance,
    updateInstancePresenceWarning,
    style = "servo_blocks",
  } = ctx;

  if (Blockly.Blocks["servo_attach"]) {
    return;
  }

  const intChecks =
    typeof getBlocklyCompatibleChecks === "function"
      ? getBlocklyCompatibleChecks("int")
      : ["int", "Number"];

  const defaultName = (): string =>
    getBlocklyMsgOr("SERVO_DEFAULT_NAME", "SERVO");

  const appendServoInstance = (input: ServoInput): void => {
    input
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(
        new FieldInstance("Servo", defaultName(), false, false, false),
        "SERVO_NAME",
      );
  };

  const warnMissingAttach = function (this: ServoBlock): void {
    updateInstancePresenceWarning(this, "SERVO_NAME", "Servo");
  };

  const makeOnchange = (intInputNames: string[]) => {
    return function (this: ServoBlock, event: unknown): void {
      if (
        intInputNames?.length &&
        typeof enforceIntOnlyValueInputs === "function"
      ) {
        const intWarning = enforceIntOnlyValueInputs(
          this,
          intInputNames,
          event,
        );
        if (intWarning) {
          this.setWarningText(intWarning);
          return;
        }
      }
      warnMissingAttach.call(this);
    };
  };

  Blockly.Blocks["servo_attach"] = {
    init(this: ServoBlock) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr("SERVO_ATTACH1", "Attach"),
      );
      const nameRow = this.appendDummyInput();
      nameRow
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("SERVO_ATTACH2", "Servo"));
      appendServoInstance(nameRow);
      this.appendValueInput("PIN")
        .setCheck(intChecks)
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(getBlocklyMsgOr("SERVO_PIN", "PIN#"));
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(style);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_ATTACH_TOOLTIP",
          "Attach a named servo instance to a pin (setup).",
        ),
      );
      this.setHelpUrl(
        getBlocklyMsgOr(
          "SERVO_MOVE_HELPURL",
          "http://www.arduino.cc/playground/ComponentLib/servo",
        ),
      );
    },
    onchange(this: ServoBlock, event: unknown) {
      if (typeof enforceIntOnlyValueInputs === "function") {
        const warning = enforceIntOnlyValueInputs(this, ["PIN"], event);
        if (warning !== undefined) {
          this.setWarningText(warning);
        }
      }
    },
  };

  Blockly.Blocks["servo_move"] = {
    init(this: ServoBlock) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr("SERVO_MOVE_INPUT", "rotate the Servomotor"),
      );
      appendServoInstance(this.appendDummyInput());
      this.appendValueInput("DEGREE")
        .setCheck(intChecks)
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(
          getBlocklyMsgOr("SERVO_MOVE_DEGREE", "an angle (0~180°) of"),
        );
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(style);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_MOVE_TOOLTIP",
          "rotation possible between 0 ~ 180 degrees",
        ),
      );
      this.setHelpUrl(
        getBlocklyMsgOr(
          "SERVO_MOVE_HELPURL",
          "http://www.arduino.cc/playground/ComponentLib/servo",
        ),
      );
    },
    onchange: makeOnchange(["DEGREE"]),
  };

  Blockly.Blocks["servo_read_degrees"] = {
    init(this: ServoBlock) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr(
          "SERVO_READ_DEGREES_INPUT",
          "the angle of the servo motor",
        ),
      );
      appendServoInstance(this.appendDummyInput());
      this.setOutput(true, "int");
      this.setStyle(style);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_READ_DEGREES_TOOLTIP",
          "returns the number of degrees the last rotation",
        ),
      );
      this.setHelpUrl(
        getBlocklyMsgOr(
          "SERVO_READ_DEGREES_HELPURL",
          "http://www.arduino.cc/playground/ComponentLib/servo",
        ),
      );
    },
    onchange: warnMissingAttach,
  };

  Blockly.Blocks["servo_detach"] = {
    init(this: ServoBlock) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr("SERVO_DETACH", "Detach"),
      );
      appendServoInstance(this.appendDummyInput());
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(style);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_DETACH_TOOLTIP",
          "Release a pin from servo driving.",
        ),
      );
      this.setHelpUrl(
        getBlocklyMsgOr(
          "SERVO_MOVE_HELPURL",
          "http://www.arduino.cc/playground/ComponentLib/servo",
        ),
      );
    },
    onchange: warnMissingAttach,
  };

  Blockly.Blocks["servo_attached"] = {
    init(this: ServoBlock) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr("SERVO_ATTACHED", "servo attached?"),
      );
      appendServoInstance(this.appendDummyInput());
      this.setOutput(true, "Boolean");
      this.setStyle(style);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_ATTACHED_TOOLTIP",
          "true if the servo is attached to pin; false otherwise.",
        ),
      );
      this.setHelpUrl(
        getBlocklyMsgOr(
          "SERVO_MOVE_HELPURL",
          "http://www.arduino.cc/playground/ComponentLib/servo",
        ),
      );
    },
    onchange: warnMissingAttach,
  };
}

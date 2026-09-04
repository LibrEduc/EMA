/**
 * Définitions UI des blocs servo (pack d’extension).
 * Style Blockly@rduino : FieldInstance + bloc `servo_attach`.
 * Entrées PIN / DEGREE : entiers uniquement.
 */

import * as Blockly from "blockly";
import {
  enforceIntOnlyValueInputs,
  getBlocklyCompatibleChecks,
  getBlocklyMsgOr,
} from "../../../src/categories/blockly/shared";
import { FieldInstance } from "../../../src/instances";
import { updateInstancePresenceWarning } from "../../../src/instances/block_helpers";

const SERVO_STYLE = "servo_blocks";

let servoBlocksRegistered = false;

/**
 * Enregistre les blocs servo à instances.
 * Préférer le runtime `blocks.js` via le loader d’extensions.
 */
export function defineServoExtensionBlocks(): void {
  if (servoBlocksRegistered || Blockly.Blocks["servo_attach"]) {
    return;
  }
  servoBlocksRegistered = true;

  const intChecks = getBlocklyCompatibleChecks("int");
  const defaultName = () => getBlocklyMsgOr("SERVO_DEFAULT_NAME", "SERVO");

  const appendServoInstance = (input: Blockly.Input): void => {
    input
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField(
        new FieldInstance("Servo", defaultName(), false, false, false),
        "SERVO_NAME",
      );
  };

  const warnMissingAttach = function (this: Blockly.Block): void {
    updateInstancePresenceWarning(this, "SERVO_NAME", "Servo");
  };

  const makeOnchange = (intInputNames: readonly string[]) => {
    return function (this: Blockly.Block, event: Blockly.Events.Abstract): void {
      const intWarning = enforceIntOnlyValueInputs(
        this,
        intInputNames,
        event,
      );
      if (intWarning) {
        this.setWarningText(intWarning);
        return;
      }
      warnMissingAttach.call(this);
    };
  };

  Blockly.Blocks["servo_attach"] = {
    init(this: Blockly.Block) {
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
      this.setStyle(SERVO_STYLE);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_ATTACH_TOOLTIP",
          "Attach a named servo instance to a pin (setup).",
        ),
      );
    },
    onchange(
      this: Blockly.Block,
      event: Blockly.Events.Abstract,
    ): void {
      const warning = enforceIntOnlyValueInputs(this, ["PIN"], event);
      if (warning !== undefined) {
        this.setWarningText(warning);
      }
    },
  };

  Blockly.Blocks["servo_move"] = {
    init(this: Blockly.Block) {
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
      this.setStyle(SERVO_STYLE);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_MOVE_TOOLTIP",
          "rotation possible between 0 ~ 180 degrees",
        ),
      );
    },
    onchange: makeOnchange(["DEGREE"]),
  };

  Blockly.Blocks["servo_read_degrees"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr(
          "SERVO_READ_DEGREES_INPUT",
          "the angle of the servo motor",
        ),
      );
      appendServoInstance(this.appendDummyInput());
      this.setOutput(true, "int");
      this.setStyle(SERVO_STYLE);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_READ_DEGREES_TOOLTIP",
          "returns the number of degrees the last rotation",
        ),
      );
    },
    onchange: warnMissingAttach,
  };

  Blockly.Blocks["servo_detach"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr("SERVO_DETACH", "Detach"),
      );
      appendServoInstance(this.appendDummyInput());
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle(SERVO_STYLE);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_DETACH_TOOLTIP",
          "Release a pin from servo driving.",
        ),
      );
    },
    onchange: warnMissingAttach,
  };

  Blockly.Blocks["servo_attached"] = {
    init(this: Blockly.Block) {
      this.appendDummyInput().appendField(
        getBlocklyMsgOr("SERVO_ATTACHED", "servo attached?"),
      );
      appendServoInstance(this.appendDummyInput());
      this.setOutput(true, "Boolean");
      this.setStyle(SERVO_STYLE);
      this.setTooltip(
        getBlocklyMsgOr(
          "SERVO_ATTACHED_TOOLTIP",
          "true if the servo is attached to pin; false otherwise.",
        ),
      );
    },
    onchange: warnMissingAttach,
  };
}

/** Plus de dropdown PIN dynamiques : la broche est sur `servo_attach` (value). */
export const SERVO_PIN_DROPDOWNS: Record<string, "pwm"> = {};

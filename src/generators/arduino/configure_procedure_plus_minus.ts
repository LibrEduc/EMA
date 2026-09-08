/**
 * @packageDocumentation
 * @module Arduino.ConfigureProcedurePlusMinus
 * @description Plus-minus argument inputs and per-parameter type dropdowns.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import {
  setVariableTypeAndMarkManual,
  isVariableUsedOutsideProcedureBodies,
  revalidateVariableBlocksForId,
  revalidateProcedureCallBlocks,
} from "../../categories/blockly/shared";
import { getArduinoTypeDropdownOptions } from "../../categories/blockly/variables";
import { isArduinoScalarType } from "./block_types";
import type { ProcedureBlockWithArgs } from "./configure_procedure_types";

/**
 * Attaches or refreshes the Arduino type dropdown on a procedure parameter input.
 * @param block Procedure definition block owning the argument.
 * @param argId Argument input name / id.
 * @param options Optional fireEvents control for FieldDropdown.setValue.
 */
export function attachProcedureParameterTypeDropdown(
  block: Blockly.Block,
  argId: string,
  options?: { fireEvents?: boolean },
): void {
  const proc = block as ProcedureBlockWithArgs;
  const input = block.getInput(argId);
  if (!input) {
    return;
  }
  const typeFieldName = `${argId}_TYPE`;
  const fireEvents = options?.fireEvents ?? true;
  let dropdown = input.fieldRow.find(
    (field) => field.name === typeFieldName,
  ) as Blockly.FieldDropdown | undefined;
  if (!dropdown) {
    dropdown = new Blockly.FieldDropdown(
      getArduinoTypeDropdownOptions,
      (value) => {
        const selectedType = value || "int";
        const argDatum = proc.argData_?.find((elem) => elem.argId === argId);
        if (argDatum?.model) {
          if (
            !isVariableUsedOutsideProcedureBodies(
              block.workspace,
              argDatum.model.getId(),
            )
          ) {
            setVariableTypeAndMarkManual(argDatum.model, selectedType);
          }
          Blockly.Procedures.mutateCallers(block);
          revalidateProcedureCallBlocks(block.workspace);
          revalidateVariableBlocksForId(block.workspace, argDatum.model.getId());
        }
        return selectedType;
      },
    );
    const nameIndex = input.fieldRow.findIndex((field) => field.name === argId);
    const insertIndex = nameIndex >= 0 ? nameIndex + 1 : input.fieldRow.length;
    input.insertFieldAt(insertIndex, dropdown, typeFieldName);
  }

  const argDatum = proc.argData_?.find((elem) => elem.argId === argId);
  const modelType = argDatum?.model?.getType?.() || "";
  const currentType =
    modelType && modelType !== "__NO_TYPE__" && isArduinoScalarType(modelType)
      ? modelType
      : "int";
  dropdown.setValue(currentType, fireEvents);
  if (
    argDatum?.model &&
    !isVariableUsedOutsideProcedureBodies(block.workspace, argDatum.model.getId())
  ) {
    setVariableTypeAndMarkManual(argDatum.model, currentType);
  }
}

/**
 * Patches plus-minus addVarInput_ so new args get type dropdowns; seeds existing args.
 * @param this Procedure definition block instance.
 */
export function patchProcedurePlusMinusTypes(this: Blockly.Block): void {
  const typed = this as ProcedureBlockWithArgs;
  if (typed.__typedPlusMinus) {
    return;
  }
  typed.__typedPlusMinus = true;

  const originalAddVarInput = typed.addVarInput_;
  if (typeof originalAddVarInput === "function") {
    typed.addVarInput_ = function (name: string, argId: string) {
      Blockly.Events.disable();
      try {
        originalAddVarInput.call(this, name, argId);
        attachProcedureParameterTypeDropdown(this, argId, { fireEvents: false });
      } finally {
        Blockly.Events.enable();
      }
    };
  }

  if (typed.argData_ && typed.argData_.length > 0) {
    for (const argDatum of typed.argData_) {
      attachProcedureParameterTypeDropdown(this, argDatum.argId, {
        fireEvents: false,
      });
    }
  }
}

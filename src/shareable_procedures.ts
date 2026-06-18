/**
 * @packageDocumentation
 * @module ShareableProcedures
 * @description Option shareable-procedures (désactivé par défaut ; incompatible avec block-plus-minus procedures).
 */

import * as Blockly from "blockly";

let shareableProceduresRegistered = false;

/**
 * True après {@link registerShareableProcedures} (blocs procédure du plugin actifs).
 */
export const isShareableProceduresEnabled = (): boolean => shareableProceduresRegistered;

/**
 * Remplace les blocs procédure Blockly par ceux du plugin shareable-procedures.
 * Incompatible avec `@blockly/block-plus-minus` procedures — ne pas activer les deux.
 */
export const registerShareableProcedures = async (): Promise<void> => {
  if (shareableProceduresRegistered) {
    return;
  }
  const { activateShareableProcedures } = await import("./shareable_procedures_loader");
  activateShareableProcedures();
  shareableProceduresRegistered = true;
};

/**
 * Trouve le bloc de définition associé à un appel (modèle explicite ou nom legacy).
 */
export const findProcedureDefinitionBlock = (
  workspace: Blockly.Workspace,
  callBlock: Blockly.Block,
): Blockly.Block | null => {
  const callLike = callBlock as Blockly.Block & {
    getProcedureModel?: () => Blockly.Procedures.IProcedureModel | null;
    getProcedureCall?: () => string;
  };
  const callModel = callLike.getProcedureModel?.();
  if (callModel) {
    for (const block of workspace.getAllBlocks(false)) {
      const defLike = block as Blockly.Block & {
        isProcedureDef?: () => boolean;
        getProcedureModel?: () => Blockly.Procedures.IProcedureModel | null;
      };
      if (
        defLike.isProcedureDef?.() &&
        defLike.getProcedureModel?.()?.getId() === callModel.getId()
      ) {
        return block;
      }
    }
    return null;
  }
  const defName = callLike.getProcedureCall?.() || callBlock.getFieldValue?.("NAME");
  if (!defName) {
    return null;
  }
  return Blockly.Procedures.getDefinition(defName, workspace);
};

/**
 * @license GPL-3.0-or-later
 * Activation du plugin shareable-procedures (chargé à la demande uniquement).
 */

import * as Blockly from "blockly";
import * as ShareableProceduresModule from "@blockly/block-shareable-procedures";
import { syncProcedureCallArgInputChecks } from "./categories/blockly/shared";

type ShareableProceduresPackage = {
  blocks: Record<string, unknown>;
  unregisterProcedureBlocks: () => void;
  ObservableProcedureModel: new (
    workspace: Blockly.Workspace,
    name: string,
    id?: string,
  ) => Blockly.Procedures.IProcedureModel;
  ObservableParameterModel: new (
    workspace: Blockly.Workspace,
    name: string,
    id?: string,
    varId?: string,
  ) => unknown;
};

const CALL_SYNC_EXTENSION = "ucb_procedure_caller_arg_checks";

type ProcedureUpdatableBlock = Blockly.Block & {
  doProcedureUpdate?: () => void;
};

const resolveShareableProceduresPackage = (): ShareableProceduresPackage => {
  const mod = ShareableProceduresModule as ShareableProceduresPackage & {
    default?: ShareableProceduresPackage;
  };
  const candidates = [mod, mod.default];
  for (const candidate of candidates) {
    if (
      candidate?.blocks &&
      typeof candidate.unregisterProcedureBlocks === "function" &&
      candidate.ObservableProcedureModel &&
      candidate.ObservableParameterModel
    ) {
      return candidate;
    }
  }
  throw new Error(
    "@blockly/block-shareable-procedures : module non chargé (interop webpack/UMD).",
  );
};

const registerShareableProcedureSerializer = (
  ObservableProcedureModel: ShareableProceduresPackage["ObservableProcedureModel"],
  ObservableParameterModel: ShareableProceduresPackage["ObservableParameterModel"],
): void => {
  const serializerType = Blockly.registry.Type.SERIALIZER;
  if (Blockly.registry.hasItem(serializerType, "procedures")) {
    Blockly.serialization.registry.unregister("procedures");
  }
  Blockly.serialization.registry.register(
    "procedures",
    new Blockly.serialization.procedures.ProcedureSerializer(
      ObservableProcedureModel as never,
      ObservableParameterModel as never,
    ),
  );
};

/** Active les blocs procédure shareable (ne pas appeler si block-plus-minus procedures est actif). */
export const activateShareableProcedures = (): void => {
  const {
    blocks,
    unregisterProcedureBlocks,
    ObservableProcedureModel,
    ObservableParameterModel,
  } = resolveShareableProceduresPackage();

  Blockly.Extensions.register(CALL_SYNC_EXTENSION, function (this: Blockly.Block) {
    const procBlock = this as ProcedureUpdatableBlock;
    const originalUpdate = procBlock.doProcedureUpdate?.bind(procBlock);
    if (!originalUpdate) {
      return;
    }
    procBlock.doProcedureUpdate = function (this: Blockly.Block) {
      originalUpdate();
      syncProcedureCallArgInputChecks(this);
    };
  });

  for (const type of ["procedures_callreturn", "procedures_callnoreturn"] as const) {
    const blockDef = blocks[type] as { extensions?: string[] } | undefined;
    if (blockDef?.extensions && !blockDef.extensions.includes(CALL_SYNC_EXTENSION)) {
      blockDef.extensions.push(CALL_SYNC_EXTENSION);
    }
  }

  unregisterProcedureBlocks();
  Blockly.common.defineBlocks(blocks);
  registerShareableProcedureSerializer(
    ObservableProcedureModel,
    ObservableParameterModel,
  );
};

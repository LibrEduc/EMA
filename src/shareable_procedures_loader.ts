/**
 * @packageDocumentation
 * @module ShareableProceduresLoader
 * @description Activates the shareable-procedures plugin (loaded on demand only).
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

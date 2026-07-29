/**
 * @license GPL-3.0-or-later
 * Tests for the @blockly/block-shareable-procedures plugin (POC).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import * as Blockly from "blockly";
import { registerShareableProcedures } from "../src/shareable_procedures";
import { arduinoGenerator } from "../src/generators/arduino";

await registerShareableProcedures();

test("procédure shareable : modèle, sérialisation et génération Arduino", () => {
  const workspace = new Blockly.Workspace();
  Blockly.serialization.blocks.append(
    {
      type: "procedures_defnoreturn",
      x: 10,
      y: 10,
      fields: { NAME: "blinkLed" },
    },
    workspace,
  );

  const defBlocks = workspace
    .getAllBlocks(false)
    .filter((block) => block.type === "procedures_defnoreturn");
  assert.equal(defBlocks.length, 1);

  const defBlock = defBlocks[0] as Blockly.Block & {
    getProcedureModel?: () => Blockly.Procedures.IProcedureModel;
    isProcedureDef?: () => boolean;
  };
  assert.equal(typeof defBlock.getProcedureModel, "function");
  assert.equal(defBlock.isProcedureDef?.(), true);
  const model = defBlock.getProcedureModel?.();
  assert.ok(model);
  assert.equal(model?.getName(), "blinkLed");
  assert.ok(workspace.getProcedureMap().get(model!.getId()));

  const saved = Blockly.serialization.workspaces.save(workspace);
  const workspace2 = new Blockly.Workspace();
  Blockly.serialization.workspaces.load(saved, workspace2);

  const reloadedDefs = workspace2
    .getAllBlocks(false)
    .filter((block) => block.type === "procedures_defnoreturn");
  assert.equal(reloadedDefs.length, 1);
  assert.ok(workspace2.getProcedureMap().getProcedures().length >= 1);

  arduinoGenerator.init(workspace2);
  const code = arduinoGenerator.workspaceToCode(workspace2);
  assert.match(code, /void blinkLed\s*\(\s*\)/);

  workspace.dispose();
  workspace2.dispose();
});

test("procédure shareable : appel lié au modèle", () => {
  const workspace = new Blockly.Workspace();
  const def = Blockly.serialization.blocks.append(
    {
      type: "procedures_defreturn",
      x: 0,
      y: 0,
      fields: { NAME: "addOne" },
    },
    workspace,
  ) as Blockly.Block & { getProcedureModel?: () => Blockly.Procedures.IProcedureModel };

  const model = def.getProcedureModel?.();
  assert.ok(model);

  Blockly.serialization.blocks.append(
    {
      type: "procedures_callreturn",
      x: 0,
      y: 80,
      extraState: { name: "addOne", params: [] },
    },
    workspace,
  );

  const calls = workspace
    .getAllBlocks(false)
    .filter((block) => block.type === "procedures_callreturn");
  assert.equal(calls.length, 1);

  const call = calls[0] as Blockly.Block & {
    getProcedureModel?: () => Blockly.Procedures.IProcedureModel;
  };
  assert.equal(call.getProcedureModel?.()?.getId(), model?.getId());

  workspace.dispose();
});

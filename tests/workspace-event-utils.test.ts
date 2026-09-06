/**
 * @license GPL-3.0-or-later
 * Unit tests for workspace event defer / queue helpers.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import * as Blockly from "blockly";
import {
  shouldDeferWorkspaceEnforcement,
  shouldQueueWorkspaceEnforcement,
} from "../src/core/workspace_event_utils";

test("drag-tagged BLOCK_MOVE is deferred but still queued", () => {
  const workspace = new Blockly.Workspace();
  const move = new Blockly.Events.BlockMove();
  move.reason = ["drag"];

  const isRelevant = (e: Blockly.Events.Abstract) =>
    e.type === Blockly.Events.BLOCK_MOVE;

  assert.equal(shouldDeferWorkspaceEnforcement(workspace, move), true);
  assert.equal(
    shouldQueueWorkspaceEnforcement(workspace, move, isRelevant),
    true,
  );
  workspace.dispose();
});

test("BLOCK_CREATE is queued for post-settle enforcement", () => {
  const workspace = new Blockly.Workspace();
  const create = new Blockly.Events.BlockCreate();
  const isRelevant = (e: Blockly.Events.Abstract) =>
    e.type === Blockly.Events.BLOCK_CREATE ||
    e.type === Blockly.Events.BLOCK_MOVE;

  assert.equal(
    shouldQueueWorkspaceEnforcement(workspace, create, isRelevant),
    true,
  );
  workspace.dispose();
});

test("unrelated UI events are neither deferred-as-work nor queued", () => {
  const workspace = new Blockly.Workspace();
  const ui = new Blockly.Events.UiBase("selected");
  const isRelevant = () => false;

  assert.equal(shouldDeferWorkspaceEnforcement(workspace, ui), true);
  assert.equal(shouldQueueWorkspaceEnforcement(workspace, ui, isRelevant), false);
  workspace.dispose();
});

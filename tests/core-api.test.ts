/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert/strict";
import { sanitizeSerializedWorkspaceState } from "../src/core/workspace_state";

const state = { blocks: { blocks: [{ x: Number.NaN, y: "bad" }] } };
sanitizeSerializedWorkspaceState(state);
const block = (state.blocks as { blocks: Array<{ x: number; y: number }> }).blocks[0];
assert.equal(block.x, 0);
assert.equal(block.y, 0);

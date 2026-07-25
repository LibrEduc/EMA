import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createEmptyBitmapGrid,
  resizeBitmapGrid,
} from "../src/categories/blockly/array_bitmap_grid.ts";

describe("array_bitmap helpers", () => {
  it("createEmptyBitmapGrid builds rows x cols of zeros", () => {
    const grid = createEmptyBitmapGrid(2, 3);
    assert.deepEqual(grid, [
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });

  it("resizeBitmapGrid preserves overlapping pixels", () => {
    const source = [
      [1, 0],
      [0, 1],
    ];
    const grown = resizeBitmapGrid(source, 3, 3);
    assert.deepEqual(grown, [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ]);
    const shrunk = resizeBitmapGrid(source, 1, 1);
    assert.deepEqual(shrunk, [[1]]);
  });
});

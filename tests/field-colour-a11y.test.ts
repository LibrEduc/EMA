import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatColourAriaValue,
  normalizeHexColour,
} from "../src/categories/blockly/field_colour_a11y.ts";

describe("field_colour_a11y", () => {
  it("normalizeHexColour accepts #RRGGBB", () => {
    assert.equal(normalizeHexColour("#ff00ff"), "#FF00FF");
    assert.equal(normalizeHexColour("00ff00"), "#00FF00");
    assert.equal(normalizeHexColour(""), null);
  });

  it("formatColourAriaValue includes hex and RGB", () => {
    const spoken = formatColourAriaValue("#FF0000");
    assert.match(spoken, /#FF0000/);
    assert.match(spoken, /255,\s*0,\s*0/);
  });
});

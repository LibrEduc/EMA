/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { describe, it } from "node:test";
import {
  DEMO_SHELL_REQUIRED_IDS,
  resolveDemoShellDom,
} from "../src/demo/demo_dom.ts";

const buildDemoHtml = (omitId?: string): string => {
  const tags = DEMO_SHELL_REQUIRED_IDS.map((id) => {
    if (omitId && id === omitId) {
      return "";
    }
    if (id.endsWith("Menu") || id === "boardMenu") {
      return `<select id="${id}"></select>`;
    }
    if (
      id.startsWith("plugin") ||
      id.includes("Switch") ||
      id === "alwaysOpenedToolboxFlyout" ||
      id === "loadFileInput"
    ) {
      return `<input id="${id}" type="${id === "loadFileInput" ? "file" : "checkbox"}" />`;
    }
    return `<div id="${id}"></div>`;
  });
  return `<!DOCTYPE html><html><body>${tags.join("")}</body></html>`;
};

describe("resolveDemoShellDom", () => {
  it("returns ok with typed hosts when all ids are present", () => {
    const dom = new JSDOM(buildDemoHtml());
    const result = resolveDemoShellDom(dom.window.document);
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.ok(result.elements.workspaceContentBlockly);
    assert.equal(result.missing.length, 0);
  });

  it("returns missing ids without throwing", () => {
    const dom = new JSDOM(buildDemoHtml("div_workspace_content_blockly"));
    const result = resolveDemoShellDom(dom.window.document);
    assert.equal(result.ok, false);
    if (result.ok) {
      return;
    }
    assert.deepEqual(result.missing, ["div_workspace_content_blockly"]);
  });
});

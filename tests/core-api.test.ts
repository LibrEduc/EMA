/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { JSDOM } from "jsdom";
import {
  BOARD_PROFILES,
  DEFAULT_BOARD_ID,
  getBoardDropdownOptions,
  getBoardProfileDropdownOptions,
  pinDigitalValidator,
  pinPWMValidator,
} from "../src/boards.ts";
import { sanitizeSerializedWorkspaceState } from "../src/core/workspace_state.ts";

describe("core-api / boards", () => {
  it("sanitizeSerializedWorkspaceState coerces bad coordinates", () => {
    const state = { blocks: { blocks: [{ x: Number.NaN, y: "bad" }] } };
    sanitizeSerializedWorkspaceState(state);
    const block = (state.blocks as { blocks: Array<{ x: number; y: number }> })
      .blocks[0];
    assert.equal(block.x, 0);
    assert.equal(block.y, 0);
  });

  it("DEFAULT_BOARD_ID is none and present in profiles", () => {
    assert.equal(DEFAULT_BOARD_ID, "none");
    assert.ok(BOARD_PROFILES[DEFAULT_BOARD_ID]);
  });

  it("pin validators accept uno pins and reject unknown", () => {
    assert.equal(pinDigitalValidator("13", "arduino_uno"), "13");
    assert.equal(pinDigitalValidator("99", "arduino_uno"), null);
    assert.equal(pinPWMValidator("3", "arduino_uno"), "3");
    assert.equal(pinPWMValidator("2", "arduino_uno"), null);
  });

  it("getBoardDropdownOptions returns digital/pwm/analog/serial for uno", () => {
    const opts = getBoardDropdownOptions("arduino_uno");
    assert.ok(
      opts.digital.some(([label, value]) => label === "13" && value === "13"),
    );
    assert.ok(opts.pwm.length > 0);
    assert.ok(
      opts.analog.some(([, value]) => value === "A0" || value.startsWith("A")),
    );
    assert.ok(opts.serial.length > 0);
  });

  it("getBoardProfileDropdownOptions excludes none", () => {
    const options = getBoardProfileDropdownOptions();
    assert.ok(options.length > 0);
    assert.ok(options.every(([, id]) => id !== "none"));
  });
});

function installJsdomGlobals(): JSDOM {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><body>
      <div id="editor" style="width:480px;height:360px"></div>
    </body></html>`,
    { pretendToBeVisual: true, url: "http://localhost/" },
  );
  const { window } = dom;
  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.document = window.document;
  globalThis.HTMLElement = window.HTMLElement as typeof HTMLElement;
  globalThis.SVGElement = window.SVGElement as typeof SVGElement;
  globalThis.Element = window.Element as typeof Element;
  globalThis.Node = window.Node as typeof Node;
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: window.navigator,
  });
  globalThis.getComputedStyle = window.getComputedStyle.bind(window);
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(() => cb(0), 0)) as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number) =>
    clearTimeout(id)) as typeof cancelAnimationFrame;
  return dom;
}

describe("core-api / createUcBlockly", () => {
  let dom: JSDOM;
  let createUcBlockly: typeof import("../src/core/create_ucblockly.ts").createUcBlockly;
  let resetKernel: typeof import("../src/core/register.ts").resetUcBlocklyKernelRegistrationForTests;
  let getToolboxWithoutBoardCategory: typeof import("../src/toolbox.ts").getToolboxWithoutBoardCategory;
  let basic_toolbox: typeof import("../src/toolbox.ts").basic_toolbox;

  before(async () => {
    // Blockly must load after DOM globals exist (ConnectionChecker, inject).
    dom = installJsdomGlobals();
    ({ createUcBlockly } = await import("../src/core/create_ucblockly.ts"));
    ({ resetUcBlocklyKernelRegistrationForTests: resetKernel } = await import(
      "../src/core/register.ts"
    ));
    ({ getToolboxWithoutBoardCategory, basic_toolbox } = await import(
      "../src/toolbox.ts"
    ));
    resetKernel();
  });

  after(() => {
    resetKernel?.();
    dom?.window.close();
  });

  it("injects, generates empty sketch, save/load round-trip", () => {
    const container = document.getElementById("editor");
    assert.ok(container);

    const editor = createUcBlockly(container, {
      toolbox: getToolboxWithoutBoardCategory(basic_toolbox),
      language: "en",
      localizeToolbox: false,
      media: "./media/",
      workspaceOptions: {
        // Avoid async media fetches after dispose under jsdom.
        sounds: false,
      },
      enforcers: {
        strictTypes: false,
        programStructure: false,
        strictConnectionChecker: false,
      },
    });

    assert.ok(editor.workspace);
    const code = editor.getCode();
    assert.equal(typeof code, "string");

    const saved = editor.saveWorkspace();
    assert.equal(typeof saved, "object");
    editor.loadWorkspace(saved);
    assert.equal(typeof editor.getCode(), "string");

    editor.dispose();
  });
});

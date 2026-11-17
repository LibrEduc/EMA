import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMenuTemplate, isMenuCommand, isMenuState } from "../electron/menu.mjs";

const makeState = () => ({
  language: "fr",
  labels: Object.fromEntries([
    "file", "open", "save", "quit", "edit", "undo", "redo", "restart", "view", "code", "codeOpen",
    "codeClosed", "flyout", "settings", "language", "codeTarget", "accessibility",
    "highContrast", "screenreader", "textSize", "font", "help", "shortcuts", "tutorial",
  ].map((key) => [key, key])),
  toggles: { codeOpen: false, flyoutOpen: true, highContrast: false, screenreader: false },
  selects: Object.fromEntries(["language", "codeTarget", "font", "textSize"].map((key) => [key, {
    value: "selected",
    options: [{ value: "selected", label: "Choice" }, { value: "other", label: "Other" }],
  }])),
});

describe("Electron menu model", () => {
  it("rejects incomplete menu state", () => {
    assert.equal(isMenuState(makeState()), true);
    assert.equal(isMenuState({ ...makeState(), language: "unsupported" }), false);
    assert.equal(isMenuState({ ...makeState(), toggles: {} }), false);
  });

  it("builds native menus and updates checkbox/radio choices", () => {
    const commands = [];
    const template = buildMenuTemplate(makeState(), (command) => commands.push(command), "win32");
    assert.deepEqual(template.map((item) => item.label), ["file", "edit", "view", "settings", "accessibility", "help"]);
    const codeToggle = template[2].submenu[0];
    codeToggle.click({ checked: true });
    const language = template[3].submenu[0].submenu[0];
    assert.equal(language.checked, true);
    language.click();
    assert.deepEqual(commands, [
      { type: "toggle", id: "toggle-code", checked: true },
      { type: "select", id: "language", value: "selected" },
    ]);
    assert.equal(template[0].submenu[3].role, "quit");
    assert.equal(template[0].submenu[0].accelerator, "CmdOrCtrl+O");
    assert.equal(template[0].submenu[1].accelerator, "CmdOrCtrl+S");
    assert.equal(buildMenuTemplate(makeState(), () => {}, "darwin")[0].label, "EMA");
  });

  it("accepts only known command ids and payloads", () => {
    assert.equal(isMenuCommand({ type: "action", id: "restart" }), true);
    assert.equal(isMenuCommand({ type: "action", id: "open" }), true);
    assert.equal(isMenuCommand({ type: "action", id: "save" }), true);
    assert.equal(isMenuCommand({ type: "action", id: "execute-arbitrary" }), false);
    assert.equal(isMenuCommand({ type: "toggle", id: "toggle-flyout", checked: false }), true);
    assert.equal(isMenuCommand({ type: "toggle", id: "toggle-flyout" }), false);
    assert.equal(isMenuCommand({ type: "select", id: "language", value: "fr" }), true);
    assert.equal(isMenuCommand({ type: "select", id: "language", value: "x".repeat(121) }), false);
  });
});
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMenuTemplate, isMenuState } from "../electron/menu.mjs";

const makeState = () => ({
  language: "fr",
  selects: Object.fromEntries(["languageMenu", "boardMenu", "rendererMenu", "themeMenu"].map((id) => [id, {
    value: "selected",
    options: [
      { value: "none", label: "None", group: "" },
      { value: "selected", label: "électronique", group: "famille" },
    ],
  }])),
  toggles: Object.fromEntries(["pluginMinimap", "pluginHighlight", "pluginContinuousToolbox", "alwaysOpenedToolboxFlyout", "codeEditorSwitch", "debugSwitch"].map((id) => [id, { label: `option ${id}`, checked: false }])),
  actions: Object.fromEntries(["saveButton", "loadButton", "undoButton", "redoButton", "aboutButton", "shortcutsHelpButton", "keyboardTutorialButton"].map((id) => [id, `action ${id}`])),
});

describe("Electron menu", () => {
  it("rejects malformed or oversized renderer state", () => {
    const state = makeState();
    assert.equal(isMenuState(state), true);
    assert.equal(isMenuState({ ...state, toggles: {} }), false);
    assert.equal(isMenuState({ ...state, language: "x".repeat(301) }), false);
    state.selects.boardMenu.options[0].value = 42 as unknown as string;
    assert.equal(isMenuState(state), false);
  });

  it("groups boards, marks selections and sends the selected action", () => {
    const commands: unknown[] = [];
    const template = buildMenuTemplate(makeState(), (command: unknown) => commands.push(command), () => {});
    assert.deepEqual(template.map((item: { label: string }) => item.label), ["Fichier", "Édition", "Affichage", "Paramètres", "Aide"]);
    const board = template[3].submenu[1].submenu[1].submenu[0];
    assert.equal(board.label, "Électronique");
    assert.equal(template[3].submenu[1].submenu[1].label, "Famille");
    assert.equal(board.checked, true);
    assert.equal(template[0].submenu[0].label, "Action saveButton");
    assert.equal(template[2].submenu[3].label, "Option pluginMinimap");
    board.click();
    template[0].submenu[0].click();
    assert.deepEqual(commands, [
      { type: "select", id: "boardMenu", value: "selected" },
      { type: "action", id: "saveButton" },
    ]);
  });
});
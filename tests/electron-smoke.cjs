const assert = require("node:assert/strict");
const { mkdtempSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { app, BrowserWindow, Menu } = require("electron");

app.setPath("userData", mkdtempSync(path.join(tmpdir(), "ema-electron-test-")));

const waitUntil = async (check, message) => {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(message);
};

const findItem = (menu, label) => {
  for (const item of menu.items) {
    if (item.label === label) return item;
    const child = item.submenu && findItem(item.submenu, label);
    if (child) return child;
  }
  return undefined;
};

(async () => {
  await import("../electron/main.mjs");
  await app.whenReady();
  const window = await waitUntil(() => BrowserWindow.getAllWindows()[0], "Window not created");
  const evaluate = (code) => window.webContents.executeJavaScript(code);
  await waitUntil(() => Menu.getApplicationMenu()?.items.length === 5 &&
    ["Paramètres", "Settings", "Configuración", "الإعدادات"].some((label) => findItem(Menu.getApplicationMenu(), label)), "Menu not initialized");
  assert.equal(await evaluate('getComputedStyle(document.getElementById("app_topbar")).display'), "none");
  assert.ok(await evaluate('document.querySelector(".blocklySvg") !== null'));

  const french = findItem(Menu.getApplicationMenu(), "Français");
  assert.ok(french);
  french.click(undefined, window, {});
  await waitUntil(() => evaluate('document.getElementById("languageMenu").value === "fr"'), "French language did not change");
  await waitUntil(() => findItem(Menu.getApplicationMenu(), "Paramètres"), "French menu did not synchronize");

  const english = findItem(Menu.getApplicationMenu(), "English");
  assert.ok(english);
  english.click(undefined, window, {});
  await waitUntil(() => evaluate('document.getElementById("languageMenu").value === "en"'), "Language did not change");
  await waitUntil(() => findItem(Menu.getApplicationMenu(), "Settings"), "Menu did not translate");

  const board = await evaluate(`(() => {
    const select = document.getElementById("boardMenu");
    const option = Array.from(select.options).find(item => item.value !== select.value && item.value !== "none");
    return { value: option.value, label: option.textContent.trim() };
  })()`);
  const boardItem = findItem(Menu.getApplicationMenu(), board.label);
  assert.ok(boardItem, "Board not present in menu");
  boardItem.click(undefined, window, {});
  await waitUntil(() => evaluate(`document.getElementById("boardMenu").value === ${JSON.stringify(board.value)}`), "Board did not change");
  await waitUntil(() => findItem(Menu.getApplicationMenu(), board.label)?.checked, "Board menu did not synchronize");

  findItem(Menu.getApplicationMenu(), "Français").click(undefined, window, {});
  await waitUntil(() => findItem(Menu.getApplicationMenu(), "Paramètres"), "Menu did not return to French");
  assert.equal(await evaluate('document.getElementById("boardMenu").value'), board.value);
  assert.equal(findItem(Menu.getApplicationMenu(), board.label)?.checked, true);
  findItem(Menu.getApplicationMenu(), "English").click(undefined, window, {});
  await waitUntil(() => findItem(Menu.getApplicationMenu(), "Settings"), "Menu did not return to English");
  assert.equal(await evaluate('document.getElementById("boardMenu").value'), board.value);

  const toggleLabel = await evaluate('document.getElementById("pluginHighlight").parentElement.textContent.trim()');
  const initialToggle = await evaluate('document.getElementById("pluginHighlight").checked');
  const toggle = findItem(Menu.getApplicationMenu(), toggleLabel);
  assert.ok(toggle);
  toggle.click(undefined, window, {});
  await waitUntil(() => evaluate(`document.getElementById("pluginHighlight").checked === ${!initialToggle}`), "Toggle did not change");
  await waitUntil(() => findItem(Menu.getApplicationMenu(), toggleLabel)?.checked === !initialToggle, "Toggle menu did not synchronize");

  const theme = await evaluate(`(() => {
    const select = document.getElementById("themeMenu");
    const option = Array.from(select.options).find(item => item.value !== select.value);
    return { value: option.value, label: option.textContent.trim() };
  })()`);
  findItem(Menu.getApplicationMenu(), theme.label).click(undefined, window, {});
  await waitUntil(() => evaluate(`document.getElementById("themeMenu").value === ${JSON.stringify(theme.value)}`), "Theme did not change");
  await waitUntil(() => findItem(Menu.getApplicationMenu(), theme.label)?.checked, "Theme menu did not synchronize");

  for (const id of ["saveButton", "loadButton", "undoButton", "redoButton", "shortcutsHelpButton", "keyboardTutorialButton"]) {
    const label = await evaluate(`document.getElementById(${JSON.stringify(id)}).textContent.trim()`);
    assert.ok(findItem(Menu.getApplicationMenu(), label), `${id} missing from native menu`);
  }

  const shortcutsLabel = await evaluate('document.getElementById("shortcutsHelpButton").textContent.trim()');
  findItem(Menu.getApplicationMenu(), shortcutsLabel).click(undefined, window, {});
  await waitUntil(() => evaluate('document.getElementById("shortcuts-help-dialog")?.open'), "React shortcuts dialog did not open");
  assert.ok(await evaluate('document.querySelector("#shortcuts-help-dialog .shortcuts-help-table--editable tbody tr") !== null'));
  findItem(Menu.getApplicationMenu(), "Français").click(undefined, window, {});
  await waitUntil(() => evaluate('document.querySelector("#shortcuts-help-dialog h2").textContent === "Raccourcis clavier"'), "Open shortcuts dialog did not translate");
  findItem(Menu.getApplicationMenu(), "English").click(undefined, window, {});
  await waitUntil(() => evaluate('document.querySelector("#shortcuts-help-dialog h2").textContent === "Keyboard shortcuts"'), "Open shortcuts dialog did not return to English");
  await evaluate('document.querySelector("#shortcuts-help-dialog .shortcuts-help-edit").click()');
  await waitUntil(() => evaluate('document.getElementById("shortcuts-help-status").textContent.includes("Press a key")'), "Shortcut capture did not start");
  await evaluate('document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", keyCode: 27, which: 27, bubbles: true, cancelable: true }))');
  await waitUntil(() => evaluate('document.getElementById("shortcuts-help-status").textContent === "Edit cancelled"'), "Shortcut capture did not cancel");
  await evaluate('document.getElementById("shortcuts-help-dialog").close()');

  const tutorialLabel = await evaluate('document.getElementById("keyboardTutorialButton").textContent.trim()');
  findItem(Menu.getApplicationMenu(), tutorialLabel).click(undefined, window, {});
  await waitUntil(() => evaluate('document.getElementById("keyboard-tutorial-dialog")?.open'), "React tutorial dialog did not open");
  assert.match(await evaluate('document.getElementById("keyboard-tutorial-progress").textContent'), /^1 \/ 5/);
  await evaluate('document.querySelector("#keyboard-tutorial-dialog .keyboard-tutorial-dialog__nav button:nth-child(2)").click()');
  await waitUntil(() => evaluate('document.getElementById("keyboard-tutorial-progress").textContent.startsWith("2 / 5")'), "React tutorial did not advance");
  await evaluate('document.getElementById("keyboard-tutorial-dialog").close()');

  for (const id of ["loadButton", "saveButton"]) {
    await evaluate(`document.getElementById(${JSON.stringify(id)}).addEventListener("click", event => {
      window.__fileMenuActivation = navigator.userActivation.isActive;
      event.stopImmediatePropagation();
    }, { once: true }); delete window.__fileMenuActivation;`);
    const label = await evaluate(`document.getElementById(${JSON.stringify(id)}).textContent.trim()`);
    findItem(Menu.getApplicationMenu(), label).click(undefined, window, {});
    await waitUntil(() => evaluate('window.__fileMenuActivation !== undefined'), `${id} did not reach the interface`);
    assert.equal(await evaluate('window.__fileMenuActivation'), true, `${id} requires user activation`);
  }

  const blockId = await evaluate(`(() => {
    const workspace = Blockly.Workspace.getAll().find(ws => !ws.isFlyout && document.getElementById("div_workspace_content_blockly").contains(ws.getParentSvg()));
    const block = workspace.newBlock("math_number");
    block.initSvg();
    block.render();
    return block.id;
  })()`);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const undoLabel = await evaluate('document.getElementById("undoButton").textContent.trim()');
  findItem(Menu.getApplicationMenu(), undoLabel).click(undefined, window, {});
  await waitUntil(() => evaluate(`!Blockly.Workspace.getAll().some(ws => ws.getBlockById(${JSON.stringify(blockId)}))`), "Undo did not remove the block");
  const redoLabel = await evaluate('document.getElementById("redoButton").textContent.trim()');
  findItem(Menu.getApplicationMenu(), redoLabel).click(undefined, window, {});
  await waitUntil(() => evaluate(`Blockly.Workspace.getAll().some(ws => ws.getBlockById(${JSON.stringify(blockId)}))`), "Redo did not restore the block");

  const aboutLabel = await evaluate('document.getElementById("aboutButton").textContent.trim()');
  findItem(Menu.getApplicationMenu(), aboutLabel).click(undefined, window, {});
  await waitUntil(() => evaluate('document.getElementById("ucb-about-dialog")?.open'), "About dialog did not open");
  console.log("Electron menus, language, board, toggle and help: OK");
  app.exit(0);
})().catch((error) => {
  console.error(error);
  app.exit(1);
});
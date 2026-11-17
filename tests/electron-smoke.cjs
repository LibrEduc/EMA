const assert = require("node:assert/strict");
const { existsSync, mkdtempSync, readFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { app, BrowserWindow, dialog, Menu } = require("electron");

const userData = mkdtempSync(path.join(tmpdir(), "ema-electron-smoke-"));
const workspaceFilePath = path.join(userData, "workspace-roundtrip.µcb");
let openDialogCalls = 0;
app.setPath("userData", userData);
dialog.showSaveDialog = async () => ({ canceled: false, filePath: workspaceFilePath });
dialog.showOpenDialog = async () => {
  openDialogCalls += 1;
  return { canceled: false, filePaths: [workspaceFilePath] };
};

const waitUntil = async (check, message) => {
  const deadline = Date.now() + 15000;
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
    const nested = item.submenu && findItem(item.submenu, label);
    if (nested) return nested;
  }
  return undefined;
};

(async () => {
  await import("../electron/main.mjs");
  await app.whenReady();
  const window = await waitUntil(() => BrowserWindow.getAllWindows()[0], "Electron window was not created");
  const evaluate = (source) => window.webContents.executeJavaScript(source);
  await waitUntil(
    () => Menu.getApplicationMenu()?.items.length >= 6 && window.webContents.isLoading() === false,
    "Native menus were not initialized",
  );
  assert.equal(await evaluate('Boolean(document.getElementById("ema-workspace"))'), true);
  assert.equal(await evaluate('typeof window.emaDesktop'), "object");
  assert.equal(await evaluate('getComputedStyle(document.querySelector(".ema-header")).display'), "none");
  assert.ok(findItem(Menu.getApplicationMenu(), "Ouvrir…"), "Open workspace command missing from File menu");
  assert.ok(findItem(Menu.getApplicationMenu(), "Enregistrer"), "Save workspace command missing from File menu");

  const languageOption = await evaluate(`(() => {
    const option = Array.from(document.querySelectorAll("#ema-lang option")).find(item => item.value === "fr");
    return { label: option.textContent.trim(), value: option.value };
  })()`);
  const languageItem = findItem(Menu.getApplicationMenu(), languageOption.label);
  assert.ok(languageItem, "French language missing from native menu");
  languageItem.click(undefined, window, {});
  await waitUntil(() => evaluate('document.getElementById("ema-lang").value === "fr"'), "Language menu command did not update the renderer");
  await waitUntil(() => findItem(Menu.getApplicationMenu(), "Réglages"), "Menu labels did not update after language change");

  const codeOption = await evaluate(`(() => {
    const option = Array.from(document.querySelectorAll('input[name="ema-code-target"]')).find(item => item.value === "micropython");
    return { label: option.parentElement.querySelector("span").textContent.trim(), value: option.value };
  })()`);
  const codeItem = findItem(Menu.getApplicationMenu(), codeOption.label);
  assert.ok(codeItem, "MicroPython target missing from native menu");
  codeItem.click(undefined, window, {});
  await waitUntil(() => evaluate('document.querySelector("input[name=ema-code-target][value=micropython]").checked'), "Code target menu command did not update the renderer");

  const showCode = findItem(Menu.getApplicationMenu(), "Voir le code");
  assert.ok(showCode, "Code drawer command missing from View menu");
  showCode.click(undefined, window, {});
  await waitUntil(() => evaluate('document.querySelector(".ema-code-drawer").open'), "Code drawer command did not open the panel");

  findItem(Menu.getApplicationMenu(), "Enregistrer").click(undefined, window, {});
  await waitUntil(() => existsSync(workspaceFilePath), "Save menu did not create a workspace file");
  const savedProject = JSON.parse(readFileSync(workspaceFilePath, "utf8"));
  assert.equal(savedProject.language, "fr");
  assert.equal(savedProject.codeTarget, "micropython");
  assert.ok(savedProject.workspace, "Saved file did not contain Blockly workspace state");

  findItem(Menu.getApplicationMenu(), "Ouvrir…").click(undefined, window, {});
  await waitUntil(() => openDialogCalls === 1, "Open menu did not display the workspace dialog");
  await waitUntil(() => evaluate('document.querySelector("#ema-workspace .blocklySvg") !== null'), "Loaded workspace did not remain mounted");

  console.log("Electron startup, menu sync, language, target, code drawer and file round-trip: OK");
  app.exit(0);
})().catch((error) => {
  console.error(error);
  app.exit(1);
});

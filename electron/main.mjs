import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from "electron";
import { existsSync } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildMenuTemplate, isMenuCommand, isMenuState } from "./menu.mjs";

const electronDirectory = path.dirname(fileURLToPath(import.meta.url));
const rendererPath = path.resolve(electronDirectory, "../dist/index.html");
const rendererUrl = pathToFileURL(rendererPath);
let mainWindow;

function openExternalUrl(value) {
  try {
    if (["https:", "mailto:"].includes(new URL(value).protocol)) {
      void shell.openExternal(value);
    }
  } catch {
    // Ignore malformed URLs.
  }
}

function setNativeMenu(state) {
  const template = buildMenuTemplate(
    state,
    (command) => {
      if (!mainWindow || !isMenuCommand(command)) return;
      if (command.type === "action" && command.id === "restart") {
        void mainWindow.webContents
          .executeJavaScript('document.getElementById("ema-restart")?.click()', true)
          .catch(() => {});
        return;
      }
      mainWindow.webContents.send("ema:menu-command", command);
    },
    process.platform,
    app.name,
  );
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

const isTrustedRenderer = (event) =>
  mainWindow &&
  event.sender === mainWindow.webContents &&
  event.senderFrame === mainWindow.webContents.mainFrame;

const WORKSPACE_MAX_BYTES = 32 * 1024 * 1024;

ipcMain.handle("ema:workspace-open", async (event) => {
  if (!isTrustedRenderer(event)) return { canceled: true };
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ name: "EMA / Blockly workspace", extensions: ["µcb", "json"] }],
  });
  if (result.canceled || result.filePaths.length === 0) return { canceled: true };
  const filePath = result.filePaths[0];
  const fileInfo = await stat(filePath);
  if (fileInfo.size > WORKSPACE_MAX_BYTES) {
    throw new Error("Workspace file exceeds the 32 MB limit.");
  }
  return { canceled: false, text: await readFile(filePath, "utf8") };
});

ipcMain.handle("ema:workspace-save", async (event, request) => {
  const contents = request?.contents;
  const requestedName = request?.fileName;
  if (!isTrustedRenderer(event) || typeof contents !== "string" ||
      Buffer.byteLength(contents, "utf8") > WORKSPACE_MAX_BYTES) {
    throw new Error("Invalid workspace save request.");
  }
  const parsed = JSON.parse(contents);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid workspace file contents.");
  }
  const date = new Date().toISOString().slice(0, 10);
  const defaultName = `workspace_${date}.µcb`;
  const defaultPath = typeof requestedName === "string" &&
    requestedName === path.basename(requestedName) && requestedName.length <= 160
    ? requestedName
    : defaultName;
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [{ name: "EMA / Blockly workspace", extensions: ["µcb", "json"] }],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  await writeFile(result.filePath, contents, { encoding: "utf8", flag: "w" });
  return { canceled: false };
});
function createMainWindow() {
  if (!existsSync(rendererPath)) {
    throw new Error(`Electron renderer not found at ${rendererPath}. Run "npm run electron:build" first.`);
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(electronDirectory, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalUrl(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    try {
      const destination = new URL(url);
      if (destination.protocol === "file:" && destination.pathname === rendererUrl.pathname) return;
    } catch {
      // Block malformed navigation URLs.
    }
    event.preventDefault();
    openExternalUrl(url);
  });

  void mainWindow.loadFile(rendererPath);
}

app.setName("EMA");

ipcMain.on("ema:menu-state", (event, state) => {
  if (!mainWindow || event.sender !== mainWindow.webContents ||
      event.senderFrame !== mainWindow.webContents.mainFrame || !isMenuState(state)) return;
  setNativeMenu(state);
});

app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
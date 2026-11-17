import { app, BrowserWindow, shell } from "electron";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const electronDirectory = path.dirname(fileURLToPath(import.meta.url));
const rendererPath = path.resolve(electronDirectory, "../dist-electron/index.html");
const rendererUrl = new URL(pathToFileURL(rendererPath));

function openExternalUrl(value) {
  try {
    const protocol = new URL(value).protocol;
    if (protocol === "https:" || protocol === "mailto:") {
      void shell.openExternal(value);
    }
  } catch {
    // Ignore malformed URLs.
  }
}

function createMainWindow() {
  if (!existsSync(rendererPath)) {
    throw new Error(
      `Electron renderer not found at ${rendererPath}. Run "npm run electron:build" first.`,
    );
  }

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
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
  mainWindow.webContents.on("will-navigate", (event, value) => {
    try {
      const destination = new URL(value);
      const isRendererPage =
        destination.protocol === "file:" &&
        destination.host === rendererUrl.host &&
        destination.pathname === rendererUrl.pathname;
      if (isRendererPage) {
        return;
      }
    } catch {
      // Block malformed navigation URLs.
    }

    event.preventDefault();
    openExternalUrl(value);
  });

  void mainWindow.loadFile(rendererPath);
  return mainWindow;
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
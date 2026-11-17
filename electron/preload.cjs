const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld(
  "desktopHost",
  Object.freeze({
    isElectron: true,
    platform: process.platform,
    updateMenu: (state) => ipcRenderer.send("desktop:menu-state", state),
    onMenuCommand: (callback) => {
      const listener = (_event, command) => callback(command);
      ipcRenderer.on("desktop:menu-command", listener);
      return () => ipcRenderer.removeListener("desktop:menu-command", listener);
    },
  }),
);
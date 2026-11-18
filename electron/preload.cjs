const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("emaDesktop", Object.freeze({
  updateMenu: (state) => ipcRenderer.send("ema:menu-state", state),
  onMenuCommand: (callback) => {
    const listener = (_event, command) => callback(command);
    ipcRenderer.on("ema:menu-command", listener);
    return () => ipcRenderer.removeListener("ema:menu-command", listener);
  },
  openWorkspace: () => ipcRenderer.invoke("ema:workspace-open"),
  saveWorkspace: (contents, fileName) => ipcRenderer.invoke("ema:workspace-save", { contents, fileName }),
}));
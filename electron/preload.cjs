const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld(
  "desktopHost",
  Object.freeze({
    isElectron: true,
    platform: process.platform,
  }),
);
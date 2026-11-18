export type DesktopUiLanguage = "fr" | "en" | "es" | "ar";

export type DesktopMenuOption = { value: string; label: string };

export type DesktopMenuState = {
  language: DesktopUiLanguage;
  labels: Record<string, string>;
  toggles: Record<string, boolean>;
  selects: Record<string, { value: string; options: DesktopMenuOption[] }>;
};

export type DesktopMenuCommand =
  | { type: "action"; id: "open" | "save" | "undo" | "redo" | "restart" | "shortcuts" | "tutorial" }
  | { type: "toggle"; id: "toggle-code" | "toggle-flyout" | "toggle-contrast" | "toggle-screenreader"; checked: boolean }
  | { type: "select"; id: "language" | "code-target" | "font" | "text-size"; value: string };

type DesktopHost = {
  updateMenu: (state: DesktopMenuState) => void;
  onMenuCommand: (callback: (command: DesktopMenuCommand) => void) => () => void;
  openWorkspace: () => Promise<{ canceled: boolean; text?: string }>;
  saveWorkspace: (contents: string, fileName: string) => Promise<{ canceled: boolean }>;
};

declare global {
  interface Window {
    emaDesktop?: DesktopHost;
  }
}

export const publishDesktopMenuState = (state: DesktopMenuState): void => {
  window.emaDesktop?.updateMenu(state);
};

export const subscribeDesktopMenuCommands = (
  callback: (command: DesktopMenuCommand) => void,
): (() => void) => window.emaDesktop?.onMenuCommand(callback) ?? (() => undefined);

export const openDesktopWorkspace = (): Promise<{ canceled: boolean; text?: string }> =>
  window.emaDesktop?.openWorkspace() ?? Promise.resolve({ canceled: true });

export const saveDesktopWorkspace = (contents: string, fileName: string): Promise<{ canceled: boolean }> =>
  window.emaDesktop?.saveWorkspace(contents, fileName) ?? Promise.resolve({ canceled: true });

const selectIds = ["languageMenu", "boardMenu", "rendererMenu", "themeMenu"] as const;
const toggleIds = ["pluginMinimap", "pluginHighlight", "pluginContinuousToolbox", "alwaysOpenedToolboxFlyout", "codeEditorSwitch", "debugSwitch"] as const;
const actionIds = ["saveButton", "loadButton", "undoButton", "redoButton", "aboutButton", "shortcutsHelpButton", "keyboardTutorialButton"] as const;

type DesktopCommand =
  | { type: "action"; id: string }
  | { type: "toggle"; id: string }
  | { type: "select"; id: string; value: string };

type DesktopMenuState = {
  language: string;
  selects: Record<string, { value: string; options: { value: string; label: string; group: string }[] }>;
  toggles: Record<string, { label: string; checked: boolean }>;
  actions: Record<string, string>;
};

type DesktopHost = {
  isElectron: boolean;
  updateMenu: (state: DesktopMenuState) => void;
  onMenuCommand: (callback: (command: DesktopCommand) => void) => () => void;
};

export function initializeDesktopMenu(): void {
  const host = (window as Window & { desktopHost?: DesktopHost }).desktopHost;
  const toolbar = document.getElementById("app_topbar");
  if (!host?.isElectron || !toolbar) return;

  const publish = (): void => {
    const selects: DesktopMenuState["selects"] = {};
    for (const id of selectIds) {
      const element = document.getElementById(id) as HTMLSelectElement | null;
      if (!element || element.options.length === 0) return;
      selects[id] = {
        value: element.value,
        options: Array.from(element.options, (option) => ({
          value: option.value,
          label: option.textContent?.trim() || option.value,
          group: option.parentElement instanceof HTMLOptGroupElement ? option.parentElement.label : "",
        })),
      };
    }
    const toggles: DesktopMenuState["toggles"] = {};
    for (const id of toggleIds) {
      const element = document.getElementById(id) as HTMLInputElement | null;
      if (!element) return;
      toggles[id] = { label: element.parentElement?.textContent?.trim() || id, checked: element.checked };
    }
    const actions: DesktopMenuState["actions"] = {};
    for (const id of actionIds) {
      const element = document.getElementById(id);
      if (!element) return;
      actions[id] = element.textContent?.trim() || id;
    }
    host.updateMenu({ language: selects.languageMenu.value, selects, toggles, actions });
  };

  let pending = false;
  const schedulePublish = (): void => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      publish();
    });
  };

  host.onMenuCommand((command) => {
    if (command.type === "action" && (actionIds as readonly string[]).includes(command.id)) {
      document.getElementById(command.id)?.click();
    } else if (command.type === "toggle" && (toggleIds as readonly string[]).includes(command.id)) {
      document.getElementById(command.id)?.click();
    } else if (command.type === "select" && (selectIds as readonly string[]).includes(command.id)) {
      const element = document.getElementById(command.id) as HTMLSelectElement | null;
      if (element && Array.from(element.options).some((option) => option.value === command.value)) {
        element.value = command.value;
        element.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    schedulePublish();
  });

  new MutationObserver(schedulePublish).observe(toolbar, { subtree: true, childList: true, characterData: true, attributes: true });
  window.addEventListener("load", () => {
    schedulePublish();
    window.setTimeout(schedulePublish, 1700);
  }, { once: true });
  schedulePublish();
}
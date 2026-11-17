const LANGUAGES = ["fr", "en", "es", "ar"];
const MENU_LABEL_KEYS = [
  "file", "open", "save", "quit", "edit", "undo", "redo", "restart", "view", "code",
  "codeOpen", "codeClosed", "flyout", "settings", "language", "codeTarget",
  "accessibility", "highContrast", "screenreader", "textSize", "font", "help",
  "shortcuts", "tutorial",
];
const TOGGLE_KEYS = ["codeOpen", "flyoutOpen", "highContrast", "screenreader"];
const SELECT_KEYS = ["language", "codeTarget", "font", "textSize"];

const isText = (value) => typeof value === "string" && value.length > 0 && value.length <= 120;
const isOptions = (options) => Array.isArray(options) && options.length > 0 && options.length <= 25 &&
  options.every((option) => option && isText(option.value) && isText(option.label));

export function isMenuState(state) {
  if (!state || typeof state !== "object" || !LANGUAGES.includes(state.language)) return false;
  if (!state.labels || !MENU_LABEL_KEYS.every((key) => isText(state.labels[key]))) return false;
  if (!state.toggles || !TOGGLE_KEYS.every((key) => typeof state.toggles[key] === "boolean")) return false;
  if (!state.selects || !SELECT_KEYS.every((key) => {
    const select = state.selects[key];
    return select && isText(select.value) && isOptions(select.options) &&
      select.options.some((option) => option.value === select.value);
  })) return false;
  return true;
}

export function buildMenuTemplate(state, sendCommand, platform = process.platform, appName = "EMA") {
  const action = (id, label, accelerator) => ({
    label,
    ...(accelerator ? { accelerator } : {}),
    click: () => sendCommand({ type: "action", id }),
  });
  const toggle = (id, label, checked) => ({
    label,
    type: "checkbox",
    checked,
    click: (menuItem) => sendCommand({
      type: "toggle",
      id,
      checked: typeof menuItem?.checked === "boolean" ? menuItem.checked : !checked,
    }),
  });
  const select = (id, label, value, options) => ({
    label,
    submenu: options.map((option) => ({
      label: option.label,
      type: "radio",
      checked: option.value === value,
      click: () => sendCommand({ type: "select", id, value: option.value }),
    })),
  });
  const { labels, toggles, selects } = state;
  const template = [
    {
      label: labels.file,
      submenu: [
        action("open", labels.open, "CmdOrCtrl+O"),
        action("save", labels.save, "CmdOrCtrl+S"),
        { type: "separator" },
        ...(platform === "darwin" ? [] : [{ label: labels.quit, role: "quit" }]),
      ],
    },
    {
      label: labels.edit,
      submenu: [
        action("undo", labels.undo),
        action("redo", labels.redo),
        { type: "separator" },
        action("restart", labels.restart),
      ],
    },
    {
      label: labels.view,
      submenu: [
        toggle("toggle-code", toggles.codeOpen ? labels.codeClosed : labels.codeOpen, toggles.codeOpen),
        toggle("toggle-flyout", labels.flyout, toggles.flyoutOpen),
      ],
    },
    {
      label: labels.settings,
      submenu: [
        select("language", labels.language, selects.language.value, selects.language.options),
        select("code-target", labels.codeTarget, selects.codeTarget.value, selects.codeTarget.options),
      ],
    },
    {
      label: labels.accessibility,
      submenu: [
        toggle("toggle-contrast", labels.highContrast, toggles.highContrast),
        toggle("toggle-screenreader", labels.screenreader, toggles.screenreader),
        { type: "separator" },
        select("text-size", labels.textSize, selects.textSize.value, selects.textSize.options),
        select("font", labels.font, selects.font.value, selects.font.options),
      ],
    },
    {
      label: labels.help,
      submenu: [
        action("shortcuts", labels.shortcuts),
        action("tutorial", labels.tutorial),
      ],
    },
  ];
  if (platform === "darwin") {
    template.unshift({
      label: appName,
      submenu: [{ role: "about" }, { type: "separator" }, { label: labels.quit, role: "quit" }],
    });
  }
  return template;
}

export function isMenuCommand(command) {
  if (!command || typeof command !== "object") return false;
  if (command.type === "action") {
    return ["open", "save", "undo", "redo", "restart", "shortcuts", "tutorial"].includes(command.id);
  }
  if (command.type === "toggle") {
    return ["toggle-code", "toggle-flyout", "toggle-contrast", "toggle-screenreader"].includes(command.id) &&
      typeof command.checked === "boolean";
  }
  if (command.type === "select") {
    return ["language", "code-target", "font", "text-size"].includes(command.id) && isText(command.value);
  }
  return false;
}
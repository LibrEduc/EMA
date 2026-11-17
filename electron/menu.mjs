const selectIds = ["languageMenu", "boardMenu", "rendererMenu", "themeMenu"];
const toggleIds = ["pluginMinimap", "pluginHighlight", "pluginContinuousToolbox", "alwaysOpenedToolboxFlyout", "codeEditorSwitch", "debugSwitch"];
const actionIds = ["saveButton", "loadButton", "undoButton", "redoButton", "aboutButton", "shortcutsHelpButton", "keyboardTutorialButton"];

const labels = {
  fr: { file: "Fichier", edit: "Édition", view: "Affichage", settings: "Paramètres", help: "Aide", language: "Langue", board: "Carte", renderer: "Rendu", theme: "Thème", contact: "Contacter", quit: "Quitter" },
  en: { file: "File", edit: "Edit", view: "View", settings: "Settings", help: "Help", language: "Language", board: "Board", renderer: "Renderer", theme: "Theme", contact: "Contact", quit: "Quit" },
  es: { file: "Archivo", edit: "Editar", view: "Ver", settings: "Configuración", help: "Ayuda", language: "Idioma", board: "Placa", renderer: "Renderizado", theme: "Tema", contact: "Contacto", quit: "Salir" },
  ar: { file: "ملف", edit: "تحرير", view: "عرض", settings: "الإعدادات", help: "مساعدة", language: "اللغة", board: "اللوحة", renderer: "العرض", theme: "المظهر", contact: "اتصل بنا", quit: "خروج" },
};

const isText = (value) => typeof value === "string" && value.length <= 300;
const capitalizeFirst = (value) => {
  const [first, ...rest] = value;
  return first ? `${first.toLocaleUpperCase()}${rest.join("")}` : value;
};

export function isMenuState(state) {
  if (!state || typeof state !== "object" || !isText(state.language) || !state.selects || !state.toggles || !state.actions) return false;
  return selectIds.every((id) => {
    const select = state.selects[id];
    return select && isText(select.value) && Array.isArray(select.options) && select.options.length <= 1000 &&
      select.options.every((option) => option && isText(option.value) && isText(option.label) && isText(option.group));
  }) && toggleIds.every((id) => {
    const toggle = state.toggles[id];
    return toggle && isText(toggle.label) && typeof toggle.checked === "boolean";
  }) && actionIds.every((id) => isText(state.actions[id]));
}

export function buildMenuTemplate(state, send, openContact) {
  const text = labels[state.language] ?? labels.en;
  const action = (id) => ({ label: capitalizeFirst(state.actions[id]), click: () => send({ type: "action", id }) });
  const select = (id, label) => {
    const current = state.selects[id];
    const items = [];
    const groups = new Map();
    for (const option of current.options) {
      const item = {
        label: capitalizeFirst(option.label),
        type: "radio",
        checked: option.value === current.value,
        click: () => send({ type: "select", id, value: option.value }),
      };
      if (!option.group) items.push(item);
      else {
        if (!groups.has(option.group)) {
          const group = { label: capitalizeFirst(option.group), submenu: [] };
          groups.set(option.group, group);
          items.push(group);
        }
        groups.get(option.group).submenu.push(item);
      }
    }
    return { label, submenu: items };
  };
  const toggle = (id) => ({
    label: capitalizeFirst(state.toggles[id].label),
    type: "checkbox",
    checked: state.toggles[id].checked,
    click: () => send({ type: "toggle", id }),
  });

  return [
    { label: text.file, submenu: [action("saveButton"), action("loadButton"), { type: "separator" }, { label: text.quit, role: "quit" }] },
    { label: text.edit, submenu: [action("undoButton"), action("redoButton"), { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }] },
    { label: text.view, submenu: [select("rendererMenu", text.renderer), select("themeMenu", text.theme), { type: "separator" }, ...toggleIds.map(toggle), { type: "separator" }, { role: "togglefullscreen" }, { role: "toggleDevTools" }] },
    { label: text.settings, submenu: [select("languageMenu", text.language), select("boardMenu", text.board)] },
    { label: text.help, submenu: [action("aboutButton"), action("shortcutsHelpButton"), action("keyboardTutorialButton"), { label: text.contact, click: openContact }] },
  ];
}
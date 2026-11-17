import type { ChangeEventHandler, ReactNode } from "react";

export type TranslatedActionProps = {
  id: string;
  messageKey: string;
  titleKey: string;
  onClick?: () => void;
  children?: ReactNode;
};

export function TranslatedAction({ id, messageKey, titleKey, onClick, children }: TranslatedActionProps) {
  return (
    <button id={id} type="button" className="toolbar-btn lang" data-title-key={titleKey} onClick={onClick}>
      {children}
      <span className="lang" data-title-key={titleKey} data-i18n={messageKey}>{messageKey}</span>
    </button>
  );
}

export type SelectOption = { value: string; messageKey: string; id?: string };

export type ToolbarSelectProps = {
  id: string;
  titleKey: string;
  options: readonly SelectOption[];
  onChange?: ChangeEventHandler<HTMLSelectElement>;
};

export function ToolbarSelect({ id, titleKey, options, onChange }: ToolbarSelectProps) {
  return (
    <select id={id} name={id} className="toolbar-select" data-title-key={titleKey} onChange={onChange}>
      {options.map(({ value, messageKey, id: optionId }) => (
        <option key={value} id={optionId} value={value} className="lang" data-title-key={titleKey} data-i18n={messageKey}>
          {messageKey}
        </option>
      ))}
    </select>
  );
}

export type PluginToggleProps = {
  id: string;
  messageKey: string;
  titleKey: string;
  checked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
};

export function PluginToggle({ id, messageKey, titleKey, checked, onChange }: PluginToggleProps) {
  return (
    <label className="plugin-option" htmlFor={id}>
      <input id={id} type="checkbox" data-title-key={titleKey} defaultChecked={checked} onChange={onChange} />
      <span className="lang" data-title-key={titleKey} data-i18n={messageKey}>{messageKey}</span>
    </label>
  );
}

export type ToolbarProps = {
  onSave: () => void;
  onLoad: () => void;
  onLoadFileChange: ChangeEventHandler<HTMLInputElement>;
  onUndo: () => void;
  onRedo: () => void;
  onLanguageChange: ChangeEventHandler<HTMLSelectElement>;
  onThemeChange: ChangeEventHandler<HTMLSelectElement>;
  onRendererChange: ChangeEventHandler<HTMLSelectElement>;
  onBoardChange: ChangeEventHandler<HTMLSelectElement>;
  onMinimapChange: ChangeEventHandler<HTMLInputElement>;
  onHighlightChange: ChangeEventHandler<HTMLInputElement>;
  onContinuousToolboxChange: ChangeEventHandler<HTMLInputElement>;
  onFlyoutPinChange: ChangeEventHandler<HTMLInputElement>;
  onCodeEditorChange: ChangeEventHandler<HTMLInputElement>;
  onDebugChange: ChangeEventHandler<HTMLInputElement>;
};

const themeOptions: readonly SelectOption[] = [
  { id: "themeClassicSpan", value: "classic", messageKey: "THEME_CLASSIC" },
  { id: "themeModernSpan", value: "modern", messageKey: "THEME_MODERN" },
  { id: "themeDeuteranopiaSpan", value: "deuteranopia", messageKey: "THEME_DEUTERANOPIA" },
  { id: "themeTritanopiaSpan", value: "tritanopia", messageKey: "THEME_TRITANOPIA" },
  { id: "themeZelosSpan", value: "zelos", messageKey: "THEME_ZELOS" },
  { id: "themeHighContrastSpan", value: "high_contrast", messageKey: "THEME_HIGHCONTRAST" },
  { id: "themeDarkSpan", value: "dark", messageKey: "THEME_DARK" },
  { id: "themeHackerSpan", value: "hacker", messageKey: "THEME_HACKER" },
  { id: "themeSeshatSpan", value: "seshat", messageKey: "THEME_SESHAT" },
  { id: "themeBwSpan", value: "blackWhite", messageKey: "THEME_BLACKWHITE" },
];

const rendererOptions: readonly SelectOption[] = [
  { id: "rendererGeras", value: "geras", messageKey: "RENDERER_GERAS" },
  { id: "rendererThrasos", value: "thrasos", messageKey: "RENDERER_THRASOS" },
  { id: "rendererZelos", value: "zelos", messageKey: "RENDERER_ZELOS" },
  { id: "rendererMinimalist", value: "minimalist", messageKey: "RENDERER_MINI" },
];

export function Toolbar(props: ToolbarProps) {
  const isElectron = (window as Window & { desktopHost?: { isElectron?: boolean } }).desktopHost?.isElectron === true;
  return (
    <header id="app_topbar" className="divTableCell app-topbar" style={isElectron ? { display: "none" } : undefined}>
      <div className="toolbar-brand-group">
        <div id="title" className="app-title">
          <img className="app-title__logo" src="assets/favicon-32x32.png?v=2" alt="" width="32" height="32" decoding="async" />
          <span className="lang" data-i18n="HOME">HOME</span>
        </div>
        <TranslatedAction id="aboutButton" messageKey="ABOUT" titleKey="ABOUT_TOOLTIP" />
        <a href="https://www.linkedin.com/in/sebcanet/" target="_blank" rel="noopener noreferrer">
          <span className="lang" data-title-key="CONTACT_TOOLTIP" data-i18n="CONTACT">CONTACT</span>
        </a>
      </div>

      <div className="toolbar-actions" aria-label="Workspace actions">
        <TranslatedAction id="saveButton" messageKey="SAVE" titleKey="SAVE_TOOLTIP" onClick={props.onSave} />
        <TranslatedAction id="loadButton" messageKey="LOAD" titleKey="LOAD_TOOLTIP" onClick={props.onLoad} />
        <input type="file" id="loadFileInput" accept=".µcb,.json,application/json" hidden aria-hidden="true" tabIndex={-1} onChange={props.onLoadFileChange} />
        <TranslatedAction id="undoButton" messageKey="UNDO" titleKey="UNDO_TOOLTIP" onClick={props.onUndo} />
        <TranslatedAction id="redoButton" messageKey="REDO" titleKey="REDO_TOOLTIP" onClick={props.onRedo} />
        <TranslatedAction id="shortcutsHelpButton" messageKey="SHORTCUTS_HELP_BUTTON" titleKey="SHORTCUTS_HELP_TOOLTIP" />
        <TranslatedAction id="keyboardTutorialButton" messageKey="KEYBOARD_TUTORIAL_BUTTON" titleKey="KEYBOARD_TUTORIAL_TOOLTIP" />
      </div>

      <div className="toolbar-settings" aria-label="Workspace settings">
        <ToolbarSelect id="languageMenu" titleKey="LANGUAGE_MENU_TOOLTIP" options={[]} onChange={props.onLanguageChange} />
        <ToolbarSelect id="rendererMenu" titleKey="RENDERER_MENU_TOOLTIP" options={rendererOptions} onChange={props.onRendererChange} />
        <ToolbarSelect id="themeMenu" titleKey="THEME_MENU_TOOLTIP" options={themeOptions} onChange={props.onThemeChange} />
        <ToolbarSelect id="boardMenu" titleKey="BOARD_MENU_TOOLTIP" options={[]} onChange={props.onBoardChange} />
      </div>

      <div id="pluginOptions" className="toolbar-plugin-options">
        <PluginToggle id="pluginMinimap" messageKey="PLUGIN_MINIMAP" titleKey="PLUGIN_MINIMAP_TOOLTIP" onChange={props.onMinimapChange} />
        <PluginToggle id="pluginHighlight" messageKey="PLUGIN_HIGHLIGHT" titleKey="PLUGIN_HIGHLIGHT_TOOLTIP" onChange={props.onHighlightChange} />
        <PluginToggle id="pluginContinuousToolbox" messageKey="PLUGIN_CONTINUOUSTOOLBOX" titleKey="PLUGIN_CONTINUOUSTOOLBOX_TOOLTIP" onChange={props.onContinuousToolboxChange} />
        <PluginToggle id="alwaysOpenedToolboxFlyout" messageKey="ALWAYS_OPEN_FLYOUT" titleKey="ALWAYS_OPEN_FLYOUT_TOOLTIP" onChange={props.onFlyoutPinChange} />
        <PluginToggle id="codeEditorSwitch" messageKey="CODE_EDITOR" titleKey="CODE_EDITOR_TOOLTIP" onChange={props.onCodeEditorChange} />
        <PluginToggle id="debugSwitch" messageKey="PLUGIN_DEBUG" titleKey="PLUGIN_DEBUG_TOOLTIP" onChange={props.onDebugChange} />
      </div>
    </header>
  );
}

import { useEffect, useRef, useState, type MouseEvent } from "react";
import * as Blockly from "blockly";
import {
  KEYBOARD_TUTORIAL_OPEN_EVENT,
  KEYBOARD_TUTORIAL_REFRESH_EVENT,
  getKeyboardTutorialContent,
  getKeyboardTutorialText,
  type KeyboardTutorialKey,
} from "../../shell_keyboard_tutorial";
import {
  SHORTCUTS_HELP_OPEN_EVENT,
  SHORTCUTS_HELP_REFRESH_EVENT,
  closeShortcutsHelp,
} from "../../shell_shortcuts_help";
import {
  BUTTON_ID,
  CLOSE_ID,
  DIALOG_ID,
  HINT_ID,
  STATUS_ID,
  TITLE_ID,
  navigationHintRows,
  shellRows,
} from "../../shell_shortcuts_help_dialog";
import {
  cancelListeningCapture,
  getShortcutEditState,
  isListening,
  restoreFocus,
  setPendingFocus,
  setStatus,
  startListening,
  stopListening,
  subscribeShortcutEditState,
  takePendingFocus,
} from "../../shell_shortcuts_help_edit";
import { actionLabel, blocklyMsg, t } from "../../shell_shortcuts_help_i18n";
import {
  EDITABLE_SHORTCUT_NAMES,
  formatSerializedKeys,
  getDefaultKeyCodes,
  getEffectiveKeyCodes,
  hasCustomShortcutBindings,
  resetAllShortcutBindings,
  resetShortcutBinding,
} from "../../shortcut_preferences";
import { dismissKeyboardTutorial } from "../../blockly_a11y_extensions";

const TUTORIAL_DIALOG_ID = "keyboard-tutorial-dialog";
const TUTORIAL_TITLE_ID = "keyboard-tutorial-title";
const TUTORIAL_BODY_ID = "keyboard-tutorial-body";
const TUTORIAL_PROGRESS_ID = "keyboard-tutorial-progress";
const TUTORIAL_STEP_COUNT = 5;

const tutorialText = (key: string): string =>
  getKeyboardTutorialText(key as KeyboardTutorialKey);

function ShortcutTable({
  heading,
  rows,
  colAction,
  colKeys,
}: {
  heading: string;
  rows: Array<{ label: string; keys: string }>;
  colAction: string;
  colKeys: string;
}) {
  return (
    <section className="shortcuts-help-section">
      <h3>{heading}</h3>
      <table className="shortcuts-help-table">
        <thead>
          <tr>
            <th scope="col">{colAction}</th>
            <th scope="col">{colKeys}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, keys }) => (
            <tr key={`${label}:${keys}`}>
              <th scope="row">{label}</th>
              <td>{keys}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function EditableShortcuts() {
  const editState = getShortcutEditState();
  const colAction = t("SHORTCUTS_HELP_COL_ACTION");
  const colKeys = t("SHORTCUTS_HELP_COL_KEYS");
  const rows = EDITABLE_SHORTCUT_NAMES.flatMap((name) => {
    const codes = getEffectiveKeyCodes(name);
    if (!codes.length && !Blockly.ShortcutRegistry.registry.getRegistry()[name]) return [];
    const defaults = getDefaultKeyCodes(name);
    const custom = codes.length > 0 && (defaults.length === 0 || codes.length !== defaults.length || codes.some((code, index) => code !== defaults[index]));
    return [{ name, label: actionLabel(name), keys: formatSerializedKeys(codes.length ? codes : defaults), custom }];
  });
  const refresh = (): void => {
    window.dispatchEvent(new Event(SHORTCUTS_HELP_REFRESH_EVENT));
  };

  return (
    <section className="shortcuts-help-section" aria-describedby={HINT_ID}>
      <h3>{t("SHORTCUTS_HELP_SECTION_EDITABLE")}</h3>
      <p id={HINT_ID} className="shortcuts-help-hint">{t("SHORTCUTS_HELP_EDITABLE_HINT")}</p>
      <p
        id={STATUS_ID}
        className={`shortcuts-help-status${editState.status?.isError ? " shortcuts-help-status--error" : ""}`}
        role="status"
        aria-live={editState.status?.isError ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {editState.status?.message ?? ""}
      </p>
      <table className="shortcuts-help-table shortcuts-help-table--editable" aria-describedby={HINT_ID}>
        <thead>
          <tr>
            <th scope="col">{colAction}</th>
            <th scope="col">{colKeys}</th>
            <th scope="col">{t("SHORTCUTS_HELP_COL_EDIT")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ name, label, keys, custom }) => {
            const listening = editState.listeningFor === name;
            return (
              <tr key={name} className={custom ? "shortcuts-help-row--custom" : undefined}>
                <th scope="row">
                  {label}
                  {custom && <span className="shortcuts-help-sr-only"> ({t("SHORTCUTS_HELP_CUSTOM_BADGE")})</span>}
                </th>
                <td className="shortcuts-help-keys">{keys}</td>
                <td className="shortcuts-help-actions">
                  <button
                    type="button"
                    className={`toolbar-btn shortcuts-help-edit${listening ? " shortcuts-help-edit--listening" : ""}`}
                    data-shortcut-name={name}
                    aria-label={t("SHORTCUTS_HELP_EDIT_ARIA").replace("%1", label)}
                    aria-pressed={listening}
                    aria-busy={listening}
                    onClick={() => startListening(name, refresh)}
                  >
                    {listening ? t("SHORTCUTS_HELP_LISTENING") : t("SHORTCUTS_HELP_EDIT")}
                  </button>
                  {custom && (
                    <button
                      type="button"
                      className="toolbar-btn shortcuts-help-reset"
                      data-shortcut-name={name}
                      aria-label={t("SHORTCUTS_HELP_RESET_ARIA").replace("%1", label)}
                      onClick={() => {
                        stopListening();
                        resetShortcutBinding(name);
                        setPendingFocus({ kind: "edit", name });
                        setStatus(t("SHORTCUTS_HELP_RESET_DONE").replace("%1", label));
                      }}
                    >
                      {t("SHORTCUTS_HELP_RESET_ONE")}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {hasCustomShortcutBindings() && (
        <button
          type="button"
          className="toolbar-btn shortcuts-help-reset-all"
          onClick={() => {
            stopListening();
            resetAllShortcutBindings();
            setPendingFocus({ kind: "close" });
            setStatus(t("SHORTCUTS_HELP_RESET_ALL_DONE"));
          }}
        >
          {t("SHORTCUTS_HELP_RESET_ALL")}
        </button>
      )}
    </section>
  );
}

export function HelpDialogs() {
  const shortcutsDialog = useRef<HTMLDialogElement>(null);
  const tutorialDialog = useRef<HTMLDialogElement>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [shortcutsRevision, setShortcutsRevision] = useState(0);
  const [, setTutorialRevision] = useState(0);

  useEffect(() => subscribeShortcutEditState(() => setShortcutsRevision((value) => value + 1)), []);

  useEffect(() => {
    const openShortcuts = (): void => {
      setPendingFocus({ kind: "close" });
      setShortcutsOpen(true);
      setShortcutsRevision((value) => value + 1);
    };
    const refreshShortcuts = (): void => setShortcutsRevision((value) => value + 1);
    const openTutorial = (event: Event): void => {
      const step = (event as CustomEvent<{ step?: number }>).detail?.step ?? 0;
      setTutorialStep(Math.max(0, Math.min(step, TUTORIAL_STEP_COUNT - 1)));
      setTutorialOpen(true);
    };
    const refreshTutorial = (): void => setTutorialRevision((value) => value + 1);

    window.addEventListener(SHORTCUTS_HELP_OPEN_EVENT, openShortcuts);
    window.addEventListener(SHORTCUTS_HELP_REFRESH_EVENT, refreshShortcuts);
    window.addEventListener(KEYBOARD_TUTORIAL_OPEN_EVENT, openTutorial);
    window.addEventListener(KEYBOARD_TUTORIAL_REFRESH_EVENT, refreshTutorial);
    return () => {
      window.removeEventListener(SHORTCUTS_HELP_OPEN_EVENT, openShortcuts);
      window.removeEventListener(SHORTCUTS_HELP_REFRESH_EVENT, refreshShortcuts);
      window.removeEventListener(KEYBOARD_TUTORIAL_OPEN_EVENT, openTutorial);
      window.removeEventListener(KEYBOARD_TUTORIAL_REFRESH_EVENT, refreshTutorial);
    };
  }, []);

  useEffect(() => {
    const dialog = shortcutsDialog.current;
    if (!dialog) return;
    if (shortcutsOpen && !dialog.open) dialog.showModal();
    if (!shortcutsOpen && dialog.open) dialog.close();
    document.getElementById(BUTTON_ID)?.classList.toggle("is-active", shortcutsOpen);
  }, [shortcutsOpen]);

  useEffect(() => {
    const dialog = tutorialDialog.current;
    if (!dialog) return;
    if (tutorialOpen && !dialog.open) dialog.showModal();
    if (!tutorialOpen && dialog.open) dialog.close();
  }, [tutorialOpen]);

  useEffect(() => {
    if (!shortcutsOpen) return;
    const focus = takePendingFocus();
    if (focus) restoreFocus(focus);
  }, [shortcutsOpen, shortcutsRevision]);

  const closeShortcuts = (): void => shortcutsDialog.current?.close();
  const closeTutorial = (): void => tutorialDialog.current?.close();
  const handleBackdrop = (event: MouseEvent<HTMLDialogElement>, close: () => void): void => {
    if (event.target === event.currentTarget) close();
  };
  const tutorialContent = getKeyboardTutorialContent(tutorialStep);
  const colAction = t("SHORTCUTS_HELP_COL_ACTION");
  const colKeys = t("SHORTCUTS_HELP_COL_KEYS");
  return (
    <>
      <dialog
        id={DIALOG_ID}
        ref={shortcutsDialog}
        className="shortcuts-help-dialog"
        aria-labelledby={TITLE_ID}
        onClick={(event) => handleBackdrop(event, closeShortcuts)}
        onClose={() => {
          setShortcutsOpen(false);
          closeShortcutsHelp();
        }}
        onCancel={(event) => {
          if (isListening()) {
            event.preventDefault();
            cancelListeningCapture(() => window.dispatchEvent(new Event(SHORTCUTS_HELP_REFRESH_EVENT)));
          }
        }}
      >
        <h2 id={TITLE_ID} className="shortcuts-help-dialog__title" tabIndex={-1}>
          {t("SHORTCUTS_HELP_TITLE")}
        </h2>
        <div id="shortcuts-help-content" className="shortcuts-help-dialog__content">
          <ShortcutTable
            heading={t("SHORTCUTS_HELP_SECTION_SHELL")}
            rows={shellRows()}
            colAction={colAction}
            colKeys={colKeys}
          />
          <ShortcutTable
            heading={blocklyMsg("SHORTCUTS_CODE_NAVIGATION")}
            rows={navigationHintRows()}
            colAction={colAction}
            colKeys={colKeys}
          />
          <EditableShortcuts />
        </div>
        <button
          type="button"
          id={CLOSE_ID}
          className="shortcuts-help-dialog__close toolbar-btn"
          aria-label={t("SHORTCUTS_HELP_CLOSE")}
          onClick={closeShortcuts}
        >
          {t("SHORTCUTS_HELP_CLOSE")}
        </button>
      </dialog>

      <dialog
        id={TUTORIAL_DIALOG_ID}
        ref={tutorialDialog}
        className="keyboard-tutorial-dialog shortcuts-help-dialog"
        aria-labelledby={TUTORIAL_TITLE_ID}
        onClick={(event) => handleBackdrop(event, closeTutorial)}
        onClose={() => setTutorialOpen(false)}
      >
        <h2 id={TUTORIAL_TITLE_ID} className="shortcuts-help-dialog__title">
          {tutorialText("KEYBOARD_TUTORIAL_TITLE")}
        </h2>
        <p id={TUTORIAL_PROGRESS_ID} className="keyboard-tutorial-dialog__progress">
          {tutorialStep + 1} / {TUTORIAL_STEP_COUNT} — {tutorialContent.title}
        </p>
        <div id={TUTORIAL_BODY_ID} className="keyboard-tutorial-dialog__body shortcuts-help-dialog__content">
          {tutorialContent.body}
        </div>
        <div className="keyboard-tutorial-dialog__nav">
          <button type="button" className="toolbar-btn" disabled={tutorialStep === 0} onClick={() => setTutorialStep((step) => Math.max(0, step - 1))}>
            {tutorialText("KEYBOARD_TUTORIAL_PREV")}
          </button>
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => tutorialStep === TUTORIAL_STEP_COUNT - 1 ? closeTutorial() : setTutorialStep((step) => step + 1)}
          >
            {tutorialText(tutorialStep === TUTORIAL_STEP_COUNT - 1 ? "KEYBOARD_TUTORIAL_CLOSE" : "KEYBOARD_TUTORIAL_NEXT")}
          </button>
          <button type="button" className="toolbar-btn" onClick={closeTutorial}>
            {tutorialText("KEYBOARD_TUTORIAL_SKIP")}
          </button>
        </div>
        <button
          type="button"
          className="keyboard-tutorial-dialog__dismiss"
          onClick={() => {
            dismissKeyboardTutorial();
            closeTutorial();
          }}
        >
          {tutorialText("KEYBOARD_TUTORIAL_DONT_SHOW")}
        </button>
        <button
          type="button"
          className="shortcuts-help-dialog__close toolbar-btn"
          aria-label={tutorialText("KEYBOARD_TUTORIAL_CLOSE")}
          onClick={closeTutorial}
        >
          {tutorialText("KEYBOARD_TUTORIAL_CLOSE")}
        </button>
      </dialog>
    </>
  );
}
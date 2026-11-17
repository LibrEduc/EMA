import { useLayoutEffect, useRef, type ChangeEvent } from "react";
import {
  basic_toolbox,
  getToolboxWithoutBoardCategory,
} from "../toolbox";
import { changeLanguageToolbox, getLangParamFromUrl } from "../language";
import { registerUcBlocklyKernel } from "../core/register";
import { registerWorkspaceForSvgResize } from "../workspace_resize";
import { restoreLayoutFromSessionStorage, primeWorkspaceContainerDimensions } from "../demo/demo_layout";
import {
  reportMissingDemoShellDom,
  resolveDemoShellDom,
} from "../demo/demo_dom";
import { startDemoLifecycle } from "../demo/demo_lifecycle";
import { BlocklyApplication } from "../blockly_application_type";
import { createDemoUiActions, type DemoUiActions } from "../demo/demo_ui_handlers";
import { AppShell } from "./components/AppShell";
import type { AppShellProps } from "./components/AppShell";
import { initializeDesktopMenu } from "./desktop_menu";
import "../css/index.css";
import "../css/µcBlockly.css";
import "./react-app.css";

export function ReactDemoApplication() {
  const booted = useRef(false);
  const actions = useRef<DemoUiActions | null>(null);

  const shellActions: AppShellProps = {
    onSave: () => actions.current?.save(),
    onLoad: () => actions.current?.openFilePicker(),
    onLoadFileChange: (event: ChangeEvent<HTMLInputElement>) => actions.current?.loadFile(event),
    onUndo: () => actions.current?.undo(),
    onRedo: () => actions.current?.redo(),
    onLanguageChange: (event) => actions.current?.changeLanguage(event),
    onThemeChange: (event) => actions.current?.changeTheme(event),
    onRendererChange: (event) => actions.current?.changeRenderer(event),
    onBoardChange: (event) => actions.current?.changeBoard(event),
    onMinimapChange: (event) => actions.current?.toggleMinimap(event),
    onHighlightChange: (event) => actions.current?.toggleHighlight(event),
    onContinuousToolboxChange: (event) => actions.current?.toggleContinuousToolbox(event),
    onFlyoutPinChange: (event) => actions.current?.togglePinnedFlyout(event),
    onCodeEditorChange: (event) => actions.current?.toggleCodeEditor(event),
    onDebugChange: (event) => actions.current?.toggleDebug(event),
  };

  useLayoutEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const resolved = resolveDemoShellDom();
    if (!resolved.ok) {
      reportMissingDemoShellDom(resolved.missing);
      throw new Error(
        `µcBlockly demo: missing required DOM element(s): ${resolved.missing.join(", ")}`,
      );
    }

    const elements = resolved.elements;
    elements.contentMonacoEditor.style.display = "none";
    restoreLayoutFromSessionStorage();
    registerUcBlocklyKernel();
    primeWorkspaceContainerDimensions(elements);

    const initialToolbox = getToolboxWithoutBoardCategory(basic_toolbox);
    const application = new BlocklyApplication(
      basic_toolbox,
      {
        grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
        scrollbars: true,
        toolbox: changeLanguageToolbox(getLangParamFromUrl(), initialToolbox),
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 6,
          minScale: 0.1,
          scaleSpeed: 1.2,
          pinch: true,
        },
        trashcan: true,
        media: "./media/",
      },
      elements.workspaceContentBlockly,
      elements.contentCode,
    );

    application.LANGUAGE_NAME = {
      ar: "العربية",
      en: "english",
      es: "español",
      fr: "français",
    };
    application.LANGUAGE_RTL = ["ar", "fa", "he", "lki"];

    actions.current = createDemoUiActions({ µcB: application, elements });
    registerWorkspaceForSvgResize(application.workspace);
    startDemoLifecycle({ µcB: application, elements, wireUiHandlers: false });
    initializeDesktopMenu();
  }, []);

  return <AppShell {...shellActions} />;
}

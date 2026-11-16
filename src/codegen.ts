import * as Blockly from "blockly";
import { arduinoGenerator } from "µcBlockly/core";
import { micropythonGenerator } from "./generators/micropython";

export type CodeTarget = "arduino" | "micropython";

const TARGET_KEY = "ema.codeTarget";

export function loadCodeTarget(): CodeTarget {
  try {
    const saved = window.localStorage.getItem(TARGET_KEY);
    if (saved === "micropython" || saved === "arduino") {
      return saved;
    }
  } catch {
    // ignore
  }
  return "arduino";
}

export function saveCodeTarget(target: CodeTarget): void {
  try {
    window.localStorage.setItem(TARGET_KEY, target);
  } catch {
    // ignore
  }
}

export function generateCode(
  workspace: Blockly.Workspace,
  target: CodeTarget,
): string {
  try {
    if (target === "micropython") {
      return micropythonGenerator.workspaceToCode(workspace);
    }
    return arduinoGenerator.workspaceToCode(workspace);
  } catch (error) {
    console.error("[EMA] génération code:", error);
    return `// Erreur de génération (${target})\n// ${String(error)}`;
  }
}

/** Place un bloc setup+loop si le workspace est vide (sinon le générateur Arduino renvoie ""). */
export function seedProgramStructure(workspace: Blockly.WorkspaceSvg): void {
  if (workspace.getTopBlocks(false).length > 0) {
    return;
  }
  const block = workspace.newBlock("board_base_setup_loop");
  block.initSvg();
  block.render();
  block.moveBy(40, 40);
  if (typeof block.setDeletable === "function") {
    block.setDeletable(false);
  }
}

export function bindCodePanel(
  workspace: Blockly.Workspace,
  codeRoot: HTMLElement,
  getTarget: () => CodeTarget,
): () => void {
  let timer: number | null = null;

  const refresh = (): void => {
    const code = generateCode(workspace, getTarget());
    codeRoot.textContent =
      code.trim().length > 0
        ? code
        : getTarget() === "micropython"
          ? "# Ajoutez des blocs (setup / loop) pour générer du MicroPython."
          : "// Ajoutez des blocs (setup / loop) pour générer du C Arduino.";
  };

  const schedule = (): void => {
    if (timer !== null) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      timer = null;
      refresh();
    }, 120);
  };

  workspace.addChangeListener((event: Blockly.Events.Abstract) => {
    if (event.isUiEvent) {
      return;
    }
    if ((workspace as Blockly.WorkspaceSvg).isDragging?.()) {
      return;
    }
    schedule();
  });

  refresh();
  return refresh;
}

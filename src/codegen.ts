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

export interface UnsupportedBlock {
  readonly id: string;
  readonly type: string;
  /** Texte lisible du bloc (saisi par l'élève), vide s'il n'en a aucun. */
  readonly label: string;
}

export type GenerationResult =
  | { readonly ok: true; readonly code: string }
  | {
      readonly ok: false;
      readonly error: unknown;
      readonly unsupportedBlocks: ReadonlyArray<UnsupportedBlock>;
    };

const BLOCK_LABEL_MAX_LENGTH = 40;

function hasGenerator(target: CodeTarget, blockType: string): boolean {
  const generator =
    target === "micropython" ? micropythonGenerator : arduinoGenerator;
  return typeof generator.forBlock[blockType] === "function";
}

// toString() renvoie des "?" pour les entrées vides : un bloc sans texte
// (comme libre_start) n'a alors aucun libellé lisible.
const READABLE_TEXT = /[\p{L}\p{N}]/u;

function labelOf(block: Blockly.Block): string {
  const text = block.toString(BLOCK_LABEL_MAX_LENGTH).trim();
  return READABLE_TEXT.test(text) ? text : "";
}

/** Enabled blocks without a generator: the ones that make generation throw. */
function findUnsupportedBlocks(
  workspace: Blockly.Workspace,
  target: CodeTarget,
): UnsupportedBlock[] {
  return workspace
    .getAllBlocks(false)
    .filter((block) => block.isEnabled() && !hasGenerator(target, block.type))
    .map((block) => ({
      id: block.id,
      type: block.type,
      label: labelOf(block),
    }));
}

export function tryGenerateCode(
  workspace: Blockly.Workspace,
  target: CodeTarget,
): GenerationResult {
  try {
    const code =
      target === "micropython"
        ? micropythonGenerator.workspaceToCode(workspace)
        : arduinoGenerator.workspaceToCode(workspace);
    return { ok: true, code };
  } catch (error) {
    console.error("[EMA] génération code:", error);
    return {
      ok: false,
      error,
      unsupportedBlocks: findUnsupportedBlocks(workspace, target),
    };
  }
}

export function generateCode(
  workspace: Blockly.Workspace,
  target: CodeTarget,
): string {
  const result = tryGenerateCode(workspace, target);
  if (result.ok) {
    return result.code;
  }
  return `// Erreur de génération (${target})\n// ${String(result.error)}`;
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

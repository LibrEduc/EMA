/**
 * Typographie accessibilité EMA : taille globale (slider) + police lisible.
 * Inspiré des réglages a11y usuels (µcBlockly / widgets lecture) + WCAG G178.
 */

import * as Blockly from "blockly";

export const TEXT_SIZE_KEY = "ema.textSizePercent";
export const FONT_KEY = "ema.uiFont";

/** Pourcentage de la taille racine (100 = défaut navigateur, max 200 = G178). */
export const TEXT_SIZE_MIN = 100;
export const TEXT_SIZE_MAX = 200;
export const TEXT_SIZE_STEP = 5;
export const TEXT_SIZE_DEFAULT = 100;

export type UiFontId =
  | "system"
  | "atkinson"
  | "lexend"
  | "opendyslexic"
  | "verdana";

export const UI_FONTS: ReadonlyArray<{
  id: UiFontId;
  stack: string;
}> = [
  {
    id: "system",
    stack: 'system-ui, "Segoe UI", "Helvetica Neue", sans-serif',
  },
  {
    id: "atkinson",
    stack: '"Atkinson Hyperlegible", system-ui, sans-serif',
  },
  {
    id: "lexend",
    stack: '"Lexend", system-ui, sans-serif',
  },
  {
    id: "opendyslexic",
    stack: '"OpenDyslexic", "Comic Sans MS", cursive, sans-serif',
  },
  {
    id: "verdana",
    stack: "Verdana, Geneva, sans-serif",
  },
];

export function isUiFontId(value: string): value is UiFontId {
  return UI_FONTS.some((f) => f.id === value);
}

export function fontStackFor(id: UiFontId): string {
  return UI_FONTS.find((f) => f.id === id)?.stack ?? UI_FONTS[0].stack;
}

/** Migre l’ancien select (1 / 1.15 / 1.35) vers un pourcentage. */
export function normalizeTextSizePercent(raw: string | null): number {
  if (!raw) {
    return TEXT_SIZE_DEFAULT;
  }
  if (raw === "1") return 100;
  if (raw === "1.15") return 115;
  if (raw === "1.35") return 135;
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return TEXT_SIZE_DEFAULT;
  }
  if (n > 0 && n <= 3) {
    return clampPercent(Math.round(n * 100));
  }
  return clampPercent(Math.round(n));
}

function clampPercent(value: number): number {
  const stepped =
    Math.round((value - TEXT_SIZE_MIN) / TEXT_SIZE_STEP) * TEXT_SIZE_STEP +
    TEXT_SIZE_MIN;
  return Math.min(TEXT_SIZE_MAX, Math.max(TEXT_SIZE_MIN, stepped));
}

export function loadTextSizePercent(): number {
  try {
    const modern = window.localStorage.getItem(TEXT_SIZE_KEY);
    if (modern) {
      return normalizeTextSizePercent(modern);
    }
    const legacy = window.localStorage.getItem("ema.textScale");
    if (legacy) {
      return normalizeTextSizePercent(legacy);
    }
  } catch {
    // ignore
  }
  return TEXT_SIZE_DEFAULT;
}

export function loadUiFont(): UiFontId {
  try {
    const raw = window.localStorage.getItem(FONT_KEY);
    if (raw && isUiFontId(raw)) {
      return raw;
    }
  } catch {
    // ignore
  }
  return "system";
}

export function applyShellTypography(percent: number, fontId: UiFontId): void {
  const size = clampPercent(percent);
  const stack = fontStackFor(fontId);
  const root = document.documentElement;
  root.style.fontSize = `${size}%`;
  root.style.setProperty("--ema-text-scale", String(size / 100));
  root.style.setProperty("--ema-ui-font", stack);
  root.dataset.emaFont = fontId;
  document.body.style.fontFamily = stack;

  try {
    window.localStorage.setItem(TEXT_SIZE_KEY, String(size));
    window.localStorage.setItem(FONT_KEY, fontId);
  } catch {
    // ignore
  }
}

/** Applique police + taille aux textes Blockly (blocs, menus, champs). */
export function applyBlocklyTypography(
  workspace: Blockly.WorkspaceSvg,
  percent: number,
  fontId: UiFontId,
): void {
  void percent; // déjà appliqué sur <html> via applyShellTypography
  const stack = fontStackFor(fontId);
  // Aligne le thème sur --ema-blockly-font (0.875rem) = toolbox = flyout = blocs.
  const rootPx =
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize) ||
    16;
  const themeSize = Math.max(10, Math.round(rootPx * 0.875));

  const theme = workspace.getTheme();
  const current = theme.fontStyle ?? {};
  theme.setFontStyle({
    family: stack,
    weight: current.weight ?? "bold",
    size: themeSize,
  });
  workspace.refreshTheme();

  for (const block of workspace.getAllBlocks(false)) {
    block.initSvg();
    block.queueRender();
  }

  const flyout = workspace.getFlyout();
  const flyoutWs = flyout?.getWorkspace?.();
  if (flyoutWs) {
    flyoutWs.getTheme().setFontStyle({
      family: stack,
      weight: current.weight ?? "bold",
      size: themeSize,
    });
    flyoutWs.refreshTheme();
    for (const block of flyoutWs.getAllBlocks(false)) {
      block.initSvg();
      block.queueRender();
    }
  }

  // Rebuild flyout labels (largeur/padding) à la nouvelle métrique texte.
  const toolbox = workspace.getToolbox();
  if (toolbox && "refreshSelection" in toolbox) {
    (toolbox as { refreshSelection: () => void }).refreshSelection();
  }

  Blockly.svgResize(workspace);
}

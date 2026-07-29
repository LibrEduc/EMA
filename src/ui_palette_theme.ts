/**
 * @packageDocumentation
 * @module UiPaletteTheme
 * @description Syncs the HTML shell and Monaco with the selected Blockly theme.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { µcB_codeEditor } from "./code_editor";
import { themeMappings } from "./options";

export type UiThemeMode = "light" | "dark" | "high-contrast";

type Rgb = { r: number; g: number; b: number };

const clamp = (value: number): number => Math.max(0, Math.min(255, Math.round(value)));

const toHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;

const parseColor = (raw: string | undefined): Rgb | null => {
  if (!raw) {
    return null;
  }
  const value = raw.trim().toLowerCase();
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
    return null;
  }
  const rgb = value.match(/^rgba?\(([^)]+)\)$/);
  if (!rgb) {
    return null;
  }
  const parts = rgb[1].split(",").map((p) => Number(p.trim()));
  if (parts.length < 3 || parts.some((p) => !Number.isFinite(p))) {
    return null;
  }
  return { r: clamp(parts[0]), g: clamp(parts[1]), b: clamp(parts[2]) };
};

const mix = (a: Rgb, b: Rgb, ratio: number): Rgb => ({
  r: clamp(a.r + (b.r - a.r) * ratio),
  g: clamp(a.g + (b.g - a.g) * ratio),
  b: clamp(a.b + (b.b - a.b) * ratio),
});

const relativeLuminance = (c: Rgb): number => {
  const channel = (x: number): number => {
    const value = x / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
};

const contrastRatio = (a: Rgb, b: Rgb): number => {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
};

const textOn = (bg: Rgb): Rgb => {
  const white = { r: 248, g: 250, b: 252 };
  const black = { r: 17, g: 24, b: 39 };
  return contrastRatio(white, bg) >= contrastRatio(black, bg) ? white : black;
};

const ensureContrast = (
  candidate: Rgb,
  against: Rgb,
  minRatio: number,
  preferLighten: boolean,
): Rgb => {
  let out = candidate;
  if (contrastRatio(out, against) >= minRatio) {
    return out;
  }
  const toward = preferLighten ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  for (let i = 1; i <= 10; i += 1) {
    const mixed = mix(out, toward, i * 0.08);
    if (contrastRatio(mixed, against) >= minRatio) {
      out = mixed;
      break;
    }
    out = mixed;
  }
  return out;
};

/**
 * Résout le mode coque (clair / sombre / contraste élevé) à partir du thème Blockly.
 */
export const resolveUiThemeMode = (
  themeKey: string,
  isDarkWorkspace: boolean,
): UiThemeMode => {
  if (themeKey === "high_contrast" || themeKey === "blackWhite") {
    return "high-contrast";
  }
  if (isDarkWorkspace || themeKey === "dark") {
    return "dark";
  }
  return "light";
};

/**
 * Dérive les variables CSS de la coque et le thème Monaco depuis le thème Blockly actif.
 * @param themeKey - Clé du thème ; par défaut la valeur du menu `#themeMenu`.
 */
export const syncUiPaletteTheme = (themeKey?: string): void => {
  const menu = document.getElementById("themeMenu") as HTMLSelectElement | null;
  const selectedThemeKey = String(themeKey || menu?.value || "classic");
  const selectedTheme =
    themeMappings[selectedThemeKey] ?? themeMappings.classic;
  const styles = selectedTheme.componentStyles ?? {};
  const workspace = parseColor(styles.workspaceBackgroundColour) ?? { r: 248, g: 250, b: 252 };
  const toolbox = parseColor(styles.toolboxBackgroundColour) ?? mix(workspace, { r: 226, g: 232, b: 240 }, 0.45);
  const flyout = parseColor(styles.flyoutBackgroundColour) ?? mix(toolbox, workspace, 0.4);
  const toolboxFg =
    parseColor(styles.toolboxForegroundColour) ??
    parseColor(styles.flyoutForegroundColour) ??
    textOn(toolbox);
  const accent = parseColor(styles.markerColour) ?? parseColor(styles.cursorColour) ?? { r: 11, g: 87, b: 208 };
  const scrollbar = parseColor(styles.scrollbarColour) ?? mix(toolbox, textOn(toolbox), 0.45);
  const isDark = relativeLuminance(workspace) < 0.35;
  const uiThemeMode = resolveUiThemeMode(selectedThemeKey, isDark);

  const panelCodeBg = mix(workspace, flyout, isDark ? 0.35 : 0.15);
  const panelConsoleBg = mix(toolbox, flyout, isDark ? 0.5 : 0.35);
  const panelRightBg = mix(workspace, toolbox, isDark ? 0.45 : 0.3);
  const panelBottomBg = mix(flyout, toolbox, isDark ? 0.55 : 0.45);
  const resizerBg = mix(workspace, toolbox, isDark ? 0.6 : 0.5);
  const topbarBg = mix(toolbox, workspace, isDark ? 0.35 : 0.2);
  const topbarFg = ensureContrast(toolboxFg, topbarBg, 4.5, isDark);
  const controlBg = mix(topbarBg, flyout, isDark ? 0.25 : 0.15);
  const controlFg = ensureContrast(topbarFg, controlBg, 4.5, isDark);
  const controlBorder = ensureContrast(mix(controlBg, accent, 0.35), controlBg, 3, !isDark);
  const controlHover = mix(controlBg, controlFg, isDark ? 0.18 : 0.08);

  const toggleBase = mix(resizerBg, accent, isDark ? 0.22 : 0.14);
  const toggleBg = ensureContrast(toggleBase, resizerBg, 1.35, isDark);
  const toggleFg = textOn(toggleBg);
  const toggleHoverCandidate = mix(toggleBg, toggleFg, isDark ? 0.22 : 0.1);
  const toggleHover = ensureContrast(toggleHoverCandidate, resizerBg, 1.45, isDark);
  const toggleBorderCandidate = mix(toggleBg, accent, isDark ? 0.45 : 0.35);
  const toggleBorder = ensureContrast(toggleBorderCandidate, toggleBg, 1.3, !isDark);

  const boardGroupBg = mix(toolbox, flyout, isDark ? 0.4 : 0.3);
  const boardGroupFg = ensureContrast(textOn(boardGroupBg), boardGroupBg, 4.5, isDark);
  const boardOptionBg = mix(controlBg, workspace, isDark ? 0.2 : 0.1);
  const boardOptionFg = ensureContrast(controlFg, boardOptionBg, 4.5, isDark);

  document.documentElement.dataset.uiTheme = uiThemeMode;
  µcB_codeEditor.applyTheme(uiThemeMode);

  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--panel-code-bg", toHex(panelCodeBg.r, panelCodeBg.g, panelCodeBg.b));
  {
    const fg = textOn(panelCodeBg);
    rootStyle.setProperty("--panel-code-fg", toHex(fg.r, fg.g, fg.b));
  }
  rootStyle.setProperty("--panel-console-bg", toHex(panelConsoleBg.r, panelConsoleBg.g, panelConsoleBg.b));
  {
    const fg = textOn(panelConsoleBg);
    rootStyle.setProperty("--panel-console-fg", toHex(fg.r, fg.g, fg.b));
  }
  rootStyle.setProperty("--panel-right-bg", toHex(panelRightBg.r, panelRightBg.g, panelRightBg.b));
  rootStyle.setProperty("--panel-bottom-bg", toHex(panelBottomBg.r, panelBottomBg.g, panelBottomBg.b));
  rootStyle.setProperty("--resizer-bg", toHex(resizerBg.r, resizerBg.g, resizerBg.b));
  rootStyle.setProperty("--resizer-color", toHex(scrollbar.r, scrollbar.g, scrollbar.b));
  rootStyle.setProperty("--resizer-focus", toHex(accent.r, accent.g, accent.b));
  rootStyle.setProperty("--focus-ring", toHex(accent.r, accent.g, accent.b));
  rootStyle.setProperty("--toggle-bg", toHex(toggleBg.r, toggleBg.g, toggleBg.b));
  rootStyle.setProperty("--toggle-bg-hover", toHex(toggleHover.r, toggleHover.g, toggleHover.b));
  rootStyle.setProperty("--toggle-border", toHex(toggleBorder.r, toggleBorder.g, toggleBorder.b));
  rootStyle.setProperty("--toggle-fg", toHex(toggleFg.r, toggleFg.g, toggleFg.b));
  rootStyle.setProperty("--topbar-bg", toHex(topbarBg.r, topbarBg.g, topbarBg.b));
  rootStyle.setProperty("--topbar-fg", toHex(topbarFg.r, topbarFg.g, topbarFg.b));
  rootStyle.setProperty("--topbar-control-bg", toHex(controlBg.r, controlBg.g, controlBg.b));
  rootStyle.setProperty("--topbar-control-fg", toHex(controlFg.r, controlFg.g, controlFg.b));
  rootStyle.setProperty("--topbar-control-border", toHex(controlBorder.r, controlBorder.g, controlBorder.b));
  rootStyle.setProperty("--topbar-control-hover", toHex(controlHover.r, controlHover.g, controlHover.b));
  rootStyle.setProperty("--board-group-bg", toHex(boardGroupBg.r, boardGroupBg.g, boardGroupBg.b));
  rootStyle.setProperty("--board-group-fg", toHex(boardGroupFg.r, boardGroupFg.g, boardGroupFg.b));
  rootStyle.setProperty("--board-option-bg", toHex(boardOptionBg.r, boardOptionBg.g, boardOptionBg.b));
  rootStyle.setProperty("--board-option-fg", toHex(boardOptionFg.r, boardOptionFg.g, boardOptionFg.b));
};

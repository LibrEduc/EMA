/**
 * @packageDocumentation
 * @module UcBlocklyHost
 * @description Host-app helpers for products embedding µcBlockly (e.g. BlocklyDuino).
 * @remarks
 * Complements the UcBlocklyCore module with theme/palette, language DOM,
 * boards, a11y/shell helpers — without being part of the lean kernel API.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
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

/** Theme instances + UI chrome palette sync (may touch Monaco if present). */
export { themeMappings } from "../options";
export { syncUiPaletteTheme } from "../ui_palette_theme";

/** Lazy Monaco editor for the generated-code panel. */
export {
  LazyMonacoEditor,
  µcB_codeEditor,
  type MonacoThemeId,
} from "../code_editor";

/** Toolbox / language for host remounts and label updates. */
export {
  changeLanguageToolbox,
  HTML_changeLanguage,
} from "../language";
export { registerToolboxSearchI18n } from "../toolbox_search_i18n";

/** Board profiles + pin dropdown refresh. */
export { BOARD_PROFILES, DEFAULT_BOARD_ID } from "../boards";
export { refreshBoardPinDropdowns } from "../categories/blockly/board";

/** Continuous toolbox metrics (register in host before enabling plugin). */
export { ContinuousMetricsOverlayFlyout } from "../continuous_metrics_overlay_flyout";

/** Accessibility / keyboard shell helpers. */
export { getA11yLabel } from "../a11y_labels";
export {
  focusBlocklyToolbox,
  focusBlocklyWorkspace,
  registerShellBlocklyWorkspace,
} from "../blockly_shell_focus";
export {
  refreshShortcutsHelp,
  registerShortcutsHelp,
} from "../shell_shortcuts_help";
export {
  registerBlocklyA11yExtensions,
  refreshBlocklyA11yExtensions,
} from "../blockly_a11y_extensions";
export { registerKeyboardTutorial } from "../shell_keyboard_tutorial";

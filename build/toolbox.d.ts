/**
 * @packageDocumentation
 * @module Toolbox
 * @description Toolbox configuration and block definitions for µcBlockly
 * @remarks
 * Defines toolbox categories, labels, and block lists.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */
/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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
 * along with this program.  If not, see \<https://www.gnu.org/licenses/\>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import '@blockly/field-angle';
/**
 * Block entry in a toolbox category (flat block with type).
 */
type ToolboxBlockEntry = {
    kind: string;
    type: string;
    fields?: {
        [key: string]: number | string;
    };
    inputs?: {
        [key: string]: {
            shadow?: {
                type?: string;
                fields?: {
                    [key: string]: number | string;
                };
            };
            block?: {
                type: string;
            };
        };
    };
};
/**
 * Category entry: can contain blocks or nested subcategories (sous-menus).
 */
type ToolboxCategoryContentEntry = ToolboxBlockEntry | {
    kind: string;
    name?: string;
    categorystyle?: string;
    custom?: string;
    contents?: ToolboxCategoryContentEntry[];
};
/**
 * Top-level toolbox configuration.
 * @param kind - "categoryToolbox".
 * @param contents - Array of categories (each may have nested subcategories in contents).
 */
export type ToolboxConfiguration = {
    kind: string;
    contents: Array<{
        kind: string;
        name?: string;
        categorystyle?: string;
        custom?: string;
        contents?: ToolboxCategoryContentEntry[];
        blockxml?: string;
    }>;
};
export declare const basic_toolbox: ToolboxConfiguration;
/**
 * Returns a deep clone of the toolbox with the board category (CAT_BOARD) removed.
 * Used when no board is selected so the toolbox does not show board blocks.
 */
export declare function getToolboxWithoutBoardCategory(toolbox: ToolboxConfiguration): ToolboxConfiguration;
/**
 * Returns the toolbox to use for the workspace: without the board category if
 * no board is selected, otherwise a clone of the full toolbox.
 * Read the current selection from the board menu in the DOM.
 */
export declare function getToolboxForCurrentBoard(toolbox: ToolboxConfiguration): ToolboxConfiguration;
export {};
//# sourceMappingURL=toolbox.d.ts.map
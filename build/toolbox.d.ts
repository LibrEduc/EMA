/**
 * @packageDocumentation
 * @module Toolbox
 * @description Toolbox configuration and block definitions for µcBlockly
 * @author scanet\@libreduc.cc (Sébastien Canet)
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
 * The above type represents the configuration of a toolbox in TypeScript, which includes
 * various kinds of blocks and their properties.
 * @param kind - The "kind" property in the ToolboxConfiguration type represents the
 * type or category of the toolbox item. It can be a string value that describes the kind of
 * item, such as "category", "block", or "separator".
 * @param contents - The `contents` property is an array that contains objects with the
 * following properties:
 */
export type ToolboxConfiguration = {
    kind: string;
    contents: Array<{
        kind: string;
        name?: string;
        categorystyle?: string;
        custom?: string;
        contents?: Array<{
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
        }>;
        blockxml?: string;
    }>;
};
export declare const basic_toolbox: ToolboxConfiguration;
//# sourceMappingURL=toolbox.d.ts.map
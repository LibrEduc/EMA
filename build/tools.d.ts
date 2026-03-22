/**
 * @packageDocumentation
 * @module Tools
 * @description Utility functions and tools for µcBlockly
 * @remarks
 * Small helpers for URL params and UI toggles.
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
/**
 * Adds or replaces a query parameter in a URL string.
 * @param url - Input URL string.
 * @param param - Query parameter name.
 * @param value - Query parameter value.
 * @returns Updated URL with the parameter applied.
 */
export declare const addReplaceParamToUrl: (url: string, param: string, value: string) => string;
/**
 * Builds pathname + updated search + hash for the current page (same-origin URL without host).
 * Use with {@link pushStateReplaceSearchParam} so the browser keeps the correct path and fragment (#).
 * @param param - Query parameter name.
 * @param value - New value for the parameter.
 * @returns Full path string suitable for `history.pushState` (pathname + search + hash).
 */
export declare function buildCurrentUrlWithSearchParam(param: string, value: string): string;
/**
 * Updates one query parameter and pushes history state (full pathname + search + hash).
 * @param param - Query parameter name.
 * @param value - New value for the parameter.
 */
export declare function pushStateReplaceSearchParam(param: string, value: string): void;
/**
 * Updates plugin flags in the URL based on a checkbox state.
 * @param pluginName - DOM checkbox element id.
 * @param pluginKey - URL key representing the plugin.
 */
export declare const setPluginsInURL: (pluginName: string, pluginKey: string) => void;
//# sourceMappingURL=tools.d.ts.map
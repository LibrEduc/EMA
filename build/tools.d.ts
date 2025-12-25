/**
 * @packageDocumentation
 * @module Tools
 * @description Utility functions and tools for µcBlockly
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
/**
 * The function adds or replaces a parameter and its value in a given URL.
 * @param url - The `url` parameter is a string representing the URL to which the parameter
 * needs to be added or replaced.
 * @param param - The `param` parameter is a string that represents the name of the query
 * parameter that you want to add or replace in the URL.
 * @param value - The `value` parameter is a string representing the value that you want to
 * add or replace for the specified parameter in the URL.
 * @returns The function `addReplaceParamToUrl` returns a modified version of the input `url` string
 * with the specified `param` and `value` added or replaced.
 */
export declare const addReplaceParamToUrl: (url: string, param: string, value: string) => string;
/**
 * The function `setPluginsInURL` updates the URL parameters based on the state of a checkbox for a
 * specific plugin.
 * @param pluginName - The `pluginName` parameter in the `setPluginsInURL` function is a
 * string that represents the name of a plugin.
 * @param pluginKey - The `pluginKey` parameter in the `setPluginsInURL` function is a string
 * that represents the key associated with a specific plugin. This key is used to identify the plugin
 * in the URL parameters when setting or updating the plugins in the URL.
 */
export declare const setPluginsInURL: (pluginName: string, pluginKey: string) => void;
//# sourceMappingURL=tools.d.ts.map
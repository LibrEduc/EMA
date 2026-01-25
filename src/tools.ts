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
export const addReplaceParamToUrl = (url: string, param: string, value: string): string => {
  const re = new RegExp("([?&])" + param + "=.*?(&|$)", "i");
  const separator = url.indexOf('?') !== -1 ? "&" : "?";
  if (re.exec(url)) {
    return url.replace(re, '$1' + param + "=" + value + '$2');
  } else {
    return url + separator + param + "=" + value;
  }
};

/**
 * Updates plugin flags in the URL based on a checkbox state.
 * @param pluginName - DOM checkbox element id.
 * @param pluginKey - URL key representing the plugin.
 */
export const setPluginsInURL = (pluginName: string, pluginKey: string): void => {
  const searchParams = new URLSearchParams(window.location.search);
  let paramsURL: string[] | null = [""];
  if (searchParams.get('options') !== null)
    paramsURL = searchParams.get('options')!.split(',');
  //clean array from all null or undefined entry
  paramsURL = paramsURL.filter(Boolean);

  let result: string = "";
  const checkBox: boolean = (document.getElementById(pluginName) as HTMLInputElement).checked;
  window.sessionStorage.setItem(pluginName, checkBox.toString());
  if (checkBox) {
    if (!paramsURL.includes(pluginKey)) {
      paramsURL.push(pluginKey);
    }
    result = paramsURL.join(',');
  } else {
    result = paramsURL.join(',');
    result = result.split(",").filter(n => n != pluginKey).join(",");
  }
  window.history.pushState({}, "µcB", addReplaceParamToUrl(window.location.search, "options", result));
}
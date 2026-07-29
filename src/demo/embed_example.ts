/**
 * @packageDocumentation
 * @module Demo.EmbedExample
 * @description µcBlockly module.
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

import "../block_plus_minus_init";
import "@blockly/toolbox-search";
import { registerToolboxSearchI18n } from "../toolbox_search_i18n";
import {
  basic_toolbox,
  createUcBlockly,
  getToolboxWithoutBoardCategory,
} from "../core";
import { changeLanguageToolbox, getLangParamFromUrl } from "../language";

registerToolboxSearchI18n();

const editorRoot = document.getElementById("ucblockly-editor");
const codeRoot = document.getElementById("ucblockly-code");

if (!editorRoot || !codeRoot) {
  throw new Error("embed-example: missing #ucblockly-editor or #ucblockly-code");
}

const language = getLangParamFromUrl();
const toolbox = getToolboxWithoutBoardCategory(
  changeLanguageToolbox(language, basic_toolbox),
);

const editor = createUcBlockly(editorRoot, {
  toolbox,
  language,
  media: "./media/",
  onCodeChange: (code) => {
    codeRoot.textContent = code;
  },
});

const onResize = (): void => {
  editor.resize();
};

window.addEventListener("resize", onResize);
onResize();

codeRoot.textContent = editor.getCode();

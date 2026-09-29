/**
 * @packageDocumentation
 * @module Demo.EmbedExample
 * @description µcBlockly module.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

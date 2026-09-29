/**
 * @packageDocumentation
 * @module Toolbox.Data
 * @description Assemble the default toolbox from per-category files.
 * @remarks
 * Beginners: edit one file under `src/toolbox/categories/` — see docs/MODIFIER_TOOLBOX.md.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import "@blockly/field-angle";
import { applyToolboxBlockLevels } from "./toolbox_types";
import { buildToolbox } from "./toolbox/builder";
import { searchCategory } from "./toolbox/categories/search";
import { libreCategory } from "./toolbox/categories/libre";
import { boardCategory } from "./toolbox/categories/board";
import { logicCategory } from "./toolbox/categories/logic";
import { loopsCategory } from "./toolbox/categories/loops";
import { mathsCategory } from "./toolbox/categories/maths";
import { textCategory } from "./toolbox/categories/text";
import { listsCategory } from "./toolbox/categories/lists";
import { colorCategory } from "./toolbox/categories/color";
import { sep1 } from "./toolbox/categories/sep_1";
import { variablesCategory } from "./toolbox/categories/variables";
import { functionsCategory } from "./toolbox/categories/functions";

/** Default toolbox assembled from `toolbox/categories/*`. */
export const basic_toolbox = applyToolboxBlockLevels(
  buildToolbox([
    searchCategory,
    libreCategory,
    boardCategory,
    logicCategory,
    loopsCategory,
    mathsCategory,
    textCategory,
    listsCategory,
    colorCategory,
    sep1,
    variablesCategory,
    functionsCategory,
  ]),
);

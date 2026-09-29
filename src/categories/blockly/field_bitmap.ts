/**
 * @packageDocumentation
 * @module BlocklyFields.FieldBitmap
 * @description Re-export of \@blockly/field-bitmap with CJS/ESM interop.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as FieldBitmapNS from "@blockly/field-bitmap";
import { namedExportFromCjsPlugin } from "../../utils/blockly_plugin_export";

export const FieldBitmap = namedExportFromCjsPlugin<
  typeof import("@blockly/field-bitmap").FieldBitmap
>(FieldBitmapNS, "FieldBitmap");

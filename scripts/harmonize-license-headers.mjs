#!/usr/bin/env node
import fs from "fs";
import path from "path";
import process from "process";

function walkTsFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkTsFiles(full, out);
    } else if (entry.name.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

const FULL_GPL = `/**
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
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */`;

const ASTUCE_MODIFICATIONS_GPL = `/**
 * @license
 * Modifications copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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
 */`;

const ABBREV_PATTERNS = [
  `/**
 * @license
 * Copyright 2023 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */`,
  `/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */`,
  `/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */`,
];

const APACHE_BLOCK = `/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */`;

const APACHE_REMARK =
  " * Original Blockly generator portions are under Apache-2.0. µcBlockly modifications under GPL-3.0-or-later.\n";

const GOOGLE_FILES = new Set([
  "src/generators/arduino/blocks/logic.ts",
  "src/generators/arduino/blocks/math.ts",
  "src/generators/arduino/blocks/math_helpers.ts",
  "src/generators/arduino/blocks/loops.ts",
  "src/generators/arduino/blocks/text.ts",
  "src/generators/arduino/blocks/text_helpers.ts",
  "src/generators/arduino/blocks/procedures.ts",
  "src/generators/arduino/blocks/colour.ts",
]);

let abbrevFiles = 0;
let googleFiles = 0;

for (const file of walkTsFiles("src")) {
  const normalized = path.relative(process.cwd(), file).split(path.sep).join("/");
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  for (const pattern of ABBREV_PATTERNS) {
    if (content.includes(pattern)) {
      content = content.split(pattern).join(FULL_GPL);
      changed = true;
    }
  }

  if (GOOGLE_FILES.has(normalized)) {
    if (
      content.includes(APACHE_BLOCK) &&
      !content.includes("Modifications copyright (C) 2023-2024 ASTUCE")
    ) {
      content = content.replace(
        APACHE_BLOCK,
        `${APACHE_BLOCK}\n\n${ASTUCE_MODIFICATIONS_GPL}`,
      );
      changed = true;
      googleFiles++;
    }
    if (!content.includes("Original Blockly generator portions are under Apache-2.0")) {
      content = content.replace(/@remarks\n/, `@remarks\n${APACHE_REMARK}`);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    abbrevFiles++;
  }
}

const variableScopePath = "src/generators/arduino/variable_scope.ts";
let variableScope = fs.readFileSync(variableScopePath, "utf8");
if (!variableScope.includes("@author scanet")) {
  variableScope = variableScope.replace(
    " * @license GPL-3.0-or-later\n */",
    " * @author scanet@libreduc.cc (Sébastien Canet)\n * @license GPL-3.0-or-later\n * @version 1.0.0\n * @since 1.0.0\n */",
  );
  fs.writeFileSync(variableScopePath, variableScope);
}

const logicPath = "src/generators/arduino/blocks/logic.ts";
let logic = fs.readFileSync(logicPath, "utf8");
logic = logic.replace(
  /\n\/\/ Former goog\.module ID: Blockly\.JavaScript\.logic\n\n/,
  "\n",
);
fs.writeFileSync(logicPath, logic);

console.log(`Updated abbreviated GPL headers in ${abbrevFiles} file(s).`);
console.log(`Added ASTUCE modification license to ${googleFiles} Google-derived file(s).`);

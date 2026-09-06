/**
 * Injects extractable JSDoc (description + @param + @returns) on exported functions
 * across µcBlockly, BlocklyDuino-v3, and BlocklyDuinoFactory-v3 overlay.
 *
 * Usage: node scripts/inject-jsdoc.mjs
 */
import fs from "fs";
import path from "path";

const PARAM_HINTS = {
  url: "Input URL string.",
  param: "Query parameter name.",
  value: "Value to set.",
  block: "Blockly block instance.",
  generator: "Code generator instance.",
  workspace: "Blockly workspace.",
  options: "Configuration options.",
  language: "Language code (e.g. `fr`, `en`).",
  lang: "Language code (e.g. `fr`, `en`).",
  container: "Host DOM element.",
  toolbox: "Toolbox configuration.",
  theme: "Theme key or Blockly theme.",
  event: "Blockly workspace event.",
  name: "Name string.",
  type: "Type identifier.",
  id: "Identifier string.",
  key: "Lookup key.",
  code: "Source or generated code.",
  text: "Text content.",
  message: "Message string.",
  state: "Serialized state object.",
  settings: "Settings object.",
  board: "Board identifier.",
  boardId: "Board identifier.",
  pin: "Pin number or expression.",
  field: "Blockly field instance.",
  fieldName: "Field name on the block.",
  instanceType: "Logical instance type (e.g. `Servo`).",
  instanceName: "Instance name.",
  oldName: "Previous name.",
  newName: "New name.",
  enabled: "Whether the feature is enabled.",
  mode: "Operating mode.",
  scope: "Enforcement scope.",
  delayMs: "Delay in milliseconds.",
  callback: "Callback invoked when ready.",
  isRelevant: "Predicate selecting relevant events.",
  io: "Extension I/O adapter.",
  packId: "Extension pack folder id.",
  fragment: "Theme or toolbox fragment.",
  base: "Base toolbox configuration.",
  baseUrl: "Base URL for extension packs.",
  optional: "If true, missing assets are non-fatal.",
  micropython: "Optional MicroPython registration context.",
  getLang: "Returns the current UI language code.",
  form: "Export / settings form values.",
  stub: "Generator stub source text.",
  effects: "Captured BDuino emission effects.",
  hasOutput: "Whether the block has an output connection.",
  target: "Target element or value.",
  element: "DOM element.",
  root: "Root DOM element.",
  button: "Button element.",
  input: "Input element or Blockly input.",
  files: "File list or map.",
  file: "File path or handle.",
  data: "Payload data.",
  error: "Error object or message.",
  reason: "Disabled-reason identifier.",
  shouldDisable: "Whether to apply the disabled reason.",
  variable: "Variable model.",
  varName: "Variable name.",
  check: "Connection check type.",
  checks: "Connection check types.",
  msgs: "Message map.",
  prefix: "String prefix.",
  suffix: "String suffix.",
  order: "Operator precedence.",
  Order: "Operator precedence enum.",
  arduinoGenerator: "Arduino code generator.",
  micropythonGenerator: "MicroPython code generator.",
  pythonGenerator: "Python code generator.",
  ctx: "Registration / definition context.",
  config: "Field or module configuration.",
  style: "Block style name.",
  hue: "Colour hue.",
  colour: "Colour value.",
  source: "Source value or node.",
  dest: "Destination value or node.",
  from: "Source identifier.",
  to: "Target identifier.",
  a: "First operand.",
  b: "Second operand.",
  n: "Numeric value.",
  i: "Index.",
  x: "X coordinate or value.",
  y: "Y coordinate or value.",
  width: "Width in pixels.",
  height: "Height in pixels.",
  left: "Left panel or offset.",
  right: "Right panel or offset.",
  open: "Whether the panel is open.",
  visible: "Whether the element is visible.",
  rtl: "Right-to-left layout flag.",
  force: "Force update when true.",
  quiet: "Suppress user-visible feedback when true.",
  timeout: "Timeout in milliseconds.",
  signal: "AbortSignal for cancellation.",
  hex: "Intel HEX text or content.",
  baud: "Serial baud rate.",
  port: "Serial port handle or name.",
  sketch: "Arduino sketch source.",
  fqbn: "Fully qualified board name.",
  apiUrl: "Remote API base URL.",
  firmwareUrl: "Firmware artifact URL.",
};

function hintForParam(raw) {
  let p = raw.trim();
  if (!p || p === ",") return null;
  p = p.replace(/^\.\.\./, "");
  const nameMatch = p.match(
    /^(?:readonly\s+)?(?:public\s+|private\s+|protected\s+)?(\{[^}]+\}|\w+)/,
  );
  if (!nameMatch) return null;
  let name = nameMatch[1];
  if (name.startsWith("{")) {
    return { name: "options", desc: "Destructured options object." };
  }
  if (name.startsWith("_")) {
    const clean = name.replace(/^_+/, "") || name;
    return { name, desc: PARAM_HINTS[clean] || `Unused ${clean} parameter.` };
  }
  const desc =
    PARAM_HINTS[name] ||
    (name.endsWith("Id")
      ? "Identifier."
      : name.endsWith("Url")
        ? "URL string."
        : name.endsWith("Name")
          ? "Name string."
          : name.endsWith("Options")
            ? "Options object."
            : name.startsWith("get") && name.length > 3
              ? "Accessor callback."
              : name.startsWith("on") && name.length > 2
                ? "Event handler callback."
                : name.startsWith("is") ||
                    name.startsWith("has") ||
                    name.startsWith("can")
                  ? "Boolean flag."
                  : `\`${name}\` value.`);
  return { name, desc };
}

function parseParams(paramStr) {
  if (!paramStr.trim()) return [];
  const parts = [];
  let depth = 0;
  let cur = "";
  for (const ch of paramStr) {
    if (ch === "(" || ch === "{" || ch === "[" || ch === "<") depth++;
    if (ch === ")" || ch === "}" || ch === "]" || ch === ">")
      depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur);
  return parts.map(hintForParam).filter(Boolean);
}

function humanize(name) {
  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function defaultDescription(name) {
  return `${humanize(name)}.`;
}

function extractExistingDesc(jsdoc) {
  if (!jsdoc) return "";
  const lines = jsdoc.split(/\n/).map((l) =>
    l
      .replace(/^\s*\*\s?/, "")
      .replace(/^\s*\/\*\*\s?/, "")
      .replace(/\s*\*\/\s*$/, "")
      .trim(),
  );
  const desc = [];
  for (const l of lines) {
    if (!l || l.startsWith("@") || l === "/") continue;
    if (
      l.startsWith("Copyright") ||
      l.startsWith("SPDX") ||
      l.startsWith("Licensed")
    )
      continue;
    if (
      l.startsWith("@license") ||
      l.startsWith("@packageDocumentation") ||
      l.startsWith("@module") ||
      l.startsWith("@file") ||
      l.startsWith("@author") ||
      l.startsWith("@version") ||
      l.startsWith("@since") ||
      l.startsWith("@remarks")
    )
      continue;
    if (l.startsWith("@description")) {
      desc.push(l.replace(/^@description\s*/, ""));
      continue;
    }
    desc.push(l);
  }
  return desc.join(" ").replace(/\s+/g, " ").trim();
}

function buildJsdoc({ indent, desc, params, ret }) {
  const lines = [`${indent}/**`, `${indent} * ${desc}`];
  for (const p of params) {
    lines.push(`${indent} * @param ${p.name} - ${p.desc}`);
  }
  if (ret && ret !== "void" && ret !== "undefined") {
    const rdesc = ret.includes("Promise")
      ? "Promise resolving to the operation result."
      : ret.includes("boolean") || ret === "bool"
        ? "True when the condition holds."
        : ret.includes("string")
          ? "Result string."
          : ret.includes("number")
            ? "Numeric result."
            : ret.includes("[]") || ret.includes("Array")
              ? "Result array."
              : "Operation result.";
    lines.push(`${indent} * @returns ${rdesc}`);
  }
  lines.push(`${indent} */`);
  return lines.join("\n");
}

function findExistingJsdoc(before, start) {
  const beforeLines = before.split(/\n/);
  let li = beforeLines.length - 1;
  if (beforeLines[li] === "" || beforeLines[li] === undefined) li--;
  while (li >= 0 && beforeLines[li].trim() === "") li--;
  let existing = "";
  let replaceFrom = start;
  if (li >= 0 && beforeLines[li].trim().endsWith("*/")) {
    let startLi = li;
    while (startLi >= 0 && !beforeLines[startLi].includes("/**")) startLi--;
    if (startLi >= 0) {
      existing = beforeLines.slice(startLi, li + 1).join("\n");
      replaceFrom = beforeLines.slice(0, startLi).join("\n").length;
      if (startLi > 0) replaceFrom += 1;
    }
  }
  if (
    existing.includes("@packageDocumentation") ||
    (existing.includes("@license") &&
      existing.includes("Copyright") &&
      existing.split(/\n/).length > 15)
  ) {
    return { existing: "", replaceFrom: start };
  }
  return { existing, replaceFrom };
}

function patchMatches(s, matches, mode) {
  for (let i = matches.length - 1; i >= 0; i--) {
    const m = matches[i];
    const indent = m[1] || "";
    const name = mode === "fn" ? m[3] : m[2];
    const paramStr = mode === "fn" ? m[4] || "" : m[4] || "";
    const ret = (mode === "fn" ? m[5] || "" : m[5] || "").trim();
    const start = m.index;
    const before = s.slice(0, start);
    const { existing, replaceFrom } = findExistingJsdoc(before, start);
    const params = parseParams(paramStr);
    const hasParam = /@param\b/.test(existing);
    const hasReturns = /@returns?\b/.test(existing);
    const needsReturns = ret && ret !== "void" && ret !== "undefined";
    if (existing && hasParam && (!needsReturns || hasReturns)) continue;
    if (mode === "const" && existing && hasParam && !ret) continue;
    let desc = extractExistingDesc(existing);
    if (!desc || desc.length < 8) desc = defaultDescription(name);
    if (!/[.!?]$/.test(desc)) desc += ".";
    const jsdoc = buildJsdoc({ indent, desc, params, ret: ret || "" });
    if (existing) s = s.slice(0, replaceFrom) + jsdoc + "\n" + s.slice(start);
    else s = s.slice(0, start) + jsdoc + "\n" + s.slice(start);
  }
  return s;
}

function processFile(filePath) {
  let s = fs.readFileSync(filePath, "utf8");
  const original = s;
  const reFn =
    /^([ \t]*)export (async )?function (\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{\n]+))?/gm;
  s = patchMatches(s, [...s.matchAll(reFn)], "fn");
  const reConst =
    /^([ \t]*)export const (\w+)\s*=\s*(async\s*)?\(([^)]*)\)(?:\s*:\s*([^=]+?))?\s*=>/gm;
  s = patchMatches(s, [...s.matchAll(reConst)], "const");
  if (s !== original) {
    fs.writeFileSync(filePath, s);
    return true;
  }
  return false;
}

function walk(d, acc = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (
      ["node_modules", "build", "dist", "upstream", "graphify-out"].includes(
        e.name,
      )
    )
      continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.tsx?$/.test(e.name) && !e.name.endsWith(".d.ts")) acc.push(p);
  }
  return acc;
}

const targets = [
  "F:/Logiciels/Arduino_graphique/µcBlockly/src",
  "F:/Logiciels/Arduino_graphique/BlocklyDuino/BlocklyDuino-v3/src",
  "F:/Logiciels/Arduino_graphique/BlocklyDuino/BlocklyDuinoFactory-v3/overlay",
];

for (const root of targets) {
  if (!fs.existsSync(root)) {
    console.warn("skip missing", root);
    continue;
  }
  let n = 0;
  for (const f of walk(root)) {
    try {
      if (processFile(f)) n++;
    } catch (err) {
      console.error("FAIL", f, err.message);
    }
  }
  console.log("updated files in", root, n);
}

/**
 * Convertit un fichier XML Blockly@rduino (.B@ / .xml) en workspace JSON µcBlockly.
 */

import { DOMParser } from "@xmldom/xmldom";
import {
  HAT_BLOCK_TYPES,
  mapBlockType,
  mapFieldName,
  mapInputName,
  BLOCK_TYPE_MAP,
} from "./rduino-block-map.mjs";

const WORKSPACE_VERSION = "1.0.0";

/**
 * @typedef {object} ConversionReport
 * @property {string[]} unmappedBlockTypes
 * @property {string[]} skippedBlockTypes
 * @property {string[]} warnings
 * @property {number} blockCount
 */

/**
 * @returns {string}
 */
function newBlockId() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#%()*+,-./:;=?@[]^_{|}~";
  let id = "";
  for (let i = 0; i < 20; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * @param {import('@xmldom/xmldom').Element} el
 * @returns {string}
 */
function getAttr(el, name) {
  return el.getAttribute(name) ?? "";
}

/**
 * @param {import('@xmldom/xmldom').Element} parent
 * @param {string} tag
 * @returns {import('@xmldom/xmldom').Element[]}
 */
function childElements(parent, tag) {
  /** @type {import('@xmldom/xmldom').Element[]} */
  const out = [];
  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes[i];
    if (node.nodeType === 1 && node.nodeName === tag) {
      out.push(/** @type {import('@xmldom/xmldom').Element} */ (node));
    }
  }
  return out;
}

/**
 * @param {import('@xmldom/xmldom').Element} parent
 * @returns {import('@xmldom/xmldom').Element | null}
 */
function firstChildElement(parent) {
  for (let i = 0; i < parent.childNodes.length; i++) {
    const node = parent.childNodes[i];
    if (node.nodeType === 1) {
      return /** @type {import('@xmldom/xmldom').Element} */ (node);
    }
  }
  return null;
}

/**
 * @param {import('@xmldom/xmldom').Document} doc
 * @returns {import('@xmldom/xmldom').Element}
 */
function getWorkspaceRoot(doc) {
  const root = doc.documentElement;
  if (!root || root.nodeName !== "xml") {
    throw new Error("Racine XML attendue : <xml> (fichier Blockly@rduino)");
  }
  return root;
}

/**
 * @param {string} xmlText
 * @returns {import('@xmldom/xmldom').Document}
 */
export function parseRduinoXml(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const parseError = doc.getElementsByTagName("parsererror")[0];
  if (parseError) {
    throw new Error(`XML invalide : ${parseError.textContent ?? "erreur de parsing"}`);
  }
  return doc;
}

/**
 * @param {import('@xmldom/xmldom').Element} mutationEl
 * @returns {Record<string, unknown> | string | undefined}
 */
function mutationToExtraState(mutationEl) {
  const elseif = mutationEl.getAttribute("elseif");
  const elseAttr = mutationEl.getAttribute("else");
  if (elseif != null || elseAttr != null) {
    return {
      elseIfCount: Number(elseif ?? 0),
      hasElse: elseAttr === "1" || elseAttr === "true",
    };
  }
  const items = mutationEl.getAttribute("items");
  if (items != null) {
    return { itemCount: Number(items) };
  }
  const casebreak = mutationEl.getAttribute("casebreak");
  if (casebreak != null) {
    return { casebreakCount: Number(casebreak) };
  }
  const dim = mutationEl.getAttribute("dim");
  if (dim != null) {
    return { dim };
  }
  const loops = mutationEl.getAttribute("loops");
  if (loops != null) {
    return { loopCount: Number(loops) };
  }
  return mutationEl.toString();
}

const STANDARD_BLOCK_PREFIXES = [
  "controls_",
  "logic_",
  "math_",
  "text_",
  "variables_",
  "procedures_",
  "Array_",
  "libre_",
  "colour_",
  "lists_",
  "board_",
  "inout_angle_maths",
];

/**
 * @param {string} type
 * @returns {boolean}
 */
function isKnownBlockType(type) {
  if (BLOCK_TYPE_MAP[type]) return true;
  return STANDARD_BLOCK_PREFIXES.some(
    (prefix) => type === prefix || type.startsWith(prefix),
  );
}

/**
 * @param {ConversionReport} report
 * @param {import('@xmldom/xmldom').Element} blockEl
 * @param {Map<string, string>} variableIds
 * @returns {object | object[] | null}
 */
function convertBlockElement(blockEl, report, variableIds) {
  const sourceType = getAttr(blockEl, "type");
  if (!sourceType) {
    return null;
  }

  if (sourceType === "base_define_bloc") {
    const inner = [];
    for (const stmt of childElements(blockEl, "statement")) {
      if (getAttr(stmt, "name") !== "DO") continue;
      const child = firstChildElement(stmt);
      if (!child) continue;
      const converted = convertBlockElement(child, report, variableIds);
      if (Array.isArray(converted)) {
        inner.push(...converted);
      } else if (converted) {
        inner.push(converted);
      }
    }
    return inner;
  }

  let mappedType = mapBlockType(sourceType);
  if (mappedType === null) {
    report.skippedBlockTypes.push(sourceType);
    return null;
  }

  if (sourceType === "base_delay") {
    const uniteField = childElements(blockEl, "field").find(
      (f) => getAttr(f, "name") === "unite",
    );
    const unite = uniteField?.textContent?.trim();
    if (unite === "s" || unite === "sec") {
      mappedType = "board_base_time_delay_sec";
    }
  }

  if (!isKnownBlockType(sourceType)) {
    report.unmappedBlockTypes.push(sourceType);
  }

  /** @type {Record<string, unknown>} */
  const block = {
    type: mappedType,
    id: getAttr(blockEl, "id") || newBlockId(),
  };

  const x = Number(getAttr(blockEl, "x"));
  const y = Number(getAttr(blockEl, "y"));
  if (Number.isFinite(x)) block.x = x;
  if (Number.isFinite(y)) block.y = y;

  if (getAttr(blockEl, "inline") === "true") {
    block.inputsInline = true;
  }

  /** @type {Record<string, string | { id: string }>} */
  const fields = {};
  for (const fieldEl of childElements(blockEl, "field")) {
    const rawName = getAttr(fieldEl, "name");
    if (!rawName) continue;
    if (rawName === "unite" && mappedType.startsWith("board_base_time_delay")) {
      continue;
    }
    const name = mapFieldName(sourceType, rawName);
    const text = fieldEl.textContent ?? "";
    if (rawName === "VAR" || rawName === "VARIABLE" || rawName === "LIST") {
      const varName = text.trim();
      if (varName) {
        if (!variableIds.has(varName)) {
          variableIds.set(varName, newBlockId());
        }
        fields[name] = { id: variableIds.get(varName) };
      }
      continue;
    }
    fields[name] = text;
  }
  for (const titleEl of childElements(blockEl, "title")) {
    const rawName = getAttr(titleEl, "name");
    if (!rawName) continue;
    const name = mapFieldName(sourceType, rawName);
    fields[name] = titleEl.textContent ?? "";
  }
  if (Object.keys(fields).length > 0) {
    block.fields = fields;
  }

  const mutationEl = firstChildElement(blockEl);
  if (mutationEl?.nodeName === "mutation") {
    const extra = mutationToExtraState(mutationEl);
    if (extra !== undefined) {
      block.extraState = extra;
    }
  }

  /** @type {Record<string, object>} */
  const inputs = {};
  for (const valueEl of childElements(blockEl, "value")) {
    const inputName = mapInputName(sourceType, getAttr(valueEl, "name"));
    if (!inputName) continue;
    const childBlock = childElements(valueEl, "block")[0];
    if (!childBlock) continue;
    const converted = convertBlockElement(childBlock, report, variableIds);
    if (!converted || Array.isArray(converted)) continue;
    inputs[inputName] = { block: converted };
  }
  for (const stmtEl of childElements(blockEl, "statement")) {
    const inputName = mapInputName(sourceType, getAttr(stmtEl, "name"));
    if (!inputName) continue;
    const childBlock = firstChildElement(stmtEl);
    if (!childBlock || childBlock.nodeName !== "block") continue;
    const converted = convertBlockElement(childBlock, report, variableIds);
    if (!converted || Array.isArray(converted)) continue;
    inputs[inputName] = { block: converted };
  }
  if (Object.keys(inputs).length > 0) {
    block.inputs = inputs;
  }

  const nextEl = childElements(blockEl, "next")[0];
  const nextBlockEl = nextEl ? firstChildElement(nextEl) : null;
  if (nextBlockEl?.nodeName === "block") {
    const convertedNext = convertBlockElement(nextBlockEl, report, variableIds);
    if (convertedNext && !Array.isArray(convertedNext)) {
      block.next = { block: convertedNext };
    }
  }

  return block;
}

/**
 * @param {object[]} blocks
 * @returns {object[]}
 */
function wrapOrphanStatements(blocks) {
  const hasHat = blocks.some((b) => HAT_BLOCK_TYPES.has(b.type));
  if (hasHat) {
    return blocks;
  }
  const statements = blocks.filter((b) => b.type !== "variables_define");
  const defines = blocks.filter((b) => b.type === "variables_define");
  if (statements.length === 0) {
    return blocks;
  }
  let chain = statements[0];
  for (let i = 1; i < statements.length; i++) {
    let tail = chain;
    while (tail.next?.block) {
      tail = tail.next.block;
    }
    tail.next = { block: statements[i] };
  }
  const wrapper = {
    type: "board_base_setup_loop",
    id: newBlockId(),
    x: chain.x ?? 20,
    y: chain.y ?? 20,
    inputs: {
      LOOP: { block: chain },
    },
  };
  return [...defines, wrapper];
}

/**
 * @param {import('@xmldom/xmldom').Document} doc
 * @param {ConversionReport} report
 * @returns {{ blocks: object[], variables: object[] }}
 */
function convertWorkspaceContent(doc, report) {
  const root = getWorkspaceRoot(doc);
  const variableIds = new Map();

  /** @type {object[]} */
  let topBlocks = [];
  for (const blockEl of childElements(root, "block")) {
    const converted = convertBlockElement(blockEl, report, variableIds);
    if (Array.isArray(converted)) {
      topBlocks.push(...converted);
    } else if (converted) {
      topBlocks.push(converted);
    }
  }

  topBlocks = wrapOrphanStatements(topBlocks);
  report.blockCount = countBlocks(topBlocks);

  const variables = [...variableIds.entries()].map(([name, id]) => ({
    name,
    id,
    type: "",
  }));

  return { blocks: topBlocks, variables };
}

/**
 * @param {object[]} blocks
 * @returns {number}
 */
function countBlocks(blocks) {
  let n = 0;
  const walk = (b) => {
    if (!b || typeof b !== "object") return;
    n++;
    const rec = /** @type {Record<string, unknown>} */ (b);
    if (rec.inputs && typeof rec.inputs === "object") {
      for (const input of Object.values(rec.inputs)) {
        const inp = /** @type {{ block?: object }} */ (input);
        if (inp.block) walk(inp.block);
      }
    }
    const next = /** @type {{ block?: object }} | undefined} */ (rec.next);
    if (next?.block) walk(next.block);
  };
  for (const b of blocks) walk(b);
  return n;
}

/**
 * @param {string} xmlText
 * @param {object} [options]
 * @param {boolean} [options.wrapOrphans=true]
 * @returns {{ workspace: object, report: ConversionReport, metadata: object }}
 */
export function convertRduinoXmlToUcbJson(xmlText, options = {}) {
  const wrapOrphans = options.wrapOrphans !== false;
  const report = {
    unmappedBlockTypes: [],
    skippedBlockTypes: [],
    warnings: [],
    blockCount: 0,
  };

  const doc = parseRduinoXml(xmlText);
  const root = getWorkspaceRoot(doc);

  const metadata = {
    source: "Blockly@rduino",
    toolbox: null,
    toolboxCategories: null,
  };
  const toolboxEl = childElements(root, "toolbox")[0];
  if (toolboxEl?.textContent?.trim()) {
    metadata.toolbox = toolboxEl.textContent.trim();
  }
  const categoriesEl = childElements(root, "toolboxcategories")[0];
  if (categoriesEl?.textContent?.trim()) {
    metadata.toolboxCategories = categoriesEl.textContent.trim();
  }

  const { blocks, variables } = convertWorkspaceContent(doc, report);

  if (!wrapOrphans) {
    report.warnings.push("wrapOrphans désactivé : blocs racine non enveloppés dans setup/loop");
  }

  const uniqueUnmapped = [...new Set(report.unmappedBlockTypes)];
  report.unmappedBlockTypes = uniqueUnmapped;
  if (uniqueUnmapped.length > 0) {
    report.warnings.push(
      `${uniqueUnmapped.length} type(s) de bloc sans correspondance µcBlockly (conservés tels quels)`,
    );
  }
  if (report.skippedBlockTypes.length > 0) {
    report.warnings.push(
      `${report.skippedBlockTypes.length} bloc(s) ignoré(s) : ${[...new Set(report.skippedBlockTypes)].join(", ")}`,
    );
  }

  const workspace = {
    ucbConversion: {
      from: "Blockly@rduino",
      version: WORKSPACE_VERSION,
      convertedAt: new Date().toISOString(),
      metadata,
      report: {
        unmappedBlockTypes: report.unmappedBlockTypes,
        skippedBlockTypes: [...new Set(report.skippedBlockTypes)],
        warnings: report.warnings,
        blockCount: report.blockCount,
      },
    },
    blocks: {
      languageVersion: 0,
      blocks,
    },
    variables,
  };

  return { workspace, report, metadata };
}

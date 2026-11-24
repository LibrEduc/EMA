import type { GenerationResult } from "./codegen";

export const HUB_SLOT_MIN = 0;
export const HUB_SLOT_MAX = 19;
export const HUB_SLOT_STORAGE_KEY = "ema.hubProgramSlot";

export function isValidHubSlot(value: number): boolean {
  return (
    Number.isInteger(value) && value >= HUB_SLOT_MIN && value <= HUB_SLOT_MAX
  );
}

export function normalizeHubSlot(
  raw: string | number | null | undefined,
): number {
  if (raw === null || raw === undefined || raw === "") {
    return HUB_SLOT_MIN;
  }
  const parsed = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(parsed)) {
    return HUB_SLOT_MIN;
  }
  const rounded = Math.trunc(parsed);
  return Math.min(HUB_SLOT_MAX, Math.max(HUB_SLOT_MIN, rounded));
}

export function formatHubFilename(slot: number): string {
  return `prog_${normalizeHubSlot(slot)}.py`;
}

export function loadHubSlot(): number {
  try {
    return normalizeHubSlot(window.localStorage.getItem(HUB_SLOT_STORAGE_KEY));
  } catch {
    return HUB_SLOT_MIN;
  }
}

export function saveHubSlot(slot: number): void {
  try {
    window.localStorage.setItem(
      HUB_SLOT_STORAGE_KEY,
      String(normalizeHubSlot(slot)),
    );
  } catch {
    // ignore
  }
}

export type HubExportIssue = "generationError" | "emptyProgram";

export interface HubIssueCopy {
  readonly hubErrorBlocks: string;
  readonly hubErrorGeneric: string;
  readonly hubErrorEmpty: string;
}

const MAX_NAMED_BLOCKS = 3;

const IMPORT_LINE = /^(import\s|from\s+\S+\s+import\s)/;

// Comments, blank lines, imports and the idle loop (`while True: pass`) carry no program.
function isInactiveLine(line: string): boolean {
  const text = line.trim();
  return (
    text === "" ||
    text.startsWith("#") ||
    IMPORT_LINE.test(text) ||
    text === "while True:" ||
    text === "pass"
  );
}

export function getHubExportIssue(
  result: GenerationResult,
): HubExportIssue | null {
  if (!result.ok) {
    return "generationError";
  }
  return result.code.split("\n").every(isInactiveLine) ? "emptyProgram" : null;
}

export function formatHubIssueMessage(
  copy: HubIssueCopy,
  issue: HubExportIssue,
  result: GenerationResult,
): string {
  if (issue === "emptyProgram") {
    return copy.hubErrorEmpty;
  }
  if (result.ok || result.unsupportedBlocks.length === 0) {
    return copy.hubErrorGeneric;
  }
  const labels = result.unsupportedBlocks.map((block) => block.label);
  const named = labels.slice(0, MAX_NAMED_BLOCKS).map((label) => `« ${label} »`);
  const others = labels.length - named.length;
  const list = others > 0 ? `${named.join(", ")} (+${others})` : named.join(", ");
  return copy.hubErrorBlocks.replace("{blocks}", list);
}

export function downloadHubProgram(code: string, slot: number): string {
  const filename = formatHubFilename(slot);
  const blob = new Blob([code], { type: "text/x-python;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    URL.revokeObjectURL(url);
  }
  return filename;
}

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

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HUB_SLOT_MAX,
  HUB_SLOT_MIN,
  downloadHubProgram,
  formatHubFilename,
  isValidHubSlot,
  normalizeHubSlot,
} from "./hub_export";

describe("hub_export (#21 / #12)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("exposes slots 0 to 19", () => {
    expect(HUB_SLOT_MIN).toBe(0);
    expect(HUB_SLOT_MAX).toBe(19);
  });

  it("validates integer slots in [0, 19]", () => {
    expect(isValidHubSlot(0)).toBe(true);
    expect(isValidHubSlot(7)).toBe(true);
    expect(isValidHubSlot(19)).toBe(true);
    expect(isValidHubSlot(-1)).toBe(false);
    expect(isValidHubSlot(20)).toBe(false);
    expect(isValidHubSlot(1.5)).toBe(false);
    expect(isValidHubSlot(Number.NaN)).toBe(false);
  });

  it("normalizes and clamps slot inputs", () => {
    expect(normalizeHubSlot(0)).toBe(0);
    expect(normalizeHubSlot(12)).toBe(12);
    expect(normalizeHubSlot("12")).toBe(12);
    expect(normalizeHubSlot(-5)).toBe(0);
    expect(normalizeHubSlot(42)).toBe(19);
    expect(normalizeHubSlot(null)).toBe(0);
    expect(normalizeHubSlot(undefined)).toBe(0);
    expect(normalizeHubSlot("abc")).toBe(0);
  });

  it("formats Hub filenames as prog_N.py", () => {
    expect(formatHubFilename(0)).toBe("prog_0.py");
    expect(formatHubFilename(3)).toBe("prog_3.py");
    expect(formatHubFilename(19)).toBe("prog_19.py");
    expect(formatHubFilename(99)).toBe("prog_19.py");
  });

  it("downloads prog_N.py via a Blob object URL and revokes it", () => {
    const click = vi.fn();
    const remove = vi.fn();
    const link = {
      href: "",
      download: "",
      style: { display: "" },
      click,
      remove,
    };
    const append = vi.fn();

    vi.stubGlobal("document", {
      createElement: vi.fn((tag: string) => {
        expect(tag).toBe("a");
        return link;
      }),
      body: { appendChild: append },
    });

    const createObjectURL = vi.fn((_blob: Blob) => "blob:ema-test");
    const revokeObjectURL = vi.fn((_url: string) => undefined);
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

    const filename = downloadHubProgram("print('MAE')\n", 3);

    expect(filename).toBe("prog_3.py");
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blobArg = createObjectURL.mock.calls[0]?.[0];
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.type).toContain("python");
    expect(link.download).toBe("prog_3.py");
    expect(link.href).toBe("blob:ema-test");
    expect(append).toHaveBeenCalledWith(link);
    expect(click).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:ema-test");
  });
});

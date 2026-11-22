import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(import.meta.dirname, "..");

describe("offline fonts (#22)", () => {
  it("index.html does not load fonts from external CDNs", () => {
    const html = readFileSync(path.join(rootDir, "index.html"), "utf8");
    expect(html).not.toMatch(/fonts\.googleapis\.com/i);
    expect(html).not.toMatch(/fonts\.gstatic\.com/i);
    expect(html).not.toMatch(/cdn\.jsdelivr\.net/i);
  });

  it("a11y_typography.ts imports local @fontsource fonts", () => {
    const src = readFileSync(
      path.join(rootDir, "src", "a11y_typography.ts"),
      "utf8",
    );
    expect(src).toContain("@fontsource/atkinson-hyperlegible/");
    expect(src).toContain("@fontsource/lexend/");
    expect(src).toContain("@fontsource/opendyslexic/");
  });
});

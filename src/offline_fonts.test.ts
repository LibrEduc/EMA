import { describe, expect, it } from "vitest";
import indexHtml from "../index.html?raw";
import a11yTypographySrc from "./a11y_typography.ts?raw";

describe("offline fonts (#22)", () => {
  it("index.html does not load fonts from external CDNs", () => {
    expect(indexHtml).not.toMatch(/fonts\.googleapis\.com/i);
    expect(indexHtml).not.toMatch(/fonts\.gstatic\.com/i);
    expect(indexHtml).not.toMatch(/cdn\.jsdelivr\.net/i);
  });

  it("a11y_typography.ts imports local @fontsource fonts", () => {
    expect(a11yTypographySrc).toContain("@fontsource/atkinson-hyperlegible/");
    expect(a11yTypographySrc).toContain("@fontsource/lexend/");
    expect(a11yTypographySrc).toContain("@fontsource/opendyslexic/");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { loadUiLanguage } from "./i18n";

describe("loadUiLanguage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const openWith = ({ saved, browser }: { saved?: string; browser: string }) => {
    vi.stubGlobal("window", {
      localStorage: { getItem: () => saved ?? null },
    });
    vi.stubGlobal("navigator", { language: browser });
    return loadUiLanguage();
  };

  // A school computer set up in English must still open EMA in French.
  it("opens in French whatever the browser language", () => {
    expect(openWith({ browser: "en-US" })).toBe("fr");
    expect(openWith({ browser: "es-ES" })).toBe("fr");
  });

  it("keeps the language the student chose", () => {
    expect(openWith({ saved: "en", browser: "fr-FR" })).toBe("en");
  });

  it("opens in French when the saved value is unknown", () => {
    expect(openWith({ saved: "xx", browser: "en-US" })).toBe("fr");
  });
});

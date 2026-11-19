import { afterEach, describe, expect, it, vi } from "vitest";
import { loadUiLanguage, shareLanguageWithUcBlockly } from "./i18n";

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
    expect(openWith({ saved: "fa", browser: "en-US" })).toBe("fr");
  });

  it("opens in French when storage is blocked", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("SecurityError");
        },
      },
    });
    expect(loadUiLanguage()).toBe("fr");
  });
});

describe("shareLanguageWithUcBlockly", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const urlAfterSharing = (href: string, language: "fr" | "es") => {
    const replaceState = vi.fn();
    vi.stubGlobal("window", { location: { href }, history: { state: null, replaceState } });
    shareLanguageWithUcBlockly(language);
    return String(replaceState.mock.calls[0][2]);
  };

  // Its tutorial and shortcut dialogs fall back to English without `?lang=`.
  it("puts the language in the page URL", () => {
    expect(urlAfterSharing("file:///app/dist-electron/index.html", "fr")).toBe(
      "file:///app/dist-electron/index.html?lang=fr",
    );
  });

  it("replaces the previous language and keeps the rest of the URL", () => {
    expect(urlAfterSharing("http://localhost:5173/?lang=fr&board=uno#top", "es")).toBe(
      "http://localhost:5173/?lang=es&board=uno#top",
    );
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { loadUiLanguage, shareLanguageWithUcBlockly } from "./i18n";

describe("loadUiLanguage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const openWith = ({
    saved,
    browser,
    url = "http://localhost:5173/",
    storageBlocked = false,
  }: {
    saved?: string;
    browser: string;
    url?: string;
    storageBlocked?: boolean;
  }) => {
    vi.stubGlobal("window", {
      location: { href: url },
      localStorage: {
        getItem: () => {
          if (storageBlocked) {
            throw new Error("SecurityError");
          }
          return saved ?? null;
        },
      },
    });
    vi.stubGlobal("navigator", { language: browser });
    return loadUiLanguage();
  };

  it("follows the browser language when nothing is saved", () => {
    expect(openWith({ browser: "en-US" })).toBe("en");
    expect(openWith({ browser: "es-ES" })).toBe("es");
  });

  it("opens in French when the browser language is not supported", () => {
    expect(openWith({ browser: "de-DE" })).toBe("fr");
  });

  it("keeps the language the student chose", () => {
    expect(openWith({ saved: "en", browser: "fr-FR" })).toBe("en");
  });

  it("ignores an unknown saved value", () => {
    expect(openWith({ saved: "xx", browser: "de-DE" })).toBe("fr");
    expect(openWith({ saved: "fa", browser: "de-DE" })).toBe("fr");
    expect(openWith({ saved: "xx", browser: "es-ES" })).toBe("es");
  });

  it("falls back to the browser language when storage is blocked", () => {
    expect(openWith({ storageBlocked: true, browser: "en-US" })).toBe("en");
    expect(openWith({ storageBlocked: true, browser: "de-DE" })).toBe("fr");
  });

  it("lets ?lang= win over the saved choice and the browser", () => {
    expect(
      openWith({ url: "http://localhost:5173/?lang=es", saved: "en", browser: "fr-FR" }),
    ).toBe("es");
  });

  it("ignores an unknown ?lang= and falls through to saved, then browser", () => {
    const url = "http://localhost:5173/?lang=xx";
    expect(openWith({ url, saved: "en", browser: "fr-FR" })).toBe("en");
    expect(openWith({ url, browser: "es-ES" })).toBe("es");
  });

  it("reads ?lang= even when storage is blocked", () => {
    expect(
      openWith({ url: "http://localhost:5173/?lang=en", storageBlocked: true, browser: "fr-FR" }),
    ).toBe("en");
  });

  it("accepts ?lang= in any case (like µcBlockly) and trims spaces", () => {
    expect(openWith({ url: "http://localhost:5173/?lang=FR", browser: "en-US" })).toBe("fr");
    expect(openWith({ url: "http://localhost:5173/?lang=%20es", browser: "en-US" })).toBe("es");
  });

  it("reads ?lang= among other query parameters", () => {
    expect(openWith({ url: "http://localhost:5173/?board=uno&lang=es#top", browser: "fr-FR" })).toBe(
      "es",
    );
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

  // µcBlockly's tutorial and shortcut dialogs fall back to English without `?lang=`.
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

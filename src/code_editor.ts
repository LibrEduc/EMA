/**
 * @packageDocumentation
 * @module CodeEditor
 * @description Lazily initialized Monaco editor for generated C++ code.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type * as Monaco from "monaco-editor";

/** Thèmes Monaco intégrés. */
export type MonacoThemeId = "vs" | "vs-dark" | "hc-black" | "hc-light";

const MONACO_THEMES = new Set<MonacoThemeId>([
  "vs",
  "vs-dark",
  "hc-black",
  "hc-light",
]);

/**
 * Lazily initializes Monaco Editor to avoid heavy startup cost.
 */
export class LazyMonacoEditor {
  private editor?: Monaco.editor.IStandaloneCodeEditor;
  private pendingValue: string | null = null;
  private initializing: Promise<void> | null = null;
  private monacoTheme: MonacoThemeId = "vs";
  /** Si true, {@link applyTheme} suit le thème UI Blockly ; sinon thème manuel. */
  private followUiTheme = true;
  private readOnly = false;
  private fontFamily = "Consolas, 'Courier New', monospace";
  private fontSizePx = 14;
  private lineHeightRatio = 1.45;
  private onChangeListener: ((value: string) => void) | null = null;

  /**
   * Aligns Monaco with the application shell theme (ignored if a manual theme is set).
   */
  applyTheme(mode: "light" | "dark" | "high-contrast"): void {
    if (!this.followUiTheme) {
      return;
    }
    this.monacoTheme =
      mode === "dark" ? "vs-dark" : mode === "high-contrast" ? "hc-black" : "vs";
    this.pushThemeToEditor();
  }

  /**
   * Sets an explicit Monaco theme. Pass `followUiTheme: true` to resume auto mode.
   */
  setMonacoTheme(
    theme: MonacoThemeId,
    options?: { followUiTheme?: boolean },
  ): void {
    if (!MONACO_THEMES.has(theme)) {
      return;
    }
    this.followUiTheme = options?.followUiTheme ?? false;
    this.monacoTheme = theme;
    this.pushThemeToEditor();
  }

  /** Resume following the Blockly / shell UI theme. */
  setFollowUiTheme(follow: boolean): void {
    this.followUiTheme = follow;
  }

  isFollowUiTheme(): boolean {
    return this.followUiTheme;
  }

  getMonacoTheme(): MonacoThemeId {
    return this.monacoTheme;
  }

  private pushThemeToEditor(): void {
    if (!this.editor) {
      return;
    }
    void import("monaco-editor").then((monaco) => {
      monaco.editor.setTheme(this.monacoTheme);
    });
  }

  /**
   * Toggles whether the user can edit generated code.
   */
  setReadOnly(readOnly: boolean): void {
    this.readOnly = readOnly;
    this.editor?.updateOptions({ readOnly });
  }

  /** Current read-only flag (default false — editable generated code). */
  isReadOnly(): boolean {
    return this.readOnly;
  }

  /** Applique une police à l’éditeur Monaco (UI / accessibilité). */
  setFontFamily(fontFamily: string): void {
    const trimmed = fontFamily.trim();
    if (!trimmed) {
      return;
    }
    this.fontFamily = trimmed;
    this.editor?.updateOptions({ fontFamily: trimmed });
  }

  /** Interligne et taille de police Monaco (accessibilité coque). */
  setReadabilityOptions(options: {
    fontSizePx?: number;
    lineHeightRatio?: number;
  }): void {
    if (options.fontSizePx !== undefined && options.fontSizePx > 0) {
      this.fontSizePx = options.fontSizePx;
    }
    if (options.lineHeightRatio !== undefined && options.lineHeightRatio > 0) {
      this.lineHeightRatio = options.lineHeightRatio;
    }
    this.pushReadabilityToEditor();
  }

  private pushReadabilityToEditor(): void {
    if (!this.editor) {
      return;
    }
    this.editor.updateOptions({
      fontSize: this.fontSizePx,
      lineHeight: Math.max(12, Math.round(this.fontSizePx * this.lineHeightRatio)),
    });
  }

  /**
   * Initializes the Monaco editor if it is not already created.
   * @param container - DOM element that hosts the editor.
   * @returns Resolves when the editor is ready.
   */
  async ensureInitialized(container: HTMLElement): Promise<void> {
    if (this.editor) {
      return;
    }
    if (this.initializing) {
      await this.initializing;
      return;
    }
    this.initializing = (async () => {
      const monaco = await import("monaco-editor");
      this.editor = monaco.editor.create(container, {
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        language: "cpp",
        lineNumbers: "on",
        readOnly: this.readOnly,
        scrollBeyondLastLine: false,
        theme: this.monacoTheme,
        fontFamily: this.fontFamily,
        fontSize: this.fontSizePx,
        lineHeight: Math.max(
          12,
          Math.round(this.fontSizePx * this.lineHeightRatio),
        ),
      });
      container.setAttribute("dir", "ltr");
      if (this.pendingValue !== null) {
        this.editor.setValue(this.pendingValue);
        this.pendingValue = null;
      }
      if (this.onChangeListener) {
        this.editor.onDidChangeModelContent(() => {
          this.onChangeListener?.(this.getValue());
        });
      }
    })();
    await this.initializing;
  }

  /**
   * Sets the editor content, deferring until initialization if needed.
   * @param value - Full editor text content.
   */
  setValue(value: string): void {
    if (this.editor) {
      this.editor.setValue(value);
      return;
    }
    this.pendingValue = value;
  }

  /** Current editor text (empty string if not initialized). */
  getValue(): string {
    return this.editor?.getValue() ?? this.pendingValue ?? "";
  }

  /** Fired when the user (or program) changes editor content. */
  setOnChange(listener: ((value: string) => void) | null): void {
    this.onChangeListener = listener;
  }

  /** Switches Monaco syntax highlighting (e.g. javascript, cpp). */
  setLanguage(languageId: string): void {
    if (!this.editor) {
      return;
    }
    void import("monaco-editor").then((monaco) => {
      monaco.editor.setModelLanguage(this.editor!.getModel()!, languageId);
    });
  }
}

/** Shared Monaco editor instance for the generated code panel. */
export const µcB_codeEditor = new LazyMonacoEditor();

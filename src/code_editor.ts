/**
 * @packageDocumentation
 * @module CodeEditor
 * @description Lazily initialized Monaco editor for generated C++ code.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type * as Monaco from "monaco-editor";

/**
 * Lazily initializes Monaco Editor to avoid heavy startup cost.
 */
export class LazyMonacoEditor {
  private editor?: Monaco.editor.IStandaloneCodeEditor;
  private pendingValue: string | null = null;
  private initializing: Promise<void> | null = null;

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
        readOnly: false,
        scrollBeyondLastLine: false,
      });
      if (this.pendingValue !== null) {
        this.editor.setValue(this.pendingValue);
        this.pendingValue = null;
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
}

/** Shared Monaco editor instance for the generated code panel. */
export const µcB_codeEditor = new LazyMonacoEditor();

/**
 * @packageDocumentation
 * @module ToolboxSearchI18n
 * @description Registers an i18n subclass of the toolbox-search plugin without modifying its code.
 * @remarks
 * After loading `\@blockly/toolbox-search`, the registered category is replaced by a subclass that
 * reads strings from Blockly.Msg. Resilient to plugin version upgrades.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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

import * as Blockly from "blockly";

/** Default plugin strings (en) used for matching and replacement. */
const DEFAULT_PLACEHOLDER = "Search";
const DEFAULT_HINT = "Type to search for blocks";
const DEFAULT_NO_MATCH = "No matching blocks found";

const SEARCH_CATEGORY_KIND = "search";

function getMsg(key: string, fallback: string): string {
  const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
  return msg && msg !== key ? msg : fallback;
}

/**
 * Registers the multilingual toolbox-search category. Call once after importing `\@blockly/toolbox-search`.
 */
export function registerToolboxSearchI18n(): void {
  const Base = Blockly.registry.getClass(
    Blockly.registry.Type.TOOLBOX_ITEM,
    SEARCH_CATEGORY_KIND,
  ) as (new (
    a: Blockly.utils.toolbox.CategoryInfo,
    b: Blockly.IToolbox,
    c?: Blockly.ICollapsibleToolboxItem,
  ) => Blockly.ToolboxCategory) | undefined;

  if (!Base) {
    return;
  }

  type SearchCategoryInstance = InstanceType<typeof Base> & {
    searchField?: HTMLInputElement;
    flyoutItems_?: Array<{ kind: string; text?: string }>;
    parentToolbox_?: { refreshSelection?: () => void };
    matchBlocks?: () => void;
  };

  const baseProto = Base.prototype as SearchCategoryInstance;
  const originalMatchBlocks = baseProto.matchBlocks;

  class ToolboxSearchCategoryI18n extends Base {
    override createDom_(): HTMLDivElement {
      const div = super.createDom_() as HTMLDivElement;
      const inst = this as unknown as SearchCategoryInstance;
      if (inst.searchField) {
        inst.searchField.placeholder = getMsg(
          "TOOLBOX_SEARCH_PLACEHOLDER",
          DEFAULT_PLACEHOLDER,
        );
      }
      return div;
    }
  }

  if (typeof originalMatchBlocks === "function") {
    (ToolboxSearchCategoryI18n.prototype as unknown as SearchCategoryInstance).matchBlocks =
      function (this: SearchCategoryInstance) {
        originalMatchBlocks.call(this);
        const items = (this as unknown as Record<string, unknown>).flyoutItems_ as
          | Array<{ kind: string; text?: string }>
          | undefined;
        let replaced = false;
        if (items) {
          for (const item of items) {
            if (item.kind === "label" && typeof item.text === "string") {
              if (item.text === DEFAULT_HINT) {
                item.text = getMsg("TOOLBOX_SEARCH_HINT", DEFAULT_HINT);
                replaced = true;
              } else if (item.text === DEFAULT_NO_MATCH) {
                item.text = getMsg("TOOLBOX_SEARCH_NO_MATCH", DEFAULT_NO_MATCH);
                replaced = true;
              }
            }
          }
        }
        if (replaced && this.parentToolbox_?.refreshSelection) {
          this.parentToolbox_.refreshSelection();
        }
      };
  }

  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    SEARCH_CATEGORY_KIND,
    ToolboxSearchCategoryI18n,
    true,
  );
}

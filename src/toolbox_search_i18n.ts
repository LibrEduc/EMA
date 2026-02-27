/**
 * @packageDocumentation
 * @module ToolboxSearchI18n
 * @description Enregistre une sous-classe i18n du plugin toolbox-search sans modifier son code.
 * @remarks
 * Après chargement de @blockly/toolbox-search, on remplace la catégorie enregistrée par une
 * sous-classe qui lit les chaînes dans Blockly.Msg. Résistant aux montées de version du plugin.
 * @license GPL-3.0-or-later
 */

import * as Blockly from "blockly";

/** Chaînes par défaut du plugin (en) pour les faire correspondre et les remplacer. */
const DEFAULT_PLACEHOLDER = "Search";
const DEFAULT_HINT = "Type to search for blocks";
const DEFAULT_NO_MATCH = "No matching blocks found";

const SEARCH_CATEGORY_KIND = "search";

function getMsg(key: string, fallback: string): string {
  const msg = (Blockly.Msg as Record<string, string> | undefined)?.[key];
  return msg && msg !== key ? msg : fallback;
}

/**
 * Enregistre la catégorie toolbox-search multilingue.
 * À appeler une fois après import de @blockly/toolbox-search.
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

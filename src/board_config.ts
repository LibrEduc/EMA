/**
 * Carte figée pour EMA (robot MAE).
 *
 * Mono-carte par défaut : pas de sélecteur, pas de catégorie toolbox « Carte ».
 * Pour réactiver le multi-cartes plus tard :
 * 1. `SHOW_BOARD_CATEGORY = true`
 * 2. Afficher un vrai `<select id="boardMenu">` (à la place de `installFixedBoardMenu`)
 * 3. Brancher le `onchange` sur `manager` / toolbox (comme la démo µcBlockly)
 * 4. Changer `EMA_FIXED_BOARD_ID` ou laisser le menu choisir
 */

import type { BoardId } from "../vendor/ucBlockly/src/board_profiles";
import { CAT_BOARD_NAME } from "../vendor/ucBlockly/src/toolbox_filters";
import type { ToolboxConfiguration } from "../vendor/ucBlockly/src/toolbox_types";

/** Profil pins / codegen — MAE tourne sur ce mapping (comme µcBlockly sans menu). */
export const EMA_FIXED_BOARD_ID = "arduino_uno" as const satisfies BoardId;

/** Catégorie toolbox « Carte : … » — masquée tant que le projet est mono-carte. */
export const SHOW_BOARD_CATEGORY = false;

/**
 * Injecte un `#boardMenu` caché pour les APIs µcBlockly (`getSelectedBoardId`, etc.).
 * Idempotent.
 */
export function installFixedBoardMenu(
  boardId: BoardId = EMA_FIXED_BOARD_ID,
): void {
  let menu = document.getElementById("boardMenu") as HTMLSelectElement | null;
  if (!menu) {
    menu = document.createElement("select");
    menu.id = "boardMenu";
    menu.name = "board";
    menu.hidden = true;
    menu.setAttribute("aria-hidden", "true");
    menu.tabIndex = -1;
    document.body.appendChild(menu);
  }

  menu.innerHTML = "";
  const option = document.createElement("option");
  option.value = boardId;
  option.textContent = boardId;
  option.selected = true;
  menu.appendChild(option);
  menu.value = boardId;
}

/** Toolbox sans l'entrée « Carte : … » du rail (le filtre µcBlockly la vide seulement). */
export function withoutBoardCategory(
  toolbox: ToolboxConfiguration,
): ToolboxConfiguration {
  if (!Array.isArray(toolbox.contents)) {
    return toolbox;
  }
  return {
    ...toolbox,
    contents: toolbox.contents.filter((item) => {
      const { name, categorystyle } = item as {
        name?: string;
        categorystyle?: string;
      };
      return name !== CAT_BOARD_NAME && categorystyle !== "board_category";
    }),
  } as ToolboxConfiguration;
}

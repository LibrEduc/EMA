/**
 * @packageDocumentation
 * @module Demo.BoardsMenu
 * @description Populate the demo board &lt;select&gt; from BOARD_PROFILES.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { BOARD_PROFILES, DEFAULT_BOARD_ID } from "../boards";
import { getLangParamFromUrl } from "../language";
import { languagesMap } from "../languages/languageMap";
import { getBoardFamilyMessageKey, getShellMessage } from "../shell_messages";
import type { DemoShellDom } from "./demo_dom";

/**
 * Populates the board dropdown with all available board profiles.
 * @param elements - Demo shell hosts (board + language menus).
 */
export const HTML_populateBoards = (elements: DemoShellDom): void => {
  if (!elements.boardMenu) {
    return;
  }

  const getBoardFamily = (boardId: string, lang: string): string =>
    getShellMessage(getBoardFamilyMessageKey(boardId), lang);

  const currentLang =
    (elements.languageMenu?.value && elements.languageMenu.value.trim().length > 0
      ? elements.languageMenu.value
      : getLangParamFromUrl()) || "en";
  const noneLabel =
    languagesMap[currentLang]?.BOARD_NONE ??
    languagesMap.en?.BOARD_NONE ??
    "none";
  const previousValue = elements.boardMenu.value;

  elements.boardMenu.innerHTML = "";
  if (BOARD_PROFILES.none) {
    const noneOption = document.createElement("option");
    noneOption.value = "none";
    noneOption.textContent = noneLabel;
    elements.boardMenu.appendChild(noneOption);
  }

  const groupedBoards = new Map<string, Array<{ boardId: string; label: string }>>();
  for (const [boardId, profile] of Object.entries(BOARD_PROFILES)) {
    if (boardId === "none") continue;
    const family = getBoardFamily(boardId, currentLang);
    const description =
      typeof profile.description === "string" && profile.description.trim().length > 0
        ? profile.description
        : boardId;
    const list = groupedBoards.get(family) ?? [];
    list.push({ boardId, label: description });
    groupedBoards.set(family, list);
  }

  const sortedFamilies = [...groupedBoards.keys()].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  for (const family of sortedFamilies) {
    const familyBoards = groupedBoards.get(family);
    if (!familyBoards || familyBoards.length === 0) continue;

    familyBoards.sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
    const group = document.createElement("optgroup");
    group.label = family;
    for (const { boardId, label } of familyBoards) {
      const option = document.createElement("option");
      option.value = boardId;
      option.textContent = label;
      group.appendChild(option);
    }
    elements.boardMenu.appendChild(group);
  }
  if (elements.boardMenu.options.length > 0) {
    const fallbackValue =
      BOARD_PROFILES[DEFAULT_BOARD_ID] !== undefined
        ? DEFAULT_BOARD_ID
        : elements.boardMenu.options[0].value;
    const targetValue =
      previousValue && BOARD_PROFILES[previousValue] !== undefined
        ? previousValue
        : fallbackValue;
    elements.boardMenu.value = targetValue;
  }
};

/**
 * @packageDocumentation
 * @module Languages.ArrayMessages
 * @description ARRAY_* messages for S4e-style array blocks.
 * @remarks
 * Merged into Blockly.Msg after setLocale so array blocks display correctly.
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

/** ARRAY_* messages by language code. */
export const ARRAY_MESSAGES: Record<string, Record<string, string>> = {
  en: {
    ARRAY_CREATE_EMPTY_TITLE: "empty",
    ARRAY_CREATE_WITH: "created with",
    ARRAY_CREATE_WITH_INPUT_WITH: "an array",
    ARRAY_CREATE_WITH_ITEM_TITLE: "item",
    ARRAY_CREATE_WITH_ITEM_TOOLTIP: "Add item to array",
    ARRAY_CREATE_WITH_TOOLTIP: "Create array with elements",
    ARRAY_CREATE_WITH_HELPURL: "",
    ARRAY_CREATE_WITH_CONTAINER_TITLE_ADD: "array",
    ARRAY_CREATE_WITH_CONTAINER_TOOLTIP: "Add, remove or reorder elements",
    ARRAY_GETINDEX_AT: "element at index",
    ARRAY_GETINDEX_ITEM: "in array",
    ARRAY_GETINDEX_TOOLTIP: "Get element at index",
    ARRAY_GETINDEX_TOOLTIP1: "Get array element",
    ARRAY_GETINDEX_TOOLTIP2: "Declare or create array",
    ARRAY_GETINDEX_TOOLTIP3: "Set array element",
    ARRAY_GETINDEX_HELPURL: "",
    ARRAY_MODIFY_INDICE: "set element at index",
    ARRAY_MODIFY_NAME: "in array",
    ARRAY_MODIFY_VALUE: "value",
    ARRAY_MODIFY_TOOLTIP: "Assign value to array element",
    ARRAY_MODIFY_HELPURL: "",
    ARRAY_CREATE: "define ",
    ARRAY_LIST: "list",
    ARRAY_LIST_UNTYPED_WARNING:
      "Untyped list. Connect values to determine the type.",
    ARRAY_LIST_DUPLICATE_WARNING:
      "This list is already defined. Rename the variable or remove the extra declaration.",
    ARRAY_ARRAY: "array",
    ARRAY_TAILLE: "size",
    ARRAY_CONTIENT: "contains",
    ARRAY_dim: "dimensions ",
    ARRAY_index: "index",
    ARRAY_taille: "size",
    ARRAY_contenu: "contains",
    ARRAY_FIX: "set element",
    _AT: "to",
    HELPURL: "",
  },
  fr: {
    ARRAY_CREATE_EMPTY_TITLE: "vide",
    ARRAY_CREATE_WITH: "constituée de",
    ARRAY_CREATE_WITH_INPUT_WITH: "une liste",
    ARRAY_CREATE_WITH_ITEM_TITLE: "élément",
    ARRAY_CREATE_WITH_ITEM_TOOLTIP: "Ajoute un élément à la liste",
    ARRAY_CREATE_WITH_TOOLTIP: "Créer une liste ou tableau avec des éléments",
    ARRAY_CREATE_WITH_HELPURL: "",
    ARRAY_CREATE_WITH_CONTAINER_TITLE_ADD: "liste ou tableau",
    ARRAY_CREATE_WITH_CONTAINER_TOOLTIP: "Ajouter, supprimer ou réordonner les éléments",
    ARRAY_GETINDEX_AT: "l'élément au rang",
    ARRAY_GETINDEX_ITEM: "dans la liste",
    ARRAY_GETINDEX_TOOLTIP: "Obtenir l'élément à l'index",
    ARRAY_GETINDEX_TOOLTIP1: "Retourne la valeur stockée dans la liste ou tableau",
    ARRAY_GETINDEX_TOOLTIP2: "Créer une liste ou tableau du type sélectionné",
    ARRAY_GETINDEX_TOOLTIP3: "Fixer un élément de la liste ou tableau",
    ARRAY_GETINDEX_HELPURL: "",
    ARRAY_MODIFY_INDICE: "affecter à l'élément de rang",
    ARRAY_MODIFY_NAME: "dans le tableau",
    ARRAY_MODIFY_VALUE: "la valeur",
    ARRAY_MODIFY_TOOLTIP: "Affecte une valeur à un élément du tableau",
    ARRAY_MODIFY_HELPURL: "",
    ARRAY_CREATE: "définir ",
    ARRAY_LIST: "la liste",
    ARRAY_LIST_UNTYPED_WARNING:
      "Liste non typée. Connectez des valeurs pour déterminer le type.",
    ARRAY_LIST_DUPLICATE_WARNING:
      "Cette liste est déjà définie. Renommez la variable ou supprimez la déclaration en trop.",
    ARRAY_ARRAY: "le tableau",
    ARRAY_TAILLE: "taille",
    ARRAY_CONTIENT: "qui contient",
    ARRAY_dim: "dimensions ",
    ARRAY_index: "index",
    ARRAY_taille: "taille",
    ARRAY_contenu: "qui contient",
    ARRAY_FIX: "mettre l'élément de rang",
    _AT: "à",
    HELPURL: "",
  },
  es: {
    ARRAY_CREATE_EMPTY_TITLE: "vacío",
    ARRAY_CREATE_WITH: "crear con",
    ARRAY_CREATE_WITH_INPUT_WITH: "lista",
    ARRAY_CREATE_WITH_ITEM_TITLE: "elemento",
    ARRAY_CREATE_WITH_ITEM_TOOLTIP: "Añadir elemento a la lista",
    ARRAY_CREATE_WITH_TOOLTIP: "Crear lista con elementos",
    ARRAY_CREATE_WITH_HELPURL: "",
    ARRAY_CREATE_WITH_CONTAINER_TITLE_ADD: "lista o tabla",
    ARRAY_CREATE_WITH_CONTAINER_TOOLTIP: "Añadir, quitar o reordenar elementos",
    ARRAY_GETINDEX_AT: "elemento en índice",
    ARRAY_GETINDEX_ITEM: "en la lista",
    ARRAY_GETINDEX_TOOLTIP: "Obtener elemento en índice",
    ARRAY_GETINDEX_TOOLTIP1: "Obtener elemento del array",
    ARRAY_GETINDEX_TOOLTIP2: "Declarar o crear array",
    ARRAY_GETINDEX_TOOLTIP3: "Asignar elemento del array",
    ARRAY_MODIFY_INDICE: "asignar elemento en índice",
    ARRAY_MODIFY_NAME: "en el array",
    ARRAY_MODIFY_VALUE: "valor",
    ARRAY_MODIFY_TOOLTIP: "Asignar valor a elemento del array",
    ARRAY_CREATE: "definir ",
    ARRAY_LIST: "lista",
    ARRAY_LIST_UNTYPED_WARNING:
      "Lista sin tipo. Conecte valores para determinar el tipo.",
    ARRAY_LIST_DUPLICATE_WARNING:
      "Esta lista ya está definida. Cambie el nombre de la variable o quite la declaración extra.",
    ARRAY_ARRAY: "tabla",
    ARRAY_TAILLE: "tamaño",
    ARRAY_CONTIENT: "contiene",
    ARRAY_dim: "dimensiones ",
    ARRAY_index: "índice",
    ARRAY_taille: "tamaño",
    ARRAY_contenu: "contiene",
    ARRAY_FIX: "poner elemento en",
    _AT: "a",
    ARRAY_GETINDEX_HELPURL: "",
    ARRAY_MODIFY_HELPURL: "",
    HELPURL: "",
  },
  ar: {
    ARRAY_CREATE_EMPTY_TITLE: "فارغ",
    ARRAY_CREATE_WITH: "إنشاء بـ",
    ARRAY_CREATE_WITH_INPUT_WITH: "قائمة",
    ARRAY_CREATE_WITH_ITEM_TITLE: "عنصر",
    ARRAY_CREATE_WITH_ITEM_TOOLTIP: "إضافة عنصر إلى القائمة",
    ARRAY_CREATE_WITH_TOOLTIP: "إنشاء قائمة بعناصر",
    ARRAY_CREATE_WITH_HELPURL: "",
    ARRAY_CREATE_WITH_CONTAINER_TITLE_ADD: "قائمة أو مصفوفة",
    ARRAY_CREATE_WITH_CONTAINER_TOOLTIP: "إضافة أو إزالة أو إعادة ترتيب العناصر",
    ARRAY_GETINDEX_AT: "العنصر في الفهرس",
    ARRAY_GETINDEX_ITEM: "في القائمة",
    ARRAY_GETINDEX_TOOLTIP: "الحصول على العنصر في الفهرس",
    ARRAY_GETINDEX_TOOLTIP1: "الحصول على عنصر المصفوفة",
    ARRAY_GETINDEX_TOOLTIP2: "تعريف أو إنشاء مصفوفة",
    ARRAY_GETINDEX_TOOLTIP3: "تعيين عنصر المصفوفة",
    ARRAY_GETINDEX_HELPURL: "",
    ARRAY_MODIFY_INDICE: "تعيين العنصر في الفهرس",
    ARRAY_MODIFY_NAME: "في المصفوفة",
    ARRAY_MODIFY_VALUE: "القيمة",
    ARRAY_MODIFY_TOOLTIP: "تعيين قيمة لعنصر المصفوفة",
    ARRAY_MODIFY_HELPURL: "",
    ARRAY_CREATE: "تعريف ",
    ARRAY_LIST: "القائمة",
    ARRAY_LIST_UNTYPED_WARNING:
      "قائمة غير مُحددة النوع. صِل قيماً لتحديد النوع.",
    ARRAY_LIST_DUPLICATE_WARNING:
      "هذه القائمة معرّفة مسبقاً. أعد تسمية المتغير أو احذف التعريف الإضافي.",
    ARRAY_ARRAY: "المصفوفة",
    ARRAY_TAILLE: "الحجم",
    ARRAY_CONTIENT: "يحتوي",
    ARRAY_dim: "الأبعاد ",
    ARRAY_index: "الفهرس",
    ARRAY_taille: "الحجم",
    ARRAY_contenu: "يحتوي",
    ARRAY_FIX: "تعيين العنصر",
    _AT: "إلى",
    HELPURL: "",
  },
};

import * as Blockly from "blockly";

/** Merge ARRAY_* messages into Blockly.Msg for the given language. */
export function mergeArrayMessages(lang: string): void {
  const msgs = ARRAY_MESSAGES[lang] ?? ARRAY_MESSAGES["en"];
  Object.assign(Blockly.Msg as Record<string, string>, msgs);
}

/**
 * @packageDocumentation
 * @module Languages.BlocklyA11yMessages
 * @description µcBlockly translations for Blockly 13 messages (shortcuts, hints, screen reader).
 * @remarks Merged into `Blockly.Msg` after `setLocale` to override untranslated keys.
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

/** Blockly 13 accessibility keys — shared list with `check-translations.cjs`. */
export const BLOCKLY_A11Y_MESSAGE_KEYS = [
  "KEYBOARD_NAV_BLOCK_NAVIGATION_HINT",
  "KEYBOARD_NAV_CONSTRAINED_MOVE_HINT",
  "KEYBOARD_NAV_COPIED_HINT",
  "KEYBOARD_NAV_CUT_HINT",
  "KEYBOARD_NAV_FLYOUT_LABEL_HINT",
  "KEYBOARD_NAV_UNCONSTRAINED_MOVE_HINT",
  "KEYBOARD_NAV_WORKSPACE_NAVIGATION_HINT",
  "SCREENREADER_HINT",
  "SCREENREADER_MODE_DISABLED",
  "SCREENREADER_MODE_ENABLED",
  "SHORTCUTS_ABORT_MOVE",
  "SHORTCUTS_CLEANUP",
  "SHORTCUTS_CODE_NAVIGATION",
  "SHORTCUTS_DELETE",
  "SHORTCUTS_DISCONNECT",
  "SHORTCUTS_DUPLICATE",
  "SHORTCUTS_EDITING",
  "SHORTCUTS_ESCAPE",
  "SHORTCUTS_EXTENDED_INFORMATION",
  "SHORTCUTS_FINISH_MOVE",
  "SHORTCUTS_FOCUS_TOOLBOX",
  "SHORTCUTS_FOCUS_WORKSPACE",
  "SHORTCUTS_GENERAL",
  "SHORTCUTS_INFORMATION",
  "SHORTCUTS_JUMP_BLOCK_END",
  "SHORTCUTS_JUMP_BLOCK_START",
  "SHORTCUTS_JUMP_BOTTOM_STACK",
  "SHORTCUTS_JUMP_FIRST_BLOCK",
  "SHORTCUTS_JUMP_LAST_BLOCK",
  "SHORTCUTS_JUMP_TOP_STACK",
  "SHORTCUTS_MOVE_DOWN",
  "SHORTCUTS_MOVE_LEFT",
  "SHORTCUTS_MOVE_RIGHT",
  "SHORTCUTS_MOVE_UP",
  "SHORTCUTS_NEXT_HEADING",
  "SHORTCUTS_NEXT_STACK",
  "SHORTCUTS_PERFORM_ACTION",
  "SHORTCUTS_PREVIOUS_HEADING",
  "SHORTCUTS_PREVIOUS_STACK",
  "SHORTCUTS_SHOW_CONTEXT_MENU",
  "SHORTCUTS_SHOW_TOOLTIP",
  "SHORTCUTS_START_MOVE",
  "SHORTCUTS_START_MOVE_STACK",
  "SHORTCUTS_TOGGLE_SCREENREADER_MODE",
] as const;

const EN: Record<(typeof BLOCKLY_A11Y_MESSAGE_KEYS)[number], string> = {
  KEYBOARD_NAV_BLOCK_NAVIGATION_HINT: "Use %1 to navigate inside of blocks.",
  KEYBOARD_NAV_CONSTRAINED_MOVE_HINT:
    "Use the arrow keys to move, then %1 to accept the position.",
  KEYBOARD_NAV_COPIED_HINT: "Copied. Press %1 to paste.",
  KEYBOARD_NAV_CUT_HINT: "Cut. Press %1 to paste.",
  KEYBOARD_NAV_FLYOUT_LABEL_HINT:
    "Use the arrow keys to navigate to a block, or press %1 to go to the next heading.",
  KEYBOARD_NAV_UNCONSTRAINED_MOVE_HINT:
    "Hold %1 and use arrow keys to move freely, then %2 to accept the position.",
  KEYBOARD_NAV_WORKSPACE_NAVIGATION_HINT: "Use the arrow keys to navigate.",
  SCREENREADER_HINT:
    "Use the arrow keys to navigate. Press %1 to toggle screenreader accessibility mode.",
  SCREENREADER_MODE_DISABLED: "Screenreader mode is off, press %1 to turn it on",
  SCREENREADER_MODE_ENABLED: "Screenreader mode is on, press %1 to turn it off",
  SHORTCUTS_ABORT_MOVE: "Abort move",
  SHORTCUTS_CLEANUP: "Clean up workspace",
  SHORTCUTS_CODE_NAVIGATION: "Code navigation",
  SHORTCUTS_DELETE: "Delete",
  SHORTCUTS_DISCONNECT: "Disconnect block",
  SHORTCUTS_DUPLICATE: "Duplicate",
  SHORTCUTS_EDITING: "Editing",
  SHORTCUTS_ESCAPE: "Exit",
  SHORTCUTS_EXTENDED_INFORMATION: "Announce detailed information",
  SHORTCUTS_FINISH_MOVE: "Finish move",
  SHORTCUTS_FOCUS_TOOLBOX: "Focus toolbox",
  SHORTCUTS_FOCUS_WORKSPACE: "Focus workspace",
  SHORTCUTS_GENERAL: "General",
  SHORTCUTS_INFORMATION: "Announce information",
  SHORTCUTS_JUMP_BLOCK_END: "Jump to block end",
  SHORTCUTS_JUMP_BLOCK_START: "Jump to block start",
  SHORTCUTS_JUMP_BOTTOM_STACK: "Jump to bottom of stack",
  SHORTCUTS_JUMP_FIRST_BLOCK: "Jump to first block",
  SHORTCUTS_JUMP_LAST_BLOCK: "Jump to last block",
  SHORTCUTS_JUMP_TOP_STACK: "Jump to top of stack",
  SHORTCUTS_MOVE_DOWN: "Move down",
  SHORTCUTS_MOVE_LEFT: "Move left",
  SHORTCUTS_MOVE_RIGHT: "Move right",
  SHORTCUTS_MOVE_UP: "Move up",
  SHORTCUTS_NEXT_HEADING: "Next heading",
  SHORTCUTS_NEXT_STACK: "Next stack",
  SHORTCUTS_PERFORM_ACTION: "Edit or confirm",
  SHORTCUTS_PREVIOUS_HEADING: "Previous heading",
  SHORTCUTS_PREVIOUS_STACK: "Previous stack",
  SHORTCUTS_SHOW_CONTEXT_MENU: "Show menu",
  SHORTCUTS_SHOW_TOOLTIP: "Show tooltip",
  SHORTCUTS_START_MOVE: "Start move",
  SHORTCUTS_START_MOVE_STACK: "Start move stack",
  SHORTCUTS_TOGGLE_SCREENREADER_MODE: "Toggle screenreader mode",
};

/** Messages accessibilité Blockly 13 par code langue. */
export const BLOCKLY_A11Y_MESSAGES: Record<string, Record<string, string>> = {
  en: EN,
  fr: {
    ...EN,
    KEYBOARD_NAV_BLOCK_NAVIGATION_HINT:
      "Utilisez %1 pour naviguer à l'intérieur des blocs.",
    KEYBOARD_NAV_CONSTRAINED_MOVE_HINT:
      "Utilisez les touches directionnelles pour déplacer, puis %1 pour valider la position.",
    KEYBOARD_NAV_COPIED_HINT: "Copié. Appuyez sur %1 pour coller.",
    KEYBOARD_NAV_CUT_HINT: "Coupé. Appuyez sur %1 pour coller.",
    KEYBOARD_NAV_FLYOUT_LABEL_HINT:
      "Utilisez les touches directionnelles pour atteindre un bloc, ou appuyez sur %1 pour aller au titre suivant.",
    KEYBOARD_NAV_UNCONSTRAINED_MOVE_HINT:
      "Maintenez %1 et utilisez les touches directionnelles pour déplacer librement, puis %2 pour valider la position.",
    KEYBOARD_NAV_WORKSPACE_NAVIGATION_HINT:
      "Utilisez les touches directionnelles pour naviguer.",
    SCREENREADER_HINT:
      "Utilisez les touches directionnelles pour naviguer. Appuyez sur %1 pour activer le mode accessibilité lecteur d'écran.",
    SCREENREADER_MODE_DISABLED:
      "Mode lecteur d'écran désactivé, appuyez sur %1 pour l'activer",
    SCREENREADER_MODE_ENABLED:
      "Mode lecteur d'écran activé, appuyez sur %1 pour le désactiver",
    SHORTCUTS_ABORT_MOVE: "Annuler le déplacement",
    SHORTCUTS_CLEANUP: "Réorganiser le workspace",
    SHORTCUTS_CODE_NAVIGATION: "Navigation dans le code",
    SHORTCUTS_DELETE: "Supprimer",
    SHORTCUTS_DISCONNECT: "Déconnecter le bloc",
    SHORTCUTS_DUPLICATE: "Dupliquer",
    SHORTCUTS_EDITING: "Édition",
    SHORTCUTS_ESCAPE: "Quitter",
    SHORTCUTS_EXTENDED_INFORMATION: "Annoncer des informations détaillées",
    SHORTCUTS_FINISH_MOVE: "Terminer le déplacement",
    SHORTCUTS_FOCUS_TOOLBOX: "Focus sur la boîte à outils",
    SHORTCUTS_FOCUS_WORKSPACE: "Focus sur le workspace",
    SHORTCUTS_GENERAL: "Général",
    SHORTCUTS_INFORMATION: "Annoncer les informations",
    SHORTCUTS_JUMP_BLOCK_END: "Aller à la fin du bloc",
    SHORTCUTS_JUMP_BLOCK_START: "Aller au début du bloc",
    SHORTCUTS_JUMP_BOTTOM_STACK: "Aller en bas de la pile",
    SHORTCUTS_JUMP_FIRST_BLOCK: "Aller au premier bloc",
    SHORTCUTS_JUMP_LAST_BLOCK: "Aller au dernier bloc",
    SHORTCUTS_JUMP_TOP_STACK: "Aller en haut de la pile",
    SHORTCUTS_MOVE_DOWN: "Déplacer vers le bas",
    SHORTCUTS_MOVE_LEFT: "Déplacer vers la gauche",
    SHORTCUTS_MOVE_RIGHT: "Déplacer vers la droite",
    SHORTCUTS_MOVE_UP: "Déplacer vers le haut",
    SHORTCUTS_NEXT_HEADING: "Titre suivant",
    SHORTCUTS_NEXT_STACK: "Pile suivante",
    SHORTCUTS_PERFORM_ACTION: "Éditer ou confirmer",
    SHORTCUTS_PREVIOUS_HEADING: "Titre précédent",
    SHORTCUTS_PREVIOUS_STACK: "Pile précédente",
    SHORTCUTS_SHOW_CONTEXT_MENU: "Afficher le menu",
    SHORTCUTS_SHOW_TOOLTIP: "Afficher l'infobulle",
    SHORTCUTS_START_MOVE: "Démarrer le déplacement",
    SHORTCUTS_START_MOVE_STACK: "Déplacer la pile",
    SHORTCUTS_TOGGLE_SCREENREADER_MODE:
      "Activer/désactiver le mode lecteur d'écran",
  },
  es: {
    ...EN,
    KEYBOARD_NAV_BLOCK_NAVIGATION_HINT: "Use %1 para navegar dentro de los bloques.",
    KEYBOARD_NAV_CONSTRAINED_MOVE_HINT:
      "Use las flechas para mover y %1 para aceptar la posición.",
    KEYBOARD_NAV_COPIED_HINT: "Copiado. Pulse %1 para pegar.",
    KEYBOARD_NAV_CUT_HINT: "Cortado. Pulse %1 para pegar.",
    KEYBOARD_NAV_FLYOUT_LABEL_HINT:
      "Use las flechas para ir a un bloque o pulse %1 para ir al siguiente encabezado.",
    KEYBOARD_NAV_UNCONSTRAINED_MOVE_HINT:
      "Mantenga %1 y use las flechas para mover libremente, luego %2 para aceptar la posición.",
    KEYBOARD_NAV_WORKSPACE_NAVIGATION_HINT: "Use las flechas para navegar.",
    SCREENREADER_HINT:
      "Use las flechas para navegar. Pulse %1 para activar el modo de accesibilidad para lectores de pantalla.",
    SCREENREADER_MODE_DISABLED:
      "Modo lector de pantalla desactivado, pulse %1 para activarlo",
    SCREENREADER_MODE_ENABLED:
      "Modo lector de pantalla activado, pulse %1 para desactivarlo",
    SHORTCUTS_ABORT_MOVE: "Cancelar desplazamiento",
    SHORTCUTS_CLEANUP: "Organizar el workspace",
    SHORTCUTS_CODE_NAVIGATION: "Navegación de código",
    SHORTCUTS_DELETE: "Eliminar",
    SHORTCUTS_DISCONNECT: "Desconectar bloque",
    SHORTCUTS_DUPLICATE: "Duplicar",
    SHORTCUTS_EDITING: "Edición",
    SHORTCUTS_ESCAPE: "Salir",
    SHORTCUTS_EXTENDED_INFORMATION: "Anunciar información detallada",
    SHORTCUTS_FINISH_MOVE: "Finalizar desplazamiento",
    SHORTCUTS_FOCUS_TOOLBOX: "Enfocar caja de herramientas",
    SHORTCUTS_FOCUS_WORKSPACE: "Enfocar workspace",
    SHORTCUTS_GENERAL: "General",
    SHORTCUTS_INFORMATION: "Anunciar información",
    SHORTCUTS_JUMP_BLOCK_END: "Ir al final del bloque",
    SHORTCUTS_JUMP_BLOCK_START: "Ir al inicio del bloque",
    SHORTCUTS_JUMP_BOTTOM_STACK: "Ir al final de la pila",
    SHORTCUTS_JUMP_FIRST_BLOCK: "Ir al primer bloque",
    SHORTCUTS_JUMP_LAST_BLOCK: "Ir al último bloque",
    SHORTCUTS_JUMP_TOP_STACK: "Ir al inicio de la pila",
    SHORTCUTS_MOVE_DOWN: "Mover abajo",
    SHORTCUTS_MOVE_LEFT: "Mover a la izquierda",
    SHORTCUTS_MOVE_RIGHT: "Mover a la derecha",
    SHORTCUTS_MOVE_UP: "Mover arriba",
    SHORTCUTS_NEXT_HEADING: "Encabezado siguiente",
    SHORTCUTS_NEXT_STACK: "Pila siguiente",
    SHORTCUTS_PERFORM_ACTION: "Editar o confirmar",
    SHORTCUTS_PREVIOUS_HEADING: "Encabezado anterior",
    SHORTCUTS_PREVIOUS_STACK: "Pila anterior",
    SHORTCUTS_SHOW_CONTEXT_MENU: "Mostrar menú",
    SHORTCUTS_SHOW_TOOLTIP: "Mostrar información",
    SHORTCUTS_START_MOVE: "Iniciar desplazamiento",
    SHORTCUTS_START_MOVE_STACK: "Desplazar pila",
    SHORTCUTS_TOGGLE_SCREENREADER_MODE:
      "Activar/desactivar modo lector de pantalla",
  },
  ar: {
    ...EN,
    KEYBOARD_NAV_BLOCK_NAVIGATION_HINT: "استخدم %1 للتنقل داخل الكتل.",
    KEYBOARD_NAV_CONSTRAINED_MOVE_HINT:
      "استخدم مفاتيح الأسهم للتحريك، ثم %1 لقبول الموضع.",
    KEYBOARD_NAV_COPIED_HINT: "تم النسخ. اضغط %1 للصق.",
    KEYBOARD_NAV_CUT_HINT: "تم القص. اضغط %1 للصق.",
    KEYBOARD_NAV_FLYOUT_LABEL_HINT:
      "استخدم مفاتيح الأسهم للانتقال إلى كتلة، أو اضغط %1 للعنوان التالي.",
    KEYBOARD_NAV_UNCONSTRAINED_MOVE_HINT:
      "اضغط مع الاستمرار على %1 واستخدم مفاتيح الأسهم للتحريك بحرية، ثم %2 لقبول الموضع.",
    KEYBOARD_NAV_WORKSPACE_NAVIGATION_HINT: "استخدم مفاتيح الأسهم للتنقل.",
    SCREENREADER_HINT:
      "استخدم مفاتيح الأسهم للتنقل. اضغط %1 لتبديل وضع إمكانية الوصول لقارئ الشاشة.",
    SCREENREADER_MODE_DISABLED: "وضع قارئ الشاشة معطّل، اضغط %1 لتفعيله",
    SCREENREADER_MODE_ENABLED: "وضع قارئ الشاشة مفعّل، اضغط %1 لإيقافه",
    SHORTCUTS_ABORT_MOVE: "إلغاء التحريك",
    SHORTCUTS_CLEANUP: "ترتيب مساحة العمل",
    SHORTCUTS_CODE_NAVIGATION: "التنقل في الكود",
    SHORTCUTS_DELETE: "حذف",
    SHORTCUTS_DISCONNECT: "فصل الكتلة",
    SHORTCUTS_DUPLICATE: "تكرار",
    SHORTCUTS_EDITING: "تحرير",
    SHORTCUTS_ESCAPE: "خروج",
    SHORTCUTS_EXTENDED_INFORMATION: "الإعلان عن معلومات مفصّلة",
    SHORTCUTS_FINISH_MOVE: "إنهاء التحريك",
    SHORTCUTS_FOCUS_TOOLBOX: "التركيز على صندوق الأدوات",
    SHORTCUTS_FOCUS_WORKSPACE: "التركيز على مساحة العمل",
    SHORTCUTS_GENERAL: "عام",
    SHORTCUTS_INFORMATION: "الإعلان عن المعلومات",
    SHORTCUTS_JUMP_BLOCK_END: "الانتقال إلى نهاية الكتلة",
    SHORTCUTS_JUMP_BLOCK_START: "الانتقال إلى بداية الكتلة",
    SHORTCUTS_JUMP_BOTTOM_STACK: "الانتقال إلى أسفل المكدس",
    SHORTCUTS_JUMP_FIRST_BLOCK: "الانتقال إلى أول كتلة",
    SHORTCUTS_JUMP_LAST_BLOCK: "الانتقال إلى آخر كتلة",
    SHORTCUTS_JUMP_TOP_STACK: "الانتقال إلى أعلى المكدس",
    SHORTCUTS_MOVE_DOWN: "تحريك لأسفل",
    SHORTCUTS_MOVE_LEFT: "تحريك لليسار",
    SHORTCUTS_MOVE_RIGHT: "تحريك لليمين",
    SHORTCUTS_MOVE_UP: "تحريك لأعلى",
    SHORTCUTS_NEXT_HEADING: "العنوان التالي",
    SHORTCUTS_NEXT_STACK: "المكدس التالي",
    SHORTCUTS_PERFORM_ACTION: "تحرير أو تأكيد",
    SHORTCUTS_PREVIOUS_HEADING: "العنوان السابق",
    SHORTCUTS_PREVIOUS_STACK: "المكدس السابق",
    SHORTCUTS_SHOW_CONTEXT_MENU: "إظهار القائمة",
    SHORTCUTS_SHOW_TOOLTIP: "إظهار التلميح",
    SHORTCUTS_START_MOVE: "بدء التحريك",
    SHORTCUTS_START_MOVE_STACK: "تحريك المكدس",
    SHORTCUTS_TOGGLE_SCREENREADER_MODE: "تبديل وضع قارئ الشاشة",
  },
};

/** Fusionne les messages accessibilité Blockly 13 dans `Blockly.Msg`. */
export function mergeBlocklyA11yMessages(lang: string): void {
  const msgs = BLOCKLY_A11Y_MESSAGES[lang] ?? BLOCKLY_A11Y_MESSAGES.en;
  Object.assign(Blockly.Msg as Record<string, string>, msgs);
}

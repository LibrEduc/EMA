/**
 * @packageDocumentation
 * @module Instances.Messages
 * @description i18n for FieldInstance (NEW / RENAME / COMPONENT_WARN).
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

const INSTANCE_MESSAGES: Record<string, Record<string, string>> = {
  en: {
    NEW_INSTANCE: "New Instance",
    RENAME_INSTANCE: "Rename Instance",
    NEW_INSTANCE_TITLE: "New instance name:",
    RENAME_INSTANCE_TITLE: 'Rename all "%1" instances to:',
    COMPONENT_WARN:
      'Component "%2" needs a configuration block%1',
    INSTANCE_NAME_COLLIDES_WITH_VARIABLE:
      'The name "%1" is already used by a variable.',
    VARIABLE_NAME_COLLIDES_WITH_INSTANCE:
      'The name "%1" is already used by a component instance.',
  },
  fr: {
    NEW_INSTANCE: "nouvelle instance",
    RENAME_INSTANCE: "renommer cette instance",
    NEW_INSTANCE_TITLE: "nouveau nom d'instance :",
    RENAME_INSTANCE_TITLE: 'renommer toutes les instances "%1" en :',
    COMPONENT_WARN:
      'Le composant "%2" nécessite un bloc de configuration%1',
    INSTANCE_NAME_COLLIDES_WITH_VARIABLE:
      'Le nom « %1 » est déjà utilisé par une variable.',
    VARIABLE_NAME_COLLIDES_WITH_INSTANCE:
      'Le nom « %1 » est déjà utilisé par une instance de composant.',
  },
  es: {
    NEW_INSTANCE: "instancia nueva",
    RENAME_INSTANCE: "cambiar nombre a esta instancia",
    NEW_INSTANCE_TITLE: "nombre de instancia nuevo:",
    RENAME_INSTANCE_TITLE: 'cambiar el nombre a todas las instancias "%1" a:',
    COMPONENT_WARN:
      'El componente "%2" necesita un bloque de configuración%1',
    INSTANCE_NAME_COLLIDES_WITH_VARIABLE:
      'El nombre "%1" ya lo usa una variable.',
    VARIABLE_NAME_COLLIDES_WITH_INSTANCE:
      'El nombre "%1" ya lo usa una instancia de componente.',
  },
  ar: {
    NEW_INSTANCE: "مثيل جديد",
    RENAME_INSTANCE: "إعادة تسمية المثيل",
    NEW_INSTANCE_TITLE: "اسم المثيل الجديد:",
    RENAME_INSTANCE_TITLE: 'إعادة تسمية كل مثيلات "%1" إلى:',
    COMPONENT_WARN:
      'المكوّن "%2" يحتاج إلى كتلة إعداد%1',
    INSTANCE_NAME_COLLIDES_WITH_VARIABLE:
      'الاسم "%1" مستخدم بالفعل بواسطة متغير.',
    VARIABLE_NAME_COLLIDES_WITH_INSTANCE:
      'الاسم "%1" مستخدم بالفعل بواسطة مثيل مكوّن.',
  },
};

/**
 * Merge FieldInstance messages into `Blockly.Msg`.
 * @param lang - Language code (e.g. `fr`, `en`).
 */
export function mergeInstanceMessages(lang: string): void {
  const msgs = INSTANCE_MESSAGES[lang] ?? INSTANCE_MESSAGES.en;
  Object.assign(Blockly.Msg as Record<string, string>, msgs);
}

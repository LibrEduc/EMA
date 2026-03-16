/**
 * @packageDocumentation
 * @module Language.Ar
 * @description Arabic translations for µcBlockly.
 * @remarks
 * Locale strings used by the language map.
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

import { LanguageMap } from './languageMap';

export const arLang: LanguageMap = {
  'ar': {
    HOME: "µcBlockly",
    ABOUT: "في ما يخص",
    CONTACT: "اتصال",
    UNDO: "تراجع",
    REDO: "إعادة",
    SAVE: "حفظ",
    LOAD: "فتح",
    ABOUT_TOOLTIP: "صفحة المشروع",
    CONTACT_TOOLTIP: "الاتصال بالمؤلف",
    UNDO_TOOLTIP: "تراجع عن آخر إجراء",
    REDO_TOOLTIP: "إعادة آخر إجراء",
    SAVE_TOOLTIP: "حفظ الكتل في ملف",
    LOAD_TOOLTIP: "فتح ملف لتحميل الكتل",
    PLUGIN_MINIMAP: "مصغّر",
    PLUGIN_HIGHLIGHT: "تمييز",
    PLUGIN_CONTINUOUSTOOLBOX: "صندوق الأدوات",
    PLUGIN_DEBUG: "تصحيح",
    PLUGIN_MINIMAP_TOOLTIP: "عرض الخريطة المصغرة",
    PLUGIN_HIGHLIGHT_TOOLTIP: "تفعيل التمييز",
    PLUGIN_CONTINUOUSTOOLBOX_TOOLTIP: "استخدام صندوق الأدوات المستمر",
    ALWAYS_OPEN_FLYOUT: "مفتوحة دائماً",
    ALWAYS_OPEN_FLYOUT_TOOLTIP: "ابقاء لوحة الادوات مفتوحة",
    LANGUAGE_MENU_TOOLTIP: "تغيير لغة الواجهة",
    THEME_MENU_TOOLTIP: "تغيير سمة مساحة العمل",
    RENDERER_MENU_TOOLTIP: "تغيير عرض الكتل",
    CODE_EDITOR: "المحرر",
    CODE_EDITOR_TOOLTIP: "عرض محرر الشفرة",
    PLUGIN_DEBUG_TOOLTIP: "تفعيل سجلات التصحيح في وحدة التحكم",
    CAT_LOGIC: "منطق",
    CAT_LOOPS: "الحلقات",
    CAT_MATHS: "رياضيات",
    CAT_TEXT: "نص",
    CAT_LISTS: "قوائم",
    CAT_LIBRE: "حر",
    CAT_BOARD: "لوحة",
    CAT_BOARD_BASE: "أساسي",
    CAT_BOARD_IN: "مدخلات",
    CAT_BOARD_OUT: "مخرجات",
    CAT_BOARD_INOUT: "إدخال / إخراج",
    CAT_BOARD_TIME: "وقت",
    CAT_BOARD_CONVERSION: "تحويل",
    CAT_BOARD_SERIAL: "اتصال تسلسلي",
    CAT_SEARCH: "بحث",
    CAT_COLOR: "لون",
    CAT_VARIABLES: "متغيرات",
    CAT_FUNCTIONS: "إجراءات",
    THEME_CLASSIC: "classic",
    THEME_MODERN: "modern",
    THEME_DEUTERANOPIA: "deuteranopia",
    THEME_TRITANOPIA: "tritanopia",
    THEME_ZELOS: "zelos",
    THEME_HIGHCONTRAST: "high contrast",
    THEME_DARK: "dark",
    THEME_BLACKWHITE: "black and white",
    RENDERER_GERAS: "geras",
    RENDERER_THRASOS: "thrasos",
    RENDERER_ZELOS: "zelos",
    RENDERER_MINI: "minimalist",
    BOARD_NONE: "بدون",
    A11Y_GENERATED_CODE_REGION: "كود اردوينو المولد",
    A11Y_CONSOLE_REGION: "وحدة التحكم",
    A11Y_HORIZONTAL_RESIZER: "تغيير الحجم بين محرر بلوكلي ولوحة الكود",
    A11Y_VERTICAL_RESIZER: "تغيير الحجم بين المساحة الرئيسية ووحدة التحكم",
    A11Y_COLLAPSE_CODE_PANEL: "طي لوحة الكود",
    A11Y_OPEN_CODE_PANEL: "فتح لوحة الكود",
    A11Y_COLLAPSE_CONSOLE_PANEL: "طي وحدة التحكم",
    A11Y_OPEN_CONSOLE_PANEL: "فتح وحدة التحكم",
    EMPTY_BACKPACK: "إفراغ الحقيبة",
    REMOVE_FROM_BACKPACK: "إزالة من الحقيبة",
    COPY_TO_BACKPACK: "نسخ إلى الحقيبة",
    COPY_ALL_TO_BACKPACK: "نسخ كل الكتل إلى الحقيبة",
    PASTE_ALL_FROM_BACKPACK: "لصق كل الكتل من الحقيبة",
    RESET_TITLE: "انقر لإعادة تعيين جميع المعاملات",
    TYPED_VAR_MODAL_CONFIRM_BUTTON: "موافق",
    TYPED_VAR_MODAL_VARIABLE_NAME_LABEL: "اسم المتغير: ",
    TYPED_VAR_MODAL_TYPES_LABEL: "أنواع المتغيرات",
    TYPED_VAR_MODAL_CANCEL_BUTTON: "إلغاء",
    TYPED_VAR_MODAL_TITLE: "إنشاء متغير مُحدد النوع",
    TYPED_VAR_MODAL_INVALID_NAME: "الاسم غير صالح. يرجى اختيار اسم مختلف.",
    TYPED_VAR_UNTYPED_WARNING: "متغير غير مُحدد النوع. صِل قيمة لتحديد النوع.",
    TYPED_VAR_TYPE_MISMATCH: "نوع غير متوافق: المتغير من النوع '%1' لكنه يستقبل '%2'.",
    TYPED_VAR_SET_LABEL: "عيّن",
    TYPED_VAR_TO_LABEL: "إلى",
    TYPED_VAR_TYPE_SET_LABEL: "عيّن نوع",
    TYPED_VAR_TYPE_TO_LABEL: "إلى",
    TYPED_VAR_ARG_TYPE_LABEL: "النوع",
    VARIABLES_LOCAL: "محلي",
    VARIABLES_LOCAL_TOOLTIP: "يُحدد القيمة على أنها محلية.",
    CONTROLS_SWITCH_HELPURL: "https://www.arduino.cc/reference/en/language/structure/control-structure/switchcase/",
    CONTROLS_SWITCH_VAR_TITLE: "بدّل",
    CONTROLS_SWITCH_VAR_TAIL: "على",
    CONTROLS_SWITCH_MSG_CASEBREAK: "حالة",
    CONTROLS_SWITCH_MSG_DO: "نفّذ",
    CONTROLS_SWITCH_MSG_DEFAULT: "افتراضي",
    CONTROLS_SWITCH_MSG_SWITCHVAR: "متغير التبديل",
    CONTROLS_SWITCH_VAR_TOOLTIP: "إضافة أو حذف أو إعادة ترتيب حالات التبديل.",
    CONTROLS_SWITCH_CASEBREAK_TOOLTIP: "إضافة حالة مع break.",
    CONTROLS_SWITCH_DEFAULT_TOOLTIP: "إضافة الحالة الافتراضية.",
    CONTROLS_SWITCH_TOOLTIP_1: "تبديل بدون حالات.",
    CONTROLS_SWITCH_TOOLTIP_2: "تبديل مع حالة افتراضية.",
    CONTROLS_SWITCH_TOOLTIP_3: "تبديل مع حالات.",
    CONTROLS_SWITCH_TOOLTIP_4: "تبديل مع حالات وافتراضي.",
    MATH_CHANGE_LABEL: "غيّر",
    MATH_CHANGE_BY: "بمقدار",
    MATH_CHANGE_VAR_WARNING: "صِل متغيرًا.",
    MATH_PERCENT_TOOLTIP: "اختر قيمة بالنسبة المئوية.",
    MATH_PERCENT_HELPURL: "",
    VARIABLES_SET_CONST: "ثابت",
    VARIABLES_SET_CONST_AT: "=",
    VARIABLES_SET_CONST_TOOLTIP: "تعريف ثابت",
    VARIABLES_SET_CONST_HELPURL: "",
    VARIABLES_SET_INIT: "تعريف",
    VARIABLES_AS: "كـ",
    VARIABLES_SET_INIT_TOOLTIP: "تعريف وتهيئة",
    VARIABLES_SET_INIT_HELPURL: "",
    _AT: "=",
    VARIABLES_CONST_WARNING: "ثابت: الإسناد غير مسموح",
    VAR_TYPE_INT: "int",
    VAR_TYPE_FLOAT: "float",
    VAR_TYPE_BOOL: "bool",
    VAR_TYPE_STRING: "string",
    VAR_TYPE_CHAR: "char",
    COLOUR_HSV_HUE_LABEL: "درجة اللون",
    COLOUR_HSV_SATURATION_LABEL: "التشبع",
    COLOUR_HSV_BRIGHTNESS_LABEL: "السطوع",
    COLOUR_HSV_EYEDROPPER_LABEL: "القطارة",
    VARIABLES_GET_ITEM: "عنصر",
    VARIABLES_DEFINE: "تعريف متغير",
    ARRAY_UNE_LISTE: "قائمة تتكون من",
    ARRAY_WITH_TOOLTIP: "إنشاء قائمة بعناصر",
    ARRAY_WITH_HELPURL: "",
    LIBRE_TOOLTIP: "كتلة حرة: نص أو تعليق للكود.",
    LIBRE_LOOP_DO: "تنفيذ",
    TOOLBOX_SEARCH_PLACEHOLDER: "بحث",
    TOOLBOX_SEARCH_HINT: "اكتب 3 أحرف على الأقل للبحث عن الكتل",
    TOOLBOX_SEARCH_NO_MATCH: "لم يتم العثور على كتل",
    MATH_ANGLE: "زاوية",
    INOUT_ANGLE_MATHS_TOOLTIP: "زاوية بالدرجات",
    MATH_INTERVAL_TOOLTIP: "مقارنة ما إذا كانت القيمة ضمن نطاق",
    ARDUINO_BASE_DEFINE_CONST_TOOLTIP: "تعريف ثابت",
    ARDUINO_BASE_DEFINE_CONST_HELPURL: "",
  }
};
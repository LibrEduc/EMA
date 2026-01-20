/**
 * @packageDocumentation Define type and table of translated definition
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */
export interface LanguageMap {
    [key: string]: LanguageItem;
}
export declare const languagesMap: LanguageMap;
type LanguageMapBlockly = {
    [key: string]: {
        [key: string]: string;
    };
};
export declare const languagesMapBlockly: LanguageMapBlockly;
export interface LanguageItem {
    HOME: string;
    ABOUT: string;
    CONTACT: string;
    ABOUT_TOOLTIP: string;
    CONTACT_TOOLTIP: string;
    PLUGIN_MINIMAP: string;
    PLUGIN_HIGHLIGHT: string;
    PLUGIN_CONTINUOUSTOOLBOX: string;
    PLUGIN_DEBUG: string;
    PLUGIN_MINIMAP_TOOLTIP: string;
    PLUGIN_HIGHLIGHT_TOOLTIP: string;
    PLUGIN_CONTINUOUSTOOLBOX_TOOLTIP: string;
    ALWAYS_OPEN_FLYOUT: string;
    ALWAYS_OPEN_FLYOUT_TOOLTIP: string;
    LANGUAGE_MENU_TOOLTIP: string;
    THEME_MENU_TOOLTIP: string;
    RENDERER_MENU_TOOLTIP: string;
    CODE_EDITOR: string;
    CODE_EDITOR_TOOLTIP: string;
    PLUGIN_DEBUG_TOOLTIP: string;
    CAT_LOGIC: string;
    CAT_LOOPS: string;
    CAT_MATHS: string;
    CAT_TEXT: string;
    CAT_LISTS: string;
    CAT_COLOR: string;
    CAT_VARIABLES: string;
    CAT_FUNCTIONS: string;
    THEME_CLASSIC: string;
    THEME_MODERN: string;
    THEME_DEUTERANOPIA: string;
    THEME_TRITANOPIA: string;
    THEME_ZELOS: string;
    THEME_HIGHCONTRAST: string;
    THEME_DARK: string;
    THEME_BLACKWHITE: string;
    RENDERER_GERAS: string;
    RENDERER_THRASOS: string;
    RENDERER_ZELOS: string;
    RENDERER_MINI: string;
    EMPTY_BACKPACK: string;
    RESET_TITLE: string;
    TYPED_VAR_MODAL_CONFIRM_BUTTON: string;
    TYPED_VAR_MODAL_VARIABLE_NAME_LABEL: string;
    TYPED_VAR_MODAL_TYPES_LABEL: string;
    TYPED_VAR_MODAL_CANCEL_BUTTON: string;
    TYPED_VAR_MODAL_TITLE: string;
    TYPED_VAR_MODAL_INVALID_NAME: string;
    TYPED_VAR_UNTYPED_WARNING: string;
    TYPED_VAR_TYPE_MISMATCH: string;
    TYPED_VAR_SET_LABEL: string;
    TYPED_VAR_TO_LABEL: string;
    TYPED_VAR_TYPE_SET_LABEL: string;
    TYPED_VAR_TYPE_TO_LABEL: string;
    TYPED_VAR_ARG_TYPE_LABEL: string;
    VARIABLES_LOCAL: string;
    VARIABLES_LOCAL_TOOLTIP: string;
    CONTROLS_SWITCH_HELPURL: string;
    CONTROLS_SWITCH_VAR_TITLE: string;
    CONTROLS_SWITCH_VAR_TAIL: string;
    CONTROLS_SWITCH_MSG_CASEBREAK: string;
    CONTROLS_SWITCH_MSG_DO: string;
    CONTROLS_SWITCH_MSG_DEFAULT: string;
    CONTROLS_SWITCH_MSG_SWITCHVAR: string;
    CONTROLS_SWITCH_VAR_TOOLTIP: string;
    CONTROLS_SWITCH_CASEBREAK_TOOLTIP: string;
    CONTROLS_SWITCH_DEFAULT_TOOLTIP: string;
    CONTROLS_SWITCH_TOOLTIP_1: string;
    CONTROLS_SWITCH_TOOLTIP_2: string;
    CONTROLS_SWITCH_TOOLTIP_3: string;
    CONTROLS_SWITCH_TOOLTIP_4: string;
    VARIABLES_SET_CONST: string;
    VARIABLES_SET_CONST_AT: string;
    VARIABLES_SET_CONST_TOOLTIP: string;
    VARIABLES_SET_CONST_HELPURL: string;
    VARIABLES_SET_INIT: string;
    VARIABLES_AS: string;
    VARIABLES_SET_INIT_TOOLTIP: string;
    VARIABLES_SET_INIT_HELPURL: string;
    _AT: string;
    VARIABLES_CONST_WARNING: string;
    VAR_TYPE_INT: string;
    VAR_TYPE_FLOAT: string;
    VAR_TYPE_BOOL: string;
    VAR_TYPE_STRING: string;
    VAR_TYPE_CHAR: string;
}
export {};
//# sourceMappingURL=languageMap.d.ts.map
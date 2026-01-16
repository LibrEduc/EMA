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
    PLUGIN_MINIMAP: string;
    PLUGIN_HIGHLIGHT: string;
    PLUGIN_CONTINUOUSTOOLBOX: string;
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
}
export {};
//# sourceMappingURL=languageMap.d.ts.map
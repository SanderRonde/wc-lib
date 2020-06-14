import { WebComponentDefinerTypeInstance, WebComponentDefinerTypeStatic, WebComponentBaseTypeInstance, WebComponentBaseTypeStatic, WebComponentListenableTypeInstance, WebComponentListenableTypeStatic, WebComponentTypeInstance, WebComponentTypeStatic, WebComponentThemeManagerTypeInstance, WebComponentThemeManagerTypeStatic, WebComponentI18NManagerTypeInstance, WebComponentI18NManagerTypeStatic, WebComponentHierarchyManagerTypeInstance, WebComponentHierarchyManagerTypeStatic, WebComponentTemplateManagerTypeInstance, WebComponentTemplateManagerTypeStatic } from './types';
import { EventListenerObj, GetEvents } from '../lib/listener.js';
import { SelectorMap, GetEls } from '../lib/component.js';
declare const basicWebComponent: {
    new <GA extends {
        events?: EventListenerObj | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        i18n?: any;
        langs?: string | undefined;
        selectors?: SelectorMap | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentTypeInstance<GA, void, ELS>;
    self(): WebComponentDefinerTypeStatic & WebComponentBaseTypeStatic & WebComponentListenableTypeStatic & WebComponentTypeStatic;
} & Pick<typeof WebComponentDefinerTypeInstance, "dependencies" | "is" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentTypeInstance, never>;
/**
 * A component that only uses the most basic parts
 * Uses the `definer`, `renderer` and `listeners`
 */
export declare class BasicWebComponent<GA extends {
    i18n?: any;
    langs?: string;
    events?: EventListenerObj;
    selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends basicWebComponent<GA, E, ELS> {
}
declare const themingWebComponent: {
    new <GA extends {
        events?: EventListenerObj | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        i18n?: any;
        langs?: string | undefined;
        selectors?: SelectorMap | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentThemeManagerTypeInstance<GA> & WebComponentTypeInstance<GA, void, ELS>;
    self(): WebComponentDefinerTypeStatic & WebComponentBaseTypeStatic & WebComponentListenableTypeStatic & WebComponentThemeManagerTypeStatic & WebComponentTypeStatic;
} & Pick<typeof WebComponentDefinerTypeInstance, "dependencies" | "is" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentThemeManagerTypeInstance, "__constructedCSSChanged" | "initTheme" | "setDefaultTheme"> & Pick<typeof WebComponentTypeInstance, never>;
/**
 * A component that uses the basic parts combined
 * with the theming part.
 * Uses the `theming`,
 * `definer`, `renderer` and `listeners`
 */
export declare class ThemingWebComponent<GA extends {
    i18n?: any;
    langs?: string;
    events?: EventListenerObj;
    themes?: {
        [key: string]: any;
    };
    selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends themingWebComponent<GA, E, ELS> {
}
declare const i18NWebComponent: {
    new <GA extends {
        events?: EventListenerObj | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        i18n?: any;
        langs?: string | undefined;
        selectors?: SelectorMap | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentI18NManagerTypeInstance<GA> & WebComponentTypeInstance<GA, void, ELS>;
    self(): WebComponentDefinerTypeStatic & WebComponentBaseTypeStatic & WebComponentListenableTypeStatic & WebComponentI18NManagerTypeStatic & WebComponentTypeStatic;
} & Pick<typeof WebComponentDefinerTypeInstance, "dependencies" | "is" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentI18NManagerTypeInstance, "initI18N" | "__prom" | "__" | "langReady"> & Pick<typeof WebComponentTypeInstance, never>;
/**
 * A component that uses the basic parts combined
 * with the I18N part.
 * Uses the `i18n`,
 * `definer`, `renderer` and `listeners`
 */
export declare class I18NWebComponent<GA extends {
    i18n?: any;
    langs?: string;
    events?: EventListenerObj;
    themes?: {
        [key: string]: any;
    };
    selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends i18NWebComponent<GA, E, ELS> {
}
declare const complexTemplatingWebComponent: {
    new <GA extends {
        events?: EventListenerObj | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        i18n?: any;
        langs?: string | undefined;
        selectors?: SelectorMap | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentHierarchyManagerTypeInstance<GA> & WebComponentTemplateManagerTypeInstance & WebComponentTypeInstance<GA, void, ELS>;
    self(): WebComponentDefinerTypeStatic & WebComponentBaseTypeStatic & WebComponentListenableTypeStatic & WebComponentHierarchyManagerTypeStatic & WebComponentTemplateManagerTypeStatic & WebComponentTypeStatic;
} & Pick<typeof WebComponentDefinerTypeInstance, "dependencies" | "is" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentHierarchyManagerTypeInstance, never> & Pick<typeof WebComponentTemplateManagerTypeInstance, "initComplexTemplateProvider"> & Pick<typeof WebComponentTypeInstance, never>;
/**
 * A component that uses the basic parts combined
 * with the hierarchy manager.
 * Uses the `hierarchy`,
 * `definer`, `renderer` and `listeners`
 */
export declare class ComplexTemplatingWebComponent<GA extends {
    i18n?: any;
    langs?: string;
    events?: EventListenerObj;
    selectors?: SelectorMap;
    root?: any;
    parent?: any;
    globalProps?: {
        [key: string]: any;
    };
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends complexTemplatingWebComponent<GA, E, ELS> {
}
export {};
//# sourceMappingURL=partial.d.ts.map
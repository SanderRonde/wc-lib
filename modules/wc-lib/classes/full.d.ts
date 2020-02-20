import { EventListenerObj, GetEvents, WebComponentListenableTypeInstance } from '../lib/listener.js';
import { SelectorMap, GetEls, WebComponentTypeInstance } from '../lib/component.js';
import { WebComponentDefinerTypeInstance } from '../lib/definer.js';
import { WebComponentBaseTypeInstance } from '../lib/base.js';
import { WebComponentHierarchyManagerTypeInstance } from '../lib/hierarchy-manager.js';
import { WebComponentThemeManagerTypeInstance } from '../lib/theme-manager.js';
import { WebComponentI18NManagerTypeInstance } from '../lib/i18n-manager.js';
import { WebComponentTemplateManagerTypeInstance } from '../lib/template-manager.js';
import { WebComponentCustomCSSManagerTypeInstance } from '../lib/custom-css-manager.js';
/**
 * A full webcomponent that uses every layer and provides
 * maximum functionality.
 * Uses the `renderer`, `custom-css`, `complex-template`,
 * `I18N`, `theming`, `hierarchy`, `listeners` and `definer`
 * parts.
 */
export declare const FullWebComponent: {
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
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentHierarchyManagerTypeInstance<GA> & WebComponentThemeManagerTypeInstance<GA> & WebComponentI18NManagerTypeInstance<GA> & WebComponentTemplateManagerTypeInstance & WebComponentCustomCSSManagerTypeInstance & WebComponentTypeInstance<GA, void, ELS>;
    self(): Pick<typeof WebComponentDefinerTypeInstance, "dependencies" | "is" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentHierarchyManagerTypeInstance, never> & Pick<typeof WebComponentThemeManagerTypeInstance, "__constructedCSSChanged" | "initTheme" | "setDefaultTheme"> & Pick<typeof WebComponentI18NManagerTypeInstance, "initI18N" | "__prom" | "__" | "langReady"> & Pick<typeof WebComponentTemplateManagerTypeInstance, "initComplexTemplateProvider"> & Pick<typeof WebComponentCustomCSSManagerTypeInstance, never> & Pick<typeof WebComponentTypeInstance, never>;
} & Pick<typeof WebComponentDefinerTypeInstance, "dependencies" | "is" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentHierarchyManagerTypeInstance, never> & Pick<typeof WebComponentThemeManagerTypeInstance, "__constructedCSSChanged" | "initTheme" | "setDefaultTheme"> & Pick<typeof WebComponentI18NManagerTypeInstance, "initI18N" | "__prom" | "__" | "langReady"> & Pick<typeof WebComponentTemplateManagerTypeInstance, "initComplexTemplateProvider"> & Pick<typeof WebComponentCustomCSSManagerTypeInstance, never> & Pick<typeof WebComponentTypeInstance, never>;
/**
 * A class that extends from the full webcomponent and passes
 * the relevant generic types.
 * Uses the `renderer`, `custom-css`, `complex-template`,
 * `I18N`, `theming`, `hierarchy`, `listeners` and `definer`
 * parts.
 */
export declare class WebComponent<GA extends {
    i18n?: any;
    langs?: string;
    events?: EventListenerObj;
    themes?: {
        [key: string]: any;
    };
    selectors?: SelectorMap;
    root?: any;
    parent?: any;
    globalProps?: {
        [key: string]: any;
    };
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends FullWebComponent<GA, E, ELS> {
}
//# sourceMappingURL=full.d.ts.map
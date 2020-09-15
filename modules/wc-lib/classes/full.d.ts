import { EventListenerObj, GetEvents, WebComponentListenableTypeInstance, WebComponentListenableTypeStatic } from '../lib/listener.js';
import { SelectorMap, GetEls, WebComponentTypeStatic, WebComponentTypeInstance } from '../lib/component.js';
import { WebComponentDefinerTypeInstance, WebComponentDefinerTypeStatic } from '../lib/definer.js';
import { WebComponentBaseTypeInstance, WebComponentBaseTypeStatic } from '../lib/base.js';
import { WebComponentHierarchyManagerTypeInstance, WebComponentHierarchyManagerTypeStatic } from '../lib/hierarchy-manager.js';
import { WebComponentThemeManagerTypeStatic, WebComponentThemeManagerTypeInstance } from '../lib/theme-manager.js';
import { WebComponentI18NManagerTypeStatic, WebComponentI18NManagerTypeInstance } from '../lib/i18n-manager.js';
import { WebComponentTemplateManagerTypeStatic, WebComponentTemplateManagerTypeInstance } from '../lib/template-manager.js';
import { WebComponentCustomCSSManagerTypeStatic, WebComponentCustomCSSManagerTypeInstance } from '../lib/custom-css-manager.js';
import { CHANGE_TYPE } from '../lib/template-fn.js';
import { GetRenderArgsMixin } from './types.js';
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
        subtreeProps?: {
            [key: string]: any;
        } | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>>(...args: any[]): HTMLElement & WebComponentDefinerTypeInstance & WebComponentBaseTypeInstance & WebComponentListenableTypeInstance<GA, E> & WebComponentHierarchyManagerTypeInstance<GA> & WebComponentThemeManagerTypeInstance<GA> & WebComponentI18NManagerTypeInstance<GA> & WebComponentTemplateManagerTypeInstance & WebComponentCustomCSSManagerTypeInstance & WebComponentTypeInstance<GA, void, ELS>;
    self(): WebComponentDefinerTypeStatic & WebComponentBaseTypeStatic & WebComponentListenableTypeStatic & WebComponentHierarchyManagerTypeStatic & WebComponentThemeManagerTypeStatic & WebComponentI18NManagerTypeStatic & WebComponentTemplateManagerTypeStatic & WebComponentCustomCSSManagerTypeStatic & WebComponentTypeStatic;
} & Pick<typeof WebComponentDefinerTypeInstance, "is" | "dependencies" | "define"> & Pick<typeof WebComponentBaseTypeInstance, "html" | "css" | "__constructedCSSChanged"> & Pick<typeof WebComponentListenableTypeInstance, never> & Pick<typeof WebComponentHierarchyManagerTypeInstance, never> & Pick<typeof WebComponentThemeManagerTypeInstance, "__constructedCSSChanged" | "initTheme" | "setDefaultTheme"> & Pick<typeof WebComponentI18NManagerTypeInstance, "initI18N" | "__prom" | "__" | "langReady"> & Pick<typeof WebComponentTemplateManagerTypeInstance, "initComplexTemplateProvider"> & Pick<typeof WebComponentCustomCSSManagerTypeInstance, never> & Pick<typeof WebComponentTypeInstance, never>;
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
    subtreeProps?: {
        [key: string]: any;
    };
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends FullWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(changeType: CT): GetRenderArgsMixin<this>;
}
//# sourceMappingURL=full.d.ts.map
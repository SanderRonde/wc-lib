import {
    WebComponentMixin,
    WebComponentCustomCSSManagerMixin,
    WebComponentTemplateManagerMixin,
    WebComponentI18NManagerMixin,
    WebComponentThemeManagerMixin,
    WebComponentHierarchyManagerMixin,
    WebComponentListenableMixin,
    WebComponentBaseMixin,
    WebComponentDefinerMixin,
    elementBase,
} from './parts.js';
import {
    EventListenerObj,
    GetEvents,
    WebComponentListenableTypeInstance,
    WebComponentListenableTypeStatic,
} from '../lib/listener.js';
import {
    SelectorMap,
    GetEls,
    WebComponentTypeStatic,
    WebComponentTypeInstance,
} from '../lib/component.js';
import {
    WebComponentDefinerTypeInstance,
    WebComponentDefinerTypeStatic,
} from '../lib/definer.js';
import {
    WebComponentBaseTypeInstance,
    WebComponentBaseTypeStatic,
    GetRenderArgsBaseMixin,
} from '../lib/base.js';
import {
    WebComponentHierarchyManagerTypeInstance,
    WebComponentHierarchyManagerTypeStatic,
    GetRenderArgsHierarchyManagerMixin,
} from '../lib/hierarchy-manager.js';
import {
    WebComponentThemeManagerTypeStatic,
    WebComponentThemeManagerTypeInstance,
    GetRenderArgsThemeManagerMixin,
} from '../lib/theme-manager.js';
import {
    WebComponentI18NManagerTypeStatic,
    WebComponentI18NManagerTypeInstance,
} from '../lib/i18n-manager.js';
import {
    WebComponentTemplateManagerTypeStatic,
    WebComponentTemplateManagerTypeInstance,
} from '../lib/template-manager.js';
import {
    WebComponentCustomCSSManagerTypeStatic,
    WebComponentCustomCSSManagerTypeInstance,
} from '../lib/custom-css-manager.js';
import { CHANGE_TYPE } from '../lib/template-fn.js';

/**
 * A full webcomponent that uses every layer and provides
 * maximum functionality.
 * Uses the `renderer`, `custom-css`, `complex-template`,
 * `I18N`, `theming`, `hierarchy`, `listeners` and `definer`
 * parts.
 */
export const FullWebComponent = (WebComponentMixin(
    WebComponentCustomCSSManagerMixin(
        WebComponentTemplateManagerMixin(
            WebComponentI18NManagerMixin(
                WebComponentThemeManagerMixin(
                    WebComponentHierarchyManagerMixin(
                        WebComponentListenableMixin(
                            WebComponentBaseMixin(
                                WebComponentDefinerMixin(elementBase)
                            )
                        )
                    )
                )
            )
        )
    )
) as unknown) as {
    new <
        GA extends {
            events?: EventListenerObj;
            root?: any;
            parent?: any;
            globalProps?: {
                [key: string]: any;
            };
            themes?: {
                [key: string]: any;
            };
            i18n?: any;
            langs?: string;
            selectors?: SelectorMap;
            subtreeProps?: {
                [key: string]: any;
            };
        } = {},
        E extends EventListenerObj = GetEvents<GA>,
        ELS extends SelectorMap = GetEls<GA>
    >(
        ...args: any[]
    ): HTMLElement &
        WebComponentDefinerTypeInstance &
        WebComponentBaseTypeInstance &
        WebComponentListenableTypeInstance<GA, E> &
        WebComponentHierarchyManagerTypeInstance<GA> &
        WebComponentThemeManagerTypeInstance<GA> &
        WebComponentI18NManagerTypeInstance<GA> &
        WebComponentTemplateManagerTypeInstance &
        WebComponentCustomCSSManagerTypeInstance &
        WebComponentTypeInstance<GA, void, ELS>;
    self(): WebComponentDefinerTypeStatic &
        WebComponentBaseTypeStatic &
        WebComponentListenableTypeStatic &
        WebComponentHierarchyManagerTypeStatic &
        WebComponentThemeManagerTypeStatic &
        WebComponentI18NManagerTypeStatic &
        WebComponentTemplateManagerTypeStatic &
        WebComponentCustomCSSManagerTypeStatic &
        WebComponentTypeStatic;
} & WebComponentDefinerTypeStatic &
    WebComponentBaseTypeStatic &
    WebComponentListenableTypeStatic &
    WebComponentHierarchyManagerTypeStatic &
    WebComponentThemeManagerTypeStatic &
    WebComponentI18NManagerTypeStatic &
    WebComponentTemplateManagerTypeStatic &
    WebComponentCustomCSSManagerTypeStatic &
    WebComponentTypeStatic;

/**
 * A class that extends from the full webcomponent and passes
 * the relevant generic types.
 * Uses the `renderer`, `custom-css`, `complex-template`,
 * `I18N`, `theming`, `hierarchy`, `listeners` and `definer`
 * parts.
 */
export class WebComponent<
    GA extends {
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
    } = {},
    E extends EventListenerObj = GetEvents<GA>,
    ELS extends SelectorMap = GetEls<GA>
> extends FullWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(
        changeType: CT
    ): GetRenderArgsBaseMixin<this> &
        GetRenderArgsThemeManagerMixin<this> &
        GetRenderArgsHierarchyManagerMixin<this> {
        return super.getRenderArgs(changeType);
    }
}

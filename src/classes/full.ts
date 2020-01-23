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
import { EventListenerObj, GetEvents } from '../lib/listener.js';
import { SelectorMap, GetEls } from '../lib/component.js';

/**
 * A full webcomponent that uses every layer and provides
 * maximum functionality.
 * Uses the `renderer`, `custom-css`, `complex-template`,
 * `I18N`, `theming`, `hierarchy`, `listeners` and `definer`
 * parts.
 */
export const FullWebComponent = WebComponentMixin(
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
);

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
    } = {},
    E extends EventListenerObj = GetEvents<GA>,
    ELS extends SelectorMap = GetEls<GA>
> extends FullWebComponent<GA, E, ELS> {}

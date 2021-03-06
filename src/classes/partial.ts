import {
    WebComponentDefinerTypeInstance,
    WebComponentDefinerTypeStatic,
    WebComponentBaseTypeInstance,
    WebComponentBaseTypeStatic,
    WebComponentListenableTypeInstance,
    WebComponentListenableTypeStatic,
    WebComponentTypeInstance,
    WebComponentTypeStatic,
    WebComponentThemeManagerTypeInstance,
    WebComponentThemeManagerTypeStatic,
    WebComponentI18NManagerTypeInstance,
    WebComponentI18NManagerTypeStatic,
    WebComponentHierarchyManagerTypeInstance,
    WebComponentHierarchyManagerTypeStatic,
    WebComponentTemplateManagerTypeInstance,
    WebComponentTemplateManagerTypeStatic,
    GetRenderArgsMixin,
} from './types';
import {
    elementBase,
    WebComponentTemplateManagerMixin,
    WebComponentI18NManagerMixin,
} from './parts.js';
import {
    WebComponentListenableMixin,
    EventListenerObj,
    GetEvents,
} from '../lib/listener.js';
import { WebComponentHierarchyManagerMixin } from '../lib/hierarchy-manager.js';
import { WebComponentMixin, SelectorMap, GetEls } from '../lib/component.js';
import { WebComponentThemeManagerMixin } from '../lib/theme-manager.js';
import { WebComponentDefinerMixin } from '../lib/definer.js';
import { WebComponentBaseMixin } from '../lib/base.js';
import { CHANGE_TYPE } from '../lib/enums.js';

const basicWebComponent = (WebComponentMixin(
    WebComponentListenableMixin(
        WebComponentBaseMixin(WebComponentDefinerMixin(elementBase))
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
    ): Omit<
        HTMLElement &
            WebComponentDefinerTypeInstance &
            WebComponentBaseTypeInstance &
            WebComponentListenableTypeInstance<GA, E> &
            WebComponentTypeInstance<GA, void, ELS>,
        'getRenderArgs' | 'self'
    > & {
        getRenderArgs(changeType: CHANGE_TYPE | number): {};
    };
    self(): WebComponentDefinerTypeStatic &
        WebComponentBaseTypeStatic &
        WebComponentListenableTypeStatic &
        WebComponentTypeStatic;
} & WebComponentDefinerTypeStatic &
    WebComponentBaseTypeStatic &
    WebComponentListenableTypeStatic &
    WebComponentTypeStatic;

/**
 * A component that only uses the most basic parts
 * Uses the `definer`, `renderer` and `listeners`
 */
export class BasicWebComponent<
    GA extends {
        i18n?: any;
        langs?: string;
        events?: EventListenerObj;
        selectors?: SelectorMap;
    } = {},
    E extends EventListenerObj = GetEvents<GA>,
    ELS extends SelectorMap = GetEls<GA>
> extends basicWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(
        changeType: CT
    ): GetRenderArgsMixin<this> {
        return super.getRenderArgs(changeType) as GetRenderArgsMixin<this>;
    }
}

const themingWebComponent = (WebComponentMixin(
    WebComponentThemeManagerMixin(
        WebComponentListenableMixin(
            WebComponentBaseMixin(WebComponentDefinerMixin(elementBase))
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
    ): Omit<
        HTMLElement &
            WebComponentDefinerTypeInstance &
            WebComponentBaseTypeInstance &
            WebComponentListenableTypeInstance<GA, E> &
            WebComponentThemeManagerTypeInstance<GA> &
            WebComponentTypeInstance<GA, void, ELS>,
        'getRenderArgs' | 'self'
    > & {
        getRenderArgs(changeType: CHANGE_TYPE | number): {};
    };
    self(): WebComponentDefinerTypeStatic &
        WebComponentBaseTypeStatic &
        WebComponentListenableTypeStatic &
        WebComponentThemeManagerTypeStatic &
        WebComponentTypeStatic;
} & WebComponentDefinerTypeStatic &
    WebComponentBaseTypeStatic &
    WebComponentListenableTypeStatic &
    WebComponentThemeManagerTypeStatic &
    WebComponentTypeStatic;

/**
 * A component that uses the basic parts combined
 * with the theming part.
 * Uses the `theming`,
 * `definer`, `renderer` and `listeners`
 */
export class ThemingWebComponent<
    GA extends {
        i18n?: any;
        langs?: string;
        events?: EventListenerObj;
        themes?: {
            [key: string]: any;
        };
        selectors?: SelectorMap;
    } = {},
    E extends EventListenerObj = GetEvents<GA>,
    ELS extends SelectorMap = GetEls<GA>
> extends themingWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(
        changeType: CT
    ): GetRenderArgsMixin<this> {
        return super.getRenderArgs(changeType) as GetRenderArgsMixin<this>;
    }
}

const i18NWebComponent = (WebComponentMixin(
    WebComponentI18NManagerMixin(
        WebComponentListenableMixin(
            WebComponentBaseMixin(WebComponentDefinerMixin(elementBase))
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
    ): Omit<
        HTMLElement &
            WebComponentDefinerTypeInstance &
            WebComponentBaseTypeInstance &
            WebComponentListenableTypeInstance<GA, E> &
            WebComponentI18NManagerTypeInstance<GA> &
            WebComponentTypeInstance<GA, void, ELS>,
        'getRenderArgs' | 'self'
    > & {
        getRenderArgs(changeType: CHANGE_TYPE | number): {};
    };
    self(): WebComponentDefinerTypeStatic &
        WebComponentBaseTypeStatic &
        WebComponentListenableTypeStatic &
        WebComponentI18NManagerTypeStatic &
        WebComponentTypeStatic;
} & WebComponentDefinerTypeStatic &
    WebComponentBaseTypeStatic &
    WebComponentListenableTypeStatic &
    WebComponentI18NManagerTypeStatic &
    WebComponentTypeStatic;

/**
 * A component that uses the basic parts combined
 * with the I18N part.
 * Uses the `i18n`,
 * `definer`, `renderer` and `listeners`
 */
export class I18NWebComponent<
    GA extends {
        i18n?: any;
        langs?: string;
        events?: EventListenerObj;
        themes?: {
            [key: string]: any;
        };
        selectors?: SelectorMap;
    } = {},
    E extends EventListenerObj = GetEvents<GA>,
    ELS extends SelectorMap = GetEls<GA>
> extends i18NWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(
        changeType: CT
    ): GetRenderArgsMixin<this> {
        return super.getRenderArgs(changeType) as GetRenderArgsMixin<this>;
    }
}

const complexTemplatingWebComponent = (WebComponentMixin(
    WebComponentTemplateManagerMixin(
        WebComponentHierarchyManagerMixin(
            WebComponentListenableMixin(
                WebComponentBaseMixin(WebComponentDefinerMixin(elementBase))
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
    ): Omit<
        HTMLElement &
            WebComponentDefinerTypeInstance &
            WebComponentBaseTypeInstance &
            WebComponentListenableTypeInstance<GA, E> &
            WebComponentHierarchyManagerTypeInstance<GA> &
            WebComponentTemplateManagerTypeInstance &
            WebComponentTypeInstance<GA, void, ELS>,
        'getRenderArgs' | 'self'
    > & {
        getRenderArgs(changeType: CHANGE_TYPE | number): {};
    };
    self(): WebComponentDefinerTypeStatic &
        WebComponentBaseTypeStatic &
        WebComponentListenableTypeStatic &
        WebComponentHierarchyManagerTypeStatic &
        WebComponentTemplateManagerTypeStatic &
        WebComponentTypeStatic;
} & WebComponentDefinerTypeStatic &
    WebComponentBaseTypeStatic &
    WebComponentListenableTypeStatic &
    WebComponentHierarchyManagerTypeStatic &
    WebComponentTemplateManagerTypeStatic &
    WebComponentTypeStatic;

/**
 * A component that uses the basic parts combined
 * with the hierarchy manager.
 * Uses the `hierarchy`,
 * `definer`, `renderer` and `listeners`
 */
export class ComplexTemplatingWebComponent<
    GA extends {
        i18n?: any;
        langs?: string;
        events?: EventListenerObj;
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
> extends complexTemplatingWebComponent<GA, E, ELS> {
    getRenderArgs<CT extends CHANGE_TYPE | number>(
        changeType: CT
    ): GetRenderArgsMixin<this> {
        return super.getRenderArgs(changeType) as GetRenderArgsMixin<this>;
    }
}

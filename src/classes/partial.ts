import { 
	elementBase, WebComponentTemplateManagerMixin, WebComponentHierarchyManagerMixin, 
	WebComponentI18NManagerMixin 
} from "./parts.js";
import { WebComponentListenableMixin, EventListenerObj, GetEvents } from "../lib/listener.js";
import { WebComponentMixin, SelectorMap, GetEls } from "../lib/component.js";
import { WebComponentThemeManagerMixin } from "../lib/theme-manager.js";
import { WebComponentDefinerMixin } from "../lib/definer.js";
import { WebComponentBaseMixin } from "../lib/base.js";

/**
 * A component that only uses the most basic parts 
 * Uses the `definer`, `renderer` and `listeners`
 */
export class BasicWebComponent<GA extends {
	i18n?: any;
	langs?: string;
	events?: EventListenerObj;
	selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends WebComponentMixin(
	WebComponentListenableMixin(WebComponentBaseMixin(
		WebComponentDefinerMixin(elementBase))))<GA, E, ELS> {}

/**
 * A component that uses the basic parts combined
 * with the theming part.
 * Uses the `theming`,
 * `definer`, `renderer` and `listeners`
 */
export class ThemingWebComponent<GA extends {
	i18n?: any;
	langs?: string;
	events?: EventListenerObj;
	themes?: {
			[key: string]: any;
		};
	selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends WebComponentMixin(
	WebComponentThemeManagerMixin(WebComponentListenableMixin(
		WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))))<GA, E, ELS> {}

/**
 * A component that uses the basic parts combined
 * with the I18N part.
 * Uses the `i18n`,
 * `definer`, `renderer` and `listeners`
 */
export class I18NWebComponent<GA extends {
	i18n?: any;
	langs?: string;
	events?: EventListenerObj;
	themes?: {
		[key: string]: any;
	};
	selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends WebComponentMixin(
	WebComponentI18NManagerMixin(WebComponentListenableMixin(
		WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))))<GA, E, ELS> {}

/**
 * A component that uses the basic parts combined
 * with the hierarchy manager.
 * Uses the `hierarchy`,
 * `definer`, `renderer` and `listeners`
 */
export class ComplexTemplatingWebComponent<GA extends {
	i18n?: any;
	langs?: string;
	events?: EventListenerObj;
	selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends WebComponentMixin(
	WebComponentTemplateManagerMixin(WebComponentHierarchyManagerMixin(
		WebComponentListenableMixin(WebComponentBaseMixin(
			WebComponentDefinerMixin(elementBase))))))<GA, E, ELS> {}
import { 
	WebComponentMixin, 
	WebComponentCustomCSSManagerMixin, WebComponentTemplateManagerMixin, 
	WebComponentI18NManagerMixin, WebComponentThemeManagerMixin, 
	WebComponentHierarchyManagerMixin, WebComponentListenableMixin, 
	WebComponentBaseMixin, WebComponentDefinerMixin, elementBase 
} from "./parts.js";
import { EventListenerObj, GetEvents } from "../lib/listener.js";
import { SelectorMap, GetEls } from "../lib/component.js";

export const FullWebComponent = WebComponentMixin(
	WebComponentCustomCSSManagerMixin(WebComponentTemplateManagerMixin(
		WebComponentI18NManagerMixin(WebComponentThemeManagerMixin(
			WebComponentHierarchyManagerMixin(WebComponentListenableMixin(
				WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))))))));

export class WebComponent<GA extends {
	events?: EventListenerObj;
	selectors?: SelectorMap;
} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends FullWebComponent<GA, E, ELS> { }
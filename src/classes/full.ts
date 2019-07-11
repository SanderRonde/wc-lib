import { 
	WebComponentMixin, 
	WebComponentCustomCSSManagerMixin, WebComponentTemplateManagerMixin, 
	WebComponentI18NManagerMixin, WebComponentThemeManagerMixin, 
	WebComponentHierarchyManagerMixin, WebComponentListenableMixin, 
	WebComponentBaseMixin, WebComponentDefinerMixin, elementBase 
} from "./parts.js";
import { EventListenerObj } from "../lib/listener.js";

export const FullWebComponent = WebComponentMixin(
	WebComponentCustomCSSManagerMixin(WebComponentTemplateManagerMixin(
		WebComponentI18NManagerMixin(WebComponentThemeManagerMixin(
			WebComponentHierarchyManagerMixin(WebComponentListenableMixin(
				WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))))))));

export class WebComponent<ELS extends {
	/**
	 * All child elements of this component by ID
	 */
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	/**
	 * All child elements of this component by class
	 */
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
} = {
	IDS: {};
	CLASSES: {}
}, E extends EventListenerObj = {}> extends FullWebComponent<ELS, E> { }
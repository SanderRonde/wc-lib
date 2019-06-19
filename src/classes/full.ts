import { 
	WebComponentListenedMixin, WebComponentMixin, 
	WebComponentCustomCSSManagerMixin, WebComponentTemplateManagerMixin, 
	WebComponentI18NManagerMixin, WebComponentThemeManagerMixin, 
	WebComponentHierarchyManagerMixin, WebComponentListenableMixin, 
	WebComponentBaseMixin, WebComponentDefinerMixin 
} from "./parts.js";
import { EventListenerObj } from "../lib/listener.js";

interface ExtendedProcess extends NodeJS.Process {
	HTMLElement: typeof HTMLElement;
}

const elementBase: typeof HTMLElement = (() => {
	/* istanbul ignore else */
	if (typeof HTMLElement !== 'undefined') {
		return HTMLElement;
	} else {
		return (<ExtendedProcess>process).HTMLElement;
	}
})();

export const FullWebComponent = WebComponentListenedMixin(WebComponentMixin(
	WebComponentCustomCSSManagerMixin(WebComponentTemplateManagerMixin(
		WebComponentI18NManagerMixin(WebComponentThemeManagerMixin(
			WebComponentHierarchyManagerMixin(WebComponentListenableMixin(
				WebComponentBaseMixin(WebComponentDefinerMixin(elementBase))))))))));

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
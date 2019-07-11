import { 
	elementBase, WebComponentTemplateManagerMixin, WebComponentHierarchyManagerMixin, 
	WebComponentI18NManagerMixin 
} from "./parts.js";
import { WebComponentListenableMixin, EventListenerObj } from "../lib/listener.js";
import { WebComponentThemeManagerMixin } from "../lib/theme-manager.js";
import { WebComponentDefinerMixin } from "../lib/definer.js";
import { WebComponentMixin } from "../lib/component.js";
import { WebComponentBaseMixin } from "../lib/base.js";

export class BasicWebComponent<ELS extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
} = {
	IDS: {};
	CLASSES: {}
}, E extends EventListenerObj = {}> extends WebComponentMixin(
	WebComponentListenableMixin(WebComponentBaseMixin(
		WebComponentDefinerMixin(elementBase))))<ELS, E> {}

export class ThemingWebComponent<ELS extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
} = {
	IDS: {};
	CLASSES: {}
}, E extends EventListenerObj = {}> extends WebComponentMixin(
	WebComponentThemeManagerMixin(WebComponentListenableMixin(
		WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))))<ELS, E> {}

export class I18NWebComponent<ELS extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
} = {
	IDS: {};
	CLASSES: {}
}, E extends EventListenerObj = {}> extends WebComponentMixin(
	WebComponentI18NManagerMixin(WebComponentListenableMixin(
		WebComponentBaseMixin(WebComponentDefinerMixin(elementBase)))))<ELS, E> {}

export class ComplexTemplatingWebComponent<ELS extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
} = {
	IDS: {};
	CLASSES: {}
}, E extends EventListenerObj = {}> extends WebComponentMixin(
	WebComponentTemplateManagerMixin(WebComponentHierarchyManagerMixin(
		WebComponentListenableMixin(WebComponentBaseMixin(
			WebComponentDefinerMixin(elementBase))))))<ELS, E> {}
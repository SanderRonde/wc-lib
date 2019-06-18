import { 
	WebComponentListenedMixin, WebComponentMixin, 
	WebComponentCustomCSSManagerMixin, WebComponentTemplateManagerMixin, 
	WebComponentI18NManagerMixin, WebComponentThemeManagerMixin, 
	WebComponentHierarchyManagerMixin, WebComponentListenableMixin, 
	WebComponentBaseMixin, WebComponentDefinerMixin 
} from "./parts";

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
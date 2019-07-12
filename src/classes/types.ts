/**
 * A constructable function that returns the passed type
 */
export type Constructor<T> = new(...args: any[]) => T;

/**
 * Gets the return type of the passed function
 */
export type InferReturn<F> = F extends (...args: any[]) => infer R ? R : void;

/**
 * Gets an instance of the passed class
 */
export type InferInstance<F> = F extends new(...args: any[]) => infer R ? R : void;


export {  
	WebComponentBaseMixinInstance,
	WebComponentBaseMixinClass,
	WebComponentBaseMixinSuper
} from '../lib/base.js';
export {
	WebComponentSuper,
	WebComponentMixinInstance,
	WebComponentMixinClass
} from '../lib/component.js';
export {
	WebComponentCustomCSSManagerMixinInstance,
	WebComponentCustomCSSManagerMixinClass,
	WebComponentCustomCSSManagerMixinSuper
} from '../lib/custom-css-manager.js';
export {
	WebComponentDefinerMixinInstance,
	WebComponentDefinerMixinClass,
	WebComponentDefinerMixinSuper
} from '../lib/definer.js';
export {
	WebComponentHierarchyManagerMixinInstance,
	WebComponentHierarchyManagerMixinClass,
	WebComponentHierarchyManagerMixinSuper
} from '../lib/hierarchy-manager.js';
export {
	WebComponentI18NManagerMixinInstance,
	WebComponentI18NManagerMixinClass,
	WebComponentI18NManagerMixinSuper
} from '../lib/i18n-manager.js';
export { 
	WebComponentListenableMixinInstance,
	WebComponentListenableMixinClass,
	WebComponentListenableMixinSuper
} from '../lib/listener.js';
export {
	WebComponentTemplateManagerMixinInstance,
	WebComponentTemplateManagerMixinClass,
	WebComponentTemplateManagerMixinSuper
} from '../lib/template-manager.js';
export {
	WebComponentThemeManagerMixinInstance,
	WebComponentThemeManagerMixinClass,
	WebComponentThemeManagerMixinSuper
} from '../lib/theme-manager.js';
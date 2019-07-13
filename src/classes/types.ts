import { ListenerSet, EventListenerObj } from '../lib/listener.js';
import { Props } from '../lib/props.js';

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

/**
 * Infers props of a component from passed component['props']
 */
type InferProps<C> = C extends Props & infer P ? P : void;

/**
 * Infers the events listener object from the passed component
 */
type InferEvents<C> = C extends {
	listenerMap: ListenerSet<infer E>;
} ? E : {};

/**
 * Converts an eventname->event map to an eventname->function map
 */
type EventsToAttr<E, EL> = {
	[EV in keyof E]: (this: EL, event: E[EV]) => any;
}

/**
 * Converts a customeventname->config map to a customeventname->function map
 */
type CustomEventsToAttr<E extends EventListenerObj> = {
	[EV in keyof E]: (...args: E[EV]["args"]) => E[EV]["returnType"];
}

/**
 * Generates definitions for passed component. Use this to create a JSX.IntrinsicElements interface.
 * **Example:**
 * ```js
 declare global {
 	namespace JSX {
 		interface IntrinsicElements {
 			"my-element": JSXDefinition<MyElement>;
 		}
 	}
 }
 ```
 */
export type JSXDefinition<C extends {
	props: any;
}> = 
	React.HTMLAttributes<C> & 
	Partial<InferProps<C['props']>> & {
		__listeners?: Partial<EventsToAttr<HTMLElementEventMap, C>>;
		___listeners?: Partial<CustomEventsToAttr<InferEvents<C>>>;
	};

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
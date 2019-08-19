import { ListenerSet, EventListenerObj } from '../lib/listener.js';
import { TemplateFnLike } from '../lib/template-fn.js';
import { ClassNamesArg } from '../lib/shared.js';
/**
 * A constructable function that returns the passed type
 */
export declare type Constructor<T> = new (...args: any[]) => T;
/**
 * Gets the return type of the passed function
 */
export declare type InferReturn<F> = F extends (...args: any[]) => infer R ? R : void;
/**
 * Gets an instance of the passed class
 */
export declare type InferInstance<F> = F extends new (...args: any[]) => infer R ? R : void;
/**
 * Returns a different type if type is undefined
 */
export declare type DefaultVal<V, D = {}> = V extends undefined ? D : V;
/**
 * Returns a different type if type is undefined or unknown
 */
export declare type DefaultValUnknown<V, D = {}> = V extends undefined ? D : V extends unknown ? D : V;
/**
 * Infers props of a component from passed component['props']
 */
declare type InferProps<C extends {
    props: any;
}> = {
    [K in keyof C['props']]: C['props'][K];
};
/**
 * Infers the events listener object from the passed component
 */
declare type InferEvents<C> = C extends {
    listenerMap: ListenerSet<infer E>;
} ? E : {};
/**
 * Converts an eventname->event map to an eventname->function map
 */
declare type EventsToAttr<E> = {
    [EV in keyof E]: (event: E[EV]) => any;
};
/**
 * Converts a customeventname->config map to a customeventname->function map
 */
declare type CustomEventsToAttr<E extends EventListenerObj> = {
    [EV in keyof E]: (...args: E[EV]["args"]) => E[EV]["returnType"];
};
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
export declare type JSXDefinition<C extends {
    props: any;
}, ATTR = {}> = ATTR & Partial<InferProps<C>> & {
    __listeners?: Partial<EventsToAttr<HTMLElementEventMap>>;
    "@"?: Partial<EventsToAttr<HTMLElementEventMap>>;
    __component_listeners?: Partial<CustomEventsToAttr<InferEvents<C>>>;
    "@@"?: Partial<CustomEventsToAttr<InferEvents<C>>>;
    __bools?: Partial<InferProps<C>>;
    "?"?: Partial<InferProps<C>>;
    __refs?: Partial<InferProps<C>>;
    "#"?: Partial<InferProps<C>>;
    id?: string;
    class?: string | ClassNamesArg | ClassNamesArg[];
    "custom-css"?: TemplateFnLike;
};
/**
 * Intrinsic properties that can be used by the complex
 * templater to turn JSX props into (for example) listeners.
 */
export interface JSXIntrinsicProps {
    __listeners?: Partial<EventsToAttr<HTMLElementEventMap>>;
    "@"?: Partial<EventsToAttr<HTMLElementEventMap>>;
}
export { WebComponentBaseMixinInstance, WebComponentBaseMixinClass, WebComponentBaseMixinSuper } from '../lib/base.js';
export { WebComponentSuper, WebComponentMixinInstance, WebComponentMixinClass } from '../lib/component.js';
export { WebComponentCustomCSSManagerMixinInstance, WebComponentCustomCSSManagerMixinClass, WebComponentCustomCSSManagerMixinSuper } from '../lib/custom-css-manager.js';
export { WebComponentDefinerMixinInstance, WebComponentDefinerMixinClass, WebComponentDefinerMixinSuper } from '../lib/definer.js';
export { WebComponentHierarchyManagerMixinInstance, WebComponentHierarchyManagerMixinClass, WebComponentHierarchyManagerMixinSuper } from '../lib/hierarchy-manager.js';
export { WebComponentI18NManagerMixinInstance, WebComponentI18NManagerMixinClass, WebComponentI18NManagerMixinSuper } from '../lib/i18n-manager.js';
export { WebComponentListenableMixinInstance, WebComponentListenableMixinClass, WebComponentListenableMixinSuper } from '../lib/listener.js';
export { WebComponentTemplateManagerMixinInstance, WebComponentTemplateManagerMixinClass, WebComponentTemplateManagerMixinSuper } from '../lib/template-manager.js';
export { WebComponentThemeManagerMixinInstance, WebComponentThemeManagerMixinClass, WebComponentThemeManagerMixinSuper } from '../lib/theme-manager.js';
//# sourceMappingURL=types.d.ts.map
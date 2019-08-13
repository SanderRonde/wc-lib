import { Constructor, InferInstance, InferReturn, DefaultVal } from '../classes/types.js';
/**
 * Returns type['events']
 */
export declare type GetEvents<GA extends {
    events?: EventListenerObj;
}> = Required<GA>['events'] extends undefined ? {} : DefaultVal<Required<GA>['events'], EventListenerObj>;
/**
 * An object that maps an event name
 * to the event listener's arguments
 * and return type
 */
export interface EventListenerObj {
    /**
     * The event name
     */
    [key: string]: {
        /**
         * Arguments passed to the listener
         */
        args: any[];
        /***
         * The return type of the listener
         */
        returnType?: any;
    };
}
/**
 * A type that maps an event listener object to an object
 * indexed by the events with as a value a set that holds
 * the listener functions.
 */
export declare type ListenerSet<E extends EventListenerObj> = {
    [P in keyof E]: Set<(...params: E[P]['args']) => E[P]['returnType']>;
};
/**
 * An instance of the webcomponent listenable mixin's resulting class
 */
export declare type WebComponentListenableMixinInstance = InferInstance<WebComponentListenableMixinClass> & {
    self: WebComponentListenableMixinClass;
};
/**
 * The webcomponent listenable mixin's resulting class
 */
export declare type WebComponentListenableMixinClass = InferReturn<typeof WebComponentListenableMixin>;
/**
 * The parent/super type required by the listenable mixin
 */
export declare type WebComponentListenableMixinSuper = Constructor<{}>;
/**
 * A mixin that, when applied, allows for listening
 * to and firing of events on a component or any other
 * class
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export declare const WebComponentListenableMixin: <P extends Constructor<{}>>(superFn: P) => {
    new <GA extends {
        events?: EventListenerObj | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>>(...args: any[]): {
        /**
         * A map that maps every event name to
         * a set containing all of its listeners
         *
         * @readonly
         */
        readonly listenerMap: ListenerSet<E>;
        /**
         * Listens for given event and fires
         * the listener when it's triggered
         *
         * @template EV - The event's name
         *
         * @param {EV} event - The event's name
         * @param {(...args: E[EV]['args']) => E[EV]['returnType']} listener - The
         * 	listener called when the event is fired
         * @param {boolean} [once] - Whether to only
         * 	call this listener once (false by default)
         */
        listen<EV extends keyof E>(event: EV, listener: (...args: E[EV]["args"]) => E[EV]["returnType"], once?: boolean): void;
        /**
         * Clears all listeners on this component for
         * given event
         *
         * @template EV - The name of the event
         *
         * @param {EV} event - The name of the event to clear
         * @param {(...args: E[EV]['args']) => E[EV]['returnType']} [listener] - A
         * 	specific listener to clear. If not passed, clears all
         * 	listeners for the event
         */
        clearListener<EV extends keyof E>(event: EV, listener?: ((...args: E[EV]["args"]) => E[EV]["returnType"]) | undefined): void;
        /**
         * Fires given event on this component
         * with given params, returning an array
         * containing the return values of all
         * triggered listeners
         *
         * @template EV - The event's name
         * @template R - The return type of the
         * 	event's listeners
         *
         * @param {EV} event - The event's name
         * @param {E[EV]['args']} params - The parameters
         * 	passed to the listeners when they are
         * 	called
         *
         * @returns {R[]} An array containing the
         * 	return values of all triggered
         * 	listeners
         */
        fire<EV extends keyof E, R extends E[EV]["returnType"]>(event: EV, ...params: E[EV]["args"]): R[];
    };
} & P;
//# sourceMappingURL=listener.d.ts.map
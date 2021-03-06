import {
    Constructor,
    InferInstance,
    InferReturn,
    DefaultVal,
} from '../classes/types.js';
import { ClassToObj } from './configurable.js';

/**
 * Returns type['events']
 */
export type GetEvents<
    GA extends {
        events?: EventListenerObj;
    }
> = Required<GA>['events'] extends undefined
    ? {}
    : DefaultVal<Required<GA>['events'], EventListenerObj>;

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
export type ListenerSet<E extends EventListenerObj> = {
    [P in keyof E]: Set<(...params: E[P]['args']) => E[P]['returnType']>;
};

/**
 * The class responsible for handling the
 * listening and firing of events on this
 * component
 *
 * @template GA - An object containing an "events" key that contains
 * 	an object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
class ListenableClass<
    GA extends {
        events?: EventListenerObj;
    } = {},
    E extends EventListenerObj = GetEvents<GA>
> {
    /**
     * A map that maps every event name to
     * a set containing all of its listeners
     *
     * @readonly
     */
    listenerMap: ListenerSet<E> = {} as ListenerSet<E>;

    /**
     * Inserts a listener to only be called
     * once
     *
     * @private
     * @template T - The event's data
     * @template L - The listener
     *
     * @param {Set<L>} fns - The functions that
     * 	are listening to this event
     * @param {L} The new listener
     */
    private __insertOnce<
        T extends E[keyof E],
        L extends (...args: T['args']) => T['returnType']
    >(fns: Set<L>, listener: L) {
        const self = ((...args: T['args']) => {
            fns.delete(self);
            listener(...args);
        }) as L;
        fns.add(self);
    }

    /**
     * Asserts that a set for given
     * event exists
     *
     * @template EV - The event's name
     * @template T - The event map
     *
     * @param {EV} key - The name of the
     * 	event
     * @param {T} value - The event map
     */
    private __assertKeyExists<
        EV extends keyof T,
        T extends {
            [P in keyof E]: Set<
                (...params: E[P]['args']) => E[P]['returnType']
            >;
        }
    >(key: EV, value: T) {
        if (!(key in value)) {
            value[key] = new Set() as any;
        }
    }

    /**
     * Listens for given event and fires
     * the listener when it's triggered
     *
     * @template EV - The event's name
     *
     * @param {EV} event - The event's name
     * @param {(...args: E[EV]['args']) => E[EV]['returnType']} listener - The
     * 	listener called when the event is fired
     * @param {boolean} once - Whether to only
     * 	call this listener once (false by default)
     */
    public listen<EV extends keyof E>(
        event: EV,
        listener: (...args: E[EV]['args']) => E[EV]['returnType'],
        once: boolean
    ) {
        this.__assertKeyExists(event, this.listenerMap);
        if (once) {
            this.__insertOnce(this.listenerMap[event], listener);
        } else {
            this.listenerMap[event].add(listener);
        }
    }
}

/**
 * An instance of the webcomponent listenable mixin's resulting class
 */
export type WebComponentListenableMixinInstance = InferInstance<
    WebComponentListenableMixinClass
> & {
    self: WebComponentListenableMixinClass;
};

/**
 * The webcomponent listenable mixin's resulting class
 */
export type WebComponentListenableMixinClass = InferReturn<
    typeof WebComponentListenableMixin
>;

/**
 * The parent/super type required by the listenable mixin
 */
export type WebComponentListenableMixinSuper = Constructor<{}>;

/**
 * A standalone instance of the listener class
 */
export declare class WebComponentListenableTypeInstance<
    GA extends {
        events?: EventListenerObj;
    } = {},
    E extends EventListenerObj = GetEvents<GA>
> {
    /**
     * A map that maps every event name to
     * a set containing all of its listeners
     *
     * @readonly
     */
    get listenerMap(): ListenerSet<E>;

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
    public listen<EV extends keyof E>(
        event: EV,
        listener: (...args: E[EV]['args']) => E[EV]['returnType'],
        once?: boolean
    ): void;

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
    public clearListener<EV extends keyof E>(
        event: EV,
        listener?: (...args: E[EV]['args']) => E[EV]['returnType']
    ): void;

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
    public fire<EV extends keyof E, R extends E[EV]['returnType']>(
        event: EV,
        ...params: E[EV]['args']
    ): R[];
}

/**
 * The static values of the listener class
 */
export type WebComponentListenableTypeStatic = ClassToObj<
    typeof WebComponentListenableTypeInstance
>;

/**
 * A mixin that, when applied, allows for listening
 * to and firing of events on a component or any other
 * class
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export const WebComponentListenableMixin = <
    P extends WebComponentListenableMixinSuper
>(
    superFn: P
) => {
    const privateMap: WeakMap<
        WebComponentListenable<any, any>,
        ListenableClass<any, any>
    > = new WeakMap();
    function listenableClass<
        GA extends {
            events?: EventListenerObj;
        } = {},
        E extends EventListenerObj = GetEvents<GA>
    >(self: WebComponentListenable<GA, E>): ListenableClass<GA, E> {
        if (privateMap.has(self)) return privateMap.get(self)!;
        return privateMap.set(self, new ListenableClass()).get(self)!;
    }

    // Explanation for ts-ignore:
    // Will show a warning regarding using generics in mixins
    // This issue is tracked in the typescript repo's issues with numbers
    // #26154 #24122 (among others)

    /**
     * The class responsible for handling listening
     * and firing of events
     */
    //@ts-ignore
    class WebComponentListenable<
            GA extends {
                events?: EventListenerObj;
            } = {},
            E extends EventListenerObj = GetEvents<GA>
        >
        extends superFn
        implements WebComponentListenableTypeInstance {
        constructor(...args: any[]) {
            super(...args);
        }

        get listenerMap(): ListenerSet<E> {
            return listenableClass(this).listenerMap as ListenerSet<E>;
        }

        /* istanbul ignore next */
        public listen<EV extends keyof E>(
            event: EV,
            listener: (...args: E[EV]['args']) => E[EV]['returnType'],
            once: boolean = false
        ) {
            listenableClass(this).listen(event, listener, once);
        }

        public clearListener<EV extends keyof E>(
            event: EV,
            listener?: (...args: E[EV]['args']) => E[EV]['returnType']
        ) {
            if (event in this.listenerMap) {
                const eventListeners = this.listenerMap[event];
                if (!listener) {
                    eventListeners.clear();
                    return;
                }
                eventListeners.delete(listener);
            }
        }

        public fire<EV extends keyof E, R extends E[EV]['returnType']>(
            event: EV,
            ...params: E[EV]['args']
        ): R[] {
            if (!(event in this.listenerMap)) {
                return [];
            }

            const set = this.listenerMap[event];
            const returnValues: R[] = [];
            for (const listener of set.values()) {
                returnValues.push(listener(...params));
            }
            return returnValues;
        }
    }

    const __typecheck__: WebComponentListenableTypeStatic = WebComponentListenable;
    __typecheck__;

    return WebComponentListenable;
};

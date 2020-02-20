/**
 * The class responsible for handling the
 * listening and firing of events on this
 * component
 *
 * @template GA - An object containing an "events" key that contains
 * 	an object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
class ListenableClass {
    constructor() {
        /**
         * A map that maps every event name to
         * a set containing all of its listeners
         *
         * @readonly
         */
        this.listenerMap = {};
    }
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
    __insertOnce(fns, listener) {
        const self = ((...args) => {
            fns.delete(self);
            listener(...args);
        });
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
    __assertKeyExists(key, value) {
        if (!(key in value)) {
            value[key] = new Set();
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
    listen(event, listener, once) {
        this.__assertKeyExists(event, this.listenerMap);
        if (once) {
            this.__insertOnce(this.listenerMap[event], listener);
        }
        else {
            this.listenerMap[event].add(listener);
        }
    }
}
/**
 * A mixin that, when applied, allows for listening
 * to and firing of events on a component or any other
 * class
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export const WebComponentListenableMixin = (superFn) => {
    const privateMap = new WeakMap();
    function listenableClass(self) {
        if (privateMap.has(self))
            return privateMap.get(self);
        return privateMap.set(self, new ListenableClass()).get(self);
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
    class WebComponentListenable extends superFn {
        constructor(...args) {
            super(...args);
        }
        get listenerMap() {
            return listenableClass(this).listenerMap;
        }
        /* istanbul ignore next */
        listen(event, listener, once = false) {
            listenableClass(this).listen(event, listener, once);
        }
        clearListener(event, listener) {
            if (event in this.listenerMap) {
                const eventListeners = this.listenerMap[event];
                if (!listener) {
                    eventListeners.clear();
                    return;
                }
                eventListeners.delete(listener);
            }
        }
        fire(event, ...params) {
            if (!(event in this.listenerMap)) {
                return [];
            }
            const set = this.listenerMap[event];
            const returnValues = [];
            for (const listener of set.values()) {
                returnValues.push(listener(...params));
            }
            return returnValues;
        }
    }
    const __typecheck__ = WebComponentListenable;
    __typecheck__;
    return WebComponentListenable;
};
//# sourceMappingURL=listener.js.map
import { WebComponent } from "../classes/full.js";
/**
 * Functions that are related to adding and removing listeners to elements
 */
export declare namespace Listeners {
    /**
     * Listens for `event` on `base.$.id` and
     * triggers `listener` when the event is fired.
     * Call this function whenever the component is rendered
     * to make sure it always refers to the current
     * instance of the element as it will clear its listener
     * from the old element. Only allows a single listener
     * per event-base-id combination
     *
     * @template T - The base component
     *
     * @param {T} base - The base component
     * @param {keyof T['$']} id - The id of the element
     * 	to listen to
     * @param {K} event - The event to listen for
     * @param {(this: T, ev: HTMLElementEventMap[K]) => any} listener - The
     * 	listener that gets called when the event is fired
     * @param {boolean | AddEventListenerOptions} [options] Optional
     * 	options that are passed to addEventListener
     *
     * @returns {() => void} A function that, when called, removes
     * 	this listener
     */
    function listen<T extends {
        $: any;
    }, K extends keyof HTMLElementEventMap>(base: T, id: keyof T['$'], event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void;
    /**
     * Listens for `event` on `element` and
     * triggers `listener` when the event is fired.
     * Call this function whenever the component is rendered
     * to make sure it always refers to the current
     * instance of the element as it will remove the
     * old listener when a new one is registered.
     * Uses `identifier` to
     * identify this event-identifier-listener combination
     * and to make sure the event
     * is not listened to twice. Only allows a single listener
     * per event-base-identifier combination
     *
     * @template T - The base component
     *
     * @param {T} base - The base component
     * @param {HTMLElement|SVGElement} element - The element to listen to
     * @param {string} identifier - A unique identifier for
     * 	this base component that is mapped to this
     * 	listener call
     * @param {K} event - The event to listen for
     * @param {(this: T, ev: HTMLElementEventMap[K]) => any} listener - The
     * 	listener that gets called when the event is fired
     * @param {boolean | AddEventListenerOptions} [options] Optional
     * 	options that are passed to addEventListener
     *
     * @returns {() => void} A function that, when called, removes
     * 	this listener
     */
    function listenWithIdentifier<T, K extends keyof HTMLElementEventMap>(base: T, element: HTMLElement | SVGElement, identifier: string, event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): () => void;
    /**
     * Checks whether this element is new, meaning it's the first time
     * it's seen on the page by this function
     *
     * @param {HTMLElement|SVGElement} element - The element to check
     * @param {Object} [context] - A context in which to store
     * 	this element. For example if you want to check if the
     * 	element is new on the page use the default context. If
     * 	you want to check whether the element is new on this
     * 	component pass the component. The context has to be
     * 	an object-like value that can be the key of a WeakSet/WeakMap
     *
     * @returns {boolean} Whether this element is new in the
     * 	given context
     */
    function isNewElement(element: HTMLElement | SVGElement, context?: Object): boolean;
    /**
     * Listens for `event` on `base.$.id` if `base.$.id` is a "new"
     * element (see `isNewElement`) and
     * triggers `listener` when the event is fired.
     * Call this function whenever the component is rendered
     * to make sure it always refers to the current
     * instance of the element as it will not listen
     * to the element twice
     *
     * @template I - An object that maps an event name
     * 	to the event listener's arguments
     * 	and return type
     * @template T - The base component
     * @template K - The event's name
     *
     * @param {T} base - The base component
     * @param {keyof T['$']} id - The id of the element
     * 	to listen to
     * @param {K} event - The event to listen for
     * @param {(this: T, ev: HTMLElementEventMap[K]) => any} listener - The
     * 	listener that gets called when the event is fired
     * @param {boolean} [isNew] - A boolean that says whether
     * 	this element is new. If nothing is passed (or a non-boolean
     * 	type is passed), `isNewElement` is called
     * @param {boolean | AddEventListenerOptions} [options] Optional
     * 	options that are passed to addEventListener
     *
     * @returns {() => void} A function that, when called, removes
     * 	this listener
     */
    function listenIfNew<T extends {
        $: any;
    }, K extends keyof HTMLElementEventMap>(base: T, id: keyof T['$'], event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, isNew?: boolean, options?: boolean | AddEventListenerOptions): () => void;
    /**
     * Listens for `event` on `base` and
     * calls `listener` when it's fired.
     * Will only allow one listener for
     * every event, removing the old
     * listener when a new one is registered
     *
     * @template T - The base component
     * @template K - The event name
     *
     * @param {T} base - The base component
     * @param {K} event - The event to listen for
     * @param {(this: T, ev: HTMLElementEventMap[K]) => any} listener - The
     * 	listener that is fired when the
     * 	event is fired
     *
     * @returns {() => void} A function that, when called, removes
     * 	this listener
     */
    function listenToComponentUnique<T extends WebComponent<any>, K extends keyof HTMLElementEventMap>(base: T, event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any): () => void;
    /**
     * Listens for `event` on `base` and
     * calls `listener` when it's fired
     *
     * @template T - The base component
     * @template K - The event name
     *
     * @param {T} base - The base component
     * @param {K} event - The event to listen for
     * @param {(this: T, ev: HTMLElementEventMap[K]) => any} listener - The
     * 	listener that is fired when the
     * 	event is fired
     */
    function listenToComponent<T extends HTMLElement | SVGElement, K extends keyof HTMLElementEventMap>(base: T, event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any): () => void;
    /**
     * Removes all event listeners on the component
     *
     * @param {any} base - The component
     * 	from which to remove all listeners
     */
    function removeAllElementListeners(base: any): void;
}
//# sourceMappingURL=listeners.d.ts.map
let _supportsPassive = null;
/**
 * Returns true if this browser supports
 * passive event listeners
 *
 * @returns {boolean} Whether this browser
 * 	supports passive event listeners
 */
function supportsPassive() {
    if (_supportsPassive !== null) {
        return _supportsPassive;
    }
    _supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function () {
                _supportsPassive = true;
            },
        });
        /* istanbul ignore next */
        const tempFn = () => { };
        window.addEventListener('testPassive', tempFn, opts);
        window.removeEventListener('testPassive', tempFn, opts);
    }
    catch (e) { }
    return _supportsPassive;
}
/**
 * Functions that are related to adding and removing listeners to elements
 */
export var Listeners;
(function (Listeners) {
    const listenedToElements = new WeakMap();
    function doListen(base, type, element, id, event, listener, options) {
        const boundListener = listener.bind(base);
        if (!listenedToElements.has(base)) {
            listenedToElements.set(base, {
                identifiers: new Map(),
                elements: new Map(),
                selfUnique: new Map(),
                self: new Map(),
            });
        }
        const { elements: elementIDMap, identifiers: identifiersMap, } = listenedToElements.get(base);
        const usedMap = type === 'element' ? elementIDMap : identifiersMap;
        if (!usedMap.has(id)) {
            usedMap.set(id, {
                element,
                map: new Map(),
            });
        }
        const { map: eventIDMap, element: listenedToElement } = usedMap.get(id);
        if (!eventIDMap.has(event)) {
            eventIDMap.set(event, boundListener);
        }
        else {
            listenedToElement.removeEventListener(event, eventIDMap.get(event));
        }
        if (listenedToElement !== element) {
            //A new element was listened to instead, remove all listeners
            for (const listenedToEvent of eventIDMap.keys()) {
                listenedToElement.removeEventListener(listenedToEvent, eventIDMap.get(listenedToEvent));
                eventIDMap.delete(listenedToEvent);
            }
            //Update element
            usedMap.get(id).element = element;
        }
        if (options !== undefined && options !== null && supportsPassive()) {
            element.addEventListener(event, boundListener, options);
        }
        else {
            element.addEventListener(event, boundListener);
        }
        return () => {
            /* istanbul ignore next */
            if (eventIDMap.has(event) &&
                eventIDMap.get(event) === boundListener) {
                listenedToElement.removeEventListener(event, boundListener);
                eventIDMap.delete(event);
            }
        };
    }
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
    function listen(base, id, event, listener, options) {
        const element = base.$[id];
        return doListen(base, 'element', element, id, event, listener, options);
    }
    Listeners.listen = listen;
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
    function listenWithIdentifier(base, element, identifier, event, listener, options) {
        return doListen(base, 'identifier', element, identifier, event, listener, options);
    }
    Listeners.listenWithIdentifier = listenWithIdentifier;
    const defaultContext = {};
    const usedElements = new WeakMap();
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
    function isNewElement(element, context = defaultContext) {
        if (!element)
            return false;
        if (!usedElements.has(context)) {
            usedElements.set(context, new WeakSet());
        }
        const currentContext = usedElements.get(context);
        const has = currentContext.has(element);
        if (!has) {
            currentContext.add(element);
        }
        return !has;
    }
    Listeners.isNewElement = isNewElement;
    const newMap = new WeakMap();
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
    function listenIfNew(base, id, event, listener, isNew, options) {
        const element = base.$[id];
        const isElementNew = (() => {
            if (typeof isNew === 'boolean') {
                return isNew;
            }
            if (!newMap.has(base)) {
                // Create a link to some object to make sure
                // the context is not the base itself
                // (as the user may want to use that)
                // but is instead an object that is still
                // linked to that base
                newMap.set(base, {});
            }
            return isNewElement(element, newMap.get(base));
        })();
        if (!isElementNew) {
            return () => { };
        }
        return listen(base, id, event, listener, options);
    }
    Listeners.listenIfNew = listenIfNew;
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
    function listenToComponentUnique(base, event, listener) {
        const boundListener = listener.bind(base);
        if (!listenedToElements.has(base)) {
            listenedToElements.set(base, {
                identifiers: new Map(),
                elements: new Map(),
                selfUnique: new Map(),
                self: new Map(),
            });
        }
        const { selfUnique: selfEventMap } = listenedToElements.get(base);
        if (!selfEventMap.has(event)) {
            selfEventMap.set(event, boundListener);
        }
        else {
            base.removeEventListener(event, selfEventMap.get(event));
        }
        base.addEventListener(event, boundListener);
        return () => {
            /* istanbul ignore next */
            if (selfEventMap.has(event) &&
                selfEventMap.get(event) === boundListener) {
                base.removeEventListener(event, selfEventMap.get(event));
                selfEventMap.delete(event);
            }
        };
    }
    Listeners.listenToComponentUnique = listenToComponentUnique;
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
    function listenToComponent(base, event, listener) {
        const boundListener = listener.bind(base);
        if (!listenedToElements.has(base)) {
            listenedToElements.set(base, {
                identifiers: new Map(),
                elements: new Map(),
                selfUnique: new Map(),
                self: new Map(),
            });
        }
        const { self: selfEventMap } = listenedToElements.get(base);
        if (!selfEventMap.has(event)) {
            selfEventMap.set(event, [boundListener]);
        }
        else {
            selfEventMap.get(event).push(boundListener);
        }
        base.addEventListener(event, boundListener);
        return () => {
            /* istanbul ignore next */
            if (!selfEventMap.has(event))
                return;
            const listeners = selfEventMap.get(event);
            /* istanbul ignore next */
            if (listeners.indexOf(boundListener) > -1) {
                base.removeEventListener(event, boundListener);
            }
            listeners.splice(listeners.indexOf(boundListener), 1);
            selfEventMap.set(event, listeners);
        };
    }
    Listeners.listenToComponent = listenToComponent;
    function removeListeners(element, map) {
        for (const [event, listeners] of map.entries()) {
            for (const listener of Array.isArray(listeners)
                ? listeners
                : [listeners]) {
                element.removeEventListener(event, listener);
            }
        }
        map.clear();
    }
    /**
     * Removes all event listeners on the component
     *
     * @param {any} base - The component
     * 	from which to remove all listeners
     */
    function removeAllElementListeners(base) {
        if (!listenedToElements.has(base)) {
            return;
        }
        const { elements, identifiers, self, selfUnique, } = listenedToElements.get(base);
        for (const { map, element } of elements.values()) {
            removeListeners(element, map);
        }
        elements.clear();
        for (const { map, element } of identifiers.values()) {
            removeListeners(element, map);
        }
        identifiers.clear();
        removeListeners(base, self);
        removeListeners(base, selfUnique);
    }
    Listeners.removeAllElementListeners = removeAllElementListeners;
})(Listeners || (Listeners = {}));
//# sourceMappingURL=listeners.js.map
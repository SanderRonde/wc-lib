import { WebComponent } from './component.js';

let _supportsPassive: boolean | null = null;
/**
 * Returns true if this browser supports
 * passive event listeners
 * 
 * @returns {boolean} Whether this browser
 * 	supports passive event listeners
 */
function supportsPassive(): boolean {
	if (_supportsPassive !== null) {
		return _supportsPassive;
	}
	_supportsPassive = false;
	try {
		var opts = Object.defineProperty({}, 'passive', {
			get: function () {
				_supportsPassive = true;
			}
		});
		const tempFn = () => { };
		window.addEventListener("testPassive", tempFn, opts);
		window.removeEventListener("testPassive", tempFn, opts);
	}
	catch (e) { }
	return _supportsPassive;
}

export namespace Listeners {
	type IDMap = Map<string, (this: any, ev: HTMLElementEventMap[keyof HTMLElementEventMap]) => any>;
	const listenedToElements: WeakMap<WebComponent, {
		self: IDMap;
		identifiers: Map<string, {
			element: HTMLElement;
			map: IDMap;
		}>;
		elements: Map<string, {
			element: HTMLElement;
			map: IDMap;
		}>;
	}> = new WeakMap();
	function doListen<I extends {
		IDS: {
			[key: string]: HTMLElement|SVGElement;
		};
		CLASSES: {
			[key: string]: HTMLElement|SVGElement;
		}
	}, T extends WebComponent<I>, K extends keyof HTMLElementEventMap>(base: T, type: 'element' | 'identifier', 
		element: HTMLElement, id: string, event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, 
		options?: boolean | AddEventListenerOptions) {
			const boundListener = listener.bind(base);
			if (!listenedToElements.has(base as any)) {
				listenedToElements.set(base as any, {
					identifiers: new Map(),
					elements: new Map(),
					self: new Map()
				});
			}
			const { elements: elementIDMap, identifiers: identifiersMap } = listenedToElements.get(base as any)!;
			const usedMap = type === 'element' ?
				elementIDMap : identifiersMap;
			if (!usedMap.has(id)) {
				usedMap.set(id, {
					element,
					map: new Map()
				});
			}
			const { map: eventIDMap, element: listenedToElement } = usedMap.get(id)!;
			if (!eventIDMap.has(event)) {
				eventIDMap.set(event, boundListener);
			} else {
				listenedToElement.removeEventListener(event, eventIDMap.get(event)!);
			}
			if (listenedToElement !== element) {
				//A new element was listened to instead, remove all listeners
				for (const listenedToEvent of eventIDMap.keys()) {
					listenedToElement.removeEventListener(listenedToEvent, 
						eventIDMap.get(listenedToEvent)!);
					eventIDMap.delete(listenedToEvent);
				}
				//Update element
				usedMap.get(id)!.element = element;
			}

			if (options !== undefined && options !== null && supportsPassive) {
				element.addEventListener(event, boundListener, options);
			} else {
				element.addEventListener(event, boundListener);
			}
		}

	/**
	 * Listens for `event` on `base.$.id` and
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
	 * @param {boolean | AddEventListenerOptions} [options] Optional
	 * 	options that are passed to addEventListener
	 */
	export function listen<I extends {
		IDS: {
			[key: string]: HTMLElement|SVGElement;
		};
		CLASSES: {
			[key: string]: HTMLElement|SVGElement;
		}
	}, T extends WebComponent<I>, K extends keyof HTMLElementEventMap>(base: T, 
		id: keyof T['$'], event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, 
		options?: boolean | AddEventListenerOptions): void {
			const element: HTMLElement = (base.$ as any)[id];
			doListen(base as any, 'element', element, id as string, event, listener, options);
		}

	/**
	 * Listens for `event` on `base` and
	 * triggers `listener` when the event is fired.
	 * Call this function whenever the component is rendered
	 * to make sure it always refers to the current
	 * instance of the element as it will not listen
	 * to the element twice. Uses `identifier` to 
	 * identify this call and to make sure the event
	 * is not listened to twice
	 * 
	 * @template I - An object that maps an event name
	 * 	to the event listener's arguments
	 * 	and return type
	 * @template T - The base component
	 * @template K - The event's name
	 * 
	 * @param {T} base - The base component
	 * @param {string} identifier - A unique identifier for
	 * 	this base component that is mapped to this 
	 * 	listener call
	 * @param {K} event - The event to listen for
	 * @param {(this: T, ev: HTMLElementEventMap[K]) => any} listener - The
	 * 	listener that gets called when the event is fired
	 * @param {boolean | AddEventListenerOptions} [options] Optional
	 * 	options that are passed to addEventListener
	 */
	export function listenWithIdentifier<I extends {
		IDS: {
			[key: string]: HTMLElement|SVGElement;
		};
		CLASSES: {
			[key: string]: HTMLElement|SVGElement;
		}
	}, T extends WebComponent<I>, K extends keyof HTMLElementEventMap>(base: T, 
		element: HTMLElement, identifier: string, event: K, 
		listener: (this: T, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
			doListen(base as any, 'identifier', element, identifier, event, listener, options);
		}
	const defaultContext = {};
	const usedElements: WeakMap<any, WeakSet<HTMLElement>> = new WeakMap();

	/**
	 * Whether this element is new, meaning it's the first time
	 * it's seen on the page by this function
	 * 
	 * @param {HTMLElement} element - The element to check
	 * @param {Object} [context] - A context in which to store
	 * 	this element. For example if you want to check if the
	 * 	element is new on the page use the default context. If
	 * 	you want to check whether the element is new on this
	 * 	component pass the component. The context has to be
	 * 	an object-like value that can be the key of a WeakSet/WeakMap
	 * 
	 * @param {HTMLElement} element - The element to check
	 * @param {Object} [context] - The context in which to check
	 * 	for this element's newness. Uses the default context if 
	 * 	no other context is supplied
	 * 
	 * @returns {boolean} Whether this element is new in the
	 * 	given context
	 */
	export function isNewElement(element: HTMLElement, context: Object = defaultContext): boolean {
		if (!element)
			return false;
		if (!usedElements.has(context)) {
			usedElements.set(context, new WeakSet());
		}
		const currentContext = usedElements.get(context)!;
		const has = currentContext.has(element);
		if (!has) {
			currentContext.add(element);
		}
		return !has;
	}

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
	 * 	type is passed), `isNewelement` is called
	 * @param {boolean | AddEventListenerOptions} [options] Optional
	 * 	options that are passed to addEventListener
	 */
	export function listenIfNew<I extends {
		IDS: {
			[key: string]: HTMLElement|SVGElement;
		};
		CLASSES: {
			[key: string]: HTMLElement|SVGElement;
		}
	}, T extends WebComponent<I>, K extends keyof HTMLElementEventMap>(base: T, id: keyof T['$'], event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, isNew?: boolean, options?: boolean | AddEventListenerOptions) {
		const element: HTMLElement = (base.$ as any)[id];
		const isElementNew = typeof isNew === 'boolean' ? isNew : isNewElement(element);
		if (!isElementNew) {
			return;
		}
		listen(base as any, id as string, event, listener, options);
	}

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
	export function listenToComponent<T extends WebComponent<any>, K extends keyof HTMLElementEventMap>(base: T, event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any) {
		if (!listenedToElements.has(base)) {
			listenedToElements.set(base, {
				identifiers: new Map(),
				elements: new Map(),
				self: new Map()
			});
		}
		const { self: selfEventMap } = listenedToElements.get(base)!;
		if (!selfEventMap.has(event)) {
			selfEventMap.set(event, listener);
		}
		else {
			base.removeEventListener(event, selfEventMap.get(event)!);
		}
		base.addEventListener(event, listener);
	}
	function removeListeners(element: HTMLElement, map: IDMap) {
		for (const [event, listener] of map.entries()) {
			element.removeEventListener(event, listener);
		}
	}

	/**
	 * Removes all event listeners on the component
	 * 
	 * @param {WebComponent} base - The component
	 * 	from which to remove all listeners
	 */
	export function removeAllElementListeners(base: WebComponent) {
		if (!listenedToElements.has(base)) {
			return;
		}
		const { elements: elementIDMap, self: selfEventMap } = listenedToElements.get(base)!;
		for (const { map, element } of elementIDMap.values()) {
			removeListeners(element, map);
		}
		removeListeners(base, selfEventMap);
	}
}
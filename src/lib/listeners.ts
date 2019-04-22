export { supportsPassive } from './shared'
import { supportsPassive } from './shared'
import { WebComponent } from './component';

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
export function listen<I extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
}, T extends WebComponent<I>, K extends keyof HTMLElementEventMap>(base: T, id: keyof T['$'], event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
	const element: HTMLElement = (base.$ as any)[id];
	doListen(base as any, 'element', element, id as string, event, listener, options);
}
export function listenWithIdentifier<I extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
}, T extends WebComponent<I>, K extends keyof HTMLElementEventMap>(base: T, element: HTMLElement, identifier: string, event: K, listener: (this: T, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions) {
	doListen(base as any, 'identifier', element, identifier, event, listener, options);
}
const defaultContext = {};
const usedElements: WeakMap<any, WeakSet<HTMLElement>> = new WeakMap();
export function isNewElement(element: HTMLElement, context: Object = defaultContext) {
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
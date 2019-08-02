import { Constructor, InferInstance, InferReturn, DefaultVal, WebComponentI18NManagerMixinInstance, WebComponentThemeManagerMixinInstance } from '../classes/types.js';
import { EventListenerObj, WebComponentListenableMixinInstance, ListenerSet, GetEvents } from './listener.js';
import { bindToClass, WebComponentBaseMixinInstance } from './base.js';
import { WebComponentDefinerMixinInstance } from './definer.js';
import { CHANGE_TYPE } from './template-fn.js';
import { Listeners } from './listeners.js';
import { WCLibError } from './shared.js';
import { Props } from './props.js';

export type GetEls<GA extends {
	selectors?: SelectorMap;
}> = Required<GA>['selectors'] extends undefined ? 
	{} : DefaultVal<Required<GA>['selectors'], SelectorMap>;

export type SelectorMap<I extends {
	[key: string]: HTMLElement|SVGElement;
} = {
	[key: string]: HTMLElement|SVGElement;
}, C extends {
	[key: string]: HTMLElement|SVGElement;
} = {
	[key: string]: HTMLElement|SVGElement;
}, T extends {
	[key: string]: HTMLElement|SVGElement;
} = {
	[key: string]: HTMLElement|SVGElement;
}> = {
	/**
	 * All child elements of this component by ID
	 */
	IDS?: I;
	/**
	 * All child elements of this component by class
	 */
	CLASSES?: C;
	/**
	 * All child elements of this component by tag name
	 */
	TAGS?: T;
	/**
	 * Togglable classes that can be put onto other elements.
	 * The first property (IDS, CLASSES, TAGS) is the group
	 * to which they apply. The key is the element to which
	 * it is applied and the value is the toggleable class' 
	 * name
	 */
	TOGGLES?: {
		/**
		 * Togglable classes for classes in the IDS group
		 * where the key is the selector (that should also
		 * be present in SelectorMap['IDS'] and the value
		 * is the toggleable class
		 */
		IDS?: {
			[K in keyof I]?: string;
		}
		/**
		 * Togglable classes for classes in the CLASSES group
		 * where the key is the selector (that should also
		 * be present in SelectorMap['CLASSES'] and the value
		 * is the toggleable class
		 */
		CLASSES?: {
			[K in keyof C]?: string;
		}
		/**
		 * Togglable classes for classes in the TAGS group
		 * where the key is the selector (that should also
		 * be present in SelectorMap['TAGS'] and the value
		 * is the toggleable class
		 */
		TAGS?: {
			[K in keyof T]?: string;
		}
	};
	ATTRIBUTES?: {
		/**
		 * Togglable attributes for classes in the IDS group
		 * where the key is the selector (that should also
		 * be present in SelectorMap['IDS'] and the value
		 * is the toggleable attribute
		 */
		IDS?: {
			[K in keyof I]?: string;
		}
		/**
		 * Togglable attributes for classes in the CLASSES group
		 * where the key is the selector (that should also
		 * be present in SelectorMap['CLASSES'] and the value
		 * is the toggleable attribute
		 */
		CLASSES?: {
			[K in keyof C]?: string;
		}
		/**
		 * Togglable attributes for classes in the TAGS group
		 * where the key is the selector (that should also
		 * be present in SelectorMap['TAGS'] and the value
		 * is the toggleable attribute
		 */
		TAGS?: {
			[K in keyof T]?: string;
		}
	}
}

export type IDMapFn<IDS extends SelectorMap> = {
	/**
	 * Query this component's root for given selector
	 */
	<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | undefined;
    <K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | undefined;
    <E extends HTMLElement = HTMLElement>(selector: string): E | undefined;
} & IDS['IDS'];

/**
 * Type of property change events that can be listened for
 */
export type PropChangeEvents = 'beforePropChange'|'propChange';

class ComponentClass {
	/**
	 * An ID map containing maps between queried IDs and elements,
	 * 	cleared upon render
	 */
	public idMap: Map<string, HTMLElement|SVGElement|any> = new Map();

	constructor() { }

	@bindToClass
	/**
	 * Clears the ID map
	 */
	public clearMap() {
		this.idMap.clear();
	}

	public idMapProxy: IDMapFn<any>| null = null;
	public supportsProxy: boolean = typeof Proxy !== 'undefined';

	public genIdMapProxy<ELS extends SelectorMap>(self: WebComponentMixinInstance): IDMapFn<ELS> {
		const __this = this;
		return new Proxy((selector: string) => {
			return self.root.querySelector(selector) as HTMLElement;
		}, {
			get(_, id) {
				if (typeof id !== 'string') {
					return undefined;
				}
				const cached = __this.idMap.get(id);
				if (cached && self.shadowRoot!.contains(cached)) {
					return cached;
				}
				const el = self.root.getElementById(id);
				if (el) {
					__this.idMap.set(id, el as unknown as ELS["IDS"][keyof ELS["IDS"]]);
				}
				return el || undefined;
			}
		}) as IDMapFn<ELS>;
	}

	public getIdMapSnapshot<ELS extends SelectorMap>(self: WebComponentMixinInstance) {
		const snapshot: Partial<IDMapFn<ELS>> = ((selector: string) => {
			return self.root.querySelector(selector) as HTMLElement;
		}) as IDMapFn<ELS>
		for (const item of self.root.querySelectorAll('[id]')) {
			(snapshot as any)[item.id as any] = item;
		}

		return snapshot as IDMapFn<ELS>;
	}
}

export type WebComponentSuper = Constructor<
	HTMLElement &
	Pick<WebComponentDefinerMixinInstance, '___definerClass'> &
	Pick<WebComponentBaseMixinInstance, 'root'|'self'|'renderToDOM'> &
	Pick<WebComponentListenableMixinInstance, 'listen'|'fire'|'clearListener'|'listenerMap'> & 
	Partial<Pick<WebComponentThemeManagerMixinInstance, 'getTheme'|'getThemeName'|'setTheme'>> &
	Partial<Pick<WebComponentI18NManagerMixinInstance, 'getLang'|'setLang'|'__'|'__prom'>> & {
		connectedCallback(): void;
		disconnectedCallback?(): void;
	}>;

export type WebComponentMixinInstance = InferInstance<WebComponentMixinClass>;
export type WebComponentMixinClass = InferReturn<typeof WebComponentMixin>;

/**
 * The class that wraps up all subclasses of a webcomponent.
 * This version takes two type parameters that allow for the
 * type parameters to be specified as well as the 
 * ID map.
 * 
 * @template ELS - The elements found in this component's HTML
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
export const WebComponentMixin = <P extends WebComponentSuper>(superFn: P) => {
	const privateMap: WeakMap<WebComponent<any>, ComponentClass> = new WeakMap();
	function getPrivate(self: WebComponent): ComponentClass {
		if (privateMap.has(self)) return privateMap.get(self)!;
		return privateMap.set(self, new ComponentClass()).get(self)!;
	}

	// Will show a warning regarding using generics in mixins
	// This issue is tracked in the typescript repo's issues with numbers
	// #26154 #24122 (among others)
	//@ts-ignore
	class WebComponent<GA extends {
		i18n?: any;
		langs?: string;
		events?: EventListenerObj;
		themes?: {
			[key: string]: any;
		};
		selectors?: SelectorMap;
	} = {}, E extends EventListenerObj = GetEvents<GA>, ELS extends SelectorMap = GetEls<GA>> extends superFn {
		/**
		 * An array of functions that get called when this
		 * component gets unmounted. These will dispose
		 * of any open listeners or similar garbage
		 */
		public disposables: (() => void)[] = [];

		/**
		 * Whether this component has been mounted
		 */
		public isMounted: boolean = false;

		constructor(...args: any[]) {
			super(...args);
			this.___definerClass.internals.postRenderHooks.push(
				getPrivate(this).clearMap);
		}

		/**
		 * An object that contains all children
		 * of this element mapped by their ID. 
		 * This object can also be called with a
		 * query, which is just a proxy call to 
		 * `this.root.querySelector`.
		 * 
		 * **Note:** This function returns `undefined`
		 * 	when no element can be found instead of 
		 * 	null.
		 * 
		 * @readonly
		 */
		get $(): IDMapFn<ELS> {
			const priv = getPrivate(this);
			if (priv.supportsProxy) {
				return priv.idMapProxy ||
					(priv.idMapProxy = priv.genIdMapProxy<ELS>(this))
			}

			// Re-generate the ID map every time
			return priv.getIdMapSnapshot(this);
		}

		/**
		 * Proxy for `this.root.querySelectorAll(selector)`
		 * 
		 * @template E - An element
		 * @param {string} selector - The query to use
		 * 
		 * @returns {NodeListOf<HTMLElement|SVGElement|E>} A list of
		 * 	nodes that are the result of this query
		 */
		$$<K extends keyof HTMLElementTagNameMap>(selector: K): NodeListOf<HTMLElementTagNameMap[K]>;
		$$<K extends keyof SVGElementTagNameMap>(selector: K): NodeListOf<SVGElementTagNameMap[K]>;
		$$<E extends Element = Element>(selector: string): NodeListOf<E>;
		$$(selector: string): NodeListOf<HTMLElement> {
			return this.root.querySelectorAll(selector);
		}

		/**
		 * Called when the component is mounted to the dom.
		 * Be sure to always call `super.connectedCallback()`
		 * if you override this method
		 */
		connectedCallback() {
			super.connectedCallback();
			
			if (!this.self) {
				throw new WCLibError(this, 
					'Missing .self property on component');
			}

			Props.onConnect(this);
			this.renderToDOM(CHANGE_TYPE.ALWAYS);
			this.layoutMounted();

			this.___definerClass.internals.connectedHooks.filter(fn => fn());
		}

		/**
		 * Called when the component is unmounted from the dom
		 * Be sure to always call `super.disconnectedCallback()`
		 * 	if you override this method
		 */
		disconnectedCallback() {
			/* istanbul ignore next */
			super.disconnectedCallback && super.disconnectedCallback();
			Listeners.removeAllElementListeners(this as any);
			this.disposables.forEach(disposable => disposable());
			this.disposables = [];
			this.isMounted = false;
			this.unmounted();
		}

		/**
		 * Called when the component is mounted to the dom for the first time.
		 * This will be part of the "constructor" and will slow down the initial render
		 */
		layoutMounted() {}

		/**
		 * Called when the component is mounted to the dom and is ready to be manipulated
		 */
		mounted() {}

		/**
		 * Called when the component is removed from the dom
		 */
		unmounted() {}

		/**
		 * Listeners for property change events on this node
		 * 
		 * @template P - The properties of this node
		 * 
		 * @param {PropChangeEvents} event - The type of change
		 * 	to listen for. Either a `propChange` or a 
		 * 	`beforePropChange` event
		 * @param {(key: keyof P, newValue: P[keyof P], oldValue: P[keyof P]) => void} listener - The
		 * 	listener that should be called when the event is fired. 
		 * 	This listener is called with the name of the changed
		 * 	property, the new value and the old value respectively
		 * @param {boolean} [once] - Whther the listener should only
		 * 	be called once
		 */
		public listenProp<P extends Props & { [key: string]: any; }>(
			event: PropChangeEvents, 
			listener: (key: keyof P, newValue: P[keyof P], oldValue: P[keyof P]) => void, 
			once?: boolean): void;
		public listenProp<P extends Props & { [key: string]: any; }, PK extends keyof P>(
			event: PropChangeEvents, 
			listener: (key: PK, newValue: P[PK], oldValue: P[PK]) => void,
			once?: boolean): void;
		public listenProp<P extends Props & { [key: string]: any; }>(
			event: PropChangeEvents, 
			listener: (key: keyof P, newValue: P[keyof P], oldValue: P[keyof P]) => void,
			once: boolean = false) {
				this.listen(event, listener, once);
			}

		
		/**
		 * A map that maps every event name to
		 * a set containing all of its listeners
		 * 
		 * @readonly
		 */
		get listenerMap(): ListenerSet<E> {
			return super.listenerMap as ListenerSet<E>;
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
		 * @param {boolean} [once] - Whether to only
		 * 	call this listener once (false by default)
		 */
		public listen = <EV extends keyof E>(event: EV, listener: (...args: E[EV]['args']) => E[EV]['returnType'], once: boolean = false) => {
			super.listen(event as any, listener, once);
		}

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
		public clearListener = <EV extends keyof E>(event: EV, listener?: (...args: E[EV]['args']) => E[EV]['returnType']) => {
			super.clearListener(event as any, listener);
		}

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
		 * @param {EV} event - The event's anme
		 * @param {E[EV]['args']} params - The parameters
		 * 	passed to the listeners when they are
		 * 	called
		 * 
		 * @returns {R[]} An array containing the
		 * 	return values of all triggered
		 * 	listeners
		 */
		public fire = <EV extends keyof E, R extends E[EV]['returnType']>(event: EV, ...params: E[EV]['args']): R[] => {
			return super.fire(event as any, ...params);
		}

		/**
		 * Sets the current language
		 * 
		 * @param {string} lang - The language to set it to, a regular string
		 */
		public setLang = <L extends string = DefaultVal<GA['langs'], string>>(lang: L): Promise<void> => {
			if (!super.setLang) {
				throw new Error('Not implemented');
			}
			return super.setLang(lang);
		}

		/**
		 * Gets the currently active language
		 */
		public getLang = (): DefaultVal<GA['langs'], string> => {
			if (!super.getLang) {
				throw new Error('Not implemented');
			}
			return super.getLang() as DefaultVal<GA['langs'], string>;
		}

		/**
		 * Returns a promise that resolves to the message. You will generally
		 * want to use this inside the class itself since it resolves to a simple promise.
		 * 
		 * **Note:** Does not call the `options.returner` function before returning.
		 * 
		 * @param {Extract<keyof DefaultVal<GA['i18n'], string>, string>} key - The key to search for in the messages file
		 * @param {any[]} [values] - Optional values passed to the `getMessage` function
		 * 		that can be used as placeholders or something similar
		 * 
		 * @returns {Promise<string>} A promise that resolves to the found message
		 */
		public __prom = <I extends GA['i18n'] = { [key: string]: any; }>(key: Extract<keyof I, string>, ...values: any[]): Promise<string> => {
			if (!super.__prom) {
				throw new Error('Not implemented');
			}
			return super.__prom(key, ...values);
		}

		/**
		 * Returns either a string or whatever the `options.returner` function
		 * returns. If you have not set the `options.returner` function, this will
		 * return either a string or a promise that resolves to a string. Since
		 * this function calls `options.returner` with the promise if the i18n file
		 * is not loaded yet.
		 * 
		 * You will generally want to use this function inside your templates since it
		 * allows for the `options.returner` function to return a template-friendly
		 * value that can display a placeholder or something of the sort
		 * 
		 * @template R - The return value of your returner function
		 * @param {Extract<keyof DefaultVal<GA['i18n'], string>, string>} key - The key to search for in the messages file
		 * @param {any[]} [values] - Optional values passed to the `getMessage` function
		 * 		that can be used as placeholders or something similar
		 * 
		 * @returns {string|R} A promise that resolves to the found message
		 */
		public __ = <R, I extends GA['i18n'] = { [key: string]: any; }>(key: Extract<keyof I, string>, ...values: any[]): string|R => {
			if (!super.__) {
				throw new Error('Not implemented');
			}
			return super.__(key, ...values);
		}

		/**
		 * Gets the name of the curent theme
		 * 
		 * @returns {string} The name of the current theme
		 */
		public getThemeName = <N extends GA['themes'] = { [key: string]: any }>(): Extract<keyof N, string> => {
			if (!super.getThemeName) {
				throw new Error('Not implemented');
			}
			return super.getThemeName();
		}

		/**
		 * Gets the current theme's theme object
		 * 
		 * @template T - The themes type
		 * 
		 * @returns {T[keyof T]} A theme instance type
		 */
		public getTheme = <T extends GA['themes'] = { [key: string]: any }>(): T[keyof T] => {
			if (!super.getTheme) {
				throw new Error('Not implemented');
			}
			return super.getTheme();
		}

		/**
		 * Sets the theme of this component and any other
		 * component in its hierarchy to the passed theme
		 * 
		 * @template N - The theme name
		 */
		public setTheme = <N extends GA['themes'] = { [key: string]: any }>(themeName: N) => {
			if (!super.setTheme) {
				throw new Error('Not implemented');
			}
			return super.setTheme(themeName);
		}
	}

	return WebComponent;
}
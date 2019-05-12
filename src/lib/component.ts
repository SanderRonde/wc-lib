import { WebComponentCustomCSSManager } from './custom-css-manager.js';
import { Listeners } from './listeners.js';
import { bindToClass, CHANGE_TYPE } from './base.js';
import { EventListenerObj } from './listener.js';
import { Props } from './props.js';


type IDMapFn<IDS> = {
	/**
	 * Query this component's root for given selector
	 */
	<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
    <K extends keyof SVGElementTagNameMap>(selector: K): SVGElementTagNameMap[K] | null;
    <E extends HTMLElement = HTMLElement>(selector: string): E | null;
} & IDS;

/**
 * Type of property change events that can be listened for
 */
export type PropChangeEvents = 'beforePropChange'|'propChange';

class ComponentClass<ELS extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
} = {
	IDS: {};
	CLASSES: {}
}> {
	/**
	 * An ID map containing maps between queried IDs and elements,
	 * 	cleared upon render
	 */
	public idMap: Map<keyof ELS["IDS"], ELS["IDS"][keyof ELS["IDS"]]> = new Map();

	constructor() { }

	@bindToClass
	/**
	 * Clears the ID map
	 */
	public clearMap() {
		this.idMap.clear();
	}

	public idMapProxy: IDMapFn<ELS["IDS"]>| null = null;
	public supportsProxy: boolean = typeof Proxy !== 'undefined';

	public genIdMapProxy(self: WebComponent<any, any>): IDMapFn<ELS["IDS"]> {
		const __this = this;
		return new Proxy((selector: string) => {
			return self.root.querySelector(selector) as HTMLElement;
		}, {
			get(_, id) {
				if (typeof id !== 'string') {
					return null;
				}
				const cached = __this.idMap.get(id);
				if (cached && self.shadowRoot!.contains(cached)) {
					return cached;
				}
				const el = self.root.getElementById(id);
				if (el) {
					__this.idMap.set(id, el as ELS["IDS"][keyof ELS["IDS"]]);
				}
				return el;
			}
		}) as IDMapFn<ELS["IDS"]>;
	}

	public getIdMapSnapshot(self: WebComponent<any, any>) {
		const snapshot: Partial<IDMapFn<ELS["IDS"]>> = ((selector: string) => {
			self.root.querySelector(selector) as HTMLElement;
		}) as IDMapFn<ELS["IDS"]>
		for (const item of self.root.querySelectorAll('[id]')) {
			(snapshot as any)[item.id as any] = item;
		}

		return snapshot as IDMapFn<ELS["IDS"]>;
	}
}


/**
 * The class that wraps up all subclasses of a webcomponent
 * 
 * @template ELS - The elements found in this component's HTML
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
export abstract class WebComponent<ELS extends {
	/**
	 * All child elements of this component by ID
	 */
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	/**
	 * All child elements of this component by class
	 */
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
} = {
	IDS: {};
	CLASSES: {}
}, E extends EventListenerObj = {}> extends WebComponentCustomCSSManager<E> {
	/**
	 * The class associated with this one that
	 * contains some functions required for 
	 * it to function
	 * 
	 * @private
	 * @readonly
	 */
	private ___componentClass: ComponentClass<ELS> = new ComponentClass<ELS>();

	/**
	 * An array of functions that get called when this
	 * component gets unmounted. These will dispose
	 * of any open listeners or similar garbage
	 */
	protected disposables: (() => void)[] = [];

	/**
	 * Whether this component has been mounted
	 */
	public isMounted: boolean = false;

	constructor() {
		super();
		this.___definerClass.internals.postRenderHooks.push(
			this.___componentClass.clearMap);
	}

	/**
	 * An object that contains all children
	 * of this element mapped by their ID. 
	 * This object can also be called with a
	 * query, which is just a proxy call to 
	 * `this.root.querySelector`
	 * 
	 * @readonly
	 */
	get $(): IDMapFn<ELS["IDS"]> {
		if (this.___componentClass.supportsProxy) {
			return this.___componentClass.idMapProxy ||
				(this.___componentClass.idMapProxy = this.___componentClass.genIdMapProxy(this))
		}

		// Re-generate the ID map every time
		return this.___componentClass.getIdMapSnapshot(this);
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
	 * Called when the component is mounted to the dom
	 */
	connectedCallback() {
		super.connectedCallback();
		Props.onConnect(this);
		this.renderToDOM(CHANGE_TYPE.ALWAYS);
		this.layoutMounted();

		this.___definerClass.internals.connectedHooks.filter(fn => fn());
	}

	/**
	 * Called when the component is unmounted from the dom
	 */
	disconnectedCallback() {
		Listeners.removeAllElementListeners(this as any);
		this.disposables.forEach(disposable => disposable());
		this.disposables = [];
		this.isMounted = false;
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
	public listenProp<P extends Props & {
		[key: string]: any;
	}>(event: PropChangeEvents, 
		listener: (key: keyof P, newValue: P[keyof P], oldValue: P[keyof P]) => void,
		once?: boolean): void;
	public listenProp<P extends Props & {
		[key: string]: any;
	}, PK extends keyof P>(event: PropChangeEvents, 
		listener: (key: PK, newValue: P[PK], oldValue: P[PK]) => void,
		once?: boolean): void;
	public listenProp<P extends Props & {
		[key: string]: any;
	}>(event: PropChangeEvents, 
		listener: (key: keyof P, newValue: P[keyof P], oldValue: P[keyof P]) => void,
		once: boolean = false) {
			this.___listenableClass.listen(event, listener, once);
		}
}
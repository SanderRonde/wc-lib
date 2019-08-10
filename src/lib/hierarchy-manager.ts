import { WebComponentListenableMixinInstance, EventListenerObj, GetEvents, ListenerSet } from './listener.js';
import { Constructor, InferReturn, InferInstance, DefaultVal } from '../classes/types.js';
import { bindToClass } from './base.js';

/**
 * The type of the `component.listenGP` function
 */
export interface ListenGPType<GA extends {
	globalProps?: {
		[key: string]: any;
	}
}> {
	<GP extends GA['globalProps'] = { [key: string]: any; }>(event: 'globalPropChange', 
		listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void,
		once?: boolean): void;
	<GP extends GA['globalProps'] = { [key: string]: any; }, K extends keyof GP = any>(event: 'globalPropChange', 
		listener: (prop: K, newValue: GP[K], oldValue: GP[K]) => void,
		once?: boolean): void;
	<GP extends GA['globalProps'] = { [key: string]: any; }>(
		event: 'globalPropChange', 
		listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void,
		once?: boolean): void;
}

/**
 * Global properties functions returned by
 * `component.globalProps()`
 * 
 * @template G - The global properties
 */
export type GlobalPropsFunctions<G extends {
	[key: string]: any;
}> = {
	/**
	 * Gets all global properties
	 */
	all: G;
	/**
	 * Gets global property with given name
	 * 
	 * @template K - The key
	 * 
	 * @param {Extract<K, string>} key - The
	 * 	name of the property to get
	 * @returns {G[K]} The property
	 */
	get<K extends keyof G>(key: Extract<K, string>): G[K];
	/**
	 * Sets global property with given name
	 * 
	 * @template K - The key
	 * @template V - The value
	 * 
	 * @param {Extract<K, string>} key - The
	 * 	name of the property to get
	 * @param {V} value - The value of the 
	 * 	property to set it to
	 * @returns {G[K]} The property
	 */
	set<K extends keyof G, V extends G[K]>(key: Extract<K, string>, value: V): void;
}

class HierarchyClass {
	public children: Set<WebComponentHierarchyManagerMixinInstance> = new Set();
	public parent: any|null = null;
	public isRoot!: boolean;
	public globalProperties: any = {};
	public static hierarchyClasses: WeakSet<WebComponentHierarchyManagerMixinInstance> = new WeakSet();

	constructor(private _self: WebComponentHierarchyManagerMixinInstance,
		private _getGetPrivate: () => (element: WebComponentHierarchyManagerMixinInstance) => HierarchyClass) { }

	public __getParent<T>(): T|null {
		return this.parent as T;
	}

	private __isHierarchyManagerInstance(element: unknown): element is WebComponentHierarchyManagerMixinInstance {
		return HierarchyClass.hierarchyClasses.has(element as any);
	}

	public getGlobalProperties<G extends {
		[key: string]: string;
	}>() {
		const props: Partial<G> = {};
		for (let i = 0; i < this._self.attributes.length; i++) {
			const attr = this._self.attributes[i];
			if (attr.name.startsWith('prop_')) {
				(props as G)[attr.name.slice('prop_'.length) as keyof G] = 
					decodeURIComponent(
						attr.value as string) as G[keyof G];
			}
		}

		return props;
	}

	private __findLocalRoot(): null|WebComponentHierarchyManagerMixinInstance {
		let element: Node|null = this._self.parentNode;
		while (element && !(element instanceof (window as any).ShadowRoot) && 
			(element as any) !== document && !(element instanceof DocumentFragment)) {
				element = element.parentNode as HTMLElement|null;
			}

		/* istanbul ignore if */
		if (!element) {
			return null;
		}
		if (<any>element === document) {
			return this._self;
		}
		const host = (() => {
			/* istanbul ignore if */
			if (this.__isHierarchyManagerInstance(element)) {
				return element;
			} else {
				return (<ShadowRoot><any>element).host;
			}
		})();

		/* istanbul ignore if */
		if (!this.__isHierarchyManagerInstance(host)) {
			return null;
		}
		return host as WebComponentHierarchyManagerMixinInstance;
	}

	private __findDirectParents(): null|WebComponentHierarchyManagerMixinInstance {
		let element: Node|null = this._self.parentNode;
		while (element && !(element instanceof (window as any).ShadowRoot) && 
			(element as any) !== document && !(element instanceof DocumentFragment) &&
			!this.__isHierarchyManagerInstance(element)) {
				element = element.parentNode as HTMLElement|null;
			}

		/* istanbul ignore if */
		if (!element) {
			//Ignore this
			return null;
		}

		/* istanbul ignore else */
		if (<any>element === document) {
			//This is in the light DOM, ignore it since it's the root
			return this._self;
		} else {
			const host = this.__isHierarchyManagerInstance(element) ?
				element : (<ShadowRoot><any>element).host;

			if (!this.__isHierarchyManagerInstance(host)) {
				return null;
			}
			return host as WebComponentHierarchyManagerMixinInstance;
		}
	}

	private __getRoot(): null|WebComponentHierarchyManagerMixinInstance {
		const localRoot = this.__findLocalRoot();
		if (localRoot !== null && localRoot !== this._self) {
			//Found an actual root, use that
			return localRoot;
		}
		return this.__findDirectParents();
	}

	@bindToClass
	public registerToParent() {
		const root = this.__getRoot();
		/* istanbul ignore next */
		if (root === this._self) {
			this.isRoot = true;
			return;
		} else if (root === null) {
			return;
		}
		
		this.parent = root;
		const newProps = {...root.registerChild(this._self)};
		for (const key in newProps) {
			this.setGlobalProperty(key as Extract<keyof typeof newProps, string>, 
				newProps[key as keyof typeof newProps]);
		}
	}

	public clearNonExistentChildren() {
		const nodeChildren = Array.prototype.slice.apply(this._self.children) as HTMLElement[];
		for (const child of this.children.values()) {
			/* istanbul ignore next */
			if (!this._self.shadowRoot!.contains(child) && 
				!nodeChildren.filter(nodeChild => nodeChild.contains(child)).length) {
					this.children.delete(child);
				}
		}
	}

	public setGlobalProperty<G extends {
		[key: string]: any;
	}, P extends keyof G = keyof G, V extends G[P] = G[P]>(key: Extract<P, string>,
		value: V) {
			if (this.globalProperties[key] !== value) {
				const oldVal = this.globalProperties[key];
				this.globalProperties[key] = value;
				this._self.fire('globalPropChange', key, value, oldVal);
			}
		}

	public propagateThroughTree<R>(fn: (element: WebComponentHierarchyManagerMixinInstance) => R): R[] {
		/* istanbul ignore else */
		if (this.isRoot) {
			const results: R[] = [];
			this.__propagateDown(fn, results);
			return results;
		} else if (this.parent) {
			return this._getGetPrivate()(this.parent).propagateThroughTree(fn);
		} else {
			return [];
		}
	}

	private __propagateDown<R>(fn: (element: WebComponentHierarchyManagerMixinInstance) => R, results: R[]) {
		results.push(fn(this._self));

		for (const child of this.children) {
			this._getGetPrivate()(child).__propagateDown(fn, results);
		}
	}

	public globalPropsFns: GlobalPropsFunctions<any>|null = null;
}

/**
 * An instance of the webcomponent hierarchy manager mixin's resulting class
 */
export type WebComponentHierarchyManagerMixinInstance = InferInstance<WebComponentHierarchyManagerMixinClass> & {
	self: WebComponentHierarchyManagerMixinClass;
};

/**
 * The webcomponent hierarchy manager mixin's resulting class
 */
export type WebComponentHierarchyManagerMixinClass = InferReturn<typeof WebComponentHierarchyManagerMixin>;

/**
 * The parent/super type required by the hierarchy manager mixin
 */
export type WebComponentHierarchyManagerMixinSuper = Constructor<
	Pick<WebComponentListenableMixinInstance, 'listen'|'fire'> & 
	Partial<Pick<WebComponentListenableMixinInstance, 'clearListener'|'listenerMap'>> & 
	HTMLElement & {
		connectedCallback(): void;
	}>;


/**
 * A mixin that, when applied, allows for finding out
 * the hierarchy of all component on the page,
 * finding out the parents and children of components
 * as well as finding out the root. It also adds
 * global properties support
 * 
 * @template P - The parent/super's type
 * 
 * @param {P} superFn - The parent/super
 */
export const WebComponentHierarchyManagerMixin = <P extends WebComponentHierarchyManagerMixinSuper>(superFn: P) => {
	const privateMap: WeakMap<WebComponentHierarchyManager, HierarchyClass> = new WeakMap();
	function hierarchyClass(self: WebComponentHierarchyManager): HierarchyClass {
		if (privateMap.has(self)) return privateMap.get(self)!;
		return privateMap.set(self, new HierarchyClass(self as any, () => hierarchyClass)).get(self)!;
	}

	// Explanation for ts-ignore:
	// Will show a warning regarding using generics in mixins
	// This issue is tracked in the typescript repo's issues with numbers
	// #26154 #24122 (among others)

	/**
	 * The class that is responsible for managing 
	 * the hierarchy of the page, establishing a
	 * root node and allowing for global properties
	 * to flow from children to the root and back to
	 * children
	 */
	//@ts-ignore
	class WebComponentHierarchyManager<GA extends {
		i18n?: any;
		langs?: string;
		events?: EventListenerObj;
		themes?: {
			[key: string]: any;
		};
		root?: any;
		parent?: any;
		globalProps?: {
			[key: string]: any;
		}
	} = {}, E extends EventListenerObj = GetEvents<GA>> extends superFn {
		constructor(...args: any[]) {
			super(...args);
			HierarchyClass.hierarchyClasses.add(this as any);
		}

		/**
		 * Called when the component is mounted to the dom
		 */
		connectedCallback() {
			super.connectedCallback();
			const priv = hierarchyClass(this);
			priv.isRoot = this.hasAttribute('_root');
			priv.globalProperties = {};
			priv.registerToParent();
			if (priv.isRoot) {
				priv.globalProperties = {
					...priv.getGlobalProperties()
				};	
			}
		}

		/**
		 * Registers `element` as the child of this
		 * component
		 * 
		 * @template G - Global properties
		 * @param {HTMLElement} element - The
		 * 	component that is registered as the child of this one
		 * 
		 * @returns {G} The global properties
		 */
		public registerChild<G extends GA['globalProps'] = { [key: string]: any; }>(
			element: HTMLElement): G {
				const priv = hierarchyClass(this);
				priv.clearNonExistentChildren();
				priv.children.add(element as any);
				return priv.globalProperties as G;
			}

		/**
		 * Gets the global properties functions
		 * 
		 * @template G - The global properties
		 * @returns {GlobalPropsFunctions<G>} Functions
		 * 	that get and set global properties
		 */
		public globalProps<G extends GA['globalProps'] = { [key: string]: any; }>(): GlobalPropsFunctions<DefaultVal<G, {[key: string]: any }>> {
			const priv = hierarchyClass(this);
			if (priv.globalPropsFns) {
				return priv.globalPropsFns!;
			}

			type DefaultG = DefaultVal<G, { [key: string]: any }>;
			const __this = this;
			const fns: GlobalPropsFunctions<DefaultG> = {
				get all() {
					return hierarchyClass(__this).globalProperties;
				},
				get<K extends keyof DefaultG>(key: Extract<K, string>): DefaultG[K] {
					/* istanbul ignore next */
					if (!hierarchyClass(__this).globalProperties) {
						return undefined as any;
					}
					return hierarchyClass(__this).globalProperties[key] as any;
				},
				set<K extends keyof DefaultG, V extends DefaultG[K]>(key: Extract<K, string>, value: V): void {
					/* istanbul ignore if */
					if (!hierarchyClass(__this).parent && !hierarchyClass(__this).isRoot) {
						console.warn(`Failed to propagate global property "${key}" since this element has no registered parent`);
						return;
					}
					hierarchyClass(__this).propagateThroughTree((element) => {
						hierarchyClass(element).setGlobalProperty<DefaultG>(key, value);
					});
				}
			};
			return (hierarchyClass(this).globalPropsFns = fns);
		}

		/**
		 * Gets the root node of the global hierarchy
		 * 
		 * @template T - The type of the root
		 * 
		 * @returns {T} The root
		 */
		public getRoot<T extends GA['root'] = {}>(): T {
			const priv = hierarchyClass(this);
			if (priv.isRoot) {
				return <T><any>this;
			}
			return priv.parent!.getRoot();
		}

		/**
		 * Runs a function for every component in this
		 * global hierarchy
		 * 
		 * @template R - The return type of given function
		 * @template E - The components on the page's base types
		 * 
		 * @param {(element: WebComponentHierarchyManager) => R} fn - The
		 * 	function that is ran on every component
		 * 
		 * @returns {R[]} All return values in an array
		 */
		public runGlobalFunction<E extends {}, R = any>(fn: (element: E) => R): R[] {
			return hierarchyClass(this).propagateThroughTree(fn as any);
		}

		/**
		 * Returns the parent of this component
		 * 
		 * @template T - The parent's type
		 * @returns {T|null} - The component's parent or 
		 * 	null if it has none
		 */
		public getParent<T extends GA['parent'] = {}>(): T|null {
			return hierarchyClass(this).__getParent() as T;
		}

		/**
		 * Listeners for global property changes
		 * 
		 * @template GP - The global properties
		 * 
		 * @param {'globalPropChange'} event - The
		 * 	event to listen for
		 * @param {(prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void} listener - 
		 * 	The listener that is called when the
		 * 	event is fired
		 * @param {boolean} [once] - Whether to 
		 * 	only fire this event once
		 */
		public listenGP<GP extends GA['globalProps'] = { [key: string]: any; }>(event: 'globalPropChange', 
			listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void,
			once?: boolean): void;
		public listenGP<GP extends GA['globalProps'] = { [key: string]: any; }, K extends keyof GP = any>(event: 'globalPropChange', 
			listener: (prop: K, newValue: GP[K], oldValue: GP[K]) => void,
			once?: boolean): void;
		public listenGP<GP extends GA['globalProps'] = { [key: string]: any; }>(
			event: 'globalPropChange', 
			listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void,
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
		public fire = <EV extends keyof E, R extends E[EV]['returnType']>(event: EV, ...params: E[EV]['args']): R[] => {
			return super.fire(event as any, ...params);
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
			// istanbul ignore next
			if (!super.clearListener) {
				throw new Error('Not implemented, please include listener mixin');
			}
			// istanbul ignore next
			super.clearListener(event as any, listener);
		}
	}

	return WebComponentHierarchyManager;
}
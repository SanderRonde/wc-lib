import { EventListenerObj, WebComponentListenable } from './listener.js';
import { ConfigurableWebComponent } from './configurable.js';
import { bindToClass } from './base.js';

/**
 * Global properties functions returned by
 * `component.globalProps()`
 * 
 * @template G - The global properties
 */
type GlobalPropsFunctions<G extends {
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
	public children: Set<WebComponentHierarchyManager<any>> = new Set();
	public parent: WebComponentHierarchyManager<any>|null = null;
	public isRoot!: boolean;

	constructor(private _self: WebComponentHierarchyManager<any>) { }

	public __getParent<T extends WebComponentHierarchyManager<any>>(): T|null {
		return this.parent as T;
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

	private __findLocalRoot(): null|WebComponentHierarchyManager<any> {
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
			if (element instanceof WebComponentHierarchyManager) {
				return element;
			} else {
				return (<ShadowRoot><any>element).host;
			}
		})();

		/* istanbul ignore if */
		if (!(host instanceof WebComponentHierarchyManager)) {
			return null;
		}
		return host;
	}

	private __findDirectParents(): null|WebComponentHierarchyManager<any> {
		let element: Node|null = this._self.parentNode;
		while (element && !(element instanceof (window as any).ShadowRoot) && 
			(element as any) !== document && !(element instanceof DocumentFragment) &&
			!(element instanceof WebComponentHierarchyManager)) {
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
			const host = element instanceof WebComponentHierarchyManager ?
				element : (<ShadowRoot><any>element).host;

			if (!(host instanceof WebComponentHierarchyManager)) {
				return null;
			}
			return host;
		}
	}

	private __getRoot(): null|WebComponentHierarchyManager<any> {
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
			if (this._self.___definerClass.internals.globalProperties[key] !== value) {
				const oldVal = this._self.___definerClass.internals.globalProperties[key];
				this._self.___definerClass.internals.globalProperties[key] = value;
				this._self.fire('globalPropChange', key, value, oldVal);
			}
		}

	public propagateThroughTree<R>(fn: (element: WebComponentHierarchyManager<any>) => R): R[] {
		/* istanbul ignore else */
		if (this.isRoot) {
			const results: R[] = [];
			this.__propagateDown(fn, results);
			return results;
		} else if (this.parent) {
			return this.parent.___hierarchyClass.propagateThroughTree(fn);
		} else {
			return [];
		}
	}

	private __propagateDown<R>(fn: (element: WebComponentHierarchyManager<any>) => R, results: R[]) {
		results.push(fn(this._self));

		for (const child of this.children) {
			child.___hierarchyClass.__propagateDown(fn, results);
		}
	}

	public globalPropsFns: GlobalPropsFunctions<any>|null = null;
}

/**
 * The class that is responsible for managing 
 * the hierarchy of the page, establishing a
 * root node and allowing for global properties
 * to flow from children to the root and back to
 * children
 * 
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
export abstract class WebComponentHierarchyManager<E extends EventListenerObj> extends WebComponentListenable<E> {
	/**
	 * The class associated with this one that
	 * contains some functions required for 
	 * it to function
	 * 
	 * @private
	 * @readonly
	 */
	public ___hierarchyClass: HierarchyClass = new HierarchyClass(this);

	/**
	 * Called when the component is mounted to the dom
	 */
	connectedCallback() {
		this.___hierarchyClass.isRoot = this.hasAttribute('_root');
		this.___definerClass.internals.globalProperties = {};
		this.___hierarchyClass.registerToParent();
		if (this.___hierarchyClass.isRoot) {
			this.___definerClass.internals.globalProperties = {
				...this.___hierarchyClass.getGlobalProperties()
			};	
		}
	}

	/**
	 * Registers `element` as the child of this
	 * component
	 * 
	 * @template G - Global properties
	 * @param {WebComponentHierarchyManager<any>} element - The
	 * 	component that is registered as the child of this one
	 * 
	 * @returns {G} The global properties
	 */
	public registerChild<G extends {
		[key: string]: any;
	}>(element: WebComponentHierarchyManager<any>): G {
		this.___hierarchyClass.clearNonExistentChildren();
		this.___hierarchyClass.children.add(element);
		return this.___definerClass.internals.globalProperties as G;
	}

	/**
	 * Gets the global properties functions
	 * 
	 * @template G - The global properties
	 * @returns {GlobalPropsFunctions<G>} Functions
	 * 	that get and set global properties
	 */
	public globalProps<G extends {
		[key: string]: any;
	}>(): GlobalPropsFunctions<G> {
		if (this.___hierarchyClass.globalPropsFns) {
			return this.___hierarchyClass.globalPropsFns;
		}

		const __this = this;
		const fns: GlobalPropsFunctions<G> = {
			get all() {
				return __this.___definerClass.internals.globalProperties;
			},
			get<K extends keyof G>(key: Extract<K, string>): G[K] {
				/* istanbul ignore next */
				if (!__this.___definerClass.internals.globalProperties) {
					return undefined as any;
				}
				return __this.___definerClass.internals.globalProperties[key] as any;
			},
			set<K extends keyof G, V extends G[K]>(key: Extract<K, string>, value: V): void {
				/* istanbul ignore if */
				if (!__this.___hierarchyClass.parent && !__this.___hierarchyClass.isRoot) {
					console.warn(`Failed to propagate global property "${key}" since this element has no registered parent`);
					return;
				}
				__this.___hierarchyClass.propagateThroughTree((element) => {
					element.___hierarchyClass.setGlobalProperty<G>(key, value);
				});
			}
		};
		return (this.___hierarchyClass.globalPropsFns = fns);
	}

	/**
	 * Gets the root node of the global hierarchy
	 * 
	 * @template T - The type of the root
	 * 
	 * @returns {T} The root
	 */
	public getRoot<T>(): T {
		if (this.___hierarchyClass.isRoot) {
			return <T><any>this;
		}
		return this.___hierarchyClass.parent!.getRoot();
	}

	/**
	 * Runs a function for every component in this
	 * global hierarchy
	 * 
	 * @template R - The return type of given function
	 * 
	 * @param {(element: ConfigurableWebComponent<any>) => R} fn - The
	 * 	function that is ran on every component
	 * 
	 * @returns {R[]} All return values in an array
	 */
	public runGlobalFunction<R>(fn: (element: ConfigurableWebComponent<any>) => R): R[] {
		return this.___hierarchyClass.propagateThroughTree(fn);
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
	public listenGP<GP extends {
		[key: string]: any;
	}>(event: 'globalPropChange', 
		listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void,
		once?: boolean): void;
	public listenGP<GP extends {
		[key: string]: any;
	}, K extends keyof GP>(event: 'globalPropChange', 
		listener: (prop: K, newValue: GP[K], oldValue: GP[K]) => void,
		once?: boolean): void;
	public listenGP<GP extends {
		[key: string]: any;
	}>(event: 'globalPropChange', 
		listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void,
		once: boolean = false) {
			this.___listenableClass.listen(event, listener, once);
	}
}
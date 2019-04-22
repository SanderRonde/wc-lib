import { EventListenerObj, WebComponentListenable } from "./listener";
import { ConfigurableWebComponent } from './configurable';
import { bindToClass } from './base';

type GlobalPropsFunctions<G extends {
	[key: string]: any;
}> = {
	all: G;
	get<K extends keyof G>(key: Extract<K, string>): G[K];
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
		if (!this.isRoot) {
			return {};
		}

		const props: Partial<G> = {};
		for (let i = 0; i < this._self.attributes.length; i++) {
			const attr = this._self.attributes[i];
			if (attr.name.startsWith('prop_')) {
				props[attr.name.slice('prop_'.length)] = 
					decodeURIComponent(
						attr.value as string);
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

		if (!element) {
			return null;
		}
		if (<any>element === document) {
			return this._self;
		}
		const host = element instanceof WebComponentHierarchyManager ?
			element : (<ShadowRoot><any>element).host;

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

		if (!element) {
			//Ignore this
			return null;
		}
		if (<any>element === document) {
			//This is in the light DOM, ignore it since it's the root
			return this._self;
		}
		const host = element instanceof WebComponentHierarchyManager ?
			element : (<ShadowRoot><any>element).host;

		if (!(host instanceof WebComponentHierarchyManager)) {
			return null;
		}
		return host;
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
				this._self.___definerClass.internals.globalProperties[key] = value;
				this._self.fire('globalPropChange', key, value);
			}
		}

	public propagateThroughTree<R>(fn: (element: WebComponentHierarchyManager<any>) => R): R[] {
		if (this.isRoot) {
			const results: R[] = [];
			this.__propagateDown(fn, results);
			return results;
		} else if (this.parent) {
			return this.parent.___hierarchyClass.propagateThroughTree(fn);
		}
		return [];
	}

	private __propagateDown<R>(fn: (element: WebComponentHierarchyManager<any>) => R, results: R[]) {
		results.push(fn(this._self));

		for (const child of this.children) {
			child.___hierarchyClass.__propagateDown(fn, results);
		}
	}

	public globalPropsFns: GlobalPropsFunctions<any>|null = null;
}

export abstract class WebComponentHierarchyManager<E extends EventListenerObj> extends WebComponentListenable<E> {
	public ___hierarchyClass: HierarchyClass = new HierarchyClass(this);

	connectedCallback() {
		this.___hierarchyClass.isRoot = this.hasAttribute('_root');
		this.___definerClass.internals.globalProperties = {...{
			theme: 'light',
			isWeb: (location.protocol === 'http:' || location.protocol === 'https:') ?
				'true' : 'false'
		}, ...this.___hierarchyClass.getGlobalProperties()};
		this.___hierarchyClass.registerToParent();
	}

	public registerChild<G extends {
		[key: string]: any;
	}>(element: WebComponentHierarchyManager<any>): G {
		this.___hierarchyClass.clearNonExistentChildren();
		this.___hierarchyClass.children.add(element);
		return this.___definerClass.internals.globalProperties as G;
	}

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
				if (!__this.___definerClass.internals.globalProperties) {
					return undefined as any;
				}
				return __this.___definerClass.internals.globalProperties[key] as any;
			},
			set<K extends keyof G, V extends G[K]>(key: Extract<K, string>, value: V): void {
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

	public getRoot<T>(): T {
		if (this.___hierarchyClass.isRoot) {
			return <T><any>this;
		}
		return this.___hierarchyClass.parent!.getRoot();
	}

	public runGlobalFunction<R>(fn: (element: ConfigurableWebComponent<any>) => R): R[] {
		return this.___hierarchyClass.propagateThroughTree(fn);
	}

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
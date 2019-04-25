import { WebComponentCustomCSSManager } from './custom-css-manager.js';
import { removeAllElementListeners } from './listeners.js';
import { CHANGE_TYPE, bindToClass } from './base.js';
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

type PropChangeEvents = 'beforePropChange'|'propChange';

class Style<C> {
	private _id?: string;
	private _className?: string;
	private _tag?: string;

	constructor({
		className, id, tag
	}: {
		id?: string;
		className?: string;
		tag?: string;
	}, private _link?: {
		type: 'and'|'or';
		style: Style<any>;
	}) {
		this._id = id;
		this._tag = tag;
		this._className = className;
	}

	private _connectLinks(dataType: 'id'|'class'|'tag'): string {
		if (!this._link) {
			return '';
		}
		if (this._link.type === 'and') {
			return this._link.style.getDataType(dataType);
		} else if (this._link.type === 'or') {
			return `, ${this._link.style.getDataType(dataType)}`;
		}
		return '';
	}

	public getDataType(dataType: 'id'|'class'|'tag'): string {
		switch (dataType) {
			case 'id':
				return this.id;
			case 'class':
				return this.className;
			case 'tag':
				return this.tag;
		}
	}

	public get id(): string {
		return `#${this._id || 'undef'}${this._connectLinks('id')}`;
	}

	public get className(): string {
		return `.${this._className || 'undef'}${this._connectLinks('class')}`;
	}

	public get tag(): string {
		return `${this._tag || 'undef'}${this._connectLinks('tag')}`;
	}

	private _clone() {
		return {
			id: this._id,
			className: this._className,
			tag: this._tag
		}
	}

	public or(style: Style<any>) {
		return new Style<C>(this._clone(), {
			type: 'or',
			style
		});
	}

	public and(style: Style<any>) {
		return new Style<C>(this._clone(), {
			type: 'and',
			style
		});
	}

	public withClass(className: string) {
		return new Style<C>(this._clone(), {
			type: 'and',
			style: new Style<any>({
				className: className
			})
		});
	}

	public MARKER = '';
}

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
}

export abstract class WebComponent<ELS extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
} = {
	IDS: {};
	CLASSES: {}
}, E extends EventListenerObj = {}> extends WebComponentCustomCSSManager<E> {
	private ___componentClass: ComponentClass<ELS> = new ComponentClass<ELS>();

	protected disposables: (() => void)[] = [];
	public isMounted: boolean = false;

	constructor() {
		super();
		this.___definerClass.internals.postRenderHooks.push(
			this.___componentClass.clearMap);
	}

	/**
	 * Access this component's children based on their IDs or query something
	 */
	$: IDMapFn<ELS["IDS"]> = (() => {
		const __this = this;
		return new Proxy((selector: string) => {
			return this.root.querySelector(selector) as HTMLElement;
		}, {
			get(_, id) {
				if (typeof id !== 'string') {
					return null;
				}
				const cached = __this.___componentClass.idMap.get(id);
				if (cached && __this.shadowRoot!.contains(cached)) {
					return cached;
				}
				const el = __this.root.getElementById(id);
				if (el) {
					__this.___componentClass.idMap.set(id, el as ELS["IDS"][keyof ELS["IDS"]]);
				}
				return el;
			}
		});
	})() as IDMapFn<ELS["IDS"]>;

	/**
	 * Generate styles for this component in a type-safe manner
	 */
	styles: {
		id: {
			[P in keyof ELS["IDS"]]: Style<ELS["IDS"][P]>;
		}
		class: {
			[P in keyof ELS["CLASSES"]]: Style<ELS["CLASSES"][P]>;
		}
		tag: {
			[key: string]: Style<any>;
		}
	} = {
		id: new Proxy({}, {
			get(_, id) {
				return new Style({
					id: id as string
				});
			}
		}),
		class: new Proxy({}, {
			get(_, className) {
				return new Style({
					className: className as string
				});
			}
		}),
		tag: new Proxy({}, {
			get(_, tag) {
				return new Style({
					tag: tag as string
				});
			}
		})
	} as {
		id: {
			[P in keyof ELS["IDS"]]: Style<ELS["IDS"][P]>;
		}
		class: {
			[P in keyof ELS["CLASSES"]]: Style<ELS["CLASSES"][P]>;
		}
		tag: {
			[key: string]: Style<any>;
		}
	};

	/**
	 * Apply querySelectorAll to this component's root
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
		this.renderToDOM(CHANGE_TYPE.ALWAYS);
		this.layoutMounted();

		this.___definerClass.internals.connectedHooks.filter(fn => fn());
	}

	/**
	 * Called when the component is unmounted from the dom
	 */
	disconnectedCallback() {
		removeAllElementListeners(this as any);
		this.disposables.forEach(disposable => disposable());
		this.disposables = [];
		this.isMounted = false;
	}

	/**
	 * Called when the component is mounted to the dom for the first time.
	 * 	This will be part of the "constructor" and will slow down the initial render
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
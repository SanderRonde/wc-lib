import { WebComponentDefinerMixin, WebComponentDefinerMixinInstance } from './definer.js';
import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { TemplateFnLike, CHANGE_TYPE } from '../wclib.js';

/**
 * The property name for custom-css
 * 
 * @constant
 */
export const CUSTOM_CSS_PROP_NAME = 'custom-css';

interface CSSStyleSheet {
	insertRule(rule: string, index?: number): number;
	deleteRule(index: number): void;
	replace(text: string): Promise<CSSStyleSheet>;
	replaceSync(text: string): void;
}

export interface ExtendedShadowRoot extends ShadowRoot {
	adoptedStyleSheets: CSSStyleSheet[];
}

function repeat(size: number) {
	return new Array(size).fill(0);
}

function makeArray<T>(value: T|T[]): T[] {
	if (Array.isArray(value)) {
		return value;
	}
	return [value];
}

/**
 * Binds a function to the class, making sure the `this`
 * value always points to the class, even if its container
 * object is changed
 * 
 * **Note:** This is a decorator
 * 
 * @param {object} _target - The class to bind this to
 * @param {string} propertyKey - The name of this method
 * @param {TypedPropertyDescriptor<T>} descriptor - The
 * 	property descriptor
 * 
 * @returns {TypedPropertyDescriptor<T>|void} The new
 * 	property
 */
export function bindToClass<T extends Function>(_target: object, propertyKey: string, 
	descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void {
		if(!descriptor || (typeof descriptor.value !== 'function')) {
			throw new TypeError(`Only methods can be decorated with @bind. <${propertyKey}> is not a method!`);
		}
		
		return {
			configurable: true,
			get(this: T): T {
				const bound: T = descriptor.value!.bind(this);
				Object.defineProperty(this, propertyKey, {
					value: bound,
					configurable: true,
					writable: true
				});
				return bound;
			}
		};
	}

class BaseClassElementInstance {
	public ___cssArr: TemplateFnLike<CHANGE_TYPE>[]|null = null;
	public ___privateCSS: TemplateFnLike<CHANGE_TYPE>[]|null = null;
	public __cssSheets: {
		sheet: CSSStyleSheet;
		template: TemplateFnLike<CHANGE_TYPE>;
	}[]|null = null;
}

const baseClassInstances: Map<string, BaseClassElementInstance> = new Map();

class BaseClass {
	/**
	 * Whether the render method should be temporarily disabled (to prevent infinite loops)
	 */
	public disableRender: boolean = false;

	/**
	 * Whether this is the first render
	 */
	private __firstRender: boolean = true;

	public get instance() {
		if (baseClassInstances.has(this._self.self.is)) {
			return baseClassInstances.get(this._self.self.is)!;
		}
		const classInstance = new BaseClassElementInstance();
		baseClassInstances.set(this._self.self.is, classInstance);
		return classInstance;
	}
	
	private get __cssArr(): TemplateFnLike<CHANGE_TYPE>[] {
		if (this.instance.___cssArr !== null) return this.instance.___cssArr;
		return (this.instance.___cssArr = 
			makeArray(this._self.self.css || []));
	};
	public get __privateCSS(): TemplateFnLike<CHANGE_TYPE>[] {
		if (this.instance.___privateCSS !== null) return this.instance.___privateCSS;
		return (this.instance.___privateCSS = 
			/* istanbul ignore next */
			this.canUseConstructedCSS ? this.__cssArr.filter((template) => {
				return !(template.changeOn === CHANGE_TYPE.THEME ||
					template.changeOn & CHANGE_TYPE.NEVER);
			}) : this.__cssArr);
	};

	constructor(private _self: WebComponentBaseMixinInstance) { }

	public doPreRenderLifecycle() {
		this.disableRender = true;
		const retVal = this._self.preRender();
		this.disableRender = false;
		return retVal;
	}

	public doPostRenderLifecycle() {
		this._self.___definerClass.internals.postRenderHooks.forEach(fn => fn());
		if (this.__firstRender) {
			this.__firstRender = false;
			this._self.firstRender();
		}
		this._self.postRender();
	}

	private ___renderContainers: {
		css: HTMLElement[];
		html: HTMLElement;
		customCSS: HTMLElement[];
	}|null = null;
	private __createFixtures() {
		//Attribute is just for clarity when looking through devtools
		const css = (() => {
			return this.__cssArr.map(() => {
				const el = document.createElement('span');
				el.setAttribute('data-type', 'css');
				return el;
			});
		})();
		
		const customCSS = (() => {
			if (this._self.__hasCustomCSS()) {
				return repeat(
					makeArray(this._self.customCSS()).length).map(() => {
						const el = document.createElement('span');
						el.setAttribute('data-type', 'custom-css');
						return el;
					});
			} else {
				return [];
			}
		})();
		const html = document.createElement('span');
		html.setAttribute('data-type', 'html');
		
		css.forEach(n => this._self.root.appendChild(n));
		customCSS.forEach(n => this._self.root.appendChild(n));
		this._self.root.appendChild(html);

		return {
			css,
			customCSS,
			html
		}
	}
	public get renderContainers() {
		if (this.___renderContainers) {
			return this.___renderContainers;
		}
		return (this.___renderContainers = this.__createFixtures());
	}

	/* istanbul ignore next */
	private __genConstructedCSS() {
		// Create them
		this.instance.__cssSheets = this.instance.__cssSheets || this.__cssArr
			.filter((template) => {
				return template.changeOn === CHANGE_TYPE.THEME ||
					template.changeOn & CHANGE_TYPE.NEVER;
			}).map(t => ({
				sheet: new CSSStyleSheet() as unknown as CSSStyleSheet,
				template: t
			}));
	}

	private __sheetsMounted: boolean = false;
	/* istanbul ignore next */
	public renderConstructedCSS(change: CHANGE_TYPE) {
		if (!this.__sheetsMounted) {
			this.__genConstructedCSS();

			// Mount them
			this._self.root.adoptedStyleSheets = 
				this.instance.__cssSheets!.map(s => s.sheet);
			this.__sheetsMounted = true;

			// Force new render
			change = CHANGE_TYPE.ALWAYS;
		}

		if (!(change & CHANGE_TYPE.THEME)) {
			// Only render on theme or everything change
			return;
		}

		// Check if it should render at all
		if (!this._self.self.__constructedCSSChanged(this._self)) {
			return
		}

		this.instance.__cssSheets!.forEach(({ sheet, template }) => {
			const rendered = template.renderAsText(change, this._self).replace(
				/<\/?style>/g, '');
			sheet.replaceSync(rendered);
		});
	}

	private ___canUseConstructedCSS: boolean|null = null;
	public get canUseConstructedCSS() {
		if (this.___canUseConstructedCSS !== null) {
			return this.___canUseConstructedCSS;
		}
		return (this.___canUseConstructedCSS = (() => {
			try { 
				new CSSStyleSheet(); 
				/* istanbul ignore next */
				return true; 
			} catch(e) { 
				return false;
			}
		})());
	}

	public getRenderFn(template: TemplateFnLike<CHANGE_TYPE>, change: CHANGE_TYPE) {
		if (change === CHANGE_TYPE.FORCE) {
			return template.render.bind(template);	
		} else {
			return template.renderIfNew.bind(template);
		}
	}

	public static __constructedCSSRendered: boolean = false;
}

export type WebComponentBaseMixinInstance = InferInstance<WebComponentBaseMixinClass> & {
	self: WebComponentBaseMixinClass;
};
export type WebComponentBaseMixinClass = InferReturn<typeof WebComponentBaseMixin>;

export type WebComponentBaseMixinSuper = Constructor<
		Pick<WebComponentDefinerMixinInstance, '___definerClass'> & HTMLElement
	> & Pick<InferReturn<typeof WebComponentDefinerMixin>, 'define'|'is'>;

/**
 * A mixin that will add the ability to do
 * basic rendering of a component
 */
export const WebComponentBaseMixin = <P extends WebComponentBaseMixinSuper>(superFn: P) => {
	const privateMap: WeakMap<WebComponentBase, BaseClass> = new WeakMap();
	function baseClass(self: WebComponentBase) {
		if (privateMap.has(self)) return privateMap.get(self)!;
		return privateMap.set(self, new BaseClass(self as any)).get(self)!;
	}

	/**
	 * The class that handles basic rendering of a component
	 */
	class WebComponentBase extends superFn {
		/**
		 * The render method that will render this component's HTML
		 * 
		 * @readonly
		 */
		public static html: TemplateFnLike<CHANGE_TYPE>|null;

		/**
		 * The element's constructor
		 * 
		 * @readonly
		 */
		/* istanbul ignore next */
		public get self(): (typeof WebComponentBase) {
			return null as any;
		}

		/**
		 * The template(s) that will render this component's css
		 * 
		 * @readonly
		 */
		public static css: TemplateFnLike<CHANGE_TYPE>|TemplateFnLike<CHANGE_TYPE>[]|null;

		/**
		 * A function signaling whether this component has custom CSS applied to it
		 * 
		 * @returns {boolean} Whether this component uses custom CSS
		 */
		/* istanbul ignore next */
		public __hasCustomCSS(): boolean {
			return false;
		}

		/**
		 * Gets this component's custom CSS templates
		 * 
		 * @returns {TemplateFnLike<CHANGE_TYPE>|TemplateFnLike<CHANGE_TYPE>[]} The
		 * 	custom CSS templates
		 */
		/* istanbul ignore next */
		public customCSS(): TemplateFnLike<CHANGE_TYPE>|TemplateFnLike<CHANGE_TYPE>[] {
			return [];
		}

		/**
		 * Checks whether the constructed CSS should be changed. This function can be
		 * overridden to allow for a custom checker. Since constructed CSS
		 * is shared with all other instances of this specific component,
		 * this should only return true if the CSS for all of these components
		 * has changed. For example it might change when the theme has changed
		 * 
		 * @param {WebComponentBase} _element - The element for which to
		 * 	check it
		 * 
		 * @returns {boolean} Whether the constructed CSS has changed
		 */
		/* istanbul ignore next */
		public static __constructedCSSChanged(_element: WebComponentBase): boolean {
			// Assume nothing can be changed then, only do first render
			if (BaseClass.__constructedCSSRendered) {
				return false;
			}
			BaseClass.__constructedCSSRendered = true;
			return true;
		}

		/**
		 * The root of this component's DOM
		 * 
		 * @readonly
		 */
		public readonly root = this.attachShadow({
			mode: 'open'
		}) as ExtendedShadowRoot;
		
		/**
		 * The properties of this component
		 * 
		 * @readonly
		 */
		props: any = {};

		/**
		 * The method that starts the rendering cycle
		 * 
		 * @param {CHANGE_TYPE} [change] The change type. This
		 * 	is set to always render if not supplied
		 */
		@bindToClass
		public renderToDOM(change: CHANGE_TYPE = CHANGE_TYPE.FORCE) {
			if (baseClass(this).disableRender) return;
			if (baseClass(this).doPreRenderLifecycle() === false) {
				return;
			}

			/* istanbul ignore if */
			if (baseClass(this).canUseConstructedCSS) {
				baseClass(this).renderConstructedCSS(change);
			}
			baseClass(this).__privateCSS.forEach((sheet, index) => {
				baseClass(this).getRenderFn(sheet, change)(
					sheet.renderTemplate(change, this as any), 
					baseClass(this).renderContainers.css[index]);	
			});
			if (this.__hasCustomCSS()) {
				makeArray(this.customCSS()).forEach((sheet, index) => {
					baseClass(this).getRenderFn(sheet, change)(
						sheet.renderTemplate(change, this as any),
						baseClass(this).renderContainers.customCSS[index]);
				});
			}
			/* istanbul ignore next */
			if (this.self.html) {
				baseClass(this).getRenderFn(this.self.html, change)(
					this.self.html.renderTemplate(change, this as any), 
					baseClass(this).renderContainers.html);
			}
			baseClass(this).doPostRenderLifecycle();
		}

		/**
		 * A method called before rendering (changing props won't trigger additional re-render)
		 * If false is returned, cancels the render
		 * 
		 * @returns {false|any} The return value, if false, cancels the render
		 */
		public preRender(): false|any {}

		/**
		 * A method called after rendering
		 */
		public postRender(): any {}

		/**
		 * A method called after the very first render
		 */
		public firstRender(): any {}

		/**
		 * A method called when the component is mounted
		 * to the DOM. Be sure to always call
		 * `super.connectedCallback` if you 
		 * override this
		 */
		public connectedCallback() {}
	}
	return WebComponentBase;
}
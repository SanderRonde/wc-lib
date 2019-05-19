import { WebComponentThemeManger } from './theme-manager.js';
import { ConfiguredComponent } from './configurable.js';
import { WebComponentDefiner } from './definer.js';
import { WebComponent } from './component.js';

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

/**
 * The type of change that should re-render
 * a template. Can be combined to cover
 * multiple change types. For example
 * `CHANGE_TYPE.PROP | CHANGE_TYPE.THEME`
 * will re-render on both changes
 */
export const enum CHANGE_TYPE {
	/**
	 * A property change
	 */
	PROP = 1, 
	/**
	 * A theme change
	 */
	THEME = 2, 
	/**
	 * Never re-render. This allows
	 * for optimizing out the 
	 * rendering of this template
	 */
	NEVER = 4,
	/**
	 * Language changes
	 */
	LANG = 8, 
	/**
	 * Any change
	 */
	ALWAYS = 11
}

/**
 * The templater function that turns a template
 * string into a value that, when passed to the
 * renderer, renders the template to the page
 */
export type Templater<R> = (strings: TemplateStringsArray, ...values: any[]) => R;

/**
 * A template render function that gets called on
 * specified change
 * 
 * @template C - The base component
 * @template T - The theme object
 * @template TR - The value that is returned
 * 	by this render function that, when passed
 * 	to the renderer, renders the template to 
 *  the page
 */
export type TemplateRenderFunction<C extends {
	props: any;
}, T, TR> = (
	/**
	 * The base component
	 */
	this: C, 
	/**
	 * A templating function that takes a JS
	 * template literal and returns an intermediate
	 * value that, when passed to the renderer,
	 * can be rendered to the DOM. If the
	 * complex template provider has been
	 * initiated by calling
	 * `WebComponentTemplateManager.initComplexTemplateProvider(config)`,
	 * this allows for a few shortcuts in the template.
	 * 
	 * 
	 * **Examples**:
	 * 
	 * 
	 * * `<my-element .prop="x">` Will set the property `prop`
	 * 	directly instead of setting the attribute
	 * * `<div @click="${this.someFunc}">` Will call
	 * 	`this.someFunc` when the `click` event is fired
	 * * `<my-element @@customevent="${this.someFunc}">` will call
	 * 	`this.someFunc` when the `my-element's` component's
	 * 	special `customevent` event is fired
	 * * `<my-element ?prop="${someValue}">` only sets `prop`
	 * 	if `someValue` is truthy. If it's not, the attribute
	 * 	is not set at all
	 * * `<my-element class="${{a: true, b: false}}">` sets 
	 * 	the class property to 'a'. Any value that can be passed
	 * 	to `lib/util/shared#classNames` can be passed to this
	 * 	property and it will produce the same result
	 * * `<my-element #prop="${this}">` will create a reference
	 * 	to the value of `this` and retrieve it whenever 
	 * 	`my-element.prop` is accessed. This basically means
	 * 	that the value of `my-element.prop` is equal to `this`,
	 * 	making sure non-string values can also be passed to
	 * 	properties
	 * * `<my-element custom-css="${someCSS}">` applies the
	 * 	`someCSS` template to this element, allowing you to
	 * 	change the CSS of individual instances of an element,
	 * 	while still using the element itself's shared CSS
	 */
	complexHTML: Templater<TR>,
	/**
	 * The component's properties
	 */
	props: C['props'], 
	/**
	 * The component's current theme
	 */
	theme: T,
	/**
	 * The current change
	 */
	changeType: CHANGE_TYPE) => TR;

/**
 * Maps templaters -> components -> functions -> results
 */
const templaterMap: WeakMap<Templater<any>, 
	WeakMap<{
		props: any;
	}, WeakMap<TemplateFn<any, any, any>, 
		//Any = R in TemplateFn
		any|null>>> = new WeakMap();

/**
 * The renderer function that renders a template given 
 * that template and the target container
 */
export type Renderer<T> = (template: T, container: HTMLElement|Element|Node) => any;

/**
 * A template class that renders given template
 * when given change occurs using given renderer
 * 
 * @template C - The base component
 * @template T - The theme object
 * @template R - The return value of the template function
 */
export class TemplateFn<C extends {
	props: any;
} = WebComponent<any, any>, T = void, R = any> {
		private _lastRenderChanged: boolean = true;

		/**
		 * Creates a template class that renders given template
		 * when given change occurs using given renderer
		 * 
		 * @param {TemplateRenderFunction<C, T, R>)|null} _template - The
		 * 	template function that gets called on change
		 * @param {CHANGE_TYPE} changeOn - The type of change that should re-render
		 * 	a template. Can be combined to cover multiple change types. For example
		 * 	`CHANGE_TYPE.PROP | CHANGE_TYPE.THEME` will re-render on both changes
		 * @param {Renderer<R>} renderer - The renderer that gets called with
		 * 	the value returned by the template as the first argument and
		 * 	with the container element as the second element and is
		 * 	tasked with rendering it to the DOM
		 */
		constructor(_template: (TemplateRenderFunction<C, T, R>)|null,
			changeOn: CHANGE_TYPE.NEVER, renderer: Renderer<R>);
		constructor(_template: (TemplateRenderFunction<C, T, R>),
			changeOn: CHANGE_TYPE.ALWAYS|CHANGE_TYPE.PROP|CHANGE_TYPE.THEME, 
			renderer: Renderer<R>);
		constructor(private _template: (TemplateRenderFunction<C, T, R>)|null,
			public changeOn: CHANGE_TYPE, 
			private _renderer: Renderer<R>) { }

		private _renderWithTemplater<TR>(changeType: CHANGE_TYPE, component: C,
			templater: Templater<TR>): {
				changed: boolean;
				rendered: TR
			 } {
				if (!templaterMap.has(templater)) {
					templaterMap.set(templater, new WeakMap());
				}
				const componentTemplateMap = templaterMap.get(templater)!;
				if (!componentTemplateMap.has(component)) {
					componentTemplateMap.set(component, new WeakMap());
				}
				const templateMap = componentTemplateMap.get(component)!;
				if (this.changeOn & CHANGE_TYPE.NEVER) {
					//Never change, return the only render
					const cached = templateMap.get(this);
					if (cached) {
						return {
							changed: false,
							rendered: cached
						}
					}
					const rendered = this._template === null ?
						templater`` : (this._template as TemplateRenderFunction<C, T, R|TR>).call(
								component, templater, component.props, 
								'getTheme' in component ? 
									(component as unknown as WebComponentThemeManger<any>)
										.getTheme<T>() : null as any, changeType);
					templateMap.set(this, rendered);
					return {
						changed: true,
						rendered: rendered as TR
					}
				}
				if (this.changeOn & changeType ||
					!templateMap.has(this)) {
						//Change, rerender
						const rendered = (this._template as TemplateRenderFunction<C, T, R|TR>).call(
							component, templater, component.props, 
							'getTheme' in component ? 
								(component as unknown as WebComponentThemeManger<any>)
									.getTheme<T>() : null as any, changeType);
						templateMap.set(this, rendered);
						return {
							changed: true,
							rendered: rendered as TR
						}
					}
				
				//No change, return what was last rendered
				return {
					changed: false,
					rendered: templateMap.get(this)!
				};
			}

		private static _textRenderer(strings: TemplateStringsArray, ...values: any[]): string {
			const result: string[] = [strings[0]];
			for (let i = 0; i < values.length; i++) {
				result.push(values[i], strings[i + 1]);
			}
			return result.join('');
		}

		/**
		 * Renders this template to text and returns the text
		 * 
		 * @param {CHANGE_TYPE} changeType - The type of change that occurred
		 * @param {C} component - The base component
		 * 
		 * @returns {string} The rendered template as text
		 */
		public renderAsText(changeType: CHANGE_TYPE, component: C): string {
			const { changed, rendered } = this._renderWithTemplater(changeType, component,
				TemplateFn._textRenderer);
			this._lastRenderChanged = changed;
			return rendered;
		}

		/**
		 * Renders this template to an intermediate value that
		 * 	can then be passed to the renderer
		 * 
		 * @param {CHANGE_TYPE} changeType - The type of change that occurred
		 * @param {C} component - The base component
		 * 
		 * @returns {R} The intermediate value that
		 * 	can be passed to the renderer
		 */
		public renderTemplate(changeType: CHANGE_TYPE, component: C): R {
			const { changed, rendered } = this._renderWithTemplater(changeType, component,
				(component as unknown as WebComponent<any, any>).generateHTMLTemplate as unknown as Templater<R>);
			this._lastRenderChanged = changed;
			return rendered;
		}

		/**
		 * Renders this template the same way as some other
		 * template. This can be handy when integrating templates
		 * into other templates in order to inherit CSS or HTML
		 * 
		 * @template TR - The return value. This depends on the
		 * 	return value of the passed templater
		 * @param {CHANGE_TYPE} changeType - The type of change that occurred
		 * @param {C} component - The base component
		 * @param {templater<TR>} templater - The templater (
		 * 	generally of the parent)
		 * 
		 * @returns {TR} The return value of the templater
		 */
		public renderSame<TR>(changeType: CHANGE_TYPE, component: C,
			templater: Templater<TR>): TR {
				const { changed, rendered } = this._renderWithTemplater(changeType, component,
					templater);
				this._lastRenderChanged = changed;
				return rendered;
			}

		/**
		 * Renders a template to given HTML element
		 * 
		 * @param {R} template - The template to render in its
		 * 	intermediate form
		 * @param {HTMLElement} target - The element to render
		 * 	it to
		 */
		public render(template: R, target: HTMLElement) {
			this._renderer(template, target);
		}

		/**
		 * Renders this template to DOM if it has changed as of
		 * the last call to the template function
		 * 
		 * @param {R} template - The template to render in its
		 * 	intermediate form
		 * @param {HTMLElement} target - The element to render
		 * 	it to
		 */
		public renderIfNew(template: R, target: HTMLElement) {
			if (!this._lastRenderChanged) return;
			this._renderer(template, target);
		}
	}

class BaseClassElementInstance {
	public ___cssArr: TemplateFn<any, any, any>[]|null = null;
	public ___privateCSS: TemplateFn<any, any, any>[]|null = null;
	public __cssSheets: {
		sheet: CSSStyleSheet;
		template: TemplateFn<any, any, any>;
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
		if (baseClassInstances.has(this._self.self.config.is)) {
			return baseClassInstances.get(this._self.self.config.is)!;
		}
		const classInstance = new BaseClassElementInstance();
		baseClassInstances.set(this._self.self.config.is, classInstance);
		return classInstance;
	}
	
	private get __cssArr(): TemplateFn<any, any, any>[] {
		if (this.instance.___cssArr !== null) return this.instance.___cssArr;
		return (this.instance.___cssArr = 
			makeArray(this._self.self.config.css));
	};
	public get __privateCSS(): TemplateFn<any, any, any>[] {
		if (this.instance.___privateCSS !== null) return this.instance.___privateCSS;
		return (this.instance.___privateCSS = 
			this.canUseConstructedCSS ? this.__cssArr.filter((template) => {
				return !(template.changeOn === CHANGE_TYPE.THEME ||
					template.changeOn & CHANGE_TYPE.NEVER);
			}) : this.__cssArr);
	};

	constructor(private _self: WebComponentBase) { }

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

	private __genConstructedCSS() {
		// Create them
		this.instance.__cssSheets = this.instance.__cssSheets || this.__cssArr
			.filter((template) => {
				return template.changeOn === CHANGE_TYPE.THEME ||
					template.changeOn & CHANGE_TYPE.NEVER;
			}).map(t => ({
				sheet: new CSSStyleSheet(),
				template: t
			}));
	}

	private __sheetsMounted: boolean = false;
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
			sheet.replaceSync(template.renderAsText(change, this._self).replace(
				/<\/?style>/g, ''));
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
				return true; 
			} catch(e) { 
				return false;
			}
		})());
	}
}

/**
 * The class that handles basic rendering of a component
 */
export abstract class WebComponentBase extends WebComponentDefiner {
	/**
	 * The class associated with this one that
	 * contains some functions required for 
	 * it to function
	 * 
	 * @private
	 * @readonly
	 */
	private ___baseClass: BaseClass = new BaseClass(this);

	/**
	 * The render method that will render this component's HTML
	 * 
	 * @readonly
	 */
	public abstract readonly html: TemplateFn<any, any, any>;

	/**
	 * The element's constructor
	 * 
	 * @readonly
	 */
	public abstract get self(): typeof ConfiguredComponent;

	/**
	 * The template(s) that will render this component's css
	 * 
	 * @readonly
	 */
	public abstract readonly css: TemplateFn<any, any, any>|TemplateFn<any, any, any>[];

	/**
	 * A function signaling whether this component has custom CSS applied to it
	 * 
	 * @returns {boolean} Whether this component uses custom CSS
	 */
	public __hasCustomCSS(): boolean {
		return false;
	}

	/**
	 * Gets this component's custom CSS templates
	 * 
	 * @returns {TemplateFn<any, any, any>|TemplateFn<any, any, any>[]} The
	 * 	custom CSS templates
	 */
	public customCSS(): TemplateFn<any, any, any>|TemplateFn<any, any, any>[] {
		return [];
	}

	/**
	 * Whether the constructed CSS has been
	 * rendered
	 * 
	 * @private
	 * @readonly
	 */
	private static __constructedCSSRendered: boolean = false;

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
	public static __constructedCSSChanged(_element: WebComponentBase): boolean {
		// Assume nothing can be changed then, only do first render
		if (this.__constructedCSSRendered) {
			return false;
		}
		this.__constructedCSSRendered = true;
		return true;
	}

	/**
	 * The root of this component's DOM
	 * 
	 * @readonly
	 */
	public readonly root = this.attachShadow({
		mode: 'open'
	});
	
	/**
	 * The properties of this component
	 * 
	 * @readonly
	 */
	props: any = {};

	@bindToClass
	/**
	 * The method that starts the rendering cycle
	 * 
	 * @param {CHANGE_TYPE} [change] The change type. This
	 * 	is set to always render if not supplied
	 */
	public renderToDOM(change: CHANGE_TYPE = CHANGE_TYPE.ALWAYS) {
		if (this.___baseClass.disableRender) return;
		if (this.___baseClass.doPreRenderLifecycle() === false) {
			return;
		}

		if (this.___baseClass.canUseConstructedCSS) {
			this.___baseClass.renderConstructedCSS(change);
		}
		this.___baseClass.__privateCSS.forEach((sheet, index) => {
			sheet.renderIfNew(
				sheet.renderTemplate(change, this as any), 
				this.___baseClass.renderContainers.css[index]);
		});
		if (this.__hasCustomCSS()) {
			makeArray(this.customCSS()).forEach((sheet, index) => {
				sheet.renderIfNew(
					sheet.renderTemplate(change, this as any),
					this.___baseClass.renderContainers.customCSS[index]);
			});
		}
		this.html.renderIfNew(
			this.html.renderTemplate(change, this as any), 
			this.___baseClass.renderContainers.html);
		this.___baseClass.doPostRenderLifecycle();
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
	public postRender() {}
	/**
	 * A method called after the very first render
	 */
	public firstRender() {}
}
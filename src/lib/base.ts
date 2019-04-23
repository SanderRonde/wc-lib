import { WebComponentThemeManger } from './theme-manager';
import { ConfiguredComponent } from './configurable';
import { WebComponentDefiner } from './definer';
import { WebComponent } from './component';

function repeat(size: number) {
	return new Array(size).fill(0);
}

function makeArray<T>(value: T|T[]): T[] {
	if (Array.isArray(value)) {
		return value;
	}
	return [value];
}

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

type InferThis<T extends (this: any, ...args: any[]) => any> = 
	T extends (this: infer D, ...args: any[]) => any ? D : void;
type InferArgs<T extends (this: any, ...args: any[]) => any> = 
	T extends (this: any, ...args: infer R) => any ? R : void[];
type InferReturn<T extends (this: any, ...args: any[]) => any> = 
T extends (this: any, ...args: any[]) => infer R ? R : void;
function typeSafeCall<T extends (this: any, ...args: any[]) => any>(fn: T, 
	thisCtx: InferThis<T>, ...args: InferArgs<T>): InferReturn<T> {
		return fn.call(thisCtx, ...args);
	}

export const enum CHANGE_TYPE {
	PROP = 1, 
	THEME = 2, 
	NEVER = 4,
	LANG = 8, 
	ALWAYS = 16
}

type Templater<R> = (strings: TemplateStringsArray, ...values: any[]) => R;

type TemplateRenderFunction<C extends {
	props: any;
}, T, TR> = (this: C, 
	complexHTML: Templater<TR>,
	props: C['props'], theme: T) => TR;

/**
 * Maps templaters -> components -> functions -> results
 */
const templaterMap: WeakMap<Templater<any>, 
	WeakMap<{
		props: any;
	}, WeakMap<TemplateFn<any, any, any>, 
		//Any = R in TemplateFn
		any|null>>> = new WeakMap();
export type TemplateFnConfig<R> = {
	changeOn: CHANGE_TYPE.NEVER;
	template: R|null;
}|{
	changeOn: CHANGE_TYPE.ALWAYS|CHANGE_TYPE.THEME|CHANGE_TYPE.PROP;
	template: TemplateRenderFunction<any, any, R>
};
type Renderer<T> = (template: T, container: HTMLElement|Element|Node) => any;
export class TemplateFn<C extends {
	props: any;
} = WebComponent<any, any>, T = void, R = any> {
		private _lastRenderChanged: boolean = true;

		constructor(_template: (TemplateRenderFunction<C, T, R>)|null,
			changeOn: CHANGE_TYPE.NEVER, renderer?: Renderer<R>);
		constructor(_template: (TemplateRenderFunction<C, T, R>),
			changeOn: CHANGE_TYPE.ALWAYS|CHANGE_TYPE.PROP|CHANGE_TYPE.THEME, 
			renderer?: Renderer<R>);
		constructor(private _template: (TemplateRenderFunction<C, T, R>)|null,
			public changeOn: CHANGE_TYPE, 
			private _renderer?: Renderer<R>) { }

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
						templater`` : typeSafeCall(this._template as TemplateRenderFunction<C, T, R|TR>, 
								component, templater, component.props, 
								'getTheme' in component ? 
									(component as unknown as WebComponentThemeManger<any>)
										.getTheme<T>() : null as any);
					templateMap.set(this, rendered);
					return {
						changed: true,
						rendered: rendered as TR
					}
				}
				if (this.changeOn & CHANGE_TYPE.ALWAYS || 
					changeType & CHANGE_TYPE.ALWAYS ||
					this.changeOn & changeType ||
					!templateMap.has(this)) {
						//Change, rerender
						const rendered = typeSafeCall(this._template as TemplateRenderFunction<C, T, R|TR>, 
							component, templater, component.props, 
							'getTheme' in component ? 
								(component as unknown as WebComponentThemeManger<any>)
									.getTheme<T>() : null as any);
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

		public renderAsText(changeType: CHANGE_TYPE, component: C): string {
			const { changed, rendered } = this._renderWithTemplater(changeType, component,
				TemplateFn._textRenderer);
			this._lastRenderChanged = changed;
			return rendered;
		}

		public renderTemplate(changeType: CHANGE_TYPE, component: C): R {
			const { changed, rendered } = this._renderWithTemplater(changeType, component,
				(component as unknown as WebComponent<any, any>).generateHTMLTemplate as unknown as Templater<R>);
			this._lastRenderChanged = changed;
			return rendered;
		}

		public renderSame<TR>(changeType: CHANGE_TYPE, component: C,
			templater: Templater<TR>): TR {
				const { changed, rendered } = this._renderWithTemplater(changeType, component,
					templater);
				this._lastRenderChanged = changed;
				return rendered;
			}

		public render(template: R, target: HTMLElement) {
			if (this._renderer) {
				this._renderer(template, target);
			}
		}

		public renderIfNew(template: R, target: HTMLElement) {
			if (!this._lastRenderChanged) return;
			if (this._renderer) {
				this._renderer(template, target);
			}
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
			this.__cssArr.filter((template) => {
				return !(template.changeOn === CHANGE_TYPE.THEME ||
					template.changeOn & CHANGE_TYPE.NEVER);
			}));
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

		if (!(change & CHANGE_TYPE.THEME || change & CHANGE_TYPE.ALWAYS)) {
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

export abstract class WebComponentBase extends WebComponentDefiner {
	private ___baseClass: BaseClass = new BaseClass(this);

	/**
	 * The render method that will render this component's HTML
	 */
	public abstract html: TemplateFn<any, any, any> = new TemplateFn(() => {
		throw new Error('No render method implemented');	
	}, CHANGE_TYPE.ALWAYS);

	/**
	 * The element's constructor
	 */
	public abstract get self(): typeof ConfiguredComponent;

	/**
	 * The templates that will render this component's css
	 */
	public abstract css: TemplateFn<any, any, any>|TemplateFn<any, any, any>[] = new TemplateFn(null, CHANGE_TYPE.NEVER);

	/**
	 * A function signaling whether this component has custom CSS applied to it
	 */
	public __hasCustomCSS(): boolean {
		return false;
	}

	/**
	 * Gets this component's custom CSS templates
	 */
	public customCSS(): TemplateFn<any, any, any>|TemplateFn<any, any, any>[] {
		return [];
	}

	private static __constructedCSSRendered: boolean = false;

	/**
	 * Checks whether the constructed CSS has changed
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
	 */
	public root = this.attachShadow({
		mode: 'open'
	});
	
	/**
	 * The properties of this component
	 */
	props: any = {};

	@bindToClass
	/**
	 * The method that starts the rendering cycle
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
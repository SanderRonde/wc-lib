import { WebComponentTemplateManagerMixinInstance, CUSTOM_CSS_PROP_NAME } from './template-manager.js';
import { WebComponentDefinerMixin, WebComponentDefinerMixinInstance } from './definer.js';
import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { WebComponentThemeManagerMixinInstance } from './theme-manager.js';
import { propConfigs, DefinePropTypeConfig, PROP_TYPE } from './props.js';
import { WebComponent } from '../classes/full.js';
import { classNames } from './shared.js';

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
	ALWAYS = 11,
	/**
	 * A forced user-engaged change
	 */
	FORCE = 27
}

/**
 * The templater function that turns a template
 * string into a value that, when passed to the
 * renderer, renders the template to the page
 */
export type Templater<R> = {
	(strings: TemplateStringsArray, ...values: any[]): R;
};

export type JSXTemplater<R> = {
	(strings: TemplateStringsArray, ...values: any[]): R;
	jsx(tag: string|typeof WebComponent, attrs: {
		[key: string]: any;
	}|null, ...children: (JSXInterpreted|any)[]): JSXInterpreted;
};


export type TemplateRenderResult = {
	strings: string[]|TemplateStringsArray;
	values: any[];
}|{
	readonly strings: string[]|TemplateStringsArray;
	readonly values: any[];
}|{
	readonly strings: string[]|TemplateStringsArray;
	readonly values: ReadonlyArray<unknown>;
}|{
	toText(): string;
}|string|JSXInterpreted|HTMLElement;

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
	props?: any;
}, T, TR extends TemplateRenderResult> = (
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
	complexHTML: JSXTemplater<TR>,
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
		props?: any;
	}, WeakMap<TemplateFn<any, any, any>, 
		//Any = R in TemplateFn
		any|null>>> = new WeakMap();

/**
 * The renderer function that renders a template given 
 * that template and the target container
 */
export type Renderer<T> = (template: T, container: HTMLElement|Element|Node) => any;

/**
 * For some reason src/lib/base.CHANGE_TYPE is not assignable to
 * build/lib/base.CHANGE_TYPe so this is needed.
 * 
 * CT is however always equal to CHANGE_TYPE in the real code
 */
export interface TemplateFnLike<CT extends number = number> {
	/**
	 * When this template changes
	 * **Note**: changeType is of type CHANGE_TYPE
	 * 
	 * @type {CHANGE_TYPE}
	 */
	changeOn: CT;

	/**
	 * Renders this template as text
	 * **Note**: changeType is of type CHANGE_TYPE
	 * 
	 * @param {CHANGE_TYPE} changeType - The type of the change
	 * 	that occurred that caused this render to happen
	 * @param {{props?: any}} component - The component to which
	 * 	this text is rendered
	 * 
	 * @returns {string} The rendered string
	 */
	renderAsText(changeType: CT, component: {
		props?: any;
	}): string;

	/**
	 * Renders this template to whatever this template renderer's
	 * template representation is
	 * **Note**: changeType is of type CHANGE_TYPE
	 * 
	 * @param {CHANGE_TYPE} changeType - The type of the change
	 * 	that occurred that caused this render to happen
	 * @param {{props?: any}} component - The component to which
	 * 	this text is rendered
	 * 
	 * @returns {any|null} The template representation or null
	 * 	if nothing needs to be rendered (for example the
	 * 	passed template function returns nothing)
	 */
	renderTemplate(changeType: CT, component: {
		props?: any; 
	}): any|null;

	/**
	 * Renders this template with the templater that is passed.
	 * This can be any of the other "render*" methods.
	 * **Note**: changeType is of type CHANGE_TYPE
	 * 
	 * @param {CHANGE_TYPE} changeType - The type of the change
	 * 	that occurred that caused this render to happen
	 * @param {{props?: any}} component - The component to which
	 * 	this text is rendered
	 * @param {any} templater - The templater that will be used
	 *  to rendeer this template.
	 * 
	 * @returns {any|string|null} The template function's
	 * 	rendered version. The type depends on the passed templater
	 */
	renderSame(changeType: CT, component: { 
		props?: any; 
	}, templater: any): any|string|null;

	/**
	 * Renders the passed template (a representation of
	 * a template generated by this TemplateLike) to the DOM.
	 * Always renders the passed template, even if it's old or
	 * hasn't changed.
	 * 
	 * @param {any|null} template - A representation of a template
	 * 	generated by this TemplateFnLike
	 * @param {HTMLElement} target - The element to which this
	 * 	template needs to be rendered
	 */
	render(template: any|null, target: HTMLElement): void;
	
	/**
	 * Renders the passed template (a representation of
	 * a template generated by this TemplateLike) to the DOM.
	 * Attempts to only render the template if it's changed
	 * relative to what was last rendered.
	 * 
	 * @param {any|null} template - A representation of a template
	 * 	generated by this TemplateFnLike
	 * @param {HTMLElement} target - The element to which this
	 * 	template needs to be rendered
	 */
	renderIfNew(template: any|null, target: HTMLElement): void;
}

type TemplateComponent = Partial<Pick<WebComponentThemeManagerMixinInstance, 'getTheme'>> & {
	props: any;
}

function anyToString(value: any): string {
	if (typeof value === 'object' && 'toString' in value || value.toString) {
		return value.toString();
	}
	return value + '';
}

export class JSXInterpreted {
	public children: (JSXInterpreted|any)[];
	constructor(public tag: string|typeof WebComponent, public attrs: {
		[key: string]: any;
	}|null, children: (JSXInterpreted|any)[], public root: WebComponent<any, any>) { 
		this.children = children.filter(c => c !== undefined);
	}

	toText(): string {
		return `<${this.tag} ${!this.attrs ? '' : Object.getOwnPropertyNames(this.attrs).map((attr) => {
			return `${attr}="${anyToString(this.attrs![attr as any])}"`;
		}).join(' ')}>
			${this.children.map((child) => {
				if (child instanceof JSXInterpreted) {
					return child.toText() ;
				}
				return anyToString(child);
			}).join('\n')}
		</${this.tag}>`
	}
}


declare global {
	namespace JSX {
		interface Element extends JSXInterpreted { }
	}
}

function jsxInterpreter(root: WebComponent<any, any>, tag: string|typeof WebComponent, attrs: {
	[key: string]: any;
}|null, ...children: (JSXInterpreted|any)[]) {
	return new JSXInterpreted(tag, attrs, children, root);
}

const renderedMap: WeakMap<HTMLElement, JSXInterpreted> = new WeakMap();

function renderTextNode(text: any) {
	return document.createTextNode(text);
}

function addListener(el: HTMLElement|WebComponent<any, any>, name: string, value: any, isCustom: boolean) {
	// Custom listener
	if (eventListeners.has(el) && eventListeners.get(el)!.has(name)) {
		const lastFn = eventListeners.get(el)!.get(name)!;
		// Same functions, no need to change anything
		if (lastFn === value) return;
		// Remove previous one
		if (isCustom) {
			(el as WebComponent<any, any>).clearListener(name, eventListeners.get(el)!.get(name)! as any);
		} else {
			el.removeEventListener(name, eventListeners.get(el)!.get(name)! as any);
		}
	}
	// Add new one
	if (isCustom) {
		(el as WebComponent<any, any>).listen(name, value);
	} else {
		el.addEventListener(name, value);
	}
	if (!eventListeners.has(el)) eventListeners.set(el, new Map());
	eventListeners.get(el)!.set(name, value);
}

const eventListeners: WeakMap<HTMLElement|WebComponent<any, any>, Map<string, Function>> = new WeakMap();
function handleSpecialNames(root: WebComponent<any, any>, el: HTMLElement|WebComponent<any, any>, 
	attr: string, value: any) {
		const prefix = attr[0];
		const name = attr.slice(1);
		if (prefix === '@') {
			if (attr[1] === '@') {
				// Custom listener
				addListener(el, name, value, true);
			} else {
				// Regular listener
				addListener(el, name, value, false);
			}
		} else if (prefix === '?') {
			// Boolean
			if (el.hasAttribute(name) === !!value) return;
			if (value) {
				el.setAttribute(name, '');
			} else {
				el.removeAttribute(name);
			}
		} else if (prefix === 'class') {
			// Class
			if (Array.isArray(value)) {
				el.setAttribute('class', classNames(...value));
			} else {
				el.setAttribute('class', classNames(value));
			}
		} else if (prefix === '#' || attr === CUSTOM_CSS_PROP_NAME) {
			// Ref
			el.setAttribute(prefix === '#' ? name : attr, 
				root.genRef(value));
		} else {
			return false;
		}
		return true;
	}

function setAttribute(root: WebComponent<any, any>, el: HTMLElement|WebComponent<any, any>, attr: string, value: any) {
	if (handleSpecialNames(root, el, attr, value)) return;
	if (!propConfigs.has(el as any)) {
		el.setAttribute(attr, value);
		return;
	}

	const { priv = {}, reflect = {} } = propConfigs.get(el as any)!;
	const props = {...priv, ...reflect};
	if (!(attr in props)) {
		el.setAttribute(attr, value);
		return;
	}
	const prop = props[attr];
	if (typeof prop === 'string') {
		// Simple PROP_TYPE
		if (prop === PROP_TYPE.BOOL) {
			if (el.hasAttribute(attr) === !!value) return;
			if (value) {
				el.setAttribute(attr, '');
			} else {
				el.removeAttribute(attr);
			}
		}
		return;
	}
	if (typeof prop === 'symbol' || typeof (prop as DefinePropTypeConfig).type === 'symbol') {
		// Complex type
		el.setAttribute(attr, root.genRef(value));
		return;
	}
	const config = prop as DefinePropTypeConfig;
	if (config.type === PROP_TYPE.BOOL) {
		if (el.hasAttribute(attr) === !!value) return;
		if (value) {
			el.setAttribute(attr, '');
		} else {
			el.removeAttribute(attr);
		}
		return;
	}
	if (attr === '__listeners') {
		for (const name in value as {
			[key: string]: Function;
		}) {
			addListener(el, name, value, false);
		}
		return;
	}
	if (attr === '___listeners') {
		for (const name in value as {
			[key: string]: Function;
		}) {
			addListener(el, name, value, true);
		}
		return;
	}
	el.setAttribute(attr, anyToString(value));
}

function renderFresh(descriptor: JSXInterpreted|any): HTMLElement|Text {
	if (!(descriptor instanceof JSXInterpreted)) {
		return renderTextNode(descriptor);
	}
	const { attrs, tag, children } = descriptor;
	const el = typeof tag === 'string' ? 
		document.createElement(tag) : 
		new tag();
	if (attrs) {
		for (const attr in attrs) {
			setAttribute(descriptor.root, el, attr, attrs[attr]);
		}
	}
	for (const child of children) {
		el.appendChild(renderFresh(child));
	}
	return el;
}

function renderToIndex(element: HTMLElement|Text, parent: HTMLElement, index: number) {
	if (parent.children[index]) {
		parent.children[index].remove();
	}
	if (!parent.children[index + 1]) {
		parent.appendChild(element);
	} else {
		parent.insertBefore(element, parent.children[index + 1]);
	}
}

function updateRender(currentRender: JSXInterpreted, lastRender: JSXInterpreted, parent: HTMLElement) {
	if (parent.children.length !== currentRender.children.length) {
		Array.from(parent.children).forEach(c => c.remove());
		currentRender.children.forEach(c => parent.appendChild(renderFresh(c)));
		return;
	}

	for (let i = 0; i < Math.min(currentRender.children.length, lastRender.children.length); i++) {
		const currentChild = currentRender.children[i];
		const lastChild = lastRender.children[i];

		if (!(currentChild instanceof JSXInterpreted)) {
			if (!(lastChild instanceof JSXInterpreted) || currentChild !== lastChild) {
				renderToIndex(renderTextNode(currentChild), parent, i);
			}
			continue;
		}

		// Check tag
		if (lastChild instanceof JSXInterpreted || currentChild.tag !== lastChild.tag) {
			// Big change, just do a fresh render
			renderToIndex(renderFresh(currentChild), parent, i);
			continue;
		}

		// Check attrs
		const element = parent.children[i] as HTMLElement;
		const currentAttrs = currentChild.attrs || {};
		const lastAttrs = lastChild.attrs || {};
		const joinedAttrs = {...currentAttrs, ...lastAttrs};
		for (const key in joinedAttrs) {
			if (!(key in currentAttrs)) {
				// Removed 
				element.removeAttribute(key);
			} else if (currentAttrs[key] !== lastAttrs[key] || !(key in lastAttrs)) {
				element.setAttribute(key, currentAttrs[key] + '');
			}
		}

		// Check children
		updateRender(currentChild, lastChild, element);
	}
	if (currentRender.children.length !== lastRender.children.length) {
		if (currentRender.children.length > lastRender.children.length) {
			currentRender.children.slice(lastRender.children.length).forEach(c => parent.appendChild(renderFresh(c)));
		} else {
			Array.from(parent.children).slice(currentRender.children.length).forEach(c => c.remove());
		}
	}
}

function renderJSX(interpreted: JSXInterpreted, target: HTMLElement) {
	if (!renderedMap.has(target) || target.children.length !== 1) {
		Array.from(target.children).forEach(c => c.remove());
		target.appendChild(renderFresh(interpreted));
	} else {
		updateRender(
			new JSXInterpreted(target.tagName, null, [interpreted], interpreted.root), 
			new JSXInterpreted(target.tagName, null, [renderedMap.get(target)!], interpreted.root), 
			target);
	}
	renderedMap.set(target, interpreted);
}

/**
 * A template class that renders given template
 * when given change occurs using given renderer
 * 
 * @template C - The base component
 * @template T - The theme object
 * @template R - The return value of the template function
 */
export class TemplateFn<C extends {} = WebComponent<any, any>, T = void, R extends TemplateRenderResult = TemplateRenderResult> implements TemplateFnLike {
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
	 * @param {Renderer<R>|null} renderer - The renderer that gets called with
	 * 	the value returned by the template as the first argument and
	 * 	with the container element as the second element and is
	 * 	tasked with rendering it to the DOM
	 */
	constructor(_template: (TemplateRenderFunction<C, T, R>)|null,
		changeOn: CHANGE_TYPE.NEVER, renderer: Renderer<R>|null);
	constructor(_template: (TemplateRenderFunction<C, T, R>),
		changeOn: CHANGE_TYPE.ALWAYS|CHANGE_TYPE.PROP|CHANGE_TYPE.THEME|CHANGE_TYPE.LANG, 
		renderer: Renderer<R>|null);
	constructor(private _template: (TemplateRenderFunction<C, T, R>)|null,
		public changeOn: CHANGE_TYPE, 
		private _renderer: Renderer<R>|null) { }

	private _renderWithTemplater<TR extends TemplateRenderResult>(changeType: CHANGE_TYPE, component: C,
		templater: Templater<TR>|undefined): {
			changed: boolean;
			rendered: TR|null;
			} {
			// If no object-like or function-like templater exists, use a random object
			// to prevent an invalid key error from being thrown and to prevent
			// sharing cache that should not be used
			if (!templater || (typeof templater !== 'object' && typeof templater !== 'function')) {
				templater = component as any;
			}
			if (!templaterMap.has(templater!)) {
				templaterMap.set(templater!, new WeakMap());
			}
			const componentTemplateMap = templaterMap.get(templater!)!;

			const jsxAddedTemplate = templater as unknown as JSXTemplater<R>;
			jsxAddedTemplate.jsx = (tag: string|typeof WebComponent, attrs: {
				[key: string]: any;
			}|null, ...children: (JSXInterpreted|any)[]) => {
				return jsxInterpreter(component as any, tag, attrs, ...children);
			};

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
				const templateComponent = component as unknown as TemplateComponent;
				const rendered = this._template === null ?
					null : (this._template as TemplateRenderFunction<C, T, R|TR>).call(
						component, jsxAddedTemplate!, templateComponent.props, 
						('getTheme' in templateComponent && templateComponent.getTheme) ? 
							templateComponent.getTheme<T>() : null as any, changeType);
				templateMap.set(this, rendered);
				return {
					changed: true,
					rendered: rendered as TR
				}
			}
			if (this.changeOn & changeType ||
				!templateMap.has(this)) {
					//Change, rerender
					const templateComponent = component as unknown as TemplateComponent;
					const rendered = (this._template as TemplateRenderFunction<C, T, R|TR>).call(
						component, jsxAddedTemplate!, templateComponent.props, 
						('getTheme' in templateComponent && templateComponent.getTheme) ? 
							templateComponent.getTheme<T>() : null as any, changeType);
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

	private static _textRenderer(strings: TemplateStringsArray|string[], ...values: any[]): string {
		const result: string[] = [strings[0]];
		for (let i = 0; i < values.length; i++) {
			result.push(values[i], strings[i + 1]);
		}
		return result.join('');
	}

	private static _templateResultToText(result: Exclude<TemplateRenderResult|null, string>) {
		if (result === null || result === undefined) return '';

		if (result instanceof HTMLElement || result instanceof Element) {
			return result.innerHTML;
		}
		if ('toText' in result && typeof result.toText === 'function') {
			return result.toText();
		}
		if ('strings' in result && 'values' in result) {
			return this._textRenderer(result.strings, ...result.values);
		}
		throw new Error('Failed to convert template to text because there ' +
			'is no .toText() and no .strings and .values properties either ' +
			'(see TemplateRenderResult)');
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
		if (typeof rendered !== 'string') {
			// Not text yet
			return TemplateFn._templateResultToText(rendered);
		}
		return rendered;
	}

	/**
	 * Renders this template to an intermediate value that
	 * 	can then be passed to the renderer
	 * 
	 * @param {CHANGE_TYPE} changeType - The type of change that occurred
	 * @param {C} component - The base component
	 * 
	 * @returns {R|null} The intermediate value that
	 * 	can be passed to the renderer
	 */
	public renderTemplate(changeType: CHANGE_TYPE, component: C): R|null {
		const { changed, rendered } = this._renderWithTemplater(changeType, component,
			(component as Partial<Pick<WebComponentTemplateManagerMixinInstance, 'generateHTMLTemplate'>>)
				.generateHTMLTemplate as unknown as Templater<R>);
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
	 * @returns {TR|null|string} The return value of the templater
	 */
	public renderSame<TR extends TemplateRenderResult>(changeType: CHANGE_TYPE, component: C,
		templater: JSXTemplater<TR|string>): TR|null|string {
			const { changed, rendered } = this._renderWithTemplater(changeType, component,
				templater);
			this._lastRenderChanged = changed;
			return rendered;
		}

	/**
	 * Renders a template to given HTML element
	 * 
	 * @param {R|null} template - The template to render in its
	 * 	intermediate form
	 * @param {HTMLElement} target - The element to render
	 * 	it to
	 */
	public render(template: R|null, target: HTMLElement) {
		if (template === null) return;
		if (template instanceof HTMLElement || template instanceof Element) {
			target.appendChild(template);
			return;
		}
		if (template instanceof JSXInterpreted) {
			renderJSX(template, target);
			return;
		}
		if (this._renderer) {
			this._renderer(template, target);
		} else {
			throw new Error('Missing renderer');
		}
	}

	/**
	 * Renders this template to DOM if it has changed as of
	 * the last call to the template function
	 * 
	 * @param {R|null} template - The template to render in its
	 * 	intermediate form
	 * @param {HTMLElement} target - The element to render
	 * 	it to
	 */
	public renderIfNew(template: R|null, target: HTMLElement) {
		if (!this._lastRenderChanged) return;
		this.render(template, target);
	}
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
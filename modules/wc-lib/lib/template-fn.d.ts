import { Constructor } from '../classes/types.js';
import { WebComponent } from '../classes/full.js';
/**
 * The type of change that should re-render
 * a template. Can be combined to cover
 * multiple change types. For example
 * `CHANGE_TYPE.PROP | CHANGE_TYPE.THEME`
 * will re-render on both changes
 */
export declare const enum CHANGE_TYPE {
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
export declare type Templater<R> = {
    (strings: TemplateStringsArray, ...values: any[]): R;
};
/**
 * The type of a templater that handles both
 * regular template literals and JSX elements.
 * The template literals through calling it as a
 * function and JSX elements through `templater.jsx(...)`
 */
export declare type JSXTemplater<R> = {
    (strings: TemplateStringsArray, ...values: any[]): R;
    jsx(tag: string | (Constructor<any> & {
        is: string;
    }), attrs: {
        [key: string]: any;
    } | null, ...children: (R | any)[]): R;
};
/**
 * A result that should be returned by the template
 * renderer. Should have some way to convert it to text
 * which can be any of the below types.
 */
export declare type TemplateRenderResult = {
    strings: string[] | TemplateStringsArray;
    values: any[];
} | {
    readonly strings: string[] | TemplateStringsArray;
    readonly values: any[];
} | {
    readonly strings: string[] | TemplateStringsArray;
    readonly values: ReadonlyArray<unknown>;
} | {
    toText(): string;
} | string | Element | HTMLElement;
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
export declare type TemplateRenderFunction<C extends {
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
 * The renderer function that renders a template given
 * that template and the target container
 */
export declare type Renderer<T> = (template: T, container: HTMLElement | Element | Node) => any;
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
    }): any | null;
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
    }, templater: any): any | string | null;
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
    render(template: any | null, target: HTMLElement): void;
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
    renderIfNew(template: any | null, target: HTMLElement): void;
}
declare type InferThemeVal<C> = C extends {
    getTheme(): infer T;
} ? T : void;
/**
 * A template class that renders given template
 * when given change occurs using given renderer
 *
 * @template C - The base component
 * @template T - The theme object
 * @template R - The return value of the template function
 */
export declare class TemplateFn<C extends {} = WebComponent<any, any>, R extends TemplateRenderResult = TemplateRenderResult> implements TemplateFnLike {
    private _template;
    changeOn: CHANGE_TYPE;
    private _renderer;
    private _lastRenderChanged;
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
    constructor(_template: (TemplateRenderFunction<C, InferThemeVal<C>, R>) | null, changeOn: CHANGE_TYPE.NEVER, renderer: Renderer<R> | null);
    constructor(_template: (TemplateRenderFunction<C, InferThemeVal<C>, R>), changeOn: CHANGE_TYPE.ALWAYS | CHANGE_TYPE.PROP | CHANGE_TYPE.THEME | CHANGE_TYPE.LANG, renderer: Renderer<R> | null);
    private _renderWithTemplater;
    private static _textRenderer;
    private static _templateResultToText;
    /**
     * Renders this template to text and returns the text
     *
     * @param {CHANGE_TYPE} changeType - The type of change that occurred
     * @param {C} component - The base component
     *
     * @returns {string} The rendered template as text
     */
    renderAsText(changeType: CHANGE_TYPE, component: C): string;
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
    renderTemplate(changeType: CHANGE_TYPE, component: C): R | null;
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
    renderSame<TR extends TemplateRenderResult>(changeType: CHANGE_TYPE, component: C, templater: JSXTemplater<TR | string>): TR | null | string;
    /**
     * Renders a template to given HTML element
     *
     * @param {R|null} template - The template to render in its
     * 	intermediate form
     * @param {HTMLElement} target - The element to render
     * 	it to
     */
    render(template: R | null, target: HTMLElement): void;
    /**
     * Renders this template to DOM if it has changed as of
     * the last call to the template function
     *
     * @param {R|null} template - The template to render in its
     * 	intermediate form
     * @param {HTMLElement} target - The element to render
     * 	it to
     */
    renderIfNew(template: R | null, target: HTMLElement): void;
}
export {};
//# sourceMappingURL=template-fn.d.ts.map
import {
    Constructor,
    WebComponentThemeManagerMixinInstance,
    WebComponentTemplateManagerMixinInstance,
} from '../classes/types.js';
import { WebComponent } from '../classes/full.js';
import { jsxToLiteral } from './jsx-render.js';

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
     * Language changes
     */
    LANG = 4,
    /**
     * Never re-render. This allows
     * for optimizing out the
     * rendering of this template
     */
    NEVER = 8,
    /**
     * Any change
     */
    // 23 = 1 | 2 | 4 | 16
    ALWAYS = 23,
    /**
     * A forced user-engaged change
     */
    // 55 = 1 | 2 | 4 | 16 | 32
    FORCE = 55,
}

const changeTypes: Set<number> = new Set([1, 2, 4, 8, 16, 32]);
let lastChangeType: number = 32;
export function createUniqueChangeType() {
    const num = lastChangeType * 2;
    changeTypes.add(num);
    lastChangeType = num;

    return num;
}

/**
 * The templater function that turns a template
 * string into a value that, when passed to the
 * renderer, renders the template to the page
 */
export type Templater<R> = {
    (strings: TemplateStringsArray, ...values: any[]): R;
};

/**
 * The type of just the JSX templater function
 */
export type JSXTemplateFunction<R> = {
    <
        A extends {
            [key: string]: any;
        }
    >(
        tag:
            | string
            | ((attrs?: A) => R)
            | (Constructor<any> & {
                  is: string;
              }),
        attrs: A | null,
        ...children: (R | any)[]
    ): R;
};

export const Fragment = Symbol('fragment');

/**
 * The type of a templater that handles both
 * regular template literals and JSX elements.
 * The template literals through calling it as a
 * function and JSX elements through `templater.jsx(...)`
 */
export type JSXTemplater<R> = {
    (strings: TemplateStringsArray, ...values: any[]): R;
    jsx: JSXTemplateFunction<R>;
    Fragment: () => typeof Fragment;
    F: () => typeof Fragment;
};

/**
 * A result that should be returned by the template
 * renderer. Should have some way to convert it to text
 * which can be any of the below types.
 */
export type TemplateRenderResult =
    | {
          strings: string[] | TemplateStringsArray;
          values: any[];
      }
    | {
          readonly strings: string[] | TemplateStringsArray;
          readonly values: any[];
      }
    | {
          readonly strings: string[] | TemplateStringsArray;
          readonly values: ReadonlyArray<unknown>;
      }
    | {
          toText(): string;
      }
    | string
    | Element
    | HTMLElement;

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
export type TemplateRenderFunction<
    C extends {
        props?: any;
    },
    T,
    TR extends TemplateRenderResult
> = (
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
     * Various parameters to this change
     */
    params: {
        /**
         * The component's properties
         */
        props: C['props'];
        /**
         * The component's current theme
         */
        theme: T;
        /**
         * The current change
         */
        changeType: CHANGE_TYPE | number;
    }
) => TR;

/**
 * Maps templaters -> components -> functions -> results
 */
const templaterMap: WeakMap<
    Templater<any>,
    WeakMap<
        {
            props?: any;
        },
        WeakMap<
            TemplateFn<any, any>,
            //Any = R in TemplateFn
            any | null
        >
    >
> = new WeakMap();

/**
 * The renderer function that renders a template given
 * that template and the target container
 */
export type Renderer<T> = (
    template: T,
    container: HTMLElement | Element | Node
) => any;

/**
 * For some reason src/lib/base.CHANGE_TYPE is not assignable to
 * build/lib/base.CHANGE_TYPE so this is needed.
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
    renderAsText(
        changeType: CT,
        component: {
            props?: any;
        }
    ): string;

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
    renderTemplate(
        changeType: CT,
        component: {
            props?: any;
        }
    ): any | null;

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
    renderSame(
        changeType: CT,
        component: {
            props?: any;
        },
        templater: any
    ): any | string | null;

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

type TemplateComponent = Partial<
    Pick<WebComponentThemeManagerMixinInstance, 'getTheme'>
> & {
    props: any;
};

type InferThemeVal<C> = C extends {
    getTheme(): infer T;
}
    ? T
    : void;

function getTheme(component: TemplateComponent) {
    if ('getTheme' in component && component.getTheme) {
        return component.getTheme();
    }
    return null;
}

/**
 * A template class that renders given template
 * when given change occurs using given renderer
 *
 * @template C - The base component
 * @template T - The theme object
 * @template R - The return value of the template function
 */
export class TemplateFn<
    C extends {} = WebComponent<any, any>,
    R extends TemplateRenderResult = TemplateRenderResult
> implements TemplateFnLike {
    private _lastRenderChanged: boolean = true;
    get changeOn() {
        if (this._changeOn === CHANGE_TYPE.ALWAYS) {
            // Generate a new "always"
            return [...changeTypes.values()]
                .filter((v) => v !== CHANGE_TYPE.NEVER && v !== 16)
                .reduce((prev, current) => {
                    return prev | current;
                }, 0);
        }
        return this._changeOn;
    }

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
    constructor(
        _template: TemplateRenderFunction<C, InferThemeVal<C>, R> | null,
        changeOn: CHANGE_TYPE.NEVER,
        renderer: Renderer<R> | null
    );
    constructor(
        _template: TemplateRenderFunction<C, InferThemeVal<C>, R>,
        changeOn:
            | CHANGE_TYPE.ALWAYS
            | CHANGE_TYPE.PROP
            | CHANGE_TYPE.THEME
            | CHANGE_TYPE.LANG
            | number,
        renderer: Renderer<R> | null
    );
    constructor(
        private _template: TemplateRenderFunction<
            C,
            InferThemeVal<C>,
            R
        > | null,
        private _changeOn: CHANGE_TYPE | number,
        private _renderer: Renderer<R> | null
    ) {}

    private _renderWithTemplater<TR extends TemplateRenderResult>(
        changeType: CHANGE_TYPE | number,
        component: C,
        templater: Templater<TR> | undefined
    ): {
        changed: boolean;
        rendered: TR | null;
    } {
        // If no object-like or function-like templater exists, use a random object
        // to prevent an invalid key error from being thrown and to prevent
        // sharing cache that should not be used
        if (
            !templater ||
            (typeof templater !== 'object' && typeof templater !== 'function')
        ) {
            templater = component as any;
        }
        if (!templaterMap.has(templater!)) {
            templaterMap.set(templater!, new WeakMap());
        }
        const componentTemplateMap = templaterMap.get(templater!)!;

        const jsxAddedTemplate = ((typeof templater === 'function'
            ? templater.bind(component)
            : templater!) as unknown) as JSXTemplater<TR>;
        jsxAddedTemplate.jsx = (
            tag:
                | string
                | (Constructor<any> & {
                      is: string;
                  }),
            attrs: {
                [key: string]: any;
            } | null,
            ...children: (TR | any)[]
        ) => {
            const { strings, values } = jsxToLiteral(tag, attrs, ...children);
            return templater!(strings, ...values);
        };
        jsxAddedTemplate.Fragment = jsxAddedTemplate.F = () => Fragment;

        if (!componentTemplateMap.has(component)) {
            componentTemplateMap.set(component, new WeakMap());
        }
        const templateMap = componentTemplateMap.get(component)!;
        if (this.changeOn === CHANGE_TYPE.NEVER) {
            //Never change, return the only render
            const cached = templateMap.get(this);
            if (cached) {
                return {
                    changed: false,
                    rendered: cached,
                };
            }
            const templateComponent = (component as unknown) as TemplateComponent;
            const rendered =
                this._template === null
                    ? null
                    : (this._template as TemplateRenderFunction<
                          C,
                          InferThemeVal<C>,
                          R | TR
                      >).call(component, jsxAddedTemplate!, {
                          props: templateComponent.props,
                          theme: getTheme(templateComponent),
                          changeType: changeType,
                      });
            templateMap.set(this, rendered);
            return {
                changed: true,
                rendered: rendered as TR,
            };
        }
        if (this.changeOn & changeType || !templateMap.has(this)) {
            //Change, re-render
            const templateComponent = (component as unknown) as TemplateComponent;
            const rendered = (this._template as TemplateRenderFunction<
                C,
                InferThemeVal<C>,
                R | TR
            >).call(component, jsxAddedTemplate!, {
                props: templateComponent.props,
                theme: getTheme(templateComponent),
                changeType: changeType,
            });
            templateMap.set(this, rendered);
            return {
                changed: true,
                rendered: rendered as TR,
            };
        }

        //No change, return what was last rendered
        return {
            changed: false,
            rendered: templateMap.get(this)!,
        };
    }

    private static _textRenderer(
        strings: TemplateStringsArray | string[],
        ...values: any[]
    ): string {
        const result: string[] = [strings[0]];
        for (let i = 0; i < values.length; i++) {
            result.push(values[i], strings[i + 1]);
        }
        return result.join('');
    }

    private static _templateResultToText(
        result: Exclude<TemplateRenderResult | null, string>
    ) {
        if (result === null || result === undefined) return '';

        if (
            (typeof HTMLElement !== 'undefined' &&
                result instanceof HTMLElement) ||
            (typeof Element !== 'undefined' && result instanceof Element)
        ) {
            return `<${result.tagName.toLowerCase()} ${Array.from(
                result.attributes
            )
                .map((attr) => {
                    return `${attr.name}="${attr.value}"`;
                })
                .join(' ')}>${
                result.innerHTML
            }</${result.tagName.toLowerCase()}>`;
        }
        if ('toText' in result && typeof result.toText === 'function') {
            return result.toText();
        }
        if ('strings' in result && 'values' in result) {
            return this._textRenderer(result.strings, ...result.values);
        }
        throw new Error(
            'Failed to convert template to text because there ' +
                'is no .toText() and no .strings and .values properties either ' +
                '(see TemplateRenderResult)'
        );
    }

    /**
     * Renders this template to text and returns the text
     *
     * @param {CHANGE_TYPE|number} changeType - The type of change that occurred
     * @param {C} component - The base component
     *
     * @returns {string} The rendered template as text
     */
    public renderAsText(
        changeType: CHANGE_TYPE | number,
        component: C
    ): string {
        const { changed, rendered } = this._renderWithTemplater(
            changeType,
            component,
            TemplateFn._textRenderer
        );

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
     * @param {CHANGE_TYPE|number} changeType - The type of change that occurred
     * @param {C} component - The base component
     *
     * @returns {R|null} The intermediate value that
     * 	can be passed to the renderer
     */
    public renderTemplate(
        changeType: CHANGE_TYPE | number,
        component: C
    ): R | null {
        const { changed, rendered } = this._renderWithTemplater(
            changeType,
            component,
            ((component as Partial<
                Pick<
                    WebComponentTemplateManagerMixinInstance,
                    'generateHTMLTemplate'
                >
            >).generateHTMLTemplate as unknown) as Templater<R>
        );
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
     * @param {CHANGE_TYPE|number} changeType - The type of change that occurred
     * @param {C} component - The base component
     * @param {templater<TR>} templater - The templater (
     * 	generally of the parent)
     *
     * @returns {TR|null|string} The return value of the templater
     */
    public renderSame<TR extends TemplateRenderResult>(
        changeType: CHANGE_TYPE | number,
        component: C,
        templater: JSXTemplater<TR | string>
    ): TR | null | string {
        const { changed, rendered } = this._renderWithTemplater(
            changeType,
            component,
            templater
        );
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
    public render(template: R | null, target: HTMLElement) {
        if (template === null) return;
        if (template instanceof HTMLElement || template instanceof Element) {
            target.appendChild(template);
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
    public renderIfNew(template: R | null, target: HTMLElement) {
        if (!this._lastRenderChanged) return;
        this.render(template, target);
    }
}

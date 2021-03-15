import {
    refPrefix,
    Props,
    PropConfigObject,
    getDefinePropConfig,
    ComplexTypeClass,
    dashesToCasing,
} from './props.js';
import { WebComponentHierarchyManagerMixinInstance } from './hierarchy-manager.js';
import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { TemplateProcessor, EventPart, Part, NodePart } from 'lit-html';
import { WebComponentListenableMixinInstance } from './listener.js';
import { bindToClass, CUSTOM_CSS_PROP_NAME } from './base.js';
import { TemplateFn, TemplateFnLike } from './template-fn.js';
import { RenderOptions } from 'lit-html/lib/render-options';
import { classNames, ClassNamesArg } from './shared.js';
import { ClassToObj } from './configurable.js';
import { CHANGE_TYPE } from './enums.js';

class ClassAttributePart implements Part {
    public value: any = undefined;
    private _pendingValue: any = undefined;

    constructor(
        public element: Element,
        public name: string,
        public strings: string[],
        private _config: LitHTMLConfig
    ) {}

    private _isPrimitive(value: any): boolean {
        return (
            value === null ||
            !(typeof value === 'object' || typeof value === 'function')
        );
    }

    setValue(value: any): void {
        /* istanbul ignore else */
        if (
            value !== this._config.noChange &&
            (!this._isPrimitive(value) || value !== this.value)
        ) {
            this._pendingValue = value;
        }
    }

    private _getClassNameString(args: ClassNamesArg | ClassNamesArg[]) {
        if (Array.isArray(args)) {
            return classNames(...args);
        } else {
            return classNames(args);
        }
    }

    commit() {
        while (this._config.isDirective(this._pendingValue)) {
            const directive = this._pendingValue;
            this._pendingValue = this._config.noChange;
            directive(this);
        }
        /* istanbul ignore if */
        if (this._pendingValue === this._config.noChange) {
            return;
        }
        if (
            typeof this._pendingValue === 'string' ||
            typeof this._pendingValue === 'number'
        ) {
            //Equality has already been checked, set value
            this.value = this._pendingValue + '';
            this.element.setAttribute(this.name, this._pendingValue + '');
        } else {
            const classString = this._getClassNameString(this._pendingValue);
            this.element.setAttribute(this.name, classString);
        }
        this._pendingValue = this._config.noChange;
    }
}

export class StyleAttributePart implements Part {
    public value: any = undefined;
    private _pendingValue: any = undefined;

    constructor(
        public element: Element,
        public name: string,
        public strings: string[],
        private _config: LitHTMLConfig
    ) {}

    private _isPrimitive(value: any): boolean {
        return (
            value === null ||
            !(typeof value === 'object' || typeof value === 'function')
        );
    }

    setValue(value: any): void {
        /* istanbul ignore else */
        if (
            value !== this._config.noChange &&
            (!this._isPrimitive(value) || value !== this.value)
        ) {
            this._pendingValue = value;
        }
    }

    private static _toDashes(camelCase: string): string {
        return camelCase
            .replace(/([a-z\d])([A-Z])/g, '$1-$2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1-$2')
            .toLowerCase();
    }

    public static getStyleString(args: Partial<CSSStyleDeclaration>) {
        const arr: string[] = [];
        for (const key in args) {
            arr.push(`${this._toDashes(key)}: ${args[key]};`);
        }
        return arr.join(' ');
    }

    commit() {
        while (this._config.isDirective(this._pendingValue)) {
            const directive = this._pendingValue;
            this._pendingValue = this._config.noChange;
            directive(this);
        }
        /* istanbul ignore if */
        if (this._pendingValue === this._config.noChange) {
            return;
        }
        if (
            typeof this._pendingValue === 'string' ||
            typeof this._pendingValue === 'number'
        ) {
            //Equality has already been checked, set value
            this.value = this._pendingValue + '';
            this.element.setAttribute(this.name, this._pendingValue + '');
        } else {
            const styleString = StyleAttributePart.getStyleString(
                this._pendingValue
            );
            this.element.setAttribute(this.name, styleString);
        }
        this._pendingValue = this._config.noChange;
    }
}

class ComplexValuePart implements Part {
    public value: any = undefined;
    private _pendingValue: any = undefined;

    constructor(
        public element: Element,
        public name: string,
        public strings: string[],
        public genRef: (value: ComplexValue) => string,
        private _config: LitHTMLConfig
    ) {}

    setValue(value: any): void {
        if (value !== this._config.noChange && value !== this.value) {
            this._pendingValue = value;
        }
    }

    private static __isTemplate(value: any): value is TemplateFn {
        if (!value) return false;
        if (
            typeof value.changeOn !== 'number' ||
            typeof value.renderAsText !== 'function' ||
            typeof value.renderTemplate !== 'function' ||
            typeof value.renderSame !== 'function' ||
            typeof value.render !== 'function' ||
            typeof value.renderIfNew !== 'function'
        ) {
            return false;
        }
        return true;
    }

    commit() {
        while (this._config.isDirective(this._pendingValue)) {
            const directive = this._pendingValue;
            this._pendingValue = this._config.noChange;
            directive(this);
        }
        /* istanbul ignore if */
        if (this._pendingValue === this._config.noChange) {
            return;
        }
        if (
            this.name === CUSTOM_CSS_PROP_NAME &&
            !ComplexValuePart.__isTemplate(this._pendingValue)
        ) {
            console.warn(
                'Attempting to use non TemplateFn value for custom-css property'
            );
            this._pendingValue = new TemplateFn(null, CHANGE_TYPE.NEVER, null);
        }

        // Try and JSON parse it
        let err: boolean = false;
        /* istanbul ignore next */
        if (typeof this._pendingValue !== 'string') {
            err = true;
        } else {
            try {
                JSON.parse(this._pendingValue);
                this.element.setAttribute(this.name, this._pendingValue);
            } catch (e) {
                err = true;
            }
        }
        if (err) {
            this.element.setAttribute(
                this.name,
                this.genRef(this._pendingValue)
            );
        }
        this.value = this._pendingValue;
        this._pendingValue = this._config.noChange;
    }
}

function getComponentEventPart(
    eventPart: typeof EventPart,
    config: LitHTMLConfig
) {
    return class ComponentEventPart extends eventPart {
        element: WebComponentTemplateManagerMixinInstance | Element;

        private _pendingValue: undefined | any = undefined;

        constructor(
            element: WebComponentTemplateManagerMixinInstance | Element,
            eventName: string,
            eventContext: EventTarget
        ) {
            super(element, eventName, eventContext);
            this.element = element;
            (this.eventName as any) = eventName;
            (this.eventContext as any) = eventContext;
        }

        setValue(value: any) {
            this._pendingValue = value;
        }

        commit() {
            while (config.isDirective(this._pendingValue)) {
                const directive = this._pendingValue;
                this._pendingValue = config.noChange as any;
                (directive as any)(this);
            }
            /* istanbul ignore if */
            if (this._pendingValue === config.noChange) {
                return;
            }

            const newListener = this._pendingValue;
            const oldListener = this.value;
            const shouldRemoveListener =
                newListener == null ||
                (oldListener != null &&
                    (newListener.capture !== oldListener.capture ||
                        newListener.once !== oldListener.once ||
                        newListener.passive !== oldListener.passive));
            const shouldAddListener =
                newListener != null &&
                (oldListener == null || shouldRemoveListener);

            if (
                !('listen' in this.element) ||
                !('clearListener' in this.element)
            ) {
                console.warn(
                    'Attempting to listen using webcomponent listener on non-webcomponent element',
                    `Name: ${this.eventName}, element:`,
                    this.element
                );
            }
            if (
                shouldRemoveListener &&
                'clearListener' in this.element &&
                this.element.clearListener
            ) {
                this.element.clearListener(this.eventName);
            }
            if (
                shouldAddListener &&
                'listen' in this.element &&
                this.element.listen
            ) {
                this.element.listen(
                    this.eventName,
                    this.handleEvent.bind(this)
                );
            }
            this.value = newListener;
            this._pendingValue = config.noChange as any;
        }

        handleEvent(...args: any[]) {
            if (typeof this.value === 'function') {
                return this.value.call(this.eventContext, ...args);
            } else {
                return (this.value as {
                    handleEvent(...args: any[]): void;
                }).handleEvent(...args);
            }
        }
    };
}

class ComplexTemplateProcessor implements TemplateProcessor {
    constructor(
        public component: WebComponentTemplateManagerMixinInstance,
        public genRef: (value: ComplexValue) => string,
        private _config: LitHTMLConfig
    ) {}

    private __componentEventPart: RetVal<
        typeof getComponentEventPart
    > | null = null;
    private get _componentEventPart() {
        if (this.__componentEventPart !== null) {
            return this.__componentEventPart;
        }
        return (this.__componentEventPart = getComponentEventPart(
            this._config.EventPart as typeof EventPart,
            this._config
        ));
    }

    private _isComplexAttribute(element: Element, name: string) {
        const propsComponent = element as WebComponentTemplateManagerMixinInstance & {
            props?: Props;
        };
        /* istanbul ignore next */
        if (!('props' in propsComponent) || !propsComponent.props) return false;

        const props = propsComponent.props;
        /* istanbul ignore next */
        if (!props.__config) return false;
        const propsConfig: {
            reflect: PropConfigObject | void;
            priv: PropConfigObject | void;
        } = props.__config;

        const joined: PropConfigObject = {
            ...propsConfig.reflect,
            ...propsConfig.priv,
        };
        const propConfig = (() => {
            if (name in joined) {
                return getDefinePropConfig(joined[name]);
            }
            const casingName = dashesToCasing(name);
            if (casingName in joined) {
                return getDefinePropConfig(joined[casingName]);
            }
            return null;
        })();
        if (propConfig === null) return false;

        return propConfig.type instanceof ComplexTypeClass;
    }

    handleAttributeExpressions(
        element: Element,
        name: string,
        strings: string[]
    ): PartLike[] | ReadonlyArray<PartLike> {
        const prefix = name[0];
        if (prefix === '@' || name.startsWith('on-')) {
            if (name[1] === '@' || name.startsWith('on--')) {
                return [
                    new this._componentEventPart(
                        element,
                        name[1] === '@'
                            ? name.slice(2)
                            : name.slice('on--'.length),
                        this.component
                    ),
                ];
            } else {
                //Listeners
                return [
                    new this._config.EventPart(
                        element,
                        prefix === '@'
                            ? name.slice(1)
                            : name.slice('on-'.length),
                        this.component
                    ),
                ];
            }
        } else if (prefix === '.') {
            //Properties
            return [
                new this._config.PropertyPart(
                    element,
                    name.slice(1),
                    strings
                ),
            ];
        } else if (prefix === '?') {
            //Booleans
            return [
                new this._config.BooleanAttributePart(
                    element,
                    name.slice(1),
                    strings
                ),
            ];
        } else if (name === 'class') {
            //Classname attribute
            return [
                new ClassAttributePart(element, name, strings, this._config),
            ];
        } else if (name === 'style') {
            //Style attribute
            return [
                new StyleAttributePart(element, name, strings, this._config),
            ];
        } else if (
            prefix === '#' ||
            name === CUSTOM_CSS_PROP_NAME ||
            this._isComplexAttribute(element, name)
        ) {
            //Objects, functions, templates, arrays
            if (prefix === '#') {
                name = name.slice(1);
            }
            return [
                new ComplexValuePart(
                    element,
                    name,
                    strings,
                    this.genRef,
                    this._config
                ),
            ];
        }
        const committer = new this._config.AttributeCommitter(
            element,
            name,
            strings
        );
        return committer.parts;
    }

    /* istanbul ignore next */
    handleTextExpression(options: RenderOptions) {
        return new this._config.NodePart(options) as NodePart;
    }
}

declare class PartLike {
    constructor(...args: any[]);

    value: unknown;
    setValue(value: unknown): void;
    commit(): void;
}

declare class CommitterLike {
    constructor(...args: any[]);

    readonly parts: ReadonlyArray<PartLike>;
    commit(): void;
}

/**
 * An interface which functions should
 * be implemented by the template-result that
 * lit-html should return.
 */
export interface TemplateResultLike {
    getHTML(): string;
    getTemplateElement(): HTMLTemplateElement;
}

/**
 * A config object containing
 * the required lit-html constructs
 * 
 * All values can be imported by calling
 * ```js
 import { 
	    TemplateResult, PropertyCommitter, PropertyPart, EventPart, 
	    BooleanAttributePart, AttributeCommitter, NodePart, 
	    isDirective, noChange 
}
 ```
 */
export interface LitHTMLConfig {
    /**
	 * can be imported by calling
	 ```js
	 import { TemplateResult } from 'lit-html'
	 ```
	 */
    TemplateResult: Constructor<TemplateResultLike>;
    /**
	 * can be imported by calling
	 ```js
	 import { PropertyCommitter } from 'lit-html'
	 ```
	 */
    PropertyCommitter: typeof CommitterLike;
    /**
	 * can be imported by calling
	 ```js
	 import { PropertyPart } from 'lit-html'
	 ```
	 */
    PropertyPart: typeof PartLike;
    /**
	 * can be imported by calling
	 ```js
	 import { EventPart } from 'lit-html'
	 ```
	 */
    EventPart: typeof PartLike;
    /**
	 * can be imported by calling
	 ```js
	 import { BooleanAttributePart } from 'lit-html'
	 ```
	 */
    BooleanAttributePart: typeof PartLike;
    /**
	 * can be imported by calling
	 ```js
	 import { AttributeCommitter } from 'lit-html'
	 ```
	 */
    AttributeCommitter: typeof CommitterLike;
    /**
	 * can be imported by calling
	 ```js
	 import { NodePart } from 'lit-html'
	 ```
	 */
    NodePart: typeof PartLike;
    /**
	 * can be imported by calling
	 ```js
	 import { isDirective } from 'lit-html'
	 ```
	 */
    isDirective: (value: any) => boolean;
    /**
	 * can be imported by calling
	 ```js
	 import { isDirective } from 'lit-html'
	 ```
	 */
    directive: <F extends (...args: any[]) => object>(f: F) => F;
    /**
	 * can be imported by calling
	 ```js
	 import { noChange } from 'lit-html'
	 ```
	 */
    noChange: any;
}

type RetVal<F> = F extends (...args: any[]) => infer R ? R : void;

export class TemplateClass {
    public reffed: ComplexValue[] = [];
    private _templateProcessor: ComplexTemplateProcessor | null = null;
    public get templateProcessor(): ComplexTemplateProcessor {
        if (this._templateProcessor !== null) {
            return this._templateProcessor;
        }
        return (this._templateProcessor = new ComplexTemplateProcessor(
            this._self,
            this.genRef,
            TemplateClass._templateSettings!
        ));
    }

    public static _templateSettings: LitHTMLConfig | null = null;

    public static get templateResult(): Constructor<TemplateResultLike> {
        if (!this._templateSettings) {
            console.warn(
                'Missing templater, please initialize it ' +
                    'by calling ' +
                    'WebComponentTemplateManager.initComplexTemplateProvider({' +
                    '	TemplateResult: {{lit-html.TemplateResult}}' +
                    '	PropertyCommitter: {{lit-html.PropertyCommitter}}' +
                    '   PropertyPart: {{lit-html.PropertyPart}}' +
                    '	EventPart: {{lit-html.EventPart}}' +
                    '	BooleanAttributePart: {{lit-html.BooleanAttributePart}}' +
                    '	AttributeCommitter: {{lit-html.AttributeCommitter}}' +
                    '	NodePart: {{lit-html.TemplateResult}}' +
                    '	isDirective: {{lit-html.isDirective}}' +
                    '	noChange: {{lit-html.noChange}}' +
                    '	directive: {{lit-html.directive}}' +
                    '})'
            );
            return class X {} as any;
        }
        return this._templateSettings.TemplateResult;
    }

    constructor(private _self: WebComponentTemplateManagerMixinInstance) {}

    @bindToClass
    public genRef(value: ComplexValue) {
        if (this.reffed.indexOf(value) !== -1) {
            return `${refPrefix}${this.reffed.indexOf(value)}`;
        }

        this.reffed.push(value);
        const refIndex = this.reffed.length - 1;
        return `${refPrefix}${refIndex}`;
    }
}

export type ComplexValue = TemplateFnLike | Function | Object;

/**
 * An instance of the template manager mixin's resulting class
 */
export type WebComponentTemplateManagerMixinInstance = InferInstance<
    WebComponentTemplateManagerMixinClass
> & {
    self: WebComponentTemplateManagerMixinClass;
};

/**
 * The template manager mixin's resulting class
 */
export type WebComponentTemplateManagerMixinClass = InferReturn<
    typeof WebComponentTemplateManagerMixin
>;

/**
 * The parent/super type required by the template manager mixin
 */
export type WebComponentTemplateManagerMixinSuper = Constructor<
    HTMLElement &
        Pick<WebComponentHierarchyManagerMixinInstance, 'getParent'> &
        Partial<
            Pick<
                WebComponentListenableMixinInstance,
                'listen' | 'clearListener'
            >
        >
>;

/**
 * A standalone instance of the template manager class
 */
export declare class WebComponentTemplateManagerTypeInstance {
    /**
		 * Generate an HTML template based on the passed template literal.
		 * This will throw an error if 
		 * `WebComponentTemplateManager.initComplexTemplateProvider` has
		 * not been called. If you do not wish to use the passed complex
		 * template provider, ignore the first argument to the 
		 * `TemplateFn's` render function and use a custom templater.
		 * 
		 * Can be called with 
	```js
	WebComponentTemplateManager.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, PropertyPart, EventPart,BooleanAttributePart, AttributeCommitter, NodePart, isDirective, noChange
	});
	```
		* 
		* @param {TemplateStringsArray} strings - The strings of the 
		* 	template literal
		* @param {any[]} values - The values of the template literal
		* 
		* @returns {TemplateResultLike} A result that, when passed
		* 	to the renderer, renders the template to DOM
		*/
    public generateHTMLTemplate(
        strings: TemplateStringsArray,
        ...values: any[]
    ): TemplateResultLike;

    /**
     * Initializes a complex template provider. This allows
     * for the special properties seen in `WebComponentTemplateManager's`
     * documentation. If this is not configured, the first
     * parameter to the `TemplateFn` render function will
     * throw an error instead. When not configuring this,
     * you should ignore the first argument to the
     * `TemplateFn's` render function and instead use a
     * custom templater
     *
     * @param {LitHTMLConfig} config - A config object containing
     * 	the required lit-html constructs
     */
    public static initComplexTemplateProvider(config: LitHTMLConfig): void;

    /**
     * Gets the value of a reference to a value.
     *
     * When a complex value is passed, a "global"
     * reference is stored and indexed. Instead
     * a string containing that index is passed.
     * This function "decodes" that string and
     * retrieves the globally stored value
     *
     * @param {string} ref - The reference's index
     * 	along with the ref prefix (`___complex_ref`)
     *
     * @returns {ComplexValue} The complex value
     * 	that is being referenced to by `ref`
     */
    public getRef(ref: string): ComplexValue;

    /**
     * Gets the parent of this component and attempts
     * to resolve the reference
     *
     * @param {string} ref - The reference's index
     * 	along with the ref prefix (`___complex_ref`)
     *
     * @returns {ComplexValue} The complex value
     * 	that is being referenced to by `ref`
     */
    public getParentRef(ref: string): ComplexValue;

    /**
     * Creates a reference to given value
     *
     * @param {ComplexValue} value - The value that should be referenced
     *
     * @returns {string} An string that represents
     * 	a reference to the passed value
     */
    public genRef(value: ComplexValue): string;
}

/**
 * The static values of the template manager class
 */
export type WebComponentTemplateManagerTypeStatic = ClassToObj<
    typeof WebComponentTemplateManagerTypeInstance
>;

/**
 * A mixin that, when applied, adds the `generateHTMLTemplate`
 * method that can generate complex template literal HTML
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export const WebComponentTemplateManagerMixin = <
    P extends WebComponentTemplateManagerMixinSuper
>(
    superFn: P
) => {
    const privateMap: WeakMap<
        WebComponentTemplateManager,
        TemplateClass
    > = new WeakMap();
    function templateClass(self: WebComponentTemplateManager): TemplateClass {
        if (privateMap.has(self)) return privateMap.get(self)!;
        return privateMap.set(self, new TemplateClass(self as any)).get(self)!;
    }

    /**
     * The class that is responsible for providing the
     * `html` property of the `TemplateFn's` function call.
     * This allows for complex values to be passed and for
     * event listeners, objects/arrays and more to be bound
     * to the component. See below for examples
     *
     * **Examples:**
     *
     * * `<div @click="${this.someFunc}">` or
     * * `<div on-click="${this.someFunc}">` Will call
     * 	`this.someFunc` when the `click` event is fired
     * * `<my-element @@customevent="${this.someFunc}">` or
     * * `<my-element on--customevent="${this.someFunc}">` will call
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
    class WebComponentTemplateManager
        extends superFn
        implements WebComponentTemplateManagerTypeInstance {
        @bindToClass
        public generateHTMLTemplate(
            strings: TemplateStringsArray,
            ...values: any[]
        ): TemplateResultLike {
            return new TemplateClass.templateResult(
                strings,
                values,
                'html',
                templateClass(this).templateProcessor
            );
        }

        public static initComplexTemplateProvider(config: LitHTMLConfig) {
            TemplateClass._templateSettings = config;
        }

        public getRef(ref: string): ComplexValue {
            if (typeof ref !== 'string') {
                console.warn('Invalid ref', ref, 'on', this);
                return (undefined as unknown) as ComplexValue;
            }
            const refNumber = ~~ref.split(refPrefix)[1];
            return templateClass(this).reffed[refNumber];
        }

        public getParentRef(ref: string): ComplexValue {
            const parent = this.getParent<WebComponentTemplateManager>();
            if (!parent) {
                console.warn(
                    'Could not find parent of',
                    this,
                    'and because of that could not find ref with id',
                    ref
                );
                return (undefined as unknown) as ComplexValue;
            }
            return parent.getRef(ref);
        }

        public genRef(value: ComplexValue): string {
            return templateClass(this).genRef(value);
        }
    }

    const __typecheck__: WebComponentTemplateManagerTypeStatic = WebComponentTemplateManager;
    __typecheck__;

    return WebComponentTemplateManager;
};

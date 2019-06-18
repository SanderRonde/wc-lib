import { WebComponentHierarchyManagerMixinInstance } from './hierarchy-manager.js';
import { bindToClass, TemplateFn, CHANGE_TYPE, TemplateFnLike } from './base.js';
import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { TemplateProcessor, EventPart, Part, NodePart } from 'lit-html';
import { WebComponentListenableMixinInstance } from './listener.js';
import { RenderOptions } from 'lit-html/lib/render-options';
import { classNames, ClassNamesArg } from './shared.js';
import { refPrefix } from './props.js';

/**
 * The property name for custom-css
 * 
 * @constant
 */
export const CUSTOM_CSS_PROP_NAME = 'custom-css';

class ClassAttributePart implements Part {
	public value: any = undefined;
	private _pendingValue: any = undefined;

	constructor(public element: Element, public name: string, public strings: string[],
		private _config: LitHTMLConfig) {}

	private _isPrimitive(value: any): boolean {
		return (
			value === null ||
			!(typeof value === 'object' || typeof value === 'function'));
	}

	setValue(value: any): void {
		/* istanbul ignore else */
		if (value !== this._config.noChange && (!this._isPrimitive(value) || value !== this.value)) {
			this._pendingValue = value;
		}
	}

	private _getClassNameString(args: ClassNamesArg|ClassNamesArg[]) {
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
		if (typeof this._pendingValue === 'string' || typeof this._pendingValue === 'number') {
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

class ComplexValuePart implements Part {
	public value: any = undefined;
	private _pendingValue: any = undefined;

	constructor(public element: Element, public name: string, public strings: string[],
		public genRef: (value: ComplexValue) => string,
		private _config: LitHTMLConfig) {}

	setValue(value: any): void {
		if (value !== this._config.noChange && value !== this.value) {
			this._pendingValue = value;
		}
	}

	private static __isTemplate(value: any): value is TemplateFn {
		if (!value) return false;
		if (typeof value.changeOn !== 'number' ||
			typeof value.renderAsText !== 'function' ||
			typeof value.renderTemplate !== 'function' ||
			typeof value.renderSame !== 'function' ||
			typeof value.render !== 'function' ||
			typeof value.renderIfNew !== 'function') {
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
		if (this.name === CUSTOM_CSS_PROP_NAME && !ComplexValuePart.__isTemplate(this._pendingValue)) {
			console.warn('Attempting to use non TemplateFn value for custom-css property');
			this._pendingValue = new TemplateFn(null, CHANGE_TYPE.NEVER, null);
		}
		
		this.element.setAttribute(this.name, this.genRef(this._pendingValue));
		this.value = this._pendingValue;
		this._pendingValue = this._config.noChange;
	}
}

function getComponentEventPart(eventPart: typeof EventPart, config: LitHTMLConfig) {
	return class ComponentEventPart extends eventPart {
		element: WebComponentTemplateManagerMixinInstance|Element;
	
		constructor(element: WebComponentTemplateManagerMixinInstance|Element, eventName: string, 
			eventContext?: EventTarget) {
				super(element, eventName, eventContext);
				this.element = element;
				this.eventName = eventName;
				this.eventContext = eventContext;
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
			const shouldRemoveListener = newListener == null ||
				oldListener != null &&
					(newListener.capture !== oldListener.capture ||
					newListener.once !== oldListener.once ||
					newListener.passive !== oldListener.passive);
			const shouldAddListener =
				newListener != null && (oldListener == null || shouldRemoveListener);
		  
			if (!('listen' in this.element) || !('clearListener' in this.element)) {
				console.warn('Attempting to listen using webcomponent listener on non-webcomponent element',
					`Name: ${this.eventName}, element:`, this.element);
			}
			if (shouldRemoveListener && 'clearListener' in this.element &&
				this.element.clearListener) {
					this.element.clearListener(this.eventName);
				}
			if (shouldAddListener && 'listen' in this.element &&
				this.element.listen) {
					this.element.listen(this.eventName, this.handleEvent.bind(this));
				}
			this.value = newListener;
			this._pendingValue = config.noChange as any;
		}
	}
}

class ComplexTemplateProcessor implements TemplateProcessor {
	constructor(public component: WebComponentTemplateManagerMixinInstance,
		public genRef: (value: ComplexValue) => string,
		private _config: LitHTMLConfig) { }
	
	private __componentEventPart: RetVal<typeof getComponentEventPart>|null = null;
	private get _componentEventPart() {
		if (this.__componentEventPart !== null) {
			return this.__componentEventPart;
		}
		return (this.__componentEventPart = getComponentEventPart(
			this._config.EventPart as typeof EventPart, this._config));
	}

	handleAttributeExpressions(
		element: Element, name: string, strings: string[]): PartLike[] {
			const prefix = name[0];
			if (prefix === '@') {
				if (name[1] === '@') {
					return [new this._componentEventPart(element, name.slice(2), this.component)];
				} else {
					//Listeners
					return [new this._config.EventPart(element, name.slice(1), this.component)];
				}
			} else if (prefix === '?') {
				//Booleans
				return [new this._config.BooleanAttributePart(element, name.slice(1), strings)];
			} else if (name === 'class') {
				//Classname attribute
				return [new ClassAttributePart(element, name, strings, this._config)];
			} else if (prefix === '#' || name === CUSTOM_CSS_PROP_NAME) {
				//Objects, functions, templates, arrays
				if (prefix === '#') {
					name = name.slice(1);
				}
				return [new ComplexValuePart(element, name, strings, this.genRef,
					this._config)];
			}
			const committer = new this._config.AttributeCommitter(element, name, strings);
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

declare class CommiterLike {
	constructor(...args: any[]);
	
	parts: PartLike[];
	commit(): void;
}

export declare class TemplateResultLike {
	constructor(...args: any[]);

	getHTML(): string
	getTemplateElement(): HTMLTemplateElement;
}

/**
 * A config object containing
 * the required lit-html constructs
 * 
 * All values can be imported by calling
 * ```js
 import { TemplateResult, PropertyCommitter, EventPart, BooleanAttributePart, AttributeCommitter, NodePart, isDirective, noChange }
 ```
 */
export interface LitHTMLConfig {
	/**
	 * can be imported by calling
	 * ```js
	 import { TemplateResult } from 'lit-html'```
	 */
	TemplateResult: typeof TemplateResultLike;
	/**
	 * can be imported by calling
	 * ```js
	 import { PropertyCommitter } from 'lit-html'```
	 */
	PropertyCommitter: typeof CommiterLike;
	/**
	 * can be imported by calling
	 * ```js
	 import { EventPart } from 'lit-html'```
	 */
	EventPart: typeof PartLike;
	/**
	 * can be imported by calling
	 * ```js
	 import { BooleanAttributePart } from 'lit-html'```
	 */
	BooleanAttributePart: typeof PartLike;
	/**
	 * can be imported by calling
	 * ```js
	 import { AttributeCommitter } from 'lit-html'```
	 */
	AttributeCommitter: typeof CommiterLike;
	/**
	 * can be imported by calling
	 * ```js
	 import { NodePart } from 'lit-html'```
	 */
	NodePart: typeof PartLike;

	/**
	 * can be imported by calling
	 * ```js
	 import { isDirective } from 'lit-html'```
	 */
	isDirective: (value: any) => boolean;
	/**
	 * can be imported by calling
	 * ```js
	 import { noChange } from 'lit-html'```
	 */
	noChange: any;
	
}

type RetVal<F> = F extends (...args: any[]) => infer R ? R : void;

class TemplateClass {
	public reffed: ComplexValue[] = [];
	private _templateProcessor: ComplexTemplateProcessor|null = null;
	public get templateProcessor(): ComplexTemplateProcessor {
		if (this._templateProcessor !== null) {
			return this._templateProcessor;
		}
		return (this._templateProcessor = new ComplexTemplateProcessor(this._self, this.genRef,
			TemplateClass._templateSettings!));
	};

	public static _templateSettings: LitHTMLConfig|null = null;

	public static get templateResult(): typeof TemplateResultLike {
		if (!this._templateSettings) {
			console.warn('Missing templater, please initialize it ' +
				'by calling ' +
				'WebComponentTemplateManager.initComplexTemplateProvider({' + 
				'	TemplateResult: {{lit-html.TemplateResult}}' +
				'	PropertyCommitter: {{lit-html.PropertyCommitter}}' +
				'	EventPart: {{lit-html.EventPart}}' +
				'	BooleanAttributePart: {{lit-html.BooleanAttributePart}}' +
				'	AttributeCommitter: {{lit-html.AttributeCommitter}}' +
				'	NodePart: {{lit-html.TemplateResult}}' +
				'	isDirective: {{lit-html.isDirective}}' +
				'	noChange: {{lit-html.noChange}}' +
				'})');
			return class X {} as any;
		}
		return this._templateSettings.TemplateResult;
	}

	constructor(private _self: WebComponentTemplateManagerMixinInstance) { }

	@bindToClass
	public genRef(value: ComplexValue) {
		if (this.reffed.indexOf(value) !== -1) {
			return `${refPrefix}${
				this.reffed.indexOf(value)}`;
		}

		this.reffed.push(value);
		const refIndex = this.reffed.length - 1;
		return `${refPrefix}${refIndex}`;
	}
}

type ComplexValue = TemplateFnLike|Function|Object;

export type WebComponentTemplateManagerMixinInstance = InferInstance<WebComponentTemplateManagerMixinClass> & {
	self: WebComponentTemplateManagerMixinClass;
};
export type WebComponentTemplateManagerMixinClass = InferReturn<typeof WebComponentTemplateManagerMixin>;

export type WebComponentTemplateManagerMixinSuper = Constructor<HTMLElement &
	Pick<WebComponentHierarchyManagerMixinInstance, 'getParent'> & 
	Partial<Pick<WebComponentListenableMixinInstance, 'listen'|'clearListener'>>>;

/**
 * A mixin that, when applied, adds the `generateHTMLTemplate`
 * method that can generate complex template literal HTML
 */
export const WebComponentTemplateManagerMixin = <P extends WebComponentTemplateManagerMixinSuper>(superFn: P) => {
	const privateMap: WeakMap<WebComponentTemplateManager, TemplateClass> = new WeakMap();
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
	class WebComponentTemplateManager extends superFn {
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
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart, AttributeCommitter, NodePart, isDirective, noChange
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
		@bindToClass
		public generateHTMLTemplate(strings: TemplateStringsArray, ...values: any[]): TemplateResultLike {
			return new TemplateClass.templateResult(strings, values, 'html', templateClass(this).templateProcessor);
		}

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
		public static initComplexTemplateProvider(config: LitHTMLConfig) {
			TemplateClass._templateSettings = config;
		}

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
		public getRef(ref: string): ComplexValue {
			if (typeof ref !== 'string') {
				console.warn('Invalid ref', ref, 'on', this);
				return undefined as unknown as ComplexValue;
			}
			const refNumber = ~~ref.split(refPrefix)[1];
			return templateClass(this).reffed[refNumber];
		}

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
		public getParentRef(ref: string): ComplexValue {
			const parent = this.getParent<WebComponentTemplateManager>();
			if (!parent) {
				console.warn('Could not find parent of', this, 
					'and because of that could not find ref with id', ref);
				return undefined as unknown as ComplexValue;
			}
			return parent.getRef(ref);
		}
	}
	return WebComponentTemplateManager;
}
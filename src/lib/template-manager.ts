import { TemplateProcessor, EventPart, Part, NodePart } from 'lit-html';
import { TemplateFn, CHANGE_TYPE, bindToClass } from './base';
import { RenderOptions } from 'lit-html/lib/render-options';
import { WebComponentThemeManger } from './theme-manager';
import { WebComponentI18NManager } from './i18n-manager';
import { classNames, ClassNamesArg } from './shared';
import { EventListenerObj } from './listener';
import { refPrefix } from './props';

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

	commit() {
		while (this._config.isDirective(this._pendingValue)) {
			const directive = this._pendingValue;
			this._pendingValue = this._config.noChange;
			directive(this);
		}
		if (this._pendingValue === this._config.noChange) {
			return;
		}
		if (this.name === CUSTOM_CSS_PROP_NAME && !(this._pendingValue instanceof TemplateFn)) {
			console.warn('Attempting to use non TemplateFn value for custom-css property');
			this._pendingValue = new TemplateFn(null, CHANGE_TYPE.NEVER);
		}
		
		this.element.setAttribute(this.name, this.genRef(this._pendingValue));
		this.value = this._pendingValue;
		this._pendingValue = this._config.noChange;
	}
}

function getComponentEventPart(eventPart: typeof EventPart, config: LitHTMLConfig) {
	return class ComponentEventPart extends eventPart {
		element: WebComponentThemeManger<any>|Element;
	
		constructor(element: WebComponentThemeManger<any>|Element, eventName: string, 
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
		  
			if (!(this.element instanceof WebComponentThemeManger)) {
				console.warn('Attempting to listen using webcomponent listener on non-webcomponent element',
					`Name: ${this.eventName}, element:`, this.element);
			}
			if (shouldRemoveListener) {
				(<WebComponentThemeManger<any>>this.element)
					.clearListener(this.eventName);
			}
			if (shouldAddListener) {
				(<WebComponentThemeManger<any>>this.element)
					.listen(this.eventName, this.handleEvent.bind(this));
			}
			this.value = newListener;
			this._pendingValue = config.noChange as any;
		}
	}
}

class ComplexTemplateProcessor implements TemplateProcessor {
	constructor(public component: WebComponentTemplateManager<any>,
		public genRef: (value: ComplexValue) => string,
		private _config: LitHTMLConfig) { }
	
	private __componentEventPart: RetVal<typeof getComponentEventPart>;
	private get _componentEventPart() {
		if (this.__componentEventPart) {
			return this.__componentEventPart;
		}
		return (this.__componentEventPart = getComponentEventPart(
			this._config.EventPart as typeof EventPart, this._config));
	}

	handleAttributeExpressions(
		element: Element, name: string, strings: string[]): PartLike[] {
			const prefix = name[0];
			if (prefix === '.') {
				//Property
				const comitter = new this._config.PropertyCommitter(element, name.slice(1), strings);
      			return comitter.parts;
			} else if (prefix === '@') {
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

declare class TemplateResultLike {
	constructor(...args: any[]);

	getHTML(): string
	getTemplateElement(): HTMLTemplateElement;
}

interface LitHTMLConfig {
	TemplateResult: typeof TemplateResultLike;
	PropertyCommitter: typeof CommiterLike;
	EventPart: typeof PartLike;
	BooleanAttributePart: typeof PartLike;
	AttributeCommitter: typeof CommiterLike;
	NodePart: typeof PartLike;

	isDirective: (value: any) => boolean;
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
			TemplateClass._templateSettings));
	};

	public static _templateSettings: LitHTMLConfig|null = null;

	public static get templateResult(): typeof TemplateResultLike {
		if (!this._templateSettings) {
			console.warn('Missing templater, please initialize it ' +
				'by calling ' +
				'WebComponentTemplateManager.initComplexTemplateProvider({' + 
				'	//TODO:' +
				'})');
			return class X {} as any;
		}
		return this._templateSettings.TemplateResult;
	}

	constructor(private _self: WebComponentTemplateManager<any>) { }

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

type ComplexValue = TemplateFn<any, any, any>|Function|Object;
export abstract class WebComponentTemplateManager<E extends EventListenerObj> extends WebComponentI18NManager<E> {
	private ___templateClass: TemplateClass = new TemplateClass(this);
	
	@bindToClass
	public generateHTMLTemplate(strings: TemplateStringsArray, ...values: any[]): TemplateResultLike {
		return new TemplateClass.templateResult(strings, values, 'html', this.___templateClass.templateProcessor);
	}

	public initComplexTemplateProvider(config: LitHTMLConfig) {
		TemplateClass._templateSettings = config;
	}

	public getRef(ref: string) {
		if (typeof ref !== 'string') {
			return undefined;
		}
		const refNumber = ~~ref.split(refPrefix)[1];
		return this.___templateClass.reffed[refNumber];
	}

	public getParentRef(ref: string) {
		const parent = this.___hierarchyClass.__getParent<WebComponentTemplateManager<any>>();
		if (!parent) {
			console.warn('Could not find parent of', this, 
				'and because of that could not find ref with id', ref);
			return undefined;
		}
		return parent.getRef(ref);
	}
}
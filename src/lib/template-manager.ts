import { 
	TemplateResult, isDirective, Part, NodePart, TemplateProcessor, 
	AttributeCommitter, PropertyCommitter, EventPart, BooleanAttributePart, 
	isPrimitive, noChange 
} from 'lit-html';
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

	constructor(public element: Element, public name: string, public strings: string[]) {}

	setValue(value: any): void {
		if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
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
		while (isDirective(this._pendingValue)) {
			const directive = this._pendingValue;
			this._pendingValue = noChange;
			directive(this);
		}
		if (this._pendingValue === noChange) {
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
		this._pendingValue = noChange;
	}
}

class ComplexValuePart implements Part {
	public value: any = undefined;
	private _pendingValue: any = undefined;

	constructor(public element: Element, public name: string, public strings: string[],
		public genRef: (value: ComplexValue) => string) {}

	setValue(value: any): void {
		if (value !== noChange && value !== this.value) {
			this._pendingValue = value;
		}
	}

	commit() {
		while (isDirective(this._pendingValue)) {
			const directive = this._pendingValue;
			this._pendingValue = noChange;
			directive(this);
		}
		if (this._pendingValue === noChange) {
			return;
		}
		if (this.name === CUSTOM_CSS_PROP_NAME && !(this._pendingValue instanceof TemplateFn)) {
			console.warn('Attempting to use non TemplateFn value for custom-css property');
			this._pendingValue = new TemplateFn(null, CHANGE_TYPE.NEVER);
		}
		
		this.element.setAttribute(this.name, this.genRef(this._pendingValue));
		this.value = this._pendingValue;
		this._pendingValue = noChange;
	}
}

class ComponentEventPart extends EventPart {
	element: WebComponentThemeManger<any>|Element;

	constructor(element: WebComponentThemeManger<any>|Element, eventName: string, 
		eventContext?: EventTarget) {
			super(element, eventName, eventContext);
			this.element = element;
			this.eventName = eventName;
			this.eventContext = eventContext;
		}

	commit() {
		while (isDirective(this._pendingValue)) {
			const directive = this._pendingValue;
			this._pendingValue = noChange as any;
			directive(this);
		}
		if (this._pendingValue === noChange) {
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
		this._pendingValue = noChange as any;
	}
}

class ComplexTemplateProcessor implements TemplateProcessor {
	constructor(public component: WebComponentTemplateManager<any>,
		public genRef: (value: ComplexValue) => string) { }

	handleAttributeExpressions(
		element: Element, name: string, strings: string[]): Part[] {
			const prefix = name[0];
			if (prefix === '.') {
				//Property
				const comitter = new PropertyCommitter(element, name.slice(1), strings);
      			return comitter.parts;
			} else if (prefix === '@') {
				if (name[1] === '@') {
					return [new ComponentEventPart(element, name.slice(2), this.component)];
				} else {
					//Listeners
					return [new EventPart(element, name.slice(1), this.component)];
				}
			} else if (prefix === '?') {
				//Booleans
				return [new BooleanAttributePart(element, name.slice(1), strings)];
			} else if (name === 'class') {
				//Classname attribute
				return [new ClassAttributePart(element, name, strings)];
			} else if (prefix === '#' || name === CUSTOM_CSS_PROP_NAME) {
				//Objects, functions, templates, arrays
				if (prefix === '#') {
					name = name.slice(1);
				}
				return [new ComplexValuePart(element, name, strings, this.genRef)];
			}
			const committer = new AttributeCommitter(element, name, strings);
			return committer.parts;
		}

	handleTextExpression(options: RenderOptions) {
		return new NodePart(options);
	}
}

class TemplateClass {
	public reffed: ComplexValue[] = [];
	public templateProcessor: ComplexTemplateProcessor = new ComplexTemplateProcessor(this._self, this.genRef);

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
	public generateHTMLTemplate(strings: TemplateStringsArray, ...values: any[]): TemplateResult {
		return new TemplateResult(strings, values, 'html', this.___templateClass.templateProcessor);
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
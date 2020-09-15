var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { refPrefix, getDefinePropConfig, ComplexTypeClass, } from './props.js';
import { TemplateFn } from './template-fn.js';
import { bindToClass, CUSTOM_CSS_PROP_NAME } from './base.js';
import { classNames } from './shared.js';
class ClassAttributePart {
    constructor(element, name, strings, _config) {
        this.element = element;
        this.name = name;
        this.strings = strings;
        this._config = _config;
        this.value = undefined;
        this._pendingValue = undefined;
    }
    _isPrimitive(value) {
        return (value === null ||
            !(typeof value === 'object' || typeof value === 'function'));
    }
    setValue(value) {
        /* istanbul ignore else */
        if (value !== this._config.noChange &&
            (!this._isPrimitive(value) || value !== this.value)) {
            this._pendingValue = value;
        }
    }
    _getClassNameString(args) {
        if (Array.isArray(args)) {
            return classNames(...args);
        }
        else {
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
        if (typeof this._pendingValue === 'string' ||
            typeof this._pendingValue === 'number') {
            //Equality has already been checked, set value
            this.value = this._pendingValue + '';
            this.element.setAttribute(this.name, this._pendingValue + '');
        }
        else {
            const classString = this._getClassNameString(this._pendingValue);
            this.element.setAttribute(this.name, classString);
        }
        this._pendingValue = this._config.noChange;
    }
}
export class StyleAttributePart {
    constructor(element, name, strings, _config) {
        this.element = element;
        this.name = name;
        this.strings = strings;
        this._config = _config;
        this.value = undefined;
        this._pendingValue = undefined;
    }
    _isPrimitive(value) {
        return (value === null ||
            !(typeof value === 'object' || typeof value === 'function'));
    }
    setValue(value) {
        /* istanbul ignore else */
        if (value !== this._config.noChange &&
            (!this._isPrimitive(value) || value !== this.value)) {
            this._pendingValue = value;
        }
    }
    static _toDashes(camelCase) {
        return camelCase
            .replace(/([a-z\d])([A-Z])/g, '$1-$2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1-$2')
            .toLowerCase();
    }
    static getStyleString(args) {
        const arr = [];
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
        if (typeof this._pendingValue === 'string' ||
            typeof this._pendingValue === 'number') {
            //Equality has already been checked, set value
            this.value = this._pendingValue + '';
            this.element.setAttribute(this.name, this._pendingValue + '');
        }
        else {
            const styleString = StyleAttributePart.getStyleString(this._pendingValue);
            this.element.setAttribute(this.name, styleString);
        }
        this._pendingValue = this._config.noChange;
    }
}
class ComplexValuePart {
    constructor(element, name, strings, genRef, _config) {
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.genRef = genRef;
        this._config = _config;
        this.value = undefined;
        this._pendingValue = undefined;
    }
    setValue(value) {
        if (value !== this._config.noChange && value !== this.value) {
            this._pendingValue = value;
        }
    }
    static __isTemplate(value) {
        if (!value)
            return false;
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
        if (this.name === CUSTOM_CSS_PROP_NAME &&
            !ComplexValuePart.__isTemplate(this._pendingValue)) {
            console.warn('Attempting to use non TemplateFn value for custom-css property');
            this._pendingValue = new TemplateFn(null, 0 /* NEVER */, null);
        }
        // Try and JSON parse it
        try {
            JSON.parse(this._pendingValue);
            this.element.setAttribute(this.name, this._pendingValue);
        }
        catch (e) {
            this.element.setAttribute(this.name, this.genRef(this._pendingValue));
        }
        this.value = this._pendingValue;
        this._pendingValue = this._config.noChange;
    }
}
function getComponentEventPart(eventPart, config) {
    return class ComponentEventPart extends eventPart {
        constructor(element, eventName, eventContext) {
            super(element, eventName, eventContext);
            this._pendingValue = undefined;
            this.element = element;
            this.eventName = eventName;
            this.eventContext = eventContext;
        }
        setValue(value) {
            this._pendingValue = value;
        }
        commit() {
            while (config.isDirective(this._pendingValue)) {
                const directive = this._pendingValue;
                this._pendingValue = config.noChange;
                directive(this);
            }
            /* istanbul ignore if */
            if (this._pendingValue === config.noChange) {
                return;
            }
            const newListener = this._pendingValue;
            const oldListener = this.value;
            const shouldRemoveListener = newListener == null ||
                (oldListener != null &&
                    (newListener.capture !== oldListener.capture ||
                        newListener.once !== oldListener.once ||
                        newListener.passive !== oldListener.passive));
            const shouldAddListener = newListener != null &&
                (oldListener == null || shouldRemoveListener);
            if (!('listen' in this.element) ||
                !('clearListener' in this.element)) {
                console.warn('Attempting to listen using webcomponent listener on non-webcomponent element', `Name: ${this.eventName}, element:`, this.element);
            }
            if (shouldRemoveListener &&
                'clearListener' in this.element &&
                this.element.clearListener) {
                this.element.clearListener(this.eventName);
            }
            if (shouldAddListener &&
                'listen' in this.element &&
                this.element.listen) {
                this.element.listen(this.eventName, this.handleEvent.bind(this));
            }
            this.value = newListener;
            this._pendingValue = config.noChange;
        }
        handleEvent(...args) {
            if (typeof this.value === 'function') {
                return this.value.call(this.eventContext, ...args);
            }
            else {
                return this.value.handleEvent(...args);
            }
        }
    };
}
class ComplexTemplateProcessor {
    constructor(component, genRef, _config) {
        this.component = component;
        this.genRef = genRef;
        this._config = _config;
        this.__componentEventPart = null;
    }
    get _componentEventPart() {
        if (this.__componentEventPart !== null) {
            return this.__componentEventPart;
        }
        return (this.__componentEventPart = getComponentEventPart(this._config.EventPart, this._config));
    }
    _isComplexAttribute(element, name) {
        const propsComponent = element;
        /* istanbul ignore next */
        if (!('props' in propsComponent) || !propsComponent.props)
            return false;
        const props = propsComponent.props;
        /* istanbul ignore next */
        if (!props.__config)
            return false;
        const propsConfig = props.__config;
        const joined = Object.assign(Object.assign({}, propsConfig.reflect), propsConfig.priv);
        if (!(name in joined))
            return false;
        const propConfig = getDefinePropConfig(joined[name]);
        return propConfig.type instanceof ComplexTypeClass;
    }
    handleAttributeExpressions(element, name, strings) {
        const prefix = name[0];
        if (prefix === '@' || name.startsWith('on-')) {
            if (name[1] === '@' || name.startsWith('on--')) {
                return [
                    new this._componentEventPart(element, name[1] === '@'
                        ? name.slice(2)
                        : name.slice('on--'.length), this.component),
                ];
            }
            else {
                //Listeners
                return [
                    new this._config.EventPart(element, prefix === '@'
                        ? name.slice(1)
                        : name.slice('on-'.length), this.component),
                ];
            }
        }
        else if (prefix === '?') {
            //Booleans
            return [
                new this._config.BooleanAttributePart(element, name.slice(1), strings),
            ];
        }
        else if (name === 'class') {
            //Classname attribute
            return [
                new ClassAttributePart(element, name, strings, this._config),
            ];
        }
        else if (name === 'style') {
            //Style attribute
            return [
                new StyleAttributePart(element, name, strings, this._config),
            ];
        }
        else if (prefix === '#' ||
            name === CUSTOM_CSS_PROP_NAME ||
            this._isComplexAttribute(element, name)) {
            //Objects, functions, templates, arrays
            if (prefix === '#') {
                name = name.slice(1);
            }
            return [
                new ComplexValuePart(element, name, strings, this.genRef, this._config),
            ];
        }
        const committer = new this._config.AttributeCommitter(element, name, strings);
        return committer.parts;
    }
    /* istanbul ignore next */
    handleTextExpression(options) {
        return new this._config.NodePart(options);
    }
}
export class TemplateClass {
    constructor(_self) {
        this._self = _self;
        this.reffed = [];
        this._templateProcessor = null;
    }
    get templateProcessor() {
        if (this._templateProcessor !== null) {
            return this._templateProcessor;
        }
        return (this._templateProcessor = new ComplexTemplateProcessor(this._self, this.genRef, TemplateClass._templateSettings));
    }
    static get templateResult() {
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
                '	directive: {{lit-html.directive}}' +
                '})');
            return class X {
            };
        }
        return this._templateSettings.TemplateResult;
    }
    genRef(value) {
        if (this.reffed.indexOf(value) !== -1) {
            return `${refPrefix}${this.reffed.indexOf(value)}`;
        }
        this.reffed.push(value);
        const refIndex = this.reffed.length - 1;
        return `${refPrefix}${refIndex}`;
    }
}
TemplateClass._templateSettings = null;
__decorate([
    bindToClass
], TemplateClass.prototype, "genRef", null);
/**
 * A mixin that, when applied, adds the `generateHTMLTemplate`
 * method that can generate complex template literal HTML
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export const WebComponentTemplateManagerMixin = (superFn) => {
    const privateMap = new WeakMap();
    function templateClass(self) {
        if (privateMap.has(self))
            return privateMap.get(self);
        return privateMap.set(self, new TemplateClass(self)).get(self);
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
    class WebComponentTemplateManager extends superFn {
        generateHTMLTemplate(strings, ...values) {
            return new TemplateClass.templateResult(strings, values, 'html', templateClass(this).templateProcessor);
        }
        static initComplexTemplateProvider(config) {
            TemplateClass._templateSettings = config;
        }
        getRef(ref) {
            if (typeof ref !== 'string') {
                console.warn('Invalid ref', ref, 'on', this);
                return undefined;
            }
            const refNumber = ~~ref.split(refPrefix)[1];
            return templateClass(this).reffed[refNumber];
        }
        getParentRef(ref) {
            const parent = this.getParent();
            if (!parent) {
                console.warn('Could not find parent of', this, 'and because of that could not find ref with id', ref);
                return undefined;
            }
            return parent.getRef(ref);
        }
        genRef(value) {
            return templateClass(this).genRef(value);
        }
    }
    __decorate([
        bindToClass
    ], WebComponentTemplateManager.prototype, "generateHTMLTemplate", null);
    const __typecheck__ = WebComponentTemplateManager;
    __typecheck__;
    return WebComponentTemplateManager;
};
//# sourceMappingURL=template-manager.js.map
import { Fragment, JSXDelayedExecutionCall, jsxToLiteral, } from './jsx-render.js';
import { CHANGE_TYPE } from './enums.js';
const changeTypes = new Set([1, 2, 4, 8, 16, 32]);
let lastChangeType = 64;
export function createUniqueChangeType() {
    const num = lastChangeType * 2;
    changeTypes.add(num);
    lastChangeType = num;
    return num;
}
/**
 * Maps templaters -> components -> functions -> results
 */
const templaterMap = new WeakMap();
/**
 * A template class that renders given template
 * when given change occurs using given renderer
 *
 * @template C - The base component
 * @template T - The theme object
 * @template R - The return value of the template function
 */
export class TemplateFn {
    constructor(_template, _changeOn, _renderer) {
        this._template = _template;
        this._changeOn = _changeOn;
        this._renderer = _renderer;
        this._lastRenderChanged = true;
    }
    get _changeOnAll() {
        return [...changeTypes.values()].reduce((prev, current) => {
            return prev | current;
        }, 0);
    }
    get changeOn() {
        if (this._changeOn === CHANGE_TYPE.ALWAYS) {
            // Generate a new "always"
            return this._changeOnAll;
        }
        return this._changeOn;
    }
    _renderWithTemplater(changeType, component, templater) {
        // If no object-like or function-like templater exists, use a random object
        // to prevent an invalid key error from being thrown and to prevent
        // sharing cache that should not be used
        if (!templater ||
            (typeof templater !== 'object' && typeof templater !== 'function')) {
            templater = component;
        }
        if (!templaterMap.has(templater)) {
            templaterMap.set(templater, new WeakMap());
        }
        const componentTemplateMap = templaterMap.get(templater);
        const jsxAddedTemplate = (typeof templater === 'function'
            ? templater.bind(component)
            : templater);
        jsxAddedTemplate.jsx = (tag, attrs, ...children) => {
            const jsxResult = jsxToLiteral(tag, attrs, ...children);
            if (jsxResult instanceof JSXDelayedExecutionCall)
                return jsxResult;
            const { strings, values } = jsxResult;
            return templater(strings, ...values);
        };
        jsxAddedTemplate.Fragment = jsxAddedTemplate.F = () => Fragment;
        if (!componentTemplateMap.has(component)) {
            componentTemplateMap.set(component, new WeakMap());
        }
        const templateMap = componentTemplateMap.get(component);
        if (this.changeOn === CHANGE_TYPE.NEVER) {
            //Never change, return the only render
            const cached = templateMap.get(this);
            if (cached && changeType !== CHANGE_TYPE.FORCE) {
                return {
                    changed: false,
                    rendered: cached,
                };
            }
            let rendered = this._template === null
                ? null
                : this._template.call(component, jsxAddedTemplate, ('getRenderArgs' in component &&
                    component.getRenderArgs
                    ? component.getRenderArgs(changeType)
                    : {}));
            if (rendered instanceof JSXDelayedExecutionCall) {
                // Collapse
                rendered = rendered.collapse(templater);
            }
            templateMap.set(this, rendered);
            return {
                changed: true,
                rendered: rendered,
            };
        }
        if (changeType === CHANGE_TYPE.ALWAYS) {
            changeType = this._changeOnAll;
        }
        if (this.changeOn & changeType || !templateMap.has(this)) {
            //Change, re-render
            let rendered = this._template.call(component, jsxAddedTemplate, ('getRenderArgs' in component && component.getRenderArgs
                ? component.getRenderArgs(changeType)
                : {}));
            if (rendered instanceof JSXDelayedExecutionCall) {
                // Collapse
                rendered = rendered.collapse(templater);
            }
            templateMap.set(this, rendered);
            return {
                changed: true,
                rendered: rendered,
            };
        }
        //No change, return what was last rendered
        return {
            changed: false,
            rendered: templateMap.get(this),
        };
    }
    static _textRenderer(strings, ...values) {
        const result = [strings[0]];
        for (let i = 0; i < values.length; i++) {
            result.push(values[i], strings[i + 1]);
        }
        return result.join('');
    }
    static _templateResultToText(result) {
        if (result === null || result === undefined)
            return '';
        if ((typeof HTMLElement !== 'undefined' &&
            result instanceof HTMLElement) ||
            (typeof Element !== 'undefined' && result instanceof Element)) {
            return `<${result.tagName.toLowerCase()} ${Array.from(result.attributes)
                .map((attr) => {
                return `${attr.name}="${attr.value}"`;
            })
                .join(' ')}>${result.innerHTML}</${result.tagName.toLowerCase()}>`;
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
     * @param {CHANGE_TYPE|number} changeType - The type of change that occurred
     * @param {C} component - The base component
     *
     * @returns {string} The rendered template as text
     */
    renderAsText(changeType, component) {
        const { changed, rendered } = this._renderWithTemplater(changeType, component, TemplateFn._textRenderer);
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
    renderTemplate(changeType, component) {
        const { changed, rendered } = this._renderWithTemplater(changeType, component, component.generateHTMLTemplate);
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
    renderSame(changeType, component, templater) {
        const { changed, rendered } = this._renderWithTemplater(changeType, component, templater);
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
    render(template, target) {
        if (template === null)
            return;
        if (template instanceof HTMLElement || template instanceof Element) {
            target.appendChild(template);
            return;
        }
        if (this._renderer) {
            this._renderer(template, target);
        }
        else {
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
    renderIfNew(template, target) {
        if (!this._lastRenderChanged)
            return;
        this.render(template, target);
    }
}
//# sourceMappingURL=template-fn.js.map
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TemplateFn } from './template-fn.js';
import { WCLibError } from './shared.js';
function define(name, component) {
    if (window.customElements.get(name)) {
        return;
    }
    window.customElements.define(name, component);
}
/**
 * A definer class that has some functions that
 * allow you to keep track of how many components
 * are defined etc.
 */
export class DefinerClass {
    constructor() {
        /**
         * Any internal properties that are only used by the framework
         */
        this.internals = {
            connectedHooks: [],
            postRenderHooks: []
        };
        /**
         * Whether this component is in development mode
         */
        this.isDevelopment = false;
    }
    /**
     * Listen for the component's loading to be finished and sets
     * isMounted and calls mounted. Should only be used by the library
     * itself
     *
     * @param {WebComponentMixinInstance} component - The component
     * @param {Promise<void>} isConstructed - A promise to wait for
     * before resolving
     *
     * @returns {Promise<void>} A promise
     */
    static listenForFinished(component, isConstructed) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.finished) {
                yield isConstructed;
                component.isMounted = true;
                component.mounted();
            }
            else {
                this.listeners.push({
                    component,
                    constructed: isConstructed
                });
            }
        });
    }
    /**
     * Sets development mode to true if it was set to true for this
     * component's definition
     */
    setDevMode(component) {
        this.isDevelopment = DefinerClass.devComponents.indexOf(component.tagName.toLowerCase()) > -1;
    }
    static __doSingleMount(component) {
        return new Promise((resolve) => {
            /* istanbul ignore next */
            const animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
            animationFrame(() => {
                if (component.isMounted) {
                    resolve();
                    return;
                }
                component.isMounted = true;
                component.mounted();
                resolve();
            });
        });
    }
    /**
     * Finish loading and call the listeners
     */
    static finishLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            this.finished = true;
            if (window.requestAnimationFrame || window.webkitRequestAnimationFrame) {
                for (const { component, constructed } of [...this.listeners]) {
                    yield constructed;
                    yield this.__doSingleMount(component);
                }
            }
            else {
                /* istanbul ignore next */
                this.listeners.forEach(({ constructed, component }) => __awaiter(this, void 0, void 0, function* () {
                    yield constructed;
                    if (component.isMounted) {
                        return;
                    }
                    component.isMounted = true;
                    component.mounted();
                }));
            }
        });
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
    /**
     * Check a component's properties and validate them
     *
     * @param {WebComponentBaseMixinClass} component - The component to validate
     */
    static checkProps(component) {
        if (!component.is) {
            throw new WCLibError(component, 'Component is missing static is property');
        }
        if (typeof component.is !== 'string') {
            throw new WCLibError(component, 'Component name is not a string');
        }
        if (component.is.indexOf('-') === -1) {
            throw new WCLibError(component, 'Webcomponent names need to contain a dash "-"');
        }
        if (/[A-Z]/.test(component.is)) {
            throw new WCLibError(component, 'Webcomponent names can not contain uppercase ASCII characters.');
        }
        if (/^\d/i.test(component.is)) {
            throw new WCLibError(component, 'Webcomponent names can not start with a digit.');
        }
        if (/^-/i.test(component.is)) {
            throw new WCLibError(component, 'Webcomponent names can not start with a hyphen.');
        }
        if (component.html === undefined) {
            throw new WCLibError(component, 'Component is missing static html property (set to null to suppress)');
        }
        if (component.html === null) {
            component.html = new TemplateFn(null, 4 /* NEVER */, null);
        }
        else if (!this.__isTemplate(component.html)) {
            throw new WCLibError(component, 'Component\'s html template should be an instance of the TemplateFn class');
        }
        if (Array.isArray(component.css)) {
            for (const template of component.css) {
                if (!this.__isTemplate(template)) {
                    throw new WCLibError(component, 'Component\'s css template should be an instance of the TemplateFn class ' +
                        'or an array of them');
                }
            }
        }
        else if (component.css !== null && component.css !== undefined &&
            !this.__isTemplate(component.css)) {
            throw new WCLibError(component, 'Component\'s css template should be an instance of the TemplateFn class ' +
                'or an array of them');
        }
    }
}
/**
 * All defined webcomponents
 */
DefinerClass.defined = [];
/**
 * All defined webcomponents
 */
DefinerClass.devComponents = [];
/**
 * Whether defining has finished.
 * This is set to true when the first
 * call to .define() finishes so if
 * you have multiple ones, this is unreliable
 */
DefinerClass.finished = false;
/**
 * Listeners that listen for loading to
 * be finished
 */
DefinerClass.listeners = [];
/**
 * Metadata about defining. Allows you to listen
 * for the number of definitions
 */
export class DefineMetadata {
    /**
     * Increment the amount of defined components
     */
    static increment() {
        this.defined++;
        this._listeners.forEach(l => l(this.defined));
    }
    /**
     * Add a listener that is called when a component
     * is defined
     *
     * @param {(amount: number) => any} listener - The listener.
     * 	Gets the amount of defined components as the first argument
     */
    static onDefine(listener) {
        this._listeners.push(listener);
    }
    /**
     * Calls the listener when given amount has been reached (
     * that many components have been defined).
     *
     * @param {number} amount - The amount to wait for
     * @param {(amount: number) => any} listener - The listener to call
     */
    static onReach(amount, listener) {
        this._listeners.push((currentAmount) => {
            if (currentAmount === amount) {
                listener(amount);
            }
        });
    }
}
/**
 * The amount of defined components
 */
DefineMetadata.defined = 0;
DefineMetadata._listeners = [];
/**
 * A mixin that will add the ability to define a component
 * and its dependencies by calling .define on it
 *
 * @template P
 *
 * @param {P} superFn - The parent/super to extend from
 */
export const WebComponentDefinerMixin = (superFn) => {
    /**
     * The class that manages defining of this component
     * and its dependencies
     */
    class WebComponentDefiner extends superFn {
        constructor(...args) {
            super(...args);
            /**
             * The class associated with this one that
             * contains some functions required for
             * it to function
             *
             * @readonly
             */
            this.___definerClass = new DefinerClass();
            const isConnected = new Promise((resolve) => {
                this.___definerClass.internals.connectedHooks.push(() => {
                    resolve();
                });
            });
            DefinerClass.listenForFinished(this, isConnected);
        }
        /**
         * Define this component and its dependencies as a webcomponent
         * so they can be used
         *
         * @param {boolean} [isDevelopment] - Whether to enable
         * 	development mode in which some additional checks
         *  are performed at the cost of performance.
         * @param {boolean} [isRoot] - Set to true if this is
         * 	not a dependency (which most definitions aren't)
         * 	True by default
         */
        static define(isDevelopment = false, isRoot = true) {
            if (isRoot && DefinerClass.finished) {
                //Another root is being defined, clear last one
                DefinerClass.finished = false;
                DefinerClass.listeners = [];
            }
            if (isDevelopment) {
                DefinerClass.devComponents.push(this.is);
                DefinerClass.checkProps(this);
            }
            if (this.dependencies && this.dependencies.length) {
                for (const dependency of this.dependencies) {
                    dependency && dependency.define(isDevelopment, false);
                }
            }
            define(this.is, this);
            DefinerClass.defined.push(this.is);
            DefineMetadata.increment();
            DefinerClass.finishLoad();
        }
    }
    /**
     * Dependencies of this component. If this
     * component uses other components in its
     * template, adding them to this array will
     * make sure they are defined before this
     * component is
     *
     * @readonly
     */
    WebComponentDefiner.dependencies = [];
    return WebComponentDefiner;
};
//# sourceMappingURL=definer.js.map
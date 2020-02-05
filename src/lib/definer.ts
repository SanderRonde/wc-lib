import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { WebComponentMixinInstance } from './component.js';
import { TemplateFn, CHANGE_TYPE } from './template-fn.js';
import { WebComponentBaseMixinClass } from './base.js';
import { ClassToObj } from './configurable.js';
import { WCLibError } from './shared.js';

function define(name: string, component: any) {
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
    /**
     * Any internal properties that are only used by the framework
     */
    public internals: {
        /**
         * Any hooks that should be called after the constructor
         */
        connectedHooks: (() => void)[];
        /**
         * Any hooks that should be called after rendering
         */
        postRenderHooks: (() => void)[];
    } = {
        connectedHooks: [],
        postRenderHooks: [],
    };
    /**
     * All defined webcomponents
     */
    public static defined: string[] = [];

    /**
     * All defined webcomponents
     */
    public static devComponents: string[] = [];

    /**
     * Whether defining has finished.
     * This is set to true when the first
     * call to .define() finishes so if
     * you have multiple ones, this is unreliable
     */
    public static finished: boolean = false;

    /**
     * Listeners that listen for loading to
     * be finished
     */
    public static listeners: {
        component: WebComponentMixinInstance;
        constructed: Promise<void>;
    }[] = [];

    /**
     * Whether this component is in development mode
     */
    public isDevelopment: boolean = false;

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
    public static async listenForFinished(
        component: WebComponentMixinInstance,
        isConstructed: Promise<void>
    ) {
        if (this.finished) {
            await isConstructed;
            component.isMounted = true;
            component.mounted();
        } else {
            this.listeners.push({
                component,
                constructed: isConstructed,
            });
        }
    }

    /**
     * Sets development mode to true if it was set to true for this
     * component's definition
     */
    public setDevMode(component: HTMLElement) {
        if (!component.tagName) return;
        this.isDevelopment =
            DefinerClass.devComponents.indexOf(
                component.tagName.toLowerCase()
            ) > -1;
    }

    private static __doSingleMount(component: WebComponentMixinInstance) {
        return new Promise((resolve) => {
            /* istanbul ignore next */
            const animationFrame =
                window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame;
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
    public static async finishLoad() {
        this.finished = true;
        if (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame
        ) {
            for (const { component, constructed } of [...this.listeners]) {
                await constructed;
                await this.__doSingleMount(component);
            }
        } else {
            /* istanbul ignore next */
            this.listeners.forEach(async ({ constructed, component }) => {
                await constructed;
                if (component.isMounted) {
                    return;
                }
                component.isMounted = true;
                component.mounted();
            });
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

    /**
     * Check a component's properties and validate them
     *
     * @param {WebComponentBaseMixinClass} component - The component to validate
     */
    public static checkProps(component: WebComponentBaseMixinClass) {
        if (!component.is) {
            throw new WCLibError(
                component,
                'Component is missing static is property'
            );
        }
        if (typeof component.is !== 'string') {
            throw new WCLibError(component, 'Component name is not a string');
        }
        if (component.is.indexOf('-') === -1) {
            throw new WCLibError(
                component,
                'Webcomponent names need to contain a dash "-"'
            );
        }
        if (/[A-Z]/.test(component.is)) {
            throw new WCLibError(
                component,
                'Webcomponent names can not contain uppercase ASCII characters.'
            );
        }
        if (/^\d/i.test(component.is)) {
            throw new WCLibError(
                component,
                'Webcomponent names can not start with a digit.'
            );
        }
        if (/^-/i.test(component.is)) {
            throw new WCLibError(
                component,
                'Webcomponent names can not start with a hyphen.'
            );
        }

        if (component.html === undefined) {
            throw new WCLibError(
                component,
                'Component is missing static html property (set to null to suppress)'
            );
        }
        if (component.html === null) {
            component.html = new TemplateFn<any>(null, CHANGE_TYPE.NEVER, null);
        } else if (!this.__isTemplate(component.html)) {
            throw new WCLibError(
                component,
                "Component's html template should be an instance of the TemplateFn class"
            );
        }
        if (Array.isArray(component.css)) {
            for (const template of component.css) {
                if (!this.__isTemplate(template)) {
                    throw new WCLibError(
                        component,
                        "Component's css template should be an instance of the TemplateFn class " +
                            'or an array of them'
                    );
                }
            }
        } else if (
            component.css !== null &&
            component.css !== undefined &&
            !this.__isTemplate(component.css)
        ) {
            throw new WCLibError(
                component,
                "Component's css template should be an instance of the TemplateFn class " +
                    'or an array of them'
            );
        }
    }
}

/**
 * Metadata about defining. Allows you to listen
 * for the number of definitions
 */
export class DefineMetadata {
    /**
     * The amount of defined components
     */
    public static defined: number = 0;
    private static _listeners: ((amount: number) => any)[] = [];

    /**
     * Increment the amount of defined components
     */
    public static increment() {
        this.defined++;
        this._listeners.forEach((l) => l(this.defined));
    }

    /**
     * Add a listener that is called when a component
     * is defined
     *
     * @param {(amount: number) => any} listener - The listener.
     * 	Gets the amount of defined components as the first argument
     */
    public static onDefine(listener: (amount: number) => any) {
        this._listeners.push(listener);
    }

    /**
     * Calls the listener when given amount has been reached (
     * that many components have been defined).
     *
     * @param {number} amount - The amount to wait for
     * @param {(amount: number) => any} listener - The listener to call
     */
    public static onReach(amount: number, listener: (amount: number) => any) {
        this._listeners.push((currentAmount) => {
            if (currentAmount === amount) {
                listener(amount);
            }
        });
    }
}

/**
 * An instance of the webcomponent definer mixin's resulting class
 */
export type WebComponentDefinerMixinInstance = InferInstance<
    WebComponentDefinerMixinClass
> & {
    self: WebComponentDefinerMixinClass;
};

/**
 * The webcomponent definer mixin's resulting class
 */
export type WebComponentDefinerMixinClass = InferReturn<
    typeof WebComponentDefinerMixin
>;

/**
 * The parent/super type required by the definer mixin (the HTMLElement class)
 */
export type WebComponentDefinerMixinSuper = Constructor<HTMLElement>;

/**
 * A standalone instance of the definer class
 */
export declare class WebComponentDefinerTypeInstance {
    /**
     * The class associated with this one that
     * contains some functions required for
     * it to function
     *
     * @readonly
     */
    public ___definerClass: DefinerClass;

    /**
     * Dependencies of this component. If this
     * component uses other components in its
     * template, adding them to this array will
     * make sure they are defined before this
     * component is
     *
     * @readonly
     */
    public static dependencies?:
        | {
              define(isDevelopment?: boolean, isRoot?: boolean): void;
          }[]
        | null;

    /**
     * The name of this component
     *
     * @readonly
     */
    public static is: string;

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
    public static define(isDevelopment?: boolean, isRoot?: boolean): void;
}

/**
 * The static values of the definer class
 */
export type WebComponentDefinerTypeStatic = ClassToObj<
    typeof WebComponentDefinerTypeInstance
>;

/**
 * A mixin that will add the ability to define a component
 * and its dependencies by calling .define on it
 *
 * @template P
 *
 * @param {P} superFn - The parent/super to extend from
 */
export const WebComponentDefinerMixin = <
    P extends WebComponentDefinerMixinSuper
>(
    superFn: P
) => {
    /**
     * The class that manages defining of this component
     * and its dependencies
     */
    class WebComponentDefiner extends superFn
        implements WebComponentDefinerTypeInstance {
        public ___definerClass: DefinerClass = new DefinerClass();

        public static dependencies?:
            | {
                  define(isDevelopment?: boolean, isRoot?: boolean): void;
              }[]
            | null = [];

        public static is: string;

        constructor(...args: any[]) {
            super(...args);

            const isConnected = new Promise<void>((resolve) => {
                this.___definerClass.internals.connectedHooks.push(() => {
                    resolve();
                });
            });
            DefinerClass.listenForFinished(this as any, isConnected);
            this.___definerClass.setDevMode(this);
        }

        // istanbul ignore next
        static define(isDevelopment: boolean = false, isRoot: boolean = true) {
            if (isRoot && DefinerClass.finished) {
                //Another root is being defined, clear last one
                DefinerClass.finished = false;
                DefinerClass.listeners = [];
            }
            if (isDevelopment) {
                DefinerClass.devComponents.push(this.is);
                DefinerClass.checkProps(
                    (this as unknown) as WebComponentBaseMixinClass
                );
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

    const __typecheck__: WebComponentDefinerTypeStatic = WebComponentDefiner;
    __typecheck__;

    return WebComponentDefiner;
};

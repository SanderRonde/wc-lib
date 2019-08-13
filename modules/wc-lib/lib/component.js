var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { bindToClass } from './base.js';
import { Listeners } from './listeners.js';
import { WCLibError } from './shared.js';
import { Props } from './props.js';
class ComponentClass {
    constructor() {
        /**
         * An ID map containing maps between queried IDs and elements,
         * 	cleared upon render
         */
        this.idMap = new Map();
        this.idMapProxy = null;
        this.supportsProxy = typeof Proxy !== 'undefined';
    }
    clearMap() {
        this.idMap.clear();
    }
    genIdMapProxy(self) {
        const __this = this;
        return new Proxy((selector) => {
            return self.root.querySelector(selector);
        }, {
            get(_, id) {
                if (typeof id !== 'string') {
                    return undefined;
                }
                const cached = __this.idMap.get(id);
                if (cached && self.shadowRoot.contains(cached)) {
                    return cached;
                }
                const el = self.root.getElementById(id);
                if (el) {
                    __this.idMap.set(id, el);
                }
                return el || undefined;
            }
        });
    }
    getIdMapSnapshot(self) {
        const snapshot = ((selector) => {
            return self.root.querySelector(selector);
        });
        for (const item of self.root.querySelectorAll('[id]')) {
            snapshot[item.id] = item;
        }
        return snapshot;
    }
}
__decorate([
    bindToClass
], ComponentClass.prototype, "clearMap", null);
/**
 * The class that wraps up all subclasses of a webcomponent.
 * This version takes two type parameters that allow for the
 * type parameters to be specified as well as the
 * ID map.
 *
 * @template ELS - The elements found in this component's HTML
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
export const WebComponentMixin = (superFn) => {
    const privateMap = new WeakMap();
    function getPrivate(self) {
        if (privateMap.has(self))
            return privateMap.get(self);
        return privateMap.set(self, new ComponentClass()).get(self);
    }
    // Will show a warning regarding using generics in mixins
    // This issue is tracked in the typescript repo's issues with numbers
    // #26154 #24122 (among others)
    //@ts-ignore
    class WebComponent extends superFn {
        constructor(...args) {
            super(...args);
            /**
             * An array of functions that get called when this
             * component gets unmounted. These will dispose
             * of any open listeners or similar garbage
             */
            this.disposables = [];
            /**
             * Whether this component has been mounted
             */
            this.isMounted = false;
            /**
             * Listens for given event and fires
             * the listener when it's triggered
             *
             * @template EV - The event's name
             *
             * @param {EV} event - The event's name
             * @param {(...args: E[EV]['args']) => E[EV]['returnType']} listener - The
             * 	listener called when the event is fired
             * @param {boolean} [once] - Whether to only
             * 	call this listener once (false by default)
             */
            this.listen = (event, listener, once = false) => {
                super.listen(event, listener, once);
            };
            /**
             * Clears all listeners on this component for
             * given event
             *
             * @template EV - The name of the event
             *
             * @param {EV} event - The name of the event to clear
             * @param {(...args: E[EV]['args']) => E[EV]['returnType']} [listener] - A
             * 	specific listener to clear. If not passed, clears all
             * 	listeners for the event
             */
            this.clearListener = (event, listener) => {
                super.clearListener(event, listener);
            };
            /**
             * Fires given event on this component
             * with given params, returning an array
             * containing the return values of all
             * triggered listeners
             *
             * @template EV - The event's name
             * @template R - The return type of the
             * 	event's listeners
             *
             * @param {EV} event - The event's name
             * @param {E[EV]['args']} params - The parameters
             * 	passed to the listeners when they are
             * 	called
             *
             * @returns {R[]} An array containing the
             * 	return values of all triggered
             * 	listeners
             */
            this.fire = (event, ...params) => {
                return super.fire(event, ...params);
            };
            /**
             * Sets the current language
             *
             * @param {string} lang - The language to set it to, a regular string
             */
            this.setLang = (super.setLang ? (lang) => {
                // istanbul ignore next
                return super.setLang(lang);
            } : void 0);
            /**
             * Gets the currently active language
             */
            this.getLang = (super.getLang ? () => {
                // istanbul ignore next
                return super.getLang();
            } : void 0);
            /**
             * Returns a promise that resolves to the message. You will generally
             * want to use this inside the class itself since it resolves to a simple promise.
             *
             * **Note:** Does not call the `options.returner` function before returning.
             *
             * @param {Extract<keyof GA['i18n'], string>} key - The key to search for in the messages file
             * @param {any[]} [values] - Optional values passed to the `getMessage` function
             * 		that can be used as placeholders or something similar
             *
             * @returns {Promise<string>} A promise that resolves to the found message
             */
            this.__prom = (super.__prom ? (key, ...values) => {
                // istanbul ignore next
                return super.__prom(key, ...values);
            } : void 0);
            /**
             * Returns either a string or whatever the `options.returner` function
             * returns. If you have not set the `options.returner` function, this will
             * return either a string or a promise that resolves to a string. Since
             * this function calls `options.returner` with the promise if the i18n file
             * is not loaded yet.
             *
             * You will generally want to use this function inside your templates since it
             * allows for the `options.returner` function to return a template-friendly
             * value that can display a placeholder or something of the sort
             *
             * @template R - The return value of your returner function
             * @param {Extract<keyof GA['i18n'], string>} key - The key to search for in the messages file
             * @param {any[]} [values] - Optional values passed to the `getMessage` function
             * 		that can be used as placeholders or something similar
             *
             * @returns {string|R} A promise that resolves to the found message
             */
            this.__ = (super.__ ? (key, ...values) => {
                // istanbul ignore next
                return super.__(key, ...values);
            } : void 0);
            /**
             * Gets the name of the current theme
             *
             * @returns {string} The name of the current theme
             */
            this.getThemeName = (super.getThemeName ? () => {
                // istanbul ignore next
                return super.getThemeName();
            } : void 0);
            /**
             * Gets the current theme's theme object
             *
             * @template T - The themes type
             *
             * @returns {T[keyof T]} A theme instance type
             */
            this.getTheme = (super.getTheme ? () => {
                // istanbul ignore next
                return super.getTheme();
            } : void 0);
            /**
             * Sets the theme of this component and any other
             * component in its hierarchy to the passed theme
             *
             * @template N - The theme name
             */
            this.setTheme = (super.setTheme ? (themeName) => {
                // istanbul ignore next
                return super.setTheme(themeName);
            } : void 0);
            /**
             * Registers `element` as the child of this
             * component
             *
             * @template G - Global properties
             * @param {HTMLElement} element - The
             * 	component that is registered as the child of this one
             *
             * @returns {G} The global properties
             */
            this.registerChild = (super.registerChild ? (element) => {
                // istanbul ignore next
                return super.registerChild(element);
            } : void 0);
            /**
             * Gets the global properties functions
             *
             * @template G - The global properties
             * @returns {GlobalPropsFunctions<G>} Functions
             * 	that get and set global properties
             */
            this.globalProps = (super.globalProps ? () => {
                // istanbul ignore next
                return super.globalProps();
            } : void 0);
            /**
             * Gets the root node of the global hierarchy
             *
             * @template T - The type of the root
             *
             * @returns {T} The root
             */
            this.getRoot = (super.getRoot ? () => {
                // istanbul ignore next
                return super.getRoot();
            } : void 0);
            /**
             * Returns the parent of this component
             *
             * @template T - The parent's type
             * @returns {T|null} - The component's parent or
             * 	null if it has none
             */
            this.getParent = (super.getParent ? () => {
                // istanbul ignore next
                return super.getParent();
            } : void 0);
            /**
             * Listeners for global property changes
             *
             * @template GP - The global properties
             *
             * @param {'globalPropChange'} event - The
             * 	event to listen for
             * @param {(prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void} listener -
             * 	The listener that is called when the
             * 	event is fired
             * @param {boolean} [once] - Whether to
             * 	only fire this event once
             */
            this.listenGP = (super.listenGP ? ((event, listener, 
            // istanbul ignore next
            once = false) => {
                // istanbul ignore next
                return super.listenGP(event, listener, once);
            }) : void 0);
            /**
             * Runs a function for every component in this
             * global hierarchy
             *
             * @template R - The return type of given function
             * @template E - The components on the page's base types
             *
             * @param {(element: WebComponentHierarchyManager) => R} fn - The
             * 	function that is ran on every component
             *
             * @returns {R[]} All return values in an array
             */
            this.runGlobalFunction = (super.runGlobalFunction ? (fn) => {
                // istanbul ignore next
                return super.runGlobalFunction(fn);
            } : void 0);
            this.___definerClass.internals.postRenderHooks.push(getPrivate(this).clearMap);
        }
        /**
         * An object that contains all children
         * of this element mapped by their ID.
         * This object can also be called with a
         * query, which is just a proxy call to
         * `this.root.querySelector`.
         *
         * **Note:** This function returns `undefined`
         * 	when no element can be found instead of
         * 	null.
         *
         * @readonly
         */
        get $() {
            const priv = getPrivate(this);
            if (priv.supportsProxy) {
                return priv.idMapProxy ||
                    (priv.idMapProxy = priv.genIdMapProxy(this));
            }
            // Re-generate the ID map every time
            return priv.getIdMapSnapshot(this);
        }
        $$(selector) {
            return this.root.querySelectorAll(selector);
        }
        /**
         * Called when the component is mounted to the dom.
         * Be sure to always call `super.connectedCallback()`
         * if you override this method
         */
        connectedCallback() {
            super.connectedCallback();
            if (!this.self) {
                throw new WCLibError(this, 'Missing .self property on component');
            }
            Props.onConnect(this);
            this.renderToDOM(11 /* ALWAYS */);
            this.layoutMounted();
            this.___definerClass.internals.connectedHooks.filter(fn => fn());
        }
        /**
         * Called when the component is unmounted from the dom
         * Be sure to always call `super.disconnectedCallback()`
         * 	if you override this method
         */
        disconnectedCallback() {
            /* istanbul ignore next */
            super.disconnectedCallback && super.disconnectedCallback();
            Listeners.removeAllElementListeners(this);
            this.disposables.forEach(disposable => disposable());
            this.disposables = [];
            this.isMounted = false;
            this.unmounted();
        }
        /**
         * Called when the component is mounted to the dom for the first time.
         * This will be part of the "constructor" and will slow down the initial render
         */
        layoutMounted() { }
        /**
         * Called when the component is mounted to the dom and is ready to be manipulated
         */
        mounted() { }
        /**
         * Called when the component is removed from the dom
         */
        unmounted() { }
        listenProp(event, listener, once = false) {
            this.listen(event, listener, once);
        }
        /**
         * A map that maps every event name to
         * a set containing all of its listeners
         *
         * @readonly
         */
        get listenerMap() {
            return super.listenerMap;
        }
    }
    return WebComponent;
};
//# sourceMappingURL=component.js.map
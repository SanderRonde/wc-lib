/**
 * A value that represents the lack of a theme,
 * which is returned when no theme is set
 *
 * @constant
 */
export const noTheme = {};
/**
 * A mixin that, when applied, takes care of
 * re-rendering when the theme changes. It also
 * adds some methods for getting/setting the them
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export const WebComponentThemeManagerMixin = (superFn) => {
    let currentTheme = null;
    let themeListeners = [];
    function changeTheme(theme) {
        currentTheme = theme;
        themeListeners.forEach(l => l(theme));
    }
    class PrivateData {
        constructor(_self) {
            this._self = _self;
        }
        __setTheme() {
            this._self.renderToDOM(2 /* THEME */);
        }
    }
    PrivateData.__theme = null;
    PrivateData.__lastRenderedTheme = null;
    const privateMap = new WeakMap();
    function getPrivate(self) {
        if (privateMap.has(self))
            return privateMap.get(self);
        return privateMap.set(self, new PrivateData(self)).get(self);
    }
    const componentThemeMap = new WeakMap();
    // Explanation for ts-ignore:
    // Will show a warning regarding using generics in mixins
    // This issue is tracked in the typescript repo's issues with numbers
    // #26154 #24122 (among others)
    /**
     * A class that is responsible for managing
     * the current theme and passing it to the template
     * function when it changes
     */
    //@ts-ignore
    class WebComponentThemeManager extends superFn {
        constructor(...args) {
            super(...args);
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
            // istanbul ignore next
            this.listen = (super.listen ? (event, listener, once = false) => {
                // istanbul ignore next
                super.listen(event, listener, once);
            } : void 0);
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
            // istanbul ignore next
            this.clearListener = (super.clearListener ? (event, listener) => {
                // istanbul ignore next
                super.clearListener(event, listener);
            } : void 0);
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
             * @param {EV} event - The event's anme
             * @param {E[EV]['args']} params - The parameters
             * 	passed to the listeners when they are
             * 	called
             *
             * @returns {R[]} An array containing the
             * 	return values of all triggered
             * 	listeners
             */
            // istanbul ignore next
            this.fire = (super.fire ? (event, ...params) => {
                // istanbul ignore next
                return super.fire(event, ...params);
            } : void 0);
            /**
             * Sets the current language
             *
             * @param {string} lang - The language to set it to, a regular string
             */
            // istanbul ignore next
            this.setLang = (super.setLang ? (lang) => {
                // istanbul ignore next
                return super.setLang(lang);
            } : void 0);
            /**
             * Gets the currently active language
             */
            // istanbul ignore next
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
            // istanbul ignore next
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
            // istanbul ignore next
            this.__ = (super.__ ? (key, ...values) => {
                // istanbul ignore next
                return super.__(key, ...values);
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
            if (this.listenGP) {
                this.listenGP('globalPropChange', (prop) => {
                    if (prop === 'theme') {
                        getPrivate(this).__setTheme();
                    }
                });
            }
            else {
                themeListeners.push(() => {
                    getPrivate(this).__setTheme();
                });
            }
        }
        /**
         * Gets the name of the curent theme
         *
         * @returns {string} The name of the current theme
         */
        getThemeName() {
            return (this.globalProps && this.globalProps().get('theme')) ||
                currentTheme || PrivateData.__defaultTheme;
        }
        /**
         * Gets the current theme's theme object
         *
         * @template T - The themes type
         *
         * @returns {T[keyof T]} A theme instance type
         */
        getTheme() {
            if (PrivateData.__theme) {
                const themeName = this.getThemeName();
                if (themeName && themeName in PrivateData.__theme) {
                    return PrivateData.__theme[themeName];
                }
            }
            return noTheme;
        }
        /**
         * Sets the theme of this component and any other
         * component in its hierarchy to the passed theme
         *
         * @template N - The theme name
         */
        setTheme(themeName) {
            if (this.globalProps) {
                this.globalProps().set('theme', themeName);
            }
            else {
                changeTheme(themeName);
            }
        }
        /**
         * Initializes the theme manager by passing
         * it the theme object and the default theme
         *
         * @template T - The themes indexed by name
         */
        static initTheme({ theme, defaultTheme }) {
            PrivateData.__theme = theme;
            if (defaultTheme) {
                this.setDefaultTheme(defaultTheme);
            }
        }
        /**
         * Sets the default theme
         *
         * @template T - The themes indexed by name
         *
         * @param {Extract<keyof T, string>} name - The
         * 	name of the default theme
         */
        static setDefaultTheme(name) {
            PrivateData.__defaultTheme = name;
        }
        /**
         * Checks whether the constructed CSS should be changed. This function can be
         * overridden to allow for a custom checker. Since constructed CSS
         * is shared with all other instances of this specific component,
         * this should only return true if the CSS for all of these components
         * has changed. For example it might change when the theme has changed
         *
         * @param {WebComponentBase} element - The element for which to
         * 	check it
         *
         * @returns {boolean} Whether the constructed CSS has changed
         */
        /* istanbul ignore next */
        static __constructedCSSChanged(element) {
            if (!componentThemeMap.has(element.self)) {
                componentThemeMap.set(element.self, element.getThemeName());
                return true;
            }
            const theme = element.getThemeName();
            if (componentThemeMap.get(element.self) === theme) {
                return false;
            }
            componentThemeMap.set(element.self, theme);
            return true;
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
    return WebComponentThemeManager;
};
//# sourceMappingURL=theme-manager.js.map
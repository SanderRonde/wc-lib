var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class I18NClass {
    constructor(_self) {
        this._self = _self;
        this._elementLang = null;
    }
    setInitialLang() {
        this.setLang(I18NClass.__loadingLang, true);
    }
    notifyNewLang(lang) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const listener of I18NClass._listeners) {
                listener(lang);
            }
        });
    }
    setLang(lang, delayRender = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (I18NClass.__loadingLang !== lang) {
                I18NClass.__loadingLang = lang;
                yield I18NClass.__loadLang(lang);
                if (I18NClass.__loadingLang === lang) {
                    I18NClass.currentLang = lang;
                }
            }
            if (this._elementLang !== lang) {
                this._elementLang = lang;
                if (delayRender) {
                    setTimeout(() => {
                        this._self.renderToDOM(8 /* LANG */);
                    }, 0);
                }
                else {
                    this._self.renderToDOM(8 /* LANG */);
                }
            }
        });
    }
    static notifyOnLangChange(listener) {
        this._listeners.push(listener);
        /* istanbul ignore if */
        if (I18NClass.currentLang) {
            listener(I18NClass.currentLang);
        }
    }
    static __fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            /* istanbul ignore next */
            if ('fetch' in window && typeof window.fetch !== undefined) {
                return window.fetch(url).then(r => r.text());
            }
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(xhr.responseText);
                        }
                        else {
                            reject(new Error(`Failed xhr: ${xhr.status}`));
                        }
                    }
                };
                xhr.send();
            });
        });
    }
    static __loadLang(lang) {
        return __awaiter(this, void 0, void 0, function* () {
            if (lang in this.__langPromises)
                return;
            const prom = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const text = yield this.__fetch(this.urlFormat.replace(/\$LANG\$/g, lang));
                resolve(JSON.parse(text));
            }));
            this.__langPromises[lang] = prom;
            this.langFiles[lang] = yield prom;
        });
    }
    static get lang() {
        return this.currentLang ||
            this.__loadingLang ||
            this.defaultLang;
    }
    static loadCurrentLang() {
        return __awaiter(this, void 0, void 0, function* () {
            let loadingLang = this.lang;
            if (loadingLang in this.langFiles)
                return;
            if (loadingLang in this.__langPromises) {
                yield this.__langPromises[loadingLang];
                // Language has changed in the meantime
                if (this.lang !== loadingLang)
                    return this.loadCurrentLang();
                return;
            }
            this.__loadLang(loadingLang);
            yield this.__langPromises[loadingLang];
            // Language has changed in the meantime
            if (this.lang !== loadingLang)
                return this.loadCurrentLang();
        });
    }
    static get isReady() {
        return this.lang in this.langFiles;
    }
    static waitForKey(key, values) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadCurrentLang();
            return this.getMessage(this.langFiles[this.lang], key, values);
        });
    }
}
I18NClass.urlFormat = '/i18n/';
I18NClass.getMessage = (file, key) => {
    return file[key];
};
I18NClass.langFiles = {};
I18NClass.__langPromises = {};
I18NClass.__loadingLang = null;
I18NClass.currentLang = null;
I18NClass.defaultLang = null;
I18NClass.returner = (_, c) => c;
I18NClass._listeners = [];
/**
 * A mixin that, when applied, adds i18n support in the
 * form of adding a `__` method
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export const WebComponentI18NManagerMixin = (superFn) => {
    const privateMap = new WeakMap();
    function i18nClass(self) {
        if (privateMap.has(self))
            return privateMap.get(self);
        return privateMap.set(self, new I18NClass(self)).get(self);
    }
    // Explanation for ts-ignore:
    // Will show a warning regarding using generics in mixins
    // This issue is tracked in the typescript repo's issues with numbers
    // #26154 #24122 (among others)
    /**
     * The class that manages all i18n (internationalization) functions
     */
    //@ts-ignore
    class WebComponentI18NManagerClass extends superFn {
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
             * @param {EV} event - The event's name
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
            const priv = i18nClass(this);
            if (this.listenGP) {
                this.listenGP('globalPropChange', (prop, value) => {
                    if (prop === 'lang') {
                        priv.setLang(value);
                    }
                });
            }
            else {
                I18NClass.notifyOnLangChange((lang) => {
                    priv.setLang(lang);
                });
            }
            priv.setInitialLang();
        }
        /**
         * Sets the current language
         *
         * @param {string} lang - The language to set it to, a regular string
         */
        setLang(lang) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.globalProps) {
                    this.globalProps().set('lang', lang);
                }
                else {
                    const priv = i18nClass(this);
                    yield priv.setLang(lang);
                    yield priv.notifyNewLang(lang);
                }
            });
        }
        /**
         * Gets the currently active language
         */
        getLang() {
            return I18NClass.lang;
        }
        /**
         * Initializes i18n with a few important settings
         */
        static initI18N({ urlFormat, defaultLang, getMessage, returner }) {
            I18NClass.urlFormat = urlFormat;
            if (getMessage) {
                I18NClass.getMessage = getMessage;
            }
            if (returner) {
                I18NClass.returner = returner;
            }
            I18NClass.defaultLang = defaultLang;
        }
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
        __prom(key, ...values) {
            return WebComponentI18NManagerClass.__prom(key, ...values);
        }
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
        __(key, ...values) {
            return WebComponentI18NManagerClass.__(key, ...values);
        }
        /**
         * Returns a promise that resolves to the message. You will generally
         * want to use this inside the class itself since it resolves to a simple promise.
         *
         * **Note:** Does not call the `options.returner` function before returning.
         *
         * @param {string} key - The key to search for in the messages file
         * @param {any[]} [values] - Optional values passed to the `getMessage` function
         * 		that can be used as placeholders or something similar
         *
         * @returns {Promise<string>} A promise that resolves to the found message
         */
        static __prom(key, ...values) {
            return __awaiter(this, void 0, void 0, function* () {
                if (I18NClass.isReady) {
                    return I18NClass.getMessage(I18NClass.langFiles[I18NClass.lang], key, values);
                }
                return I18NClass.waitForKey(key, values);
            });
        }
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
         * @param {string} key - The key to search for in the messages file
         * @param {any[]} [values] - Optional values passed to the `getMessage` function
         * 		that can be used as placeholders or something similar
         *
         * @returns {string|R} A promise that resolves to the found message
         */
        static __(key, ...values) {
            const value = this.__prom(key, ...values);
            return I18NClass.returner(value, `{{${key}}}`);
        }
        /**
         * A promise that resolves when the current language is loaded
         *
         * @readonly
         */
        static get langReady() {
            return I18NClass.loadCurrentLang();
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
    return WebComponentI18NManagerClass;
};
//# sourceMappingURL=i18n-manager.js.map
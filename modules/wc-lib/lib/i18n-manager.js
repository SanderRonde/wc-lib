var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            else {
                I18NClass.currentLang = lang;
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
            if (typeof window !== 'undefined' &&
                'fetch' in window &&
                typeof window.fetch !== undefined) {
                return window.fetch(url).then((r) => r.text());
            }
            return new Promise((resolve, reject) => {
                /* istanbul ignore next */
                if (typeof XMLHttpRequest === 'undefined') {
                    resolve(null);
                    return;
                }
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
            if (lang in this.__langPromises || lang in this.langFiles)
                return;
            const prom = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const text = yield this.__fetch(this.urlFormat.replace(/\$LANG\$/g, lang));
                /* istanbul ignore next */
                if (!text) {
                    resolve({});
                    return;
                }
                resolve(JSON.parse(text));
            }));
            this.__langPromises[lang] = prom;
            this.langFiles[lang] = yield prom;
        });
    }
    static get lang() {
        return this.currentLang || this.__loadingLang || this.defaultLang;
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
        getLang() {
            return I18NClass.lang;
        }
        static initI18N(config) {
            const { defaultLang, getMessage, returner } = config;
            if ('urlFormat' in config) {
                I18NClass.urlFormat = config.urlFormat;
            }
            if ('langFiles' in config) {
                I18NClass.langFiles = config.langFiles;
            }
            if (getMessage) {
                I18NClass.getMessage = getMessage;
            }
            if (returner) {
                I18NClass.returner = returner;
            }
            I18NClass.defaultLang = defaultLang;
        }
        __prom(key, ...values) {
            return WebComponentI18NManagerClass.__prom(key, ...values);
        }
        __(key, ...values) {
            return WebComponentI18NManagerClass.__(key, ...values);
        }
        static __prom(key, ...values) {
            return __awaiter(this, void 0, void 0, function* () {
                if (I18NClass.isReady) {
                    return I18NClass.getMessage(I18NClass.langFiles[I18NClass.lang], key, values);
                }
                return I18NClass.waitForKey(key, values);
            });
        }
        static __(key, ...values) {
            const value = this.__prom(key, ...values);
            return I18NClass.returner(value, `{{${key}}}`);
        }
        static get langReady() {
            return I18NClass.loadCurrentLang();
        }
    }
    const __typecheck__ = WebComponentI18NManagerClass;
    __typecheck__;
    return WebComponentI18NManagerClass;
};
//# sourceMappingURL=i18n-manager.js.map
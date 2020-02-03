import {
    Constructor,
    InferInstance,
    InferReturn,
    DefaultVal,
    WebComponentThemeManagerMixinInstance,
    DefaultValUnknown,
    FallbackExtends,
} from '../classes/types.js';
import {
    WebComponentHierarchyManagerMixinInstance,
    ListenGPType,
    GlobalPropsFunctions,
} from './hierarchy-manager.js';
import {
    GetEvents,
    ListenerSet,
    WebComponentListenableMixinInstance,
} from './listener.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { EventListenerObj } from '../wc-lib.js';
import { CHANGE_TYPE } from './template-fn.js';
import { ClassToObj } from './configurable.js';

class I18NClass<
    GA extends {
        i18n?: any;
        langs?: string;
    } = {}
> {
    public static urlFormat: string = '/i18n/';
    public static getMessage: (
        langFile: any,
        key: string,
        values: any[]
    ) => string | Promise<string> = (
        file: {
            [key: string]: string;
        },
        key: string
    ) => {
        return file[key];
    };
    public static langFiles: {
        [key: string]: {
            [key: string]: string;
        };
    } = {};
    private static __langPromises: {
        [key: string]: Promise<{
            [key: string]: string;
        }>;
    } = {};
    private static __loadingLang: string | null = null;
    public static currentLang: string | null = null;
    public static defaultLang: string | null = null;
    public static returner: (
        promise: Promise<string>,
        content: string
    ) => any = (_, c) => c;
    private _elementLang: DefaultVal<GA['langs'], string> | null = null;
    private static _listeners: ((newLang: string) => void)[] = [];

    constructor(private _self: WebComponentI18NManagerMixinInstance) {}

    public setInitialLang() {
        this.setLang(
            I18NClass.__loadingLang! as DefaultVal<GA['langs'], string>,
            true
        );
    }

    public async notifyNewLang(lang: DefaultVal<GA['langs'], string>) {
        for (const listener of I18NClass._listeners) {
            listener(lang);
        }
    }

    public async setLang(
        lang: DefaultVal<GA['langs'], string>,
        delayRender: boolean = false
    ) {
        if (I18NClass.__loadingLang !== lang) {
            I18NClass.__loadingLang = lang;
            await I18NClass.__loadLang(lang);
            if (I18NClass.__loadingLang === lang) {
                I18NClass.currentLang = lang;
            }
        }
        if (this._elementLang !== lang) {
            this._elementLang = lang;
            if (delayRender) {
                setTimeout(() => {
                    this._self.renderToDOM(CHANGE_TYPE.LANG);
                }, 0);
            } else {
                this._self.renderToDOM(CHANGE_TYPE.LANG);
            }
        }
    }

    public static notifyOnLangChange(listener: (newLang: string) => void) {
        this._listeners.push(listener);
        /* istanbul ignore if */
        if (I18NClass.currentLang) {
            listener(I18NClass.currentLang!);
        }
    }

    private static async __fetch(url: string) {
        /* istanbul ignore next */
        if ('fetch' in window && typeof window.fetch !== undefined) {
            return window.fetch(url).then((r) => r.text());
        }

        return new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error(`Failed xhr: ${xhr.status}`));
                    }
                }
            };
            xhr.send();
        });
    }

    private static async __loadLang(lang: string) {
        if (lang in this.__langPromises || lang in this.langFiles) return;
        const prom = new Promise<{
            [key: string]: string;
        }>(async (resolve) => {
            const text = await this.__fetch(
                this.urlFormat.replace(/\$LANG\$/g, lang)
            );
            resolve(JSON.parse(text));
        });
        this.__langPromises[lang] = prom;
        this.langFiles[lang] = await prom;
    }

    public static get lang() {
        return this.currentLang || this.__loadingLang || this.defaultLang!;
    }

    static async loadCurrentLang(): Promise<void> {
        let loadingLang = this.lang;
        if (loadingLang in this.langFiles) return;
        if (loadingLang in this.__langPromises) {
            await this.__langPromises[loadingLang];

            // Language has changed in the meantime
            if (this.lang !== loadingLang) return this.loadCurrentLang();
            return;
        }
        this.__loadLang(loadingLang);
        await this.__langPromises[loadingLang];

        // Language has changed in the meantime
        if (this.lang !== loadingLang) return this.loadCurrentLang();
    }

    public static get isReady() {
        return this.lang in this.langFiles;
    }

    public static async waitForKey(key: string, values: any[]) {
        await this.loadCurrentLang();
        return this.getMessage(this.langFiles[this.lang], key, values);
    }
}

/**
 * An instance of the webcomponent i18n manager mixin's resulting class
 */
export type WebComponentI18NManagerMixinInstance = InferInstance<
    WebComponentI18NManagerMixinClass
> & {
    self: WebComponentI18NManagerMixinClass;
};

/**
 * The webcomponent i18n manager mixin's resulting class
 */
export type WebComponentI18NManagerMixinClass = InferReturn<
    typeof WebComponentI18NManagerMixin
>;

/**
 * The parent/super type required by the i18n manager mixin
 */
export type WebComponentI18NManagerMixinSuper = Constructor<
    Partial<
        Pick<
            WebComponentHierarchyManagerMixinInstance,
            'globalProps' | 'listenGP'
        >
    > &
        Pick<WebComponentBaseMixinInstance, 'renderToDOM'> &
        Partial<
            Pick<
                WebComponentListenableMixinInstance,
                'listen' | 'fire' | 'clearListener' | 'listenerMap'
            >
        > &
        Partial<
            Pick<
                WebComponentThemeManagerMixinInstance,
                'getThemeName' | 'getTheme' | 'setTheme'
            >
        > &
        Partial<
            Pick<
                WebComponentHierarchyManagerMixinInstance,
                | 'registerChild'
                | 'globalProps'
                | 'getRoot'
                | 'getParent'
                | 'listenGP'
                | 'runGlobalFunction'
            >
        >
>;

/**
 * An interface implemented by the i18n manager. This is only used to fix some
 * TS errors and should not really be used outside of that
 */
export interface WebComponentI18NManagerMixinLike {
    getLang(): string;
    setLang(lang: string): Promise<void>;
    __<R, I extends any = { [key: string]: any }>(
        key: Extract<keyof I, string>,
        ...values: any[]
    ): string | R;
    __prom<I extends any = { [key: string]: any }>(
        key: Extract<keyof I, string>,
        ...values: any[]
    ): Promise<string>;
}

/**
 * A standalone instance of the i18n manager class
 */
export declare class WebComponentI18NManagerTypeInstance<
    GA extends {
        i18n?: any;
        langs?: string;
    } = {}
> {
    /**
     * Sets the current language
     *
     * @param {string} lang - The language to set it to, a regular string
     */
    public setLang<L extends GA['langs'] = string>(lang: L): Promise<void>;

    /**
     * Gets the currently active language
     */
    public getLang(): FallbackExtends<GA['langs'], string>;

    /**
     * Initializes i18n with a few important settings
     */
    public static initI18N<
        GA extends {
            i18n?: any;
            langs?: string;
        } = {}
    >(
        config: (
            | {
                  /**
                   * The format of the language URLs where $LANG$ is replaced with the language.
                   * For example if the language is `en` and the `urlFormat` is
                   * "/_locales/$LANG$.json" it would fetch it from "/_locales/en.json"
                   */
                  urlFormat: string;
              }
            | {
                  /**
                   * The language files to be used where the name is the language
                   * and the value is the language file.
                   */
                  langFiles: {
                      [key: string]: DefaultValUnknown<
                          GA['i18n'],
                          {
                              [key: string]: any;
                          }
                      >;
                  };
              }
        ) & {
            /**
             * The default language to use. This is a simple string
             */
            defaultLang: DefaultValUnknown<GA['langs'], string>;
            /**
             * An optional override of the default `getMessage` function. This function
             * gets the message from the language file given the file, a key and some
             * replacement values and returns a message string or a promise resolving to one.
             * The default function returns `file[key]`
             */
            getMessage?: (
                langFile: DefaultValUnknown<GA['i18n'], any>,
                key: string,
                values: any[]
            ) => string | Promise<string>;
            /**
             * A final step called before the `this.__` function returns. This is called with
             * a promise that resolves to a message as the first argument and a placeholder
             * as the second argument. The placeholder is of the form "{{key}}".
             * This can be used as a way to return lit-html directives or similar
             * constructs to your templates instead of simple promises
             */
            returner?: (
                messagePromise: Promise<string>,
                placeHolder: string
            ) => any;
        }
    ): void;

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
    public __prom<I extends GA['i18n'] = { [key: string]: any }>(
        key: Extract<keyof I, string>,
        ...values: any[]
    ): Promise<string>;

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
    public __<R, I extends GA['i18n'] = { [key: string]: any }>(
        key: Extract<keyof I, string>,
        ...values: any[]
    ): string | R;

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
    public static __prom(key: string, ...values: any[]): Promise<string>;

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
    public static __<R>(key: string, ...values: any[]): string | R;

    /**
     * A promise that resolves when the current language is loaded
     *
     * @readonly
     */
    public static get langReady(): Promise<void>;
}

/**
 * The static values of the i18n manager class
 */
export type WebComponentI18NManagerTypeStatic = ClassToObj<
    typeof WebComponentI18NManagerTypeInstance
>;

/**
 * A mixin that, when applied, adds i18n support in the
 * form of adding a `__` method
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export const WebComponentI18NManagerMixin = <
    P extends WebComponentI18NManagerMixinSuper
>(
    superFn: P
) => {
    const privateMap: WeakMap<
        WebComponentI18NManagerClass<any>,
        I18NClass
    > = new WeakMap();
    function i18nClass(self: WebComponentI18NManagerClass<any>): I18NClass {
        if (privateMap.has(self)) return privateMap.get(self)!;
        return privateMap.set(self, new I18NClass(self as any)).get(self)!;
    }

    // Explanation for ts-ignore:
    // Will show a warning regarding using generics in mixins
    // This issue is tracked in the typescript repo's issues with numbers
    // #26154 #24122 (among others)

    /**
     * The class that manages all i18n (internationalization) functions
     */
    //@ts-ignore
    class WebComponentI18NManagerClass<
        GA extends {
            i18n?: any;
            langs?: string;
            events?: EventListenerObj;
            themes?: {
                [key: string]: any;
            };
            root?: any;
            parent?: any;
            globalProps?: {
                [key: string]: any;
            };
        } = {},
        E extends EventListenerObj = GetEvents<GA>
    > extends superFn
        implements
            WebComponentI18NManagerMixinLike,
            WebComponentI18NManagerTypeInstance<GA> {
        constructor(...args: any[]) {
            super(...args);

            const priv = i18nClass(this);
            if (this.listenGP) {
                this.listenGP<
                    {
                        lang: string;
                    },
                    'lang'
                >('globalPropChange', (prop, value) => {
                    if (prop === 'lang') {
                        priv.setLang(value!);
                    }
                });
            } else {
                I18NClass.notifyOnLangChange((lang: string) => {
                    priv.setLang(lang);
                });
            }
            priv.setInitialLang();
        }

        public async setLang<L extends GA['langs'] = string>(
            lang: L
        ): Promise<void> {
            if (this.globalProps) {
                this.globalProps<{
                    lang: string;
                }>().set('lang', lang!);
            } else {
                const priv = i18nClass(this);
                await priv.setLang(lang);
                await priv.notifyNewLang(lang);
            }
        }

        public getLang(): FallbackExtends<GA['langs'], string> {
            return I18NClass.lang! as FallbackExtends<GA['langs'], string>;
        }

        public static initI18N<
            GA extends {
                i18n?: any;
                langs?: string;
            } = {}
        >(
            config: (
                | {
                      urlFormat: string;
                  }
                | {
                      langFiles: {
                          [key: string]: DefaultValUnknown<
                              GA['i18n'],
                              {
                                  [key: string]: any;
                              }
                          >;
                      };
                  }
            ) & {
                defaultLang: DefaultValUnknown<GA['langs'], string>;
                getMessage?: (
                    langFile: DefaultValUnknown<GA['i18n'], any>,
                    key: string,
                    values: any[]
                ) => string | Promise<string>;
                returner?: (
                    messagePromise: Promise<string>,
                    placeHolder: string
                ) => any;
            }
        ) {
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

        public __prom<I extends GA['i18n'] = { [key: string]: any }>(
            key: Extract<keyof I, string>,
            ...values: any[]
        ): Promise<string> {
            return WebComponentI18NManagerClass.__prom(key, ...values);
        }

        public __<R, I extends GA['i18n'] = { [key: string]: any }>(
            key: Extract<keyof I, string>,
            ...values: any[]
        ): string | R {
            return WebComponentI18NManagerClass.__(key, ...values);
        }

        public static async __prom(
            key: string,
            ...values: any[]
        ): Promise<string> {
            if (I18NClass.isReady) {
                return I18NClass.getMessage(
                    I18NClass.langFiles[I18NClass.lang],
                    key,
                    values
                );
            }
            return I18NClass.waitForKey(key, values);
        }

        public static __<R>(key: string, ...values: any[]): string | R {
            const value = this.__prom(key, ...values);

            return I18NClass.returner(value, `{{${key}}}`);
        }

        public static get langReady() {
            return I18NClass.loadCurrentLang();
        }

        get listenerMap(): ListenerSet<E> {
            return super.listenerMap as ListenerSet<E>;
        }

        // istanbul ignore next
        public listen = (super.listen
            ? <EV extends keyof E>(
                  event: EV,
                  listener: (...args: E[EV]['args']) => E[EV]['returnType'],
                  once: boolean = false
              ) => {
                  // istanbul ignore next
                  super.listen!(event as any, listener, once);
              }
            : void 0)!;

        // istanbul ignore next
        public clearListener = (super.clearListener
            ? <EV extends keyof E>(
                  event: EV,
                  listener?: (...args: E[EV]['args']) => E[EV]['returnType']
              ) => {
                  // istanbul ignore next
                  super.clearListener!(event as any, listener);
              }
            : void 0)!;

        // istanbul ignore next
        public fire = (super.fire
            ? <EV extends keyof E, R extends E[EV]['returnType']>(
                  event: EV,
                  ...params: E[EV]['args']
              ): R[] => {
                  // istanbul ignore next
                  return super.fire!(event as any, ...params);
              }
            : void 0)!;

        public getThemeName = (super.getThemeName
            ? <N extends GA['themes'] = { [key: string]: any }>(): Extract<
                  keyof N,
                  string
              > => {
                  // istanbul ignore next
                  return super.getThemeName!();
              }
            : void 0)!;

        public getTheme = (super.getTheme
            ? <
                  T extends GA['themes'] = { [key: string]: any }
              >(): T[keyof T] => {
                  // istanbul ignore next
                  return super.getTheme!();
              }
            : void 0)!;

        public setTheme = (super.setTheme
            ? <N extends GA['themes'] = { [key: string]: any }>(
                  themeName: Extract<keyof N, string>
              ) => {
                  // istanbul ignore next
                  return super.setTheme!(themeName);
              }
            : void 0)!;

        public registerChild = (super.registerChild
            ? <G extends GA['globalProps'] = { [key: string]: any }>(
                  element: HTMLElement
              ): G => {
                  // istanbul ignore next
                  return super.registerChild!(element as any);
              }
            : void 0)!;

        public globalProps = (super.globalProps
            ? <
                  G extends GA['globalProps'] = { [key: string]: any }
              >(): GlobalPropsFunctions<
                  DefaultVal<G, { [key: string]: any }>
              > => {
                  // istanbul ignore next
                  return super.globalProps!();
              }
            : void 0)!;

        public getRoot = (super.getRoot
            ? <T extends GA['root'] = {}>(): T => {
                  // istanbul ignore next
                  return super.getRoot!();
              }
            : void 0)!;

        public getParent = (super.getParent
            ? <T extends GA['parent'] = {}>(): T | null => {
                  // istanbul ignore next
                  return super.getParent!();
              }
            : void 0)!;

        public listenGP = (super.listenGP
            ? ((<GP extends GA['globalProps'] = { [key: string]: any }>(
                  event: 'globalPropChange',
                  listener: (
                      prop: keyof GP,
                      newValue: GP[typeof prop],
                      oldValue: typeof newValue
                  ) => void,
                  // istanbul ignore next
                  once: boolean = false
              ) => {
                  // istanbul ignore next
                  return super.listenGP!(event, listener, once);
              }) as ListenGPType<GA>)
            : void 0)!;

        public runGlobalFunction = (super.runGlobalFunction
            ? <E extends {}, R = any>(fn: (element: E) => R): R[] => {
                  // istanbul ignore next
                  return super.runGlobalFunction!(fn);
              }
            : void 0)!;
    }

    const __typecheck__: WebComponentI18NManagerTypeStatic = WebComponentI18NManagerClass;
    __typecheck__;

    return WebComponentI18NManagerClass;
};

import { Constructor, InferInstance, InferReturn, DefaultVal, DefaultValUnknown, FallbackExtends } from '../classes/types.js';
import { WebComponentHierarchyManagerMixinInstance } from './hierarchy-manager.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { ClassToObj } from './configurable.js';
/**
 * An instance of the webcomponent i18n manager mixin's resulting class
 */
export declare type WebComponentI18NManagerMixinInstance = InferInstance<WebComponentI18NManagerMixinClass> & {
    self: WebComponentI18NManagerMixinClass;
};
/**
 * The webcomponent i18n manager mixin's resulting class
 */
export declare type WebComponentI18NManagerMixinClass = InferReturn<typeof WebComponentI18NManagerMixin>;
/**
 * The parent/super type required by the i18n manager mixin
 */
export declare type WebComponentI18NManagerMixinSuper = Constructor<Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'globalProps' | 'listenGP'>> & Pick<WebComponentBaseMixinInstance, 'renderToDOM'>>;
/**
 * An interface implemented by the i18n manager. This is only used to fix some
 * TS errors and should not really be used outside of that
 */
export interface WebComponentI18NManagerMixinLike {
    getLang(): string;
    setLang(lang: string): Promise<void>;
    __<R, I extends any = {
        [key: string]: any;
    }>(key: Extract<keyof I, string>, ...values: any[]): string | R;
    __prom<I extends any = {
        [key: string]: any;
    }>(key: Extract<keyof I, string>, ...values: any[]): Promise<string>;
}
/**
 * A standalone instance of the i18n manager class
 */
export declare class WebComponentI18NManagerTypeInstance<GA extends {
    i18n?: any;
    langs?: string;
} = {}> {
    /**
     * Sets the current language
     *
     * @param {string} lang - The language to set it to, a regular string
     */
    setLang<L extends GA['langs'] = string>(lang: L): Promise<void>;
    /**
     * Gets the currently active language
     */
    getLang(): FallbackExtends<GA['langs'], string>;
    /**
     * Initializes i18n with a few important settings
     */
    static initI18N<GA extends {
        i18n?: any;
        langs?: string;
    } = {}>(config: ({
        /**
         * The format of the language URLs where $LANG$ is replaced with the language.
         * For example if the language is `en` and the `urlFormat` is
         * "/_locales/$LANG$.json" it would fetch it from "/_locales/en.json"
         */
        urlFormat: string;
    } | {
        /**
         * The language files to be used where the name is the language
         * and the value is the language file.
         */
        langFiles: {
            [key: string]: DefaultValUnknown<GA['i18n'], {
                [key: string]: any;
            }>;
        };
    }) & {
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
        getMessage?: (langFile: DefaultValUnknown<GA['i18n'], any>, key: string, values: any[]) => string | Promise<string>;
        /**
         * A final step called before the `this.__` function returns. This is called with
         * a promise that resolves to a message as the first argument and a placeholder
         * as the second argument. The placeholder is of the form "{{key}}".
         * This can be used as a way to return lit-html directives or similar
         * constructs to your templates instead of simple promises
         */
        returner?: (messagePromise: Promise<string>, placeHolder: string, onChange?: (listener: (newPromise: Promise<string>, content: string) => void) => void) => any;
    }): void;
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
    __prom<I extends GA['i18n'] = {
        [key: string]: any;
    }>(key: Extract<keyof I, string>, ...values: any[]): Promise<string>;
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
    __<R, I extends GA['i18n'] = {
        [key: string]: any;
    }>(key: Extract<keyof I, string>, ...values: any[]): string | R;
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
    static __prom(key: string, ...values: any[]): Promise<string>;
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
    static __<R>(key: string, ...values: any[]): string | R;
    /**
     * A promise that resolves when the current language is loaded
     *
     * @readonly
     */
    static get langReady(): Promise<void>;
}
/**
 * The static values of the i18n manager class
 */
export declare type WebComponentI18NManagerTypeStatic = ClassToObj<typeof WebComponentI18NManagerTypeInstance>;
/**
 * A mixin that, when applied, adds i18n support in the
 * form of adding a `__` method
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export declare const WebComponentI18NManagerMixin: <P extends Constructor<Partial<Pick<WebComponentHierarchyManagerMixinInstance, "globalProps" | "listenGP">> & Pick<WebComponentBaseMixinInstance, "renderToDOM">>>(superFn: P) => {
    new <GA extends {
        i18n?: any;
        langs?: string | undefined;
    } = {}>(...args: any[]): {
        setLang<L extends GA["langs"] = string>(lang: L): Promise<void>;
        getLang(): FallbackExtends<GA["langs"], string>;
        __prom<I extends GA["i18n"] = {
            [key: string]: any;
        }>(key: Extract<keyof I, string>, ...values: any[]): Promise<string>;
        __<R, I_1 extends GA["i18n"] = {
            [key: string]: any;
        }>(key: Extract<keyof I_1, string>, ...values: any[]): string | R;
        globalProps?: (<G extends {
            [key: string]: any;
        } | undefined = {
            [key: string]: any;
        }>() => import("./hierarchy-manager.js").GlobalPropsFunctions<DefaultVal<G, {
            [key: string]: any;
        }>>) | undefined;
        listenGP?: {
            <GP extends {
                [key: string]: any;
            } | undefined = {
                [key: string]: any;
            }>(event: "globalPropChange", listener: (prop: keyof GP, newValue: GP[keyof GP], oldValue: GP[keyof GP]) => void, once?: boolean | undefined): void;
            <GP_1 extends {
                [key: string]: any;
            } | undefined = {
                [key: string]: any;
            }, K extends keyof GP_1 = any>(event: "globalPropChange", listener: (prop: K, newValue: GP_1[K], oldValue: GP_1[K]) => void, once?: boolean | undefined): void;
        } | undefined;
        renderToDOM: (change?: number) => void;
    };
    initI18N<GA_1 extends {
        i18n?: any;
        langs?: string | undefined;
    } = {}>(config: ({
        urlFormat: string;
    } & {
        defaultLang: DefaultValUnknown<GA_1["langs"], string>;
        getMessage?: ((langFile: DefaultValUnknown<GA_1["i18n"], any>, key: string, values: any[]) => string | Promise<string>) | undefined;
        returner?: ((messagePromise: Promise<string>, placeHolder: string, onChange?: ((listener: (newPromise: Promise<string>, content: string) => void) => void) | undefined) => any) | undefined;
    }) | ({
        langFiles: {
            [key: string]: DefaultValUnknown<GA_1["i18n"], {
                [key: string]: any;
            }>;
        };
    } & {
        defaultLang: DefaultValUnknown<GA_1["langs"], string>;
        getMessage?: ((langFile: DefaultValUnknown<GA_1["i18n"], any>, key: string, values: any[]) => string | Promise<string>) | undefined;
        returner?: ((messagePromise: Promise<string>, placeHolder: string, onChange?: ((listener: (newPromise: Promise<string>, content: string) => void) => void) | undefined) => any) | undefined;
    })): void;
    __prom(key: string, ...values: any[]): Promise<string>;
    __<R_2>(key: string, ...values: any[]): string | R_2;
    readonly langReady: Promise<void>;
} & P;
//# sourceMappingURL=i18n-manager.d.ts.map
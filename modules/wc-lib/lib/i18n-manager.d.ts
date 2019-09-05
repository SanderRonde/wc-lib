import { Constructor, InferInstance, InferReturn, DefaultVal, WebComponentThemeManagerMixinInstance, DefaultValUnknown } from '../classes/types.js';
import { WebComponentHierarchyManagerMixinInstance, ListenGPType, GlobalPropsFunctions } from './hierarchy-manager.js';
import { GetEvents, ListenerSet, WebComponentListenableMixinInstance } from './listener.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { EventListenerObj } from '../wc-lib.js';
import { CHANGE_TYPE } from './template-fn.js';
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
export declare type WebComponentI18NManagerMixinSuper = Constructor<Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'globalProps' | 'listenGP'>> & Pick<WebComponentBaseMixinInstance, 'renderToDOM'> & Partial<Pick<WebComponentListenableMixinInstance, 'listen' | 'fire' | 'clearListener' | 'listenerMap'>> & Partial<Pick<WebComponentThemeManagerMixinInstance, 'getThemeName' | 'getTheme' | 'setTheme'>> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'registerChild' | 'globalProps' | 'getRoot' | 'getParent' | 'listenGP' | 'runGlobalFunction'>>>;
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
 * A mixin that, when applied, adds i18n support in the
 * form of adding a `__` method
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export declare const WebComponentI18NManagerMixin: <P extends Constructor<Partial<Pick<WebComponentHierarchyManagerMixinInstance, "globalProps" | "listenGP">> & Pick<WebComponentBaseMixinInstance, "renderToDOM"> & Partial<Pick<WebComponentListenableMixinInstance, "listen" | "fire" | "clearListener" | "listenerMap">> & Partial<Pick<WebComponentThemeManagerMixinInstance, "getTheme" | "getThemeName" | "setTheme">> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, "globalProps" | "listenGP" | "registerChild" | "getRoot" | "getParent" | "runGlobalFunction">>>>(superFn: P) => {
    new <GA extends {
        i18n?: any;
        langs?: string | undefined;
        events?: EventListenerObj | undefined;
        themes?: {
            [key: string]: any;
        } | undefined;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        } | undefined;
    } = {}, E extends EventListenerObj = GetEvents<GA>>(...args: any[]): {
        /**
         * Sets the current language
         *
         * @param {string} lang - The language to set it to, a regular string
         */
        setLang<L extends DefaultValUnknown<GA["langs"], string>>(lang: L): Promise<void>;
        /**
         * Gets the currently active language
         */
        getLang(): string | DefaultValUnknown<GA["langs"], string>;
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
        __prom<I extends GA["i18n"] = {
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
        __<R, I extends GA["i18n"] = {
            [key: string]: any;
        }>(key: Extract<keyof I, string>, ...values: any[]): string | R;
        /**
         * A map that maps every event name to
         * a set containing all of its listeners
         *
         * @readonly
         */
        readonly listenerMap: ListenerSet<E>;
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
        listen: <EV extends keyof E>(event: EV, listener: (...args: E[EV]["args"]) => E[EV]["returnType"], once?: boolean) => void;
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
        clearListener: <EV extends keyof E>(event: EV, listener?: ((...args: E[EV]["args"]) => E[EV]["returnType"]) | undefined) => void;
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
        fire: <EV extends keyof E, R extends E[EV]["returnType"]>(event: EV, ...params: E[EV]["args"]) => R[];
        /**
         * Gets the name of the current theme
         *
         * @returns {string} The name of the current theme
         */
        getThemeName: <N extends GA["themes"] = {
            [key: string]: any;
        }>() => Extract<keyof N, string>;
        /**
         * Gets the current theme's theme object
         *
         * @template T - The themes type
         *
         * @returns {T[keyof T]} A theme instance type
         */
        getTheme: <T extends GA["themes"] = {
            [key: string]: any;
        }>() => T[keyof T];
        /**
         * Sets the theme of this component and any other
         * component in its hierarchy to the passed theme
         *
         * @template N - The theme name
         */
        setTheme: <N extends GA["themes"] = {
            [key: string]: any;
        }>(themeName: Extract<keyof N, string>) => void;
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
        registerChild: <G extends GA["globalProps"] = {
            [key: string]: any;
        }>(element: HTMLElement) => G;
        /**
         * Gets the global properties functions
         *
         * @template G - The global properties
         * @returns {GlobalPropsFunctions<G>} Functions
         * 	that get and set global properties
         */
        globalProps: <G extends GA["globalProps"] = {
            [key: string]: any;
        }>() => GlobalPropsFunctions<DefaultVal<G, {
            [key: string]: any;
        }>>;
        /**
         * Gets the root node of the global hierarchy
         *
         * @template T - The type of the root
         *
         * @returns {T} The root
         */
        getRoot: <T extends GA["root"] = {}>() => T;
        /**
         * Returns the parent of this component
         *
         * @template T - The parent's type
         * @returns {T|null} - The component's parent or
         * 	null if it has none
         */
        getParent: <T extends GA["parent"] = {}>() => T | null;
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
        listenGP: ListenGPType<GA>;
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
        runGlobalFunction: <E extends {}, R = any>(fn: (element: E) => R) => R[];
        renderToDOM: (change?: CHANGE_TYPE) => void;
    };
    /**
     * Initializes i18n with a few important settings
     */
    initI18N<GA extends {
        i18n?: any;
        langs?: string | undefined;
    } = {}>(config: ({
        /**
         * The format of the language URLs where $LANG$ is replaced with the language.
         * For example if the language is `en` and the `urlFormat` is
         * "/_locales/$LANG$.json" it would fetch it from "/_locales/en.json"
         */
        urlFormat: string;
    } & {
        /**
         * The default language to use. This is a simple string
         */
        defaultLang: DefaultValUnknown<GA["langs"], string>;
        /**
         * An optional override of the default `getMessage` function. This function
         * gets the message from the language file given the file, a key and some
         * replacement values and returns a message string or a promise resolving to one.
         * The default function returns `file[key]`
         */
        getMessage?: ((langFile: DefaultValUnknown<GA["i18n"], any>, key: string, values: any[]) => string | Promise<string>) | undefined;
        /**
         * A final step called before the `this.__` function returns. This is called with
         * a promise that resolves to a message as the first argument and a placeholder
         * as the second argument. The placeholder is of the form "{{key}}".
         * This can be used as a way to return lit-html directives or similar
         * constructs to your templates instead of simple promises
         */
        returner?: ((messagePromise: Promise<string>, placeHolder: string) => any) | undefined;
    }) | ({
        /**
         * The language files to be used where the name is the language
         * and the value is the language file.
         */
        langFiles: {
            [key: string]: DefaultValUnknown<GA["i18n"], {
                [key: string]: any;
            }>;
        };
    } & {
        /**
         * The default language to use. This is a simple string
         */
        defaultLang: DefaultValUnknown<GA["langs"], string>;
        /**
         * An optional override of the default `getMessage` function. This function
         * gets the message from the language file given the file, a key and some
         * replacement values and returns a message string or a promise resolving to one.
         * The default function returns `file[key]`
         */
        getMessage?: ((langFile: DefaultValUnknown<GA["i18n"], any>, key: string, values: any[]) => string | Promise<string>) | undefined;
        /**
         * A final step called before the `this.__` function returns. This is called with
         * a promise that resolves to a message as the first argument and a placeholder
         * as the second argument. The placeholder is of the form "{{key}}".
         * This can be used as a way to return lit-html directives or similar
         * constructs to your templates instead of simple promises
         */
        returner?: ((messagePromise: Promise<string>, placeHolder: string) => any) | undefined;
    })): void;
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
    __prom(key: string, ...values: any[]): Promise<string>;
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
    __<R>(key: string, ...values: any[]): string | R;
    /**
     * A promise that resolves when the current language is loaded
     *
     * @readonly
     */
    readonly langReady: Promise<any>;
} & P;
//# sourceMappingURL=i18n-manager.d.ts.map
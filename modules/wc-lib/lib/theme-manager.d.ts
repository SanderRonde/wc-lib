import { Constructor, InferInstance, InferReturn, DefaultValUnknown, DefaultVal } from '../classes/types.js';
import { GetEvents, WebComponentListenableMixinInstance, ListenerSet } from './listener.js';
import { WebComponentHierarchyManagerMixinInstance, GlobalPropsFunctions, ListenGPType } from './hierarchy-manager.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { EventListenerObj } from '../wc-lib.js';
import { CHANGE_TYPE } from './template-fn.js';
/**
 * A value that represents the lack of a theme,
 * which is returned when no theme is set
 *
 * @constant
 */
export declare const noTheme: {};
/**
 * An instance of the theme manager mixin's resulting class
 */
export declare type WebComponentThemeManagerMixinInstance = InferInstance<WebComponentThemeManagerMixinClass> & {
    self: WebComponentThemeManagerMixinClass;
};
/**
 * The theme manager mixin's resulting class
 */
export declare type WebComponentThemeManagerMixinClass = InferReturn<typeof WebComponentThemeManagerMixin>;
/**
 * The parent/super's type required by the theme manager mixin
 */
export declare type WebComponentThemeManagerMixinSuper = Constructor<Pick<WebComponentBaseMixinInstance, 'renderToDOM'> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'globalProps' | 'listenGP'>> & Partial<Pick<WebComponentListenableMixinInstance, 'listen' | 'fire' | 'clearListener' | 'listenerMap'>> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'registerChild' | 'globalProps' | 'getRoot' | 'getParent' | 'listenGP' | 'runGlobalFunction'>> & Partial<{
    setLang(lang: string): Promise<any>;
    getLang(): string;
    __prom(key: string, ...values: any[]): Promise<any>;
    __(key: string, ...values: any[]): any;
}>>;
/**
 * A mixin that, when applied, takes care of
 * re-rendering when the theme changes. It also
 * adds some methods for getting/setting the them
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export declare const WebComponentThemeManagerMixin: <P extends Constructor<Pick<WebComponentBaseMixinInstance, "renderToDOM"> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, "globalProps" | "listenGP">> & Partial<Pick<WebComponentListenableMixinInstance, "listen" | "fire" | "clearListener" | "listenerMap">> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, "globalProps" | "listenGP" | "registerChild" | "getRoot" | "getParent" | "runGlobalFunction">> & Partial<{
    setLang(lang: string): Promise<any>;
    getLang(): string;
    __prom(key: string, ...values: any[]): Promise<any>;
    __(key: string, ...values: any[]): any;
}>>>(superFn: P) => {
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
         * Gets the name of the curent theme
         *
         * @returns {string} The name of the current theme
         */
        getThemeName<N extends GA["themes"] = {
            [key: string]: any;
        }>(): Extract<keyof N, string>;
        /**
         * Gets the current theme's theme object
         *
         * @template T - The themes type
         *
         * @returns {T[keyof T]} A theme instance type
         */
        getTheme<T extends GA["themes"] = {
            [key: string]: any;
        }>(): T[keyof T];
        /**
         * Sets the theme of this component and any other
         * component in its hierarchy to the passed theme
         *
         * @template N - The theme name
         */
        setTheme<N extends GA["themes"] = {
            [key: string]: any;
        }>(themeName: Extract<keyof N, string>): void;
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
         * @param {EV} event - The event's anme
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
         * Sets the current language
         *
         * @param {string} lang - The language to set it to, a regular string
         */
        setLang: <L extends string = DefaultValUnknown<GA["langs"], string>>(lang: L) => Promise<void>;
        /**
         * Gets the currently active language
         */
        getLang: () => string | DefaultValUnknown<GA["langs"], string>;
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
        __prom: <I extends GA["i18n"] = {
            [key: string]: any;
        }>(key: Extract<keyof I, string>, ...values: any[]) => Promise<string>;
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
        __: <R, I extends GA["i18n"] = {
            [key: string]: any;
        }>(key: Extract<keyof I, string>, ...values: any[]) => string | R;
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
     * Initializes the theme manager by passing
     * it the theme object and the default theme
     *
     * @template T - The themes indexed by name
     */
    initTheme<T extends {
        [name: string]: any;
    }>({ theme, defaultTheme }: {
        /**
         * The themes indexed by name
         */
        theme: T;
        /**
         * The default theme to use if no
         * other theme is set
         */
        defaultTheme?: Extract<keyof T, string> | undefined;
    }): void;
    /**
     * Sets the default theme
     *
     * @template T - The themes indexed by name
     *
     * @param {Extract<keyof T, string>} name - The
     * 	name of the default theme
     */
    setDefaultTheme<T extends {
        [name: string]: any;
    }>(name: Extract<keyof T, string>): void;
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
    __constructedCSSChanged(element: {
        self: any;
        getThemeName(): string;
    }): boolean;
} & P;
//# sourceMappingURL=theme-manager.d.ts.map
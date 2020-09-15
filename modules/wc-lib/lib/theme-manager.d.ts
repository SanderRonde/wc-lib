import { WebComponentHierarchyManagerMixinInstance } from './hierarchy-manager.js';
import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { CHANGE_TYPE } from './template-fn.js';
import { ClassToObj } from './configurable.js';
import { Watchable } from './util/manual.js';
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
export declare type WebComponentThemeManagerMixinSuper = Constructor<Pick<WebComponentBaseMixinInstance, 'renderToDOM'> & Partial<Pick<WebComponentBaseMixinInstance, 'getRenderArgs'>> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'globalProps' | 'listenGP'>>>;
/**
 * A standalone instance of the theme manager class
 */
export declare class WebComponentThemeManagerTypeInstance<GA extends {
    themes?: {
        [key: string]: any;
    };
} = {}> {
    /**
     * Gets the name of the curent theme
     *
     * @returns {string} The name of the current theme
     */
    getThemeName<N extends GA['themes'] = {
        [key: string]: any;
    }>(): Extract<keyof N, string>;
    /**
     * Gets the current theme's theme object
     *
     * @template T - The themes type
     *
     * @returns {T[keyof T]} A theme instance type
     */
    getTheme<T extends GA['themes'] = {
        [key: string]: any;
    }>(): T[keyof T];
    /**
     * Sets the theme of this component and any other
     * component in its hierarchy to the passed theme
     *
     * @template N - The theme name
     */
    setTheme<N extends GA['themes'] = {
        [key: string]: any;
    }>(themeName: Extract<keyof N, string>): void;
    /**
     * Returns what should be the second argument to the
     * template fn's function
     *
     * @template CT - The type of change that triggered
     *  this render
     *
     * @param {CT} changeType - The type of change that triggered
     *  this render
     *
     * @returns {{}} To-be-defined return type
     */
    getRenderArgs<CT extends CHANGE_TYPE | number>(changeType: CT): {};
    /**
     * Initializes the theme manager by passing
     * it the theme object and the default theme
     *
     * @template T - The themes indexed by name
     */
    static initTheme<T extends {
        [name: string]: any;
    }>({ theme, defaultTheme, }: {
        /**
         * The themes indexed by name
         */
        theme: T;
        /**
         * The default theme to use if no
         * other theme is set
         */
        defaultTheme?: Extract<keyof T, string>;
    }): void;
    /**
     * Sets the default theme
     *
     * @template T - The themes indexed by name
     *
     * @param {Extract<keyof T, string>} name - The
     * 	name of the default theme
     */
    static setDefaultTheme<T extends {
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
    static __constructedCSSChanged(element: {
        self: any;
        getThemeName(): string;
    }): boolean;
}
/**
 * The static values of the theme manager class
 */
export declare type WebComponentThemeManagerTypeStatic = ClassToObj<typeof WebComponentThemeManagerTypeInstance>;
/**
 * Mixin for the getRenderArgs function for this mixin
 */
export declare type GetRenderArgsThemeManagerMixin<C> = C extends {
    getTheme(): any;
} ? {
    theme: Watchable<ReturnType<C['getTheme']>>;
} : {};
/**
 * A mixin that, when applied, takes care of
 * re-rendering when the theme changes. It also
 * adds some methods for getting/setting the them
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export declare const WebComponentThemeManagerMixin: <P extends Constructor<Pick<WebComponentBaseMixinInstance, "renderToDOM"> & Partial<Pick<WebComponentBaseMixinInstance, "getRenderArgs">> & Partial<Pick<WebComponentHierarchyManagerMixinInstance, "globalProps" | "listenGP">>>>(superFn: P) => {
    new <GA extends {
        themes?: {
            [key: string]: any;
        } | undefined;
    } = {}>(...args: any[]): {
        getThemeName<N extends GA["themes"] = {
            [key: string]: any;
        }>(): Extract<keyof N, string>;
        getTheme<T extends GA["themes"] = {
            [key: string]: any;
        }>(): T[keyof T];
        setTheme<N_2 extends GA["themes"] = {
            [key: string]: any;
        }>(themeName: Extract<keyof N_2, string>): void;
        getRenderArgs<CT extends number>(changeType: CT): {};
        renderToDOM: (change?: number) => void;
        globalProps?: (<G extends {
            [key: string]: any;
        } | undefined = {
            [key: string]: any;
        }>() => import("./hierarchy-manager.js").GlobalPropsFunctions<import("../classes/types.js").DefaultVal<G, {
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
    };
    initTheme<T_2 extends {
        [name: string]: any;
    }>({ theme, defaultTheme, }: {
        theme: T_2;
        defaultTheme?: Extract<keyof T_2, string> | undefined;
    }): void;
    setDefaultTheme<T_3 extends {
        [name: string]: any;
    }>(name: Extract<keyof T_3, string>): void;
    __constructedCSSChanged(element: {
        self: any;
        getThemeName(): string;
    }): boolean;
} & P;
//# sourceMappingURL=theme-manager.d.ts.map
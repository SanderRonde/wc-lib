import { WebComponentHierarchyManagerMixinInstance } from './hierarchy-manager.js';
import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { CHANGE_TYPE } from './template-fn.js';
import { ClassToObj } from './configurable.js';

/**
 * A value that represents the lack of a theme,
 * which is returned when no theme is set
 *
 * @constant
 */
export const noTheme = {};

/**
 * An instance of the theme manager mixin's resulting class
 */
export type WebComponentThemeManagerMixinInstance = InferInstance<
    WebComponentThemeManagerMixinClass
> & {
    self: WebComponentThemeManagerMixinClass;
};

/**
 * The theme manager mixin's resulting class
 */
export type WebComponentThemeManagerMixinClass = InferReturn<
    typeof WebComponentThemeManagerMixin
>;

/**
 * The parent/super's type required by the theme manager mixin
 */
export type WebComponentThemeManagerMixinSuper = Constructor<
    Pick<WebComponentBaseMixinInstance, 'renderToDOM'> &
        Partial<
            Pick<
                WebComponentHierarchyManagerMixinInstance,
                'globalProps' | 'listenGP'
            >
        >
>;

/**
 * A standalone instance of the theme manager class
 */
export declare class WebComponentThemeManagerTypeInstance<
    GA extends {
        themes?: {
            [key: string]: any;
        };
    } = {}
> {
    /**
     * Gets the name of the curent theme
     *
     * @returns {string} The name of the current theme
     */
    public getThemeName<
        N extends GA['themes'] = { [key: string]: any }
    >(): Extract<keyof N, string>;

    /**
     * Gets the current theme's theme object
     *
     * @template T - The themes type
     *
     * @returns {T[keyof T]} A theme instance type
     */
    public getTheme<
        T extends GA['themes'] = { [key: string]: any }
    >(): T[keyof T];

    /**
     * Sets the theme of this component and any other
     * component in its hierarchy to the passed theme
     *
     * @template N - The theme name
     */
    public setTheme<N extends GA['themes'] = { [key: string]: any }>(
        themeName: Extract<keyof N, string>
    ): void;

    /**
     * Initializes the theme manager by passing
     * it the theme object and the default theme
     *
     * @template T - The themes indexed by name
     */
    static initTheme<
        T extends {
            [name: string]: any;
        }
    >({
        theme,
        defaultTheme,
    }: {
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
    static setDefaultTheme<
        T extends {
            [name: string]: any;
        }
    >(name: Extract<keyof T, string>): void;

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
    public static __constructedCSSChanged(element: {
        self: any;
        getThemeName(): string;
    }): boolean;
}

/**
 * The static values of the theme manager class
 */
export type WebComponentThemeManagerTypeStatic = ClassToObj<
    typeof WebComponentThemeManagerTypeInstance
>;

/**
 * A mixin that, when applied, takes care of
 * re-rendering when the theme changes. It also
 * adds some methods for getting/setting the them
 *
 * @template P - The parent/super's type
 *
 * @param {P} superFn - The parent/super
 */
export const WebComponentThemeManagerMixin = <
    P extends WebComponentThemeManagerMixinSuper
>(
    superFn: P
) => {
    let currentTheme: any | null = null;
    let themeListeners: ((theme: any) => any)[] = [];

    function changeTheme(theme: any) {
        currentTheme = theme;
        themeListeners.forEach((l) => l(theme));
    }

    class PrivateData {
        constructor(private _self: WebComponentThemeManager) {}

        public __setTheme() {
            this._self.renderToDOM(CHANGE_TYPE.THEME);
        }

        public static __theme: {
            [name: string]: any;
        } | null = null;

        public static __defaultTheme: string;

        public static __lastRenderedTheme: string | null = null;
    }

    const privateMap: WeakMap<
        WebComponentThemeManager,
        PrivateData
    > = new WeakMap();
    function getPrivate(self: WebComponentThemeManager): PrivateData {
        if (privateMap.has(self)) return privateMap.get(self)!;
        return privateMap.set(self, new PrivateData(self)).get(self)!;
    }
    const componentThemeMap: WeakMap<
        typeof WebComponentThemeManager,
        string
    > = new WeakMap();

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
    class WebComponentThemeManager<
        GA extends {
            themes?: {
                [key: string]: any;
            };
        } = {}
    > extends superFn implements WebComponentThemeManagerTypeInstance<GA> {
        constructor(...args: any[]) {
            super(...args);

            if (this.listenGP) {
                this.listenGP<
                    {
                        theme: string;
                    },
                    'theme'
                >('globalPropChange', (prop) => {
                    if (prop === 'theme') {
                        getPrivate(this).__setTheme();
                    }
                });
            } else {
                themeListeners.push(() => {
                    getPrivate(this).__setTheme();
                });
            }
        }

        public getThemeName<
            N extends GA['themes'] = { [key: string]: any }
        >(): Extract<keyof N, string> {
            return (
                (this.globalProps &&
                    this.globalProps<{ theme: string }>().get('theme')) ||
                currentTheme ||
                PrivateData.__defaultTheme
            );
        }

        public getTheme<
            T extends GA['themes'] = { [key: string]: any }
        >(): T[keyof T] {
            if (PrivateData.__theme) {
                const themeName = this.getThemeName();
                if (themeName && themeName in PrivateData.__theme) {
                    return PrivateData.__theme[themeName] as T[keyof T];
                }
            }
            return noTheme as T[keyof T];
        }

        public setTheme<N extends GA['themes'] = { [key: string]: any }>(
            themeName: Extract<keyof N, string>
        ) {
            if (this.globalProps) {
                this.globalProps<{ theme: Extract<keyof N, string> }>().set(
                    'theme',
                    themeName
                );
            } else {
                changeTheme(themeName);
            }
        }

        static initTheme<
            T extends {
                [name: string]: any;
            }
        >({
            theme,
            defaultTheme,
        }: {
            theme: T;
            defaultTheme?: Extract<keyof T, string>;
        }) {
            PrivateData.__theme = theme;
            if (defaultTheme) {
                this.setDefaultTheme(defaultTheme);
            }
        }

        static setDefaultTheme<
            T extends {
                [name: string]: any;
            }
        >(name: Extract<keyof T, string>) {
            PrivateData.__defaultTheme = name;
        }

        /* istanbul ignore next */
        public static __constructedCSSChanged(element: {
            self: any;
            getThemeName(): string;
        }): boolean {
            if (!componentThemeMap.has(element.self)) {
                componentThemeMap.set(element.self, element.getThemeName());
                return true;
            }

            const theme = element.getThemeName();
            if (componentThemeMap.get(element.self)! === theme) {
                return false;
            }
            componentThemeMap.set(element.self, theme);
            return true;
        }
    }

    const __typecheck__: WebComponentThemeManagerTypeStatic = WebComponentThemeManager;
    __typecheck__;

    return WebComponentThemeManager;
};

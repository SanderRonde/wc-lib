import {
    Constructor,
    InferInstance,
    InferReturn,
    DefaultValUnknown,
    DefaultVal,
} from '../classes/types.js';
import {
    GetEvents,
    WebComponentListenableMixinInstance,
    ListenerSet,
} from './listener.js';
import {
    WebComponentHierarchyManagerMixinInstance,
    GlobalPropsFunctions,
    ListenGPType,
} from './hierarchy-manager.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { EventListenerObj } from '../wc-lib.js';
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
        > &
        Partial<
            Pick<
                WebComponentListenableMixinInstance,
                'listen' | 'fire' | 'clearListener' | 'listenerMap'
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
        > &
        Partial<{
            setLang(lang: string): Promise<any>;
            getLang(): string;
            __prom(key: string, ...values: any[]): Promise<any>;
            __(key: string, ...values: any[]): any;
        }>
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

        // istanbul ignore next
        public setLang = (super.setLang
            ? <L extends string = DefaultValUnknown<GA['langs'], string>>(
                  lang: L
              ): Promise<void> => {
                  // istanbul ignore next
                  return super.setLang!(lang);
              }
            : void 0)!;

        // istanbul ignore next
        public getLang = (super.getLang
            ? (): DefaultValUnknown<GA['langs'], string> | string => {
                  // istanbul ignore next
                  return super.getLang!() as
                      | DefaultValUnknown<GA['langs'], string>
                      | string;
              }
            : void 0)!;

        // istanbul ignore next
        public __prom = (super.__prom
            ? <I extends GA['i18n'] = { [key: string]: any }>(
                  key: Extract<keyof I, string>,
                  ...values: any[]
              ): Promise<string> => {
                  // istanbul ignore next
                  return super.__prom!(key, ...values);
              }
            : void 0)!;

        // istanbul ignore next
        public __ = (super.__
            ? <R, I extends GA['i18n'] = { [key: string]: any }>(
                  key: Extract<keyof I, string>,
                  ...values: any[]
              ): string | R => {
                  // istanbul ignore next
                  return super.__!(key, ...values);
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

    const __typecheck__: WebComponentThemeManagerTypeStatic = WebComponentThemeManager;
    __typecheck__;

    return WebComponentThemeManager;
};

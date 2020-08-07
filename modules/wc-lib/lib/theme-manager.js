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
        themeListeners.forEach((l) => l(theme));
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
        getThemeName() {
            return ((this.globalProps &&
                this.globalProps().get('theme')) ||
                currentTheme ||
                PrivateData.__defaultTheme);
        }
        getTheme() {
            if (PrivateData.__theme) {
                const themeName = this.getThemeName();
                if (themeName && themeName in PrivateData.__theme) {
                    return PrivateData.__theme[themeName];
                }
            }
            return noTheme;
        }
        setTheme(themeName) {
            if (this.globalProps) {
                this.globalProps().set('theme', themeName);
            }
            else {
                changeTheme(themeName);
            }
        }
        static initTheme({ theme, defaultTheme, }) {
            PrivateData.__theme = theme;
            if (defaultTheme) {
                this.setDefaultTheme(defaultTheme);
            }
        }
        static setDefaultTheme(name) {
            PrivateData.__defaultTheme = name;
        }
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
    }
    const __typecheck__ = WebComponentThemeManager;
    __typecheck__;
    return WebComponentThemeManager;
};
//# sourceMappingURL=theme-manager.js.map
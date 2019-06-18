import { WebComponentHierarchyManagerMixinInstance } from './hierarchy-manager.js';
import { Constructor, InferInstance, InferReturn } from '../classes/types.js';
import { CHANGE_TYPE, WebComponentBaseMixinInstance } from './base.js';

/**
 * A value that represents the lack of a theme,
 * which is returned when no theme is set
 * 
 * @constant
 */
export const noTheme = {};

export type WebComponentThemeManagerMixinInstance = InferInstance<WebComponentThemeManagerMixinClass> & {
	self: WebComponentThemeManagerMixinClass;
};
export type WebComponentThemeManagerMixinClass = InferReturn<typeof WebComponentThemeManagerMixin>;

export type WebComponentThemeManagerMixinSuper = Constructor<
	Pick<WebComponentBaseMixinInstance, 'renderToDOM'> & 
	Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'globalProps'|'listenGP'>>>;

/**
 * A mixin that, when applied, takes care of 
 * re-rendering when the theme changes. It also
 * adds some methods for getting/setting the them
 */
export const WebComponentThemeManagerMixin = <P extends WebComponentThemeManagerMixinSuper>(superFn: P) => {
	let currentTheme: any|null = null;
	let themeListeners: ((theme: any) => any)[] = [];

	function changeTheme(theme: any) {
		currentTheme = theme;
		themeListeners.forEach(l => l(theme));
	}

	class PrivateData {
		constructor(private _self: WebComponentThemeManager) { }

		public __setTheme() {
			this._self.renderToDOM(CHANGE_TYPE.THEME);
		}

		public static __theme: {
			[name: string]: any;
		}|null = null;

		public static __defaultTheme: string;

		public static __lastRenderedTheme: string|null = null;
	}

	const privateMap: WeakMap<WebComponentThemeManager, PrivateData> = new WeakMap();
	function getPrivate(self: WebComponentThemeManager): PrivateData {
		if (privateMap.has(self)) return privateMap.get(self)!;
		return privateMap.set(self, new PrivateData(self)).get(self)!;
	}

	/**
	 * A class that is responsible for managing
	 * the current theme and passing it to the template
	 * function when it changes
	 */
	class WebComponentThemeManager extends superFn {
		constructor(...args: any[]) {
			super(...args);

			if (this.listenGP) {
				this.listenGP<{
					theme: string;
				}, 'theme'>('globalPropChange', (prop) => {
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

		public getThemeName(): string {
			return (this.globalProps && this.globalProps<{theme: string;}>().get('theme')) ||
				currentTheme || PrivateData.__defaultTheme;
		}

		public getTheme<T>(): T {
			if (PrivateData.__theme) {
				const themeName = this.getThemeName();
				if (themeName && themeName in PrivateData.__theme) {
					return PrivateData.__theme[themeName] as T;
				}
			}
			return noTheme as T;
		}

		//TODO: test this and document this
		public setTheme<T>(themeName: T) {
			if (this.globalProps) {
				this.globalProps<{theme: T;}>().set('theme', themeName);
			} else {
				changeTheme(themeName);
			}
		}

		static initTheme<T extends {
			[name: string]: any;
		}>({ theme, defaultTheme }: {
			theme: T;
			defaultTheme?: Extract<keyof T, string>
		}) {
			PrivateData.__theme = theme;
			if (defaultTheme) {
				this.setDefaultTheme(defaultTheme);
			}
		}

		static setDefaultTheme<T extends {
			[name: string]: any;
		}>(name: Extract<keyof T, string>) {
			PrivateData.__defaultTheme = name;
		}

		/* istanbul ignore next */
		public static __constructedCSSChanged(element: WebComponentThemeManager): boolean {
			const theme = element.getThemeName();
			if (PrivateData.__lastRenderedTheme === theme) {
				return false;
			}
			PrivateData.__lastRenderedTheme = theme;
			return true;
		}
	}
	return WebComponentThemeManager;
}
import { WebComponentHierarchyManager } from './hierarchy-manager.js';
import { EventListenerObj } from './listener.js';
import { CHANGE_TYPE } from './base.js';

/**
 * A value that represents the lack of a theme,
 * which is returned when no theme is set
 * 
 * @constant
 */
export const noTheme = {};

/**
 * A class that is responsible for managing
 * the current theme and passing it to the template
 * function when it changes
 * 
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
export abstract class WebComponentThemeManger<E extends EventListenerObj> extends WebComponentHierarchyManager<E> {
	constructor() {
		super();

		this.listenGP<{
			theme: string;
		}, 'theme'>('globalPropChange', (prop) => {
			if (prop === 'theme') {
				this.__setTheme();
			}
		});
	}

	/**
	 * Called when the component is mounted to the dom
	 */
	connectedCallback() {
		super.connectedCallback();
	}

	/**
	 * Sets the theme, which renders this element
	 * to the DOM using the "theme" change type
	 * 
	 * @private
	 */
	private __setTheme() {
		this.renderToDOM(CHANGE_TYPE.THEME);
	}

	/**
	 * Gets the name of the curent theme
	 * 
	 * @returns {string} The name of the current theme
	 */
	public getThemeName(): string {
		return (this.___definerClass.internals.globalProperties && this.___definerClass.internals.globalProperties.theme) 
			|| WebComponentThemeManger.__defaultTheme;
	}

	/**
	 * Gets the current theme's theme object
	 * 
	 * @template T - The theme type
	 * 
	 * @returns {T} A theme type
	 */
	public getTheme<T>(): T {
		if (WebComponentThemeManger.__theme) {
			const themeName = this.getThemeName();
			if (themeName && themeName in WebComponentThemeManger.__theme) {
				return WebComponentThemeManger.__theme[themeName] as T;
			}
		}
		return noTheme as T;
	}

	/**
	 * The themes indexed by name
	 * 
	 * @readonly
	 * @private
	 */
	private static __theme: {
		[name: string]: any;
	}|null = null;

	/**
	 * Initializes the theme manager by passing
	 * it the theme object and the default theme
	 * 
	 * @template T - The themes indexed by name
	 */
	static initTheme<T extends {
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
		defaultTheme?: Extract<keyof T, string>
	}) {
		this.__theme = theme;
		if (defaultTheme) {
			this.setDefaultTheme(defaultTheme);
		}
	}

	/**
	 * The default theme to use
	 * 
	 * @readonly
	 * @private
	 */
	private static __defaultTheme: string;

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
	}>(name: Extract<keyof T, string>) {
		this.__defaultTheme = name;
	}

	/**
	 * The last rendered theme
	 * 
	 * @private
	 */
	private static __lastRenderedTheme: string|null = null;

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
	public static __constructedCSSChanged(element: WebComponentThemeManger<any>): boolean {
		const theme = element.getThemeName();
		if (this.__lastRenderedTheme === theme) {
			return false;
		}
		this.__lastRenderedTheme = theme;
		return true;
	}
}
import { Constructor, InferInstance, InferReturn, DefaultValUnknown, DefaultVal } from '../classes/types.js';
import { GetEvents, WebComponentListenableMixinInstance, ListenerSet } from './listener.js';
import { WebComponentHierarchyManagerMixinInstance, GlobalPropsFunctions, ListenGPType } from './hierarchy-manager.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { EventListenerObj } from '../wclib.js';
import { CHANGE_TYPE } from './template-fn.js';

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
export type WebComponentThemeManagerMixinInstance = InferInstance<WebComponentThemeManagerMixinClass> & {
	self: WebComponentThemeManagerMixinClass;
};

/**
 * The theme manager mixin's resulting class
 */
export type WebComponentThemeManagerMixinClass = InferReturn<typeof WebComponentThemeManagerMixin>;

/**
 * The parent/super's type required by the theme manager mixin
 */
export type WebComponentThemeManagerMixinSuper = Constructor<
	Pick<WebComponentBaseMixinInstance, 'renderToDOM'> & 
	Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'globalProps'|'listenGP'>> & 
	Partial<Pick<WebComponentListenableMixinInstance, 'listen'|'fire'|'clearListener'|'listenerMap'>> & 
	Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'registerChild'|'globalProps'|'getRoot'|'getParent'|'listenGP'|'runGlobalFunction'>> &
	Partial<{
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
	const componentThemeMap: WeakMap<typeof WebComponentThemeManager, string> = new WeakMap();

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
	class WebComponentThemeManager<GA extends {
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
		}
	} = {}, E extends EventListenerObj = GetEvents<GA>> extends superFn {
		constructor(...args: any[]) {
			super(...args);

			(() => {
				if (this.listenGP) {
					try {
						this.listenGP<{
							theme: string;
						}, 'theme'>('globalPropChange', (prop) => {
							if (prop === 'theme') {
								getPrivate(this).__setTheme();
							}
						});
						return;
					} catch(e) { }
				}
				themeListeners.push(() => {
					getPrivate(this).__setTheme();
				});
			})();
		}

		/**
		 * Gets the name of the curent theme
		 * 
		 * @returns {string} The name of the current theme
		 */
		public getThemeName<N extends GA['themes'] = { [key: string]: any }>(): Extract<keyof N, string> {
			try {
				if (this.globalProps) {
					return this.globalProps<{theme: string;}>().get('theme') as Extract<keyof N, string>;
				}
			} catch(e) { }
			return currentTheme || PrivateData.__defaultTheme;
		}

		/**
		 * Gets the current theme's theme object
		 * 
		 * @template T - The themes type
		 * 
		 * @returns {T[keyof T]} A theme instance type
		 */
		public getTheme<T extends GA['themes'] = { [key: string]: any }>(): T[keyof T] {
			if (PrivateData.__theme) {
				const themeName = this.getThemeName();
				if (themeName && themeName in PrivateData.__theme) {
					return PrivateData.__theme[themeName] as T[keyof T];
				}
			}
			return noTheme as T[keyof T];
		}

		/**
		 * Sets the theme of this component and any other
		 * component in its hierarchy to the passed theme
		 * 
		 * @template N - The theme name
		 */
		public setTheme<N extends GA['themes'] = { [key: string]: any }>(themeName: Extract<keyof N, string>) {
			try {
				this.globalProps<{theme: Extract<keyof N, string>;}>().set('theme', themeName);
				return;
			} catch(e) { }
			changeTheme(themeName);
		}

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
			PrivateData.__theme = theme;
			if (defaultTheme) {
				this.setDefaultTheme(defaultTheme);
			}
		}

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
			PrivateData.__defaultTheme = name;
		}

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

		/**
		 * A map that maps every event name to
		 * a set containing all of its listeners
		 * 
		 * @readonly
		 */
		get listenerMap(): ListenerSet<E> {
			return super.listenerMap as ListenerSet<E>;
		}

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
		// istanbul ignore next
		public listen = <EV extends keyof E>(event: EV, listener: (...args: E[EV]['args']) => E[EV]['returnType'], once: boolean = false) => {
			// istanbul ignore next
			if (!super.listen) {
				throw new Error('Not implemented, please include listener mixin');
			}
			// istanbul ignore next
			super.listen(event as any, listener, once);
		}

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
		public clearListener = <EV extends keyof E>(event: EV, listener?: (...args: E[EV]['args']) => E[EV]['returnType']) => {
			// istanbul ignore next
			if (!super.clearListener) {
				throw new Error('Not implemented, please include listener mixin');
			}
			// istanbul ignore next
			super.clearListener(event as any, listener);
		}

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
		public fire = <EV extends keyof E, R extends E[EV]['returnType']>(event: EV, ...params: E[EV]['args']): R[] => {
			// istanbul ignore next
			if (!super.fire) {
				throw new Error('Not implemented, please include listener mixin');
			}
			// istanbul ignore next
			return super.fire(event as any, ...params);
		}

		/**
		 * Sets the current language
		 * 
		 * @param {string} lang - The language to set it to, a regular string
		 */
		public setLang = <L extends string = DefaultValUnknown<GA['langs'], string>>(lang: L): Promise<void> => {
			// istanbul ignore next
			if (!super.setLang) {
				throw new Error('Not implemented, please include I18N mixin');
			}
			// istanbul ignore next
			return super.setLang(lang);
		}

		/**
		 * Gets the currently active language
		 */
		public getLang = (): DefaultValUnknown<GA['langs'], string>|string => {
			// istanbul ignore next
			if (!super.getLang) {
				throw new Error('Not implemented, please include I18N mixin');
			}
			// istanbul ignore next
			return super.getLang() as DefaultValUnknown<GA['langs'], string>|string;
		}

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
		public __prom = <I extends GA['i18n'] = { [key: string]: any; }>(key: Extract<keyof I, string>, ...values: any[]): Promise<string> => {
			// istanbul ignore next
			if (!super.__prom) {
				throw new Error('Not implemented, please include I18N mixin');
			}
			// istanbul ignore next
			return super.__prom(key, ...values);
		}

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
		public __ = <R, I extends GA['i18n'] = { [key: string]: any; }>(key: Extract<keyof I, string>, ...values: any[]): string|R => {
			// istanbul ignore next
			if (!super.__) {
				throw new Error('Not implemented, please include I18N mixin');
			}
			// istanbul ignore next
			return super.__(key, ...values);
		}

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
		public registerChild = <G extends GA['globalProps'] = { [key: string]: any; }>(
			element: HTMLElement): G => {
				// istanbul ignore next
				if (!super.registerChild) {
					throw new Error('Not implemented, please include listener mixin');
				}
				// istanbul ignore next
				return super.registerChild(element as any);
			}

		/**
		 * Gets the global properties functions
		 * 
		 * @template G - The global properties
		 * @returns {GlobalPropsFunctions<G>} Functions
		 * 	that get and set global properties
		 */
		public globalProps = <G extends GA['globalProps'] = { [key: string]: any; }>(): GlobalPropsFunctions<DefaultVal<G, {[key: string]: any }>> => {
			// istanbul ignore next
			if (!super.globalProps) {
				throw new Error('Not implemented, please include hierarchy manager mixin');
			}
			// istanbul ignore next
			return super.globalProps();
		}

		/**
		 * Gets the root node of the global hierarchy
		 * 
		 * @template T - The type of the root
		 * 
		 * @returns {T} The root
		 */
		public getRoot = <T extends GA['root'] = {}>(): T => {
			// istanbul ignore next
			if (!super.getRoot) {
				throw new Error('Not implemented, please include hierarchy manager mixin');
			}
			// istanbul ignore next
			return super.getRoot();
		}

		/**
		 * Returns the parent of this component
		 * 
		 * @template T - The parent's type
		 * @returns {T|null} - The component's parent or 
		 * 	null if it has none
		 */
		public getParent = <T extends GA['parent'] = {}>(): T|null => {
			// istanbul ignore next
			if (!super.getParent) {
				throw new Error('Not implemented, please include hierarchy manager mixin');
			}
			// istanbul ignore next
			return super.getParent();
		}

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
		public listenGP = (<GP extends GA['globalProps'] = { [key: string]: any; }>(
			event: 'globalPropChange', 
			listener: (prop: keyof GP, newValue: GP[typeof prop], oldValue: typeof newValue) => void,
			// istanbul ignore next
			once: boolean = false) => {
				// istanbul ignore next
				if (!super.listenGP) {
					throw new Error('Not implemented, please include hierarchy manager mixin');
				}
				// istanbul ignore next
				return super.listenGP(event, listener, once);
		}) as ListenGPType<GA>;

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
		public runGlobalFunction = <E extends {}, R = any>(fn: (element: E) => R): R[] => {
			// istanbul ignore next
			if (!super.runGlobalFunction) {
				throw new Error('Not implemented, please include hierarchy manager mixin');
			}
			// istanbul ignore next
			return super.runGlobalFunction(fn);
		}
	}

	return WebComponentThemeManager;
}
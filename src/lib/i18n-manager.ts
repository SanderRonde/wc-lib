import { Constructor, InferInstance, InferReturn, DefaultVal, WebComponentThemeManagerMixinInstance } from '../classes/types.js';
import { GetEvents, ListenerSet, WebComponentListenableMixinInstance } from './listener.js';
import { WebComponentHierarchyManagerMixinInstance } from './hierarchy-manager.js';
import { WebComponentBaseMixinInstance } from './base.js';
import { EventListenerObj } from '../wclib.js';
import { CHANGE_TYPE } from './template-fn.js';

class I18NClass<GA extends {
	i18n?: any;
	langs?: string;
} = {}> {
	public static urlFormat: string = '/i18n/';
	public static getMessage: (langFile: any, key: string, values: any[]) => string|Promise<string> = 
		(file: {
			[key: string]: string;
		}, key: string) => {
			return file[key];
		}
	public static langFiles: {
		[key: string]: {
			[key: string]: string;
		}
	} = {};
	private static __langPromises: {
		[key: string]: Promise<{
			[key: string]: string;
		}>;
	} = {};
	private static __loadingLang: string|null = null;
	public static currentLang: string|null = null;
	public static defaultLang: string|null = null;
	public static returner: (promise: Promise<string>, content: string) => any =
		(_, c) => c
	private _elementLang: DefaultVal<GA['langs'], string>|null = null;
	private static _listeners: ((newLang: string) => void)[] = [];

	constructor(private _self: WebComponentI18NManagerMixinInstance) { }

	public setInitialLang() {
		this.setLang(I18NClass.__loadingLang! as DefaultVal<GA['langs'], string>, true);
	}

	public async notifyNewLang(lang: DefaultVal<GA['langs'], string>) {
		for (const listener of I18NClass._listeners) {
			listener(lang);
		}
	}

	public async setLang(lang: DefaultVal<GA['langs'], string>, delayRender: boolean = false) {
		if (I18NClass.__loadingLang !== lang) {
			I18NClass.__loadingLang = lang;
			await I18NClass.__loadLang(lang);
			if (I18NClass.__loadingLang === lang) {
				I18NClass.currentLang = lang;
			}
		}
		if (this._elementLang !== lang) {
			this._elementLang = lang;
			if (delayRender) {
				setTimeout(() => {
					this._self.renderToDOM(CHANGE_TYPE.LANG);
				}, 0);
			} else {
				this._self.renderToDOM(CHANGE_TYPE.LANG);
			}
		}
	}

	public static notifyOnLangChange(listener: (newLang: string) => void) {
		this._listeners.push(listener);
		/* istanbul ignore if */
		if (I18NClass.currentLang) {
			listener(I18NClass.currentLang!);
		}
	}

	private static async __fetch(url: string) {
		/* istanbul ignore next */
		if ('fetch' in window && typeof window.fetch !== undefined) {
			return window.fetch(url).then(r => r.text());
		}

		return new Promise<string>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.onreadystatechange = () => {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve(xhr.responseText);
					} else {
						reject(new Error(`Failed xhr: ${xhr.status}`));
					}
				}
			}
			xhr.send();
		});
	}

	private static async __loadLang(lang: string) {
		if (lang in this.__langPromises) return;
		const prom = new Promise<{
			[key: string]: string;
		}>(async (resolve) => {
			const text = await this.__fetch(this.urlFormat.replace(/\$LANG\$/g, lang));
			resolve(JSON.parse(text));
		});
		this.__langPromises[lang] = prom;
		this.langFiles[lang] = await prom;
	}

	public static get lang() {
		return this.currentLang || 
			this.__loadingLang ||
			this.defaultLang!;
	}

	static async loadCurrentLang(): Promise<any> {
		let loadingLang = this.lang;
		if (loadingLang in this.langFiles) return;
		if (loadingLang in this.__langPromises) {
			await this.__langPromises[loadingLang];

			// Language has changed in the meantime
			if (this.lang !== loadingLang) return this.loadCurrentLang();
			return;
		}
		this.__loadLang(loadingLang);
		await this.__langPromises[loadingLang];

		// Language has changed in the meantime
		if (this.lang !== loadingLang) return this.loadCurrentLang();
	}

	public static get isReady() {
		return this.lang in this.langFiles;
	}

	public static async waitForKey(key: string, values: any[]) {
		await this.loadCurrentLang();
		return this.getMessage(
			this.langFiles[this.lang], key, values);
	}
}

export type WebComponentI18NManagerMixinInstance = InferInstance<WebComponentI18NManagerMixinClass> & {
	self: WebComponentI18NManagerMixinClass;
};
export type WebComponentI18NManagerMixinClass = InferReturn<typeof WebComponentI18NManagerMixin>;

export type WebComponentI18NManagerMixinSuper = Constructor<
	Partial<Pick<WebComponentHierarchyManagerMixinInstance, 'globalProps'|'listenGP'>> & 
	Pick<WebComponentBaseMixinInstance, 'renderToDOM'> & 
	Partial<Pick<WebComponentListenableMixinInstance, 'listen'|'fire'|'clearListener'|'listenerMap'>> & 
	Partial<Pick<WebComponentThemeManagerMixinInstance, 'getThemeName'|'getTheme'|'setTheme'>>>;

export interface WebComponentI18NManagerMixinLike {
	getLang(): string;
	setLang(lang: string): Promise<void>;
	__<R, I extends any = { [key: string]: any; }>(key: Extract<keyof I, string>, ...values: any[]): string|R;
	__prom<I extends any = { [key: string]: any; }>(key: Extract<keyof I, string>, ...values: any[]): Promise<string>;
}

/**
 * A mixin that, when applied, adds i18n support in the
 * form of adding a `__` method
 */
export const WebComponentI18NManagerMixin = <P extends WebComponentI18NManagerMixinSuper>(superFn: P) => {
	const privateMap: WeakMap<WebComponentI18NManagerClass<any>, I18NClass> = new WeakMap();
	function i18nClass(self: WebComponentI18NManagerClass<any>): I18NClass {
		if (privateMap.has(self)) return privateMap.get(self)!;
		return privateMap.set(self, new I18NClass(self as any)).get(self)!;
	}

	// Explanation for ts-ignore:
	// Will show a warning regarding using generics in mixins
	// This issue is tracked in the typescript repo's issues with numbers
	// #26154 #24122 (among others)

	/**
	 * The class that manages all i18n (internationalization) functions
	 */
	//@ts-ignore
	class WebComponentI18NManagerClass<GA extends {
		i18n?: any;
		langs?: string;
		events?: EventListenerObj;
		themes?: {
			[key: string]: any;
		};
	} = {}, E extends EventListenerObj = GetEvents<GA>> extends superFn implements WebComponentI18NManagerMixinLike {
		constructor(...args: any[]) {
			super(...args);

			const priv = i18nClass(this);
			if (this.listenGP) {
				this.listenGP<{
					lang: string;
				}, 'lang'>('globalPropChange', (prop, value) => {
					if (prop === 'lang') {
						priv.setLang(value!);
					}
				});
			} else {
				I18NClass.notifyOnLangChange((lang: string) => {
					priv.setLang(lang);
				});
			}
			priv.setInitialLang();
		}

		/**
		 * Sets the current language
		 * 
		 * @param {string} lang - The language to set it to, a regular string
		 */
		public async setLang<L extends DefaultVal<GA['langs'], string>>(lang: L): Promise<void> {
			if (this.globalProps) {
				this.globalProps<{
					lang: string;
				}>().set('lang', lang);
			} else {
				const priv = i18nClass(this);
				await priv.setLang(lang);
				await priv.notifyNewLang(lang);
			}
		}

		/**
		 * Gets the currently active language
		 */
		public getLang(): DefaultVal<GA['langs'], string> {
			return I18NClass.lang! as DefaultVal<GA['langs'], string>;
		}
		
		/**
		 * Initializes i18n with a few important settings
		 */
		public static initI18N<GA extends {
			i18n?: any;
			langs?: string;
		} = {}>({
			urlFormat,
			defaultLang,
			getMessage,
			returner
		}: {
			/**
			 * The format of the language URLs where $LANG$ is replaced with the language.
			 * For example if the language is `en` and the `urlFormat` is 
			 * "/_locales/$LANG$.json" it would fetch it from "/_locales/en.json"
			 */
			urlFormat: string;
			/**
			 * The default language to use. This is a simple string
			 */
			defaultLang: DefaultVal<GA['langs'], string>;
			/**
			 * An optional override of the default `getMessage` function. This function
			 * gets the message from the language file given the file, a key and some 
			 * replacement values and returns a message string or a promise resolving to one. 
			 * The default function returns `file[key]`
			 */
			getMessage?: (langFile: DefaultVal<GA['i18n'], any>, key: string, values: any[]) => string|Promise<string>;
			/**
			 * A final step called before the `this.__` function returns. This is called with
			 * a promise that resolves to a message as the first argument and a placeholder
			 * as the second argument. The placeholder is of the form "{{key}}".
			 * This can be used as a way to return lit-html directives or similar
			 * constructs to your templates instead of simple promises
			 */
			returner?: (messagePromise: Promise<string>, placeHolder: string) => any;
		}) {
			I18NClass.urlFormat = urlFormat;
			if (getMessage) {
				I18NClass.getMessage = getMessage;
			}
			if (returner) {
				I18NClass.returner = returner;
			}
			I18NClass.defaultLang = defaultLang;
		}

		/**
		 * Returns a promise that resolves to the message. You will generally
		 * want to use this inside the class itself since it resolves to a simple promise.
		 * 
		 * **Note:** Does not call the `options.returner` function before returning.
		 * 
		 * @param {Extract<keyof DefaultVal<GA['i18n'], string>, string>} key - The key to search for in the messages file
		 * @param {any[]} [values] - Optional values passed to the `getMessage` function
		 * 		that can be used as placeholders or something similar
		 * 
		 * @returns {Promise<string>} A promise that resolves to the found message
		 */
		public __prom<I extends GA['i18n'] = { [key: string]: any; }>(key: Extract<keyof I, string>, ...values: any[]): Promise<string> {
			return WebComponentI18NManagerClass.__prom(key, ...values);
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
		 * @param {Extract<keyof DefaultVal<GA['i18n'], string>, string>} key - The key to search for in the messages file
		 * @param {any[]} [values] - Optional values passed to the `getMessage` function
		 * 		that can be used as placeholders or something similar
		 * 
		 * @returns {string|R} A promise that resolves to the found message
		 */
		public __<R, I extends GA['i18n'] = { [key: string]: any; }>(key: Extract<keyof I, string>, ...values: any[]): string|R {
			return WebComponentI18NManagerClass.__(key, ...values);
		}

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
		public static async __prom(key: string, ...values: any[]): Promise<string> {
			if (I18NClass.isReady) {
				return I18NClass.getMessage(
					I18NClass.langFiles[I18NClass.lang], key,
						values);
			}
			return I18NClass.waitForKey(key, values);
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
		 * @param {string} key - The key to search for in the messages file
		 * @param {any[]} [values] - Optional values passed to the `getMessage` function
		 * 		that can be used as placeholders or something similar
		 * 
		 * @returns {string|R} A promise that resolves to the found message
		 */
		public static __<R>(key: string, ...values: any[]): string|R {
			const value = this.__prom(key, ...values);

			return I18NClass.returner(value, `{{${key}}}`);
		}

		/**
		 * A promise that resolves when the current language is loaded
		 * 
		 * @readonly
		 */
		public static get langReady() {
			return I18NClass.loadCurrentLang();
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
				throw new Error('Not implemented');
			}
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
				throw new Error('Not implemented');
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
				throw new Error('Not implemented');
			}
			// istanbul ignore next
			return super.fire(event as any, ...params);
		}

		/**
		 * Gets the name of the curent theme
		 * 
		 * @returns {string} The name of the current theme
		 */
		public getThemeName = <N extends GA['themes'] = { [key: string]: any }>(): Extract<keyof N, string> => {
			// istanbul ignore next
			if (!super.getThemeName) {
				throw new Error('Not implemented');
			}
			// istanbul ignore next
			return super.getThemeName();
		}

		/**
		 * Gets the current theme's theme object
		 * 
		 * @template T - The themes type
		 * 
		 * @returns {T[keyof T]} A theme instance type
		 */
		public getTheme = <T extends GA['themes'] = { [key: string]: any }>(): T[keyof T] => {
			// istanbul ignore next
			if (!super.getTheme) {
				throw new Error('Not implemented');
			}
			// istanbul ignore next
			return super.getTheme();
		}

		/**
		 * Sets the theme of this component and any other
		 * component in its hierarchy to the passed theme
		 * 
		 * @template N - The theme name
		 */
		public setTheme = <N extends GA['themes'] = { [key: string]: any }>(themeName: Extract<keyof N, string>) => {
			// istanbul ignore next
			if (!super.setTheme) {
				throw new Error('Not implemented');
			}
			// istanbul ignore next
			return super.setTheme(themeName);
		}
	}

	return WebComponentI18NManagerClass;
}
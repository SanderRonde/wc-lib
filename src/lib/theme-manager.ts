import { WebComponentHierarchyManager } from './hierarchy-manager.js';
import { EventListenerObj } from './listener.js';
import { CHANGE_TYPE } from './base.js';

const noTheme = {};
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

	connectedCallback() {
		super.connectedCallback();
	}

	private __setTheme() {
		this.renderToDOM(CHANGE_TYPE.THEME);
	}

	public getThemeName() {
		return (this.___definerClass.internals.globalProperties && this.___definerClass.internals.globalProperties.theme) 
			|| WebComponentThemeManger.__defaultTheme;
	}

	public getTheme<T>(): T {
		if (WebComponentThemeManger.__theme) {
			const themeName = this.getThemeName();
			if (themeName && themeName in WebComponentThemeManger.__theme) {
				return WebComponentThemeManger.__theme[themeName] as T;
			}
		}
		return noTheme as T;
	}

	private static __theme: {
		[name: string]: any;
	}|null = null;
	static initTheme<T extends {
		[name: string]: any;
	}>({ theme, defaultTheme }: {
		theme: T;
		defaultTheme?: Extract<keyof T, string>
	}) {
		this.__theme = theme;
		if (defaultTheme) {
			this.setDefaultTheme(defaultTheme);
		}
	}

	private static __defaultTheme: string;
	static setDefaultTheme<T extends {
		[name: string]: any;
	}>(name: Extract<keyof T, string>) {
		this.__defaultTheme = name;
	}

	static getTheme() {
		return this.__theme;
	}

	private static __lastRenderedTheme: string|null = null;
	public static __constructedCSSChanged(element: WebComponentThemeManger<any>): boolean {
		const theme = element.getThemeName();
		if (this.__lastRenderedTheme === theme) {
			return false;
		}
		this.__lastRenderedTheme = theme;
		return true;
	}
}
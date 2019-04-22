import { WebComponentHierarchyManager } from './hierarchy-manager';
import { EventListenerObj } from './listener';
import { Theme } from './webcomponent-types';
import { CHANGE_TYPE } from './base';

const noTheme: Theme = {
	accent: {
		main: '#F00',
		weak: '#F00',
	},
	background: '#000',
	error: '#F00',
	primary: {
		main: '#F00',
		weak: '#F00',
	},
	success: '#0F0',
	text: '#000'
};
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

	public getTheme<T extends Theme = Theme>(): T {
		if (WebComponentThemeManger.__theme) {
			const themeName = this.getThemeName();
			if (themeName && themeName in WebComponentThemeManger.__theme) {
				return WebComponentThemeManger.__theme[themeName] as T;
			}
		}
		return noTheme as T;
	}

	private static __theme: {
		[name: string]: Theme;
	}|null = null;
	static initTheme<T extends {
		[name: string]: Theme;
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
		[name: string]: Theme;
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
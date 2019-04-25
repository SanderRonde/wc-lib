import { WebComponentThemeManger } from './theme-manager.js';
import { EventListenerObj } from './listener.js';
import { CHANGE_TYPE } from './base.js';

class I18NClass {
	public static format: string = '/i18n/';
	public static getMessage: (langFile: any, key: string, values: any[]) => string = 
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
	private _elementLang: string|null = null;

	constructor(private _self: WebComponentI18NManager<any>) { }

	public setInitialLang() {
		const lang = this._self.globalProps<{
			lang: string;
		}>().get('lang');
		if (lang === undefined) {
			this.setLang(I18NClass.__loadingLang!);
		}
	}

	public async setLang(lang: string) {
		if (I18NClass.__loadingLang !== lang) {
			I18NClass.__loadingLang = lang;
			await I18NClass.__loadLang(lang);
			I18NClass.currentLang = lang;
		}
		if (this._elementLang !== lang) {
			this._elementLang = lang;
			this._self.renderToDOM(CHANGE_TYPE.LANG);
		}
	}

	private static async __loadLang(lang: string) {
		if (lang in this.__langPromises) return;
		const prom = fetch(this.format.replace(/\$LANG\$/g, lang)).then(r => r.json());
		this.__langPromises[lang] = prom;
		this.langFiles[lang] = await prom;
	}

	public static get lang() {
		return this.currentLang || 
			this.__loadingLang ||
			this.defaultLang!;
	}

	private static async __loadCurrentLang() {
		if (this.lang in this.langFiles) return;
		if (this.lang in this.__langPromises) {
			await this.__langPromises[this.lang];
			return;
		}
		this.__loadLang(this.lang);
		await this.__langPromises[this.lang];
	}

	public static get isReady() {
		return this.lang in this.langFiles;
	}


	public static async waitForKey(key: string, values: any[]) {
		await this.__loadCurrentLang();
		return this.getMessage(
			this.langFiles[this.lang], key, values);
	}

	public static preprocess(prom: Promise<string>, process?: (str: string) => string): Promise<string> {
		if (!process) return prom;

		return new Promise<string>(async (resolve) => {
			resolve(process(await prom));
		});
	}
}

export abstract class WebComponentI18NManager<E extends EventListenerObj> extends WebComponentThemeManger<E> {
	private ___i18nClass: I18NClass = new I18NClass(this);

	constructor() {
		super();

		this.listenGP<{
			lang: string;
		}, 'lang'>('globalPropChange', (prop, value) => {
			if (prop === 'lang') {
				this.___i18nClass.setLang(value!);
			}
		});
		this.___i18nClass.setInitialLang();
	}

	
	public setLang<L extends string>(lang: L) {
		this.globalProps<{
			lang: string;
		}>().set('lang', lang);
	}

	public getLang() {
		return I18NClass.currentLang!;
	}
	
	public static initI18N({
		format,
		defaultLang,
		getMessage,
		returner
	}: {
		format: string;
		defaultLang: string;
		getMessage?: (langFile: any, key: string, values: any[]) => string;
		returner?: (promise: Promise<string>, content: string) => any;
	}) {
		I18NClass.format = format;
		if (getMessage) {
			I18NClass.getMessage = getMessage;
		}
		if (returner) {
			I18NClass.returner = returner;
		}
		I18NClass.defaultLang = defaultLang;
	}

	public __prom(key: string, values: any[]) {
		if (I18NClass.isReady) {
			return I18NClass.getMessage(
				I18NClass.langFiles[I18NClass.lang], key,
					values);
		}
		return I18NClass.waitForKey(key, values);
	}
	
	public __process(key: string, process?: (str: string) => string,
		...values: any[]) {
			const value = this.__prom(key, values);
			if (typeof value === 'string') return process ? process(value) : value;

			return I18NClass.returner(
				I18NClass.preprocess(value, process), `{{${key}}}`);
		}

	public __(key: string, ...values: any[]) {
		const value = this.__prom(key, values);
		if (typeof value === 'string') return value;

		return I18NClass.returner(
			I18NClass.preprocess(value), `{{${key}}}`);
	}

	public static async __(key: string, ...values: any[]) {
		const value = (() => {
			if (I18NClass.isReady) {
				return I18NClass.getMessage(
					I18NClass.langFiles[I18NClass.lang], key,
						values);
			}
			return I18NClass.waitForKey(key, values);
		})();
		if (typeof value === 'string') return value;

		return I18NClass.preprocess(value);
	}
}
import { WebComponentThemeManger } from './theme-manager';
import { EventListenerObj } from './listener';
import { CHANGE_TYPE } from './base';
import { Part } from 'lit-html';

class I18NClass {
	public static path: string = '/i18n/';
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
		const prom = fetch(`${this.path}${lang}.json`).then(r => r.json());
		this.__langPromises[lang] = prom;
		this.langFiles[lang] = await prom;
	}

	public get lang() {
		return I18NClass.currentLang ||
		I18NClass.__loadingLang! ||
		I18NClass.defaultLang!
	}

	private async __loadCurrentLang() {
		if (this.lang in I18NClass.__langPromises) return;
		I18NClass.__loadLang(this.lang);
		await I18NClass.__langPromises[this.lang];
	}

	public get isReady() {
		return this.lang in I18NClass.langFiles;
	}

	public async waitForKey(key: string) {
		await this.__loadCurrentLang();
		return I18NClass.langFiles[this.lang][key];
	}

	public preprocess(prom: Promise<string>, process?: (str: string) => string): Promise<string> {
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
		path,
		defaultLang,
		returner
	}: {
		path: string;
		defaultLang: string;
		returner?: (promise: Promise<string>, content: string) => any;
	}) {
		if (!path.endsWith('/')) {
			path = path + '/';
		}
		I18NClass.path = path;
		if (returner) {
			I18NClass.returner = returner;
		}
		I18NClass.defaultLang = defaultLang;
	}

	public __prom(key: string) {
		if (this.___i18nClass.isReady) {
			return I18NClass.langFiles[this.___i18nClass.lang][key]
		}
		return this.___i18nClass.waitForKey(key);
	}

	public __(key: string, process?: (str: string) => string) {
		const value = this.__prom(key);
		if (typeof value === 'string') return process ? process(value) : value;

		return I18NClass.returner(
			this.___i18nClass.preprocess(value, process), `{{${key}}}`);
	}
}
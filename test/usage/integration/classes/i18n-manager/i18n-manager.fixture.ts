import { directive, Part } from '../../../../../node_modules/lit-html/lit-html.js';
import { RootElement } from '../hierarchy-manager/elements/root-element.js';
import { WebComponentI18NManager } from '../../../../../src/wclib.js';
import { LangElement } from './elements/test-lang-element.js';
import { TestElement } from "../elements/test-element.js";

interface LangFile {
	test: {
		message: string;
	}
	values: {
		message: string;
	}
}

function applyMarker<F>(fn: F): F {
	(fn as any).___marker = true;
	return fn;
}

WebComponentI18NManager.initI18N({
	urlFormat: '/test/usage/fixtures/i18n/$LANG$.json',
	defaultLang: 'en',
	returner: directive((promise: Promise<any>, placeholder: string) => applyMarker((part: Part) => {
		part.setValue(placeholder);
		promise.then((str) => {
			part.setValue(str);
			part.commit();
		});
	})),
	async getMessage(langFile: LangFile, key, values) {
		if (!(key in langFile)) {
			return 'not found';
		}

		values = await Promise.all(values);
		const item = langFile[key as keyof typeof langFile];
		if (values.length === 0) return item.message;

		let word = item.message;
		for (let i = 0; i < values.length; i++) {
			word = word.replace(new RegExp(`\\$${i + 1}\\$`, 'gi'),
				values[i]);
		}
		return word;
	}
});

(window as any).WebComponentI18NManager = WebComponentI18NManager;
TestElement.define();
LangElement.define();
RootElement.define();
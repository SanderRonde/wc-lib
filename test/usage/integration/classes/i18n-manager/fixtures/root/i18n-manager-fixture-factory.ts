import { WebComponentI18NManagerMixinClass } from '../../../../../../../build/es/classes/types.js';
import { directive, Part } from '../../../../../../../node_modules/lit-html/lit-html.js';
import { RootElementFactory } from '../../../hierarchy-manager/elements/root-element.js';

export function i18nManagerRootFixtureFactory(base: WebComponentI18NManagerMixinClass) {
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

	base.initI18N({
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

	(window as any).WebComponent = base;
	RootElementFactory(base).define(true);
}
import { WebComponentI18NManagerMixinClass } from '../../../../../../../build/es/classes/types.js';
import { LangElementFactory } from '../../elements/test-lang-element.js';

export function i18nManagerDefaultsFixtureFactory(base: WebComponentI18NManagerMixinClass) {
	base.initI18N({
		urlFormat: '/test/usage/fixtures/i18n/$LANG$.json',
		defaultLang: 'en'
	});

	(window as any).WebComponent = base;
	LangElementFactory(base).define(true);
}
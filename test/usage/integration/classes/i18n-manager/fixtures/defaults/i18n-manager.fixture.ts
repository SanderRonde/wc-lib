import { WebComponentI18NManager } from '../../../../../../../src/wclib.js';
import { LangElement } from '../../elements/test-lang-element.js';

WebComponentI18NManager.initI18N({
	urlFormat: '/test/usage/fixtures/i18n/$LANG$.json',
	defaultLang: 'en'
});

(window as any).WebComponentI18NManager = WebComponentI18NManager;
LangElement.define();
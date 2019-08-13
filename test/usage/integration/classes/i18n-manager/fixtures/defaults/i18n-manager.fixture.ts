import { WebComponent } from '../../../../../../../build/es/wc-lib.js';
import { LangElement } from '../../elements/test-lang-element.js';

WebComponent.initI18N({
	urlFormat: '/test/usage/fixtures/i18n/$LANG$.json',
	defaultLang: 'en'
});

(window as any).WebComponent = WebComponent;
LangElement.define(true);
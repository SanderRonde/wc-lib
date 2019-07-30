import { ConfigurableWebComponent, config } from '../../src/wclib';
import { I18nComponentHTML } from './i18n-component.html.js';

@config({
	is: 'i18n-component',
	css: null,
	html: I18nComponentHTML
})
export class I18nComponent extends ConfigurableWebComponent {
	
}
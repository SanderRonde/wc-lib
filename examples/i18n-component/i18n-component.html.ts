import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { I18nComponent } from './i18n-component.js';
import { html, render } from 'lit-html';

export const I18nComponentHTML = new TemplateFn<I18nComponent>(function () {
	return html`
		<div>${this.__('what_is_your_name')}</div>
		<div>
			<label for="input">${this.__('my_name_is')}</span>
			<input id="input">
		</div>
		<br />
		<button @click=${() => {
			this.setLang('en');
		}}>${this.__('set_lang_to', this.__('english'))}</button>
		<button @click=${() => {
			this.setLang('de');
		}}>${this.__('set_lang_to', this.__('german'))}</button>
		<button @click=${() => {
			this.setLang('es');
		}}>${this.__('set_lang_to', this.__('spanish'))}</button>
	`
}, CHANGE_TYPE.LANG, render);
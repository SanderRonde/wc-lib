import { render, html } from '../../node_modules/lit-html/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../build/es/wc-lib.js';
import { I18nComponent } from './i18n-component.js';

export const I18nComponentHTML = new TemplateFn<I18nComponent>(
    function() {
        return html`
		<div>${this.__('what_is_your_name')}</div>
		<div>
			<label for="input">${this.__('my_name_is')}</span>
			<input id="input">
		</div>
		<br />
		<button @click=${() => {
            this.setLang('en');
        }}>${this.__('set_lang_to', this.__prom('english'))}</button>
		<button @click=${() => {
            this.setLang('de');
        }}>${this.__('set_lang_to', this.__prom('german'))}</button>
		<button @click=${() => {
            this.setLang('es');
        }}>${this.__('set_lang_to', this.__prom('spanish'))}</button>
	`;
    },
    CHANGE_TYPE.LANG,
    render
);

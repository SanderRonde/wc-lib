import { render, html } from '../modules/lit-html-bundled/lit-html.js';
import { TemplateFn } from '../modules/wc-lib/wc-lib.js';
export const I18nComponentHTML = new TemplateFn(function () {
    return html `
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
}, 4 /* LANG */, render);

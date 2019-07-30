import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { TypedHtml } from './typed-html.js';
import { render } from 'lit-html';

export const TypedHtmlCSS = new TemplateFn<TypedHtml>(function (html) {
	return html`<style>
		
	</style>`
}, CHANGE_TYPE.THEME, render);

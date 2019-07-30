import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { TypedHtml } from './typed-html.js';
import { render } from 'lit-html';

export const TypedHtmlHTML = new TemplateFn<TypedHtml>(function (html, props) {
	return html`
		<div></div>
	`
}, CHANGE_TYPE.PROP, render);

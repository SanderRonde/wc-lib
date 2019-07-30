import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { TypedCss } from './typed-css.js';
import { render } from 'lit-html';

export const TypedCssHTML = new TemplateFn<TypedCss>(function (html, props) {
	return html`
		<div></div>
	`
}, CHANGE_TYPE.PROP, render);

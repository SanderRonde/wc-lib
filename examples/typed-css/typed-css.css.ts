import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { TypedCss } from './typed-css.js';
import { render } from 'lit-html';

export const TypedCssCSS = new TemplateFn<TypedCss>(function (html) {
	return html`<style>
		
	</style>`
}, CHANGE_TYPE.THEME, render);

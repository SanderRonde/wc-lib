import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { ThemedComponent } from './themed-component.js';
import { render } from 'lit-html';

export const ThemedComponentCSS = new TemplateFn<ThemedComponent>(function (html) {
	return html`<style>
		
	</style>`
}, CHANGE_TYPE.THEME, render);

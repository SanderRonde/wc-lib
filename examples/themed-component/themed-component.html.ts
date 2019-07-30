import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { ThemedComponent } from './themed-component.js';
import { render } from 'lit-html';

export const ThemedComponentHTML = new TemplateFn<ThemedComponent>(function (html, props) {
	return html`
		<div></div>
	`
}, CHANGE_TYPE.PROP, render);

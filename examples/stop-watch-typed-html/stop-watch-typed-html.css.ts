import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { StopWatchTypedHTML } from './stop-watch-typed-html.js';
import { render } from 'lit-html';

export const StopWatchTypedHTMLCSS = new TemplateFn<StopWatchTypedHTML>(function (html) {
	return html`<style>
		.inline {
			display: inline-block;
		}
	</style>`
}, CHANGE_TYPE.THEME, render);

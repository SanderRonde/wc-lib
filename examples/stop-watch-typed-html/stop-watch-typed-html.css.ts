import { render } from '../../node_modules/lit-html/lit-html.js';
import { StopWatchTypedHTML } from './stop-watch-typed-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';

export const StopWatchTypedHTMLCSS = new TemplateFn<StopWatchTypedHTML>(function (html) {
	return html`<style>
		.inline {
			display: inline-block;
		}
	</style>`
}, CHANGE_TYPE.THEME, render);

import { render } from '../modules/lit-html/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../modules/wc-lib/wc-lib.js';
import { StopWatch } from './stop-watch.js';

export const StopWatchCSS = new TemplateFn<StopWatch>(function (html) {
	return html`<style>
		.inline {
			display: inline-block;
		}
	</style>`
}, CHANGE_TYPE.NEVER, render);

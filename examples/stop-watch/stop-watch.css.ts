import { render } from '../../node_modules/lit-html/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../build/es/wclib.js';
import { StopWatch } from './stop-watch.js';

export const StopWatchCSS = new TemplateFn<StopWatch>(function (html) {
	return html`<style>
		.inline {
			display: inline-block;
		}
	</style>`
}, CHANGE_TYPE.NEVER, render);

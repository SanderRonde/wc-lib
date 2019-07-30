import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { StopWatch } from './stop-watch.js';
import { render } from 'lit-html';

export const StopWatchCSS = new TemplateFn<StopWatch>(function (html) {
	return html`<style>
		.inline {
			display: inline-block;
		}
	</style>`
}, CHANGE_TYPE.NEVER, render);

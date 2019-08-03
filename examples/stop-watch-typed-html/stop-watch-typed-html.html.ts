import { render } from '../../node_modules/lit-html/lit-html.js';
import { StopWatchTypedHTML } from './stop-watch-typed-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';

export const StopWatchTypedHTMLHTML = new TemplateFn<StopWatchTypedHTML>(function (html, props) {
	return html`
		<h1 id="header">Stopwatch ${props.running ? 'running' : 'not running'}</h1>
		<div id="time">${props.seconds}</div>
		<div id="buttons">
			<button id="start" @click="${this.onStart}" class="inline">Start</button>
			<button id="stop" @click="${this.onStop}" class="inline">Stop</button>
			<button id="reset" @click="${this.onReset}" class="inline">Reset</button>
		</div>
	`
}, CHANGE_TYPE.NEVER, render);

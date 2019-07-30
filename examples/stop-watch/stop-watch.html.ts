import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { StopWatch } from './stop-watch.js';
import { render } from 'lit-html';

export const StopWatchHTML = new TemplateFn<StopWatch>(function (html, props) {
	return html`
		<h1>Stopwatch ${props.running ? 'running' : 'not running'}</h1>
		<div id="time">${props.seconds}</div>
		<div id="buttons">
			<button @click="${this.onStart}" class="inline">Start</button>
			<button @click="${this.onStop}" class="inline">Stop</button>
			<button @click="${this.onReset}" class="inline">Reset</button>
		</div>
	`
}, CHANGE_TYPE.PROP, render);

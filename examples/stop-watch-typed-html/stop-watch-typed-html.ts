import { ConfigurableWebComponent, config, Listeners } from '../../src/wclib';
import { StopWatchTypedHTMLHTML } from './stop-watch-typed-html.html.js';
import { StopWatchTypedHTMLCSS } from './stop-watch-typed-html.css.js';

@config({
	is: 'stop-watch-typed-html',
	css: StopWatchTypedHTMLCSS,
	html: StopWatchTypedHTMLHTML
})
export class StopWatchTypedHTML extends ConfigurableWebComponent<{
	selectors: {
		IDS: {
			header: HTMLHeadingElement;
			time: HTMLDivElement;
			start: HTMLButtonElement;
			stop: HTMLButtonElement;
			reset: HTMLButtonElement;
		};
		CLASSES: {
			inline: HTMLButtonElement;
		}
	};
}> {
	private _timer: number|null = null;
	private _seconds: number = 0;
	private _running: boolean = false;

	private _change() {
		this.$.header.innerText = `Stopwatch ${this._running ? 'running' : 'not running'}`;
		this.$.time.innerText = this._seconds + '';
	}

	onStart() {
		if (this._running) return;

		this._running = true;
		this._change();
		this._timer = window.setInterval(() => {
			this._seconds++;
			this._change();
		}, 1000);
	}

	onStop() {
		if (!this._running) return;

		this._running = false;
		this._change();
		this._timer && window.clearInterval(this._timer);
	}

	onReset() {
		this._seconds = 0;
		this._change();
	}

	render() {
		Listeners.listenIfNew(this, 'start', 'click', this.onStart);
		Listeners.listenIfNew(this, 'stop', 'click', this.onStop);
		Listeners.listenIfNew(this, 'reset', 'click', this.onReset);
	}
}
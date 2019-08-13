import { ConfigurableWebComponent, config, Listeners } from '../../build/es/wclib.js';
import { StopWatchTypedHTMLHTML } from './stop-watch-typed-html.html.js';
import { StopWatchTypedHTMLCSS } from './stop-watch-typed-html.css.js';

// 10 MS precision
const TIMER_PRECISION = 10;


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
	private _ms: number = 0;
	private _running: boolean = false;

	private _change() {
		this.$.header.innerText = `Stopwatch ${this._running ? 'running' : 'not running'}`;
		this.$.time.innerText = this.formatTime(this._ms);
	}

	formatTime(ms: number) {
		return `${Math.round(ms / 1000)}.${(ms % 1000) / TIMER_PRECISION}`
	}

	onStart() {
		if (this._running) return;

		this._running = true;
		this._change();
		this._timer = window.setInterval(() => {
			this._ms += TIMER_PRECISION;
			this._change();
		}, TIMER_PRECISION);
	}

	onStop() {
		if (!this._running) return;

		this._running = false;
		this._change();
		this._timer && window.clearInterval(this._timer);
	}

	onReset() {
		this._ms = 0;
		this._change();
	}

	firstRender() {
		this._change();
	}

	postRender() {
		Listeners.listenIfNew(this, 'start', 'click', this.onStart);
		Listeners.listenIfNew(this, 'stop', 'click', this.onStop);
		Listeners.listenIfNew(this, 'reset', 'click', this.onReset);
	}
}
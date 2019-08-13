import { ConfigurableWebComponent, Props, PROP_TYPE, config } from '../../build/es/wclib.js';
import { StopWatchHTML } from './stop-watch.html.js';
import { StopWatchCSS } from './stop-watch.css.js';

// 10 MS precision
const TIMER_PRECISION = 10;

@config({
	is: 'stop-watch',
	css: StopWatchCSS,
	html: StopWatchHTML
})
export class StopWatch extends ConfigurableWebComponent {
	private _timer: number|null = null;

	props = Props.define(this, {
		reflect: {
			ms: {
				type: PROP_TYPE.NUMBER,
				value: 0
			}
		},
		priv: {
			running: {
				type: PROP_TYPE.BOOL,
				value: false
			}
		}
	});

	formatTime(ms: number) {
		return `${Math.round(ms / 1000)}.${(ms % 1000) / TIMER_PRECISION}`
	}

	private _startTimer() {
		this._timer = window.setInterval(() => {
			this.props.ms += TIMER_PRECISION;
		}, TIMER_PRECISION);
	}

	onStart() {
		if (this.props.running) return;

		this.props.running = true;
		this._startTimer();
	}

	onStop() {
		if (!this.props.running) return;

		this.props.running = false;
		this._timer && window.clearInterval(this._timer);
	}

	onReset() {
		this.props.ms = 0;
	}
}
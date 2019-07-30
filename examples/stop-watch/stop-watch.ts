import { ConfigurableWebComponent, Props, PROP_TYPE, config } from '../../src/wclib';
import { StopWatchHTML } from './stop-watch.html.js';
import { StopWatchCSS } from './stop-watch.css.js';

@config({
	is: 'stop-watch',
	css: StopWatchCSS,
	html: StopWatchHTML
})
export class StopWatch extends ConfigurableWebComponent {
	private _timer: number|null = null;

	props = Props.define(this, {
		reflect: {
			seconds: {
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

	onStart() {
		if (this.props.running) return;

		this.props.running = true;
		this._timer = window.setInterval(() => {
			this.props.seconds++;
		}, 1000);
	}

	onStop() {
		if (!this.props.running) return;

		this.props.running = false;
		this._timer && window.clearInterval(this._timer);
	}

	onReset() {
		this.props.seconds = 0;
	}
}
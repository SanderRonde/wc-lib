var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, Props, config } from '../../src/wclib.js';
import { StopWatchHTML } from './stop-watch.html.js';
import { StopWatchCSS } from './stop-watch.css.js';
// 10 MS precision
const TIMER_PRECISION = 10;
let StopWatch = class StopWatch extends ConfigurableWebComponent {
    constructor() {
        super(...arguments);
        this._timer = null;
        this.props = Props.define(this, {
            reflect: {
                ms: {
                    type: "number" /* NUMBER */,
                    value: 0
                }
            },
            priv: {
                running: {
                    type: "bool" /* BOOL */,
                    value: false
                }
            }
        });
    }
    formatTime(ms) {
        return `${Math.round(ms / 1000)}.${(ms % 1000) / TIMER_PRECISION}`;
    }
    _startTimer() {
        this._timer = window.setInterval(() => {
            this.props.ms += TIMER_PRECISION;
        }, TIMER_PRECISION);
    }
    onStart() {
        if (this.props.running)
            return;
        this.props.running = true;
        this._startTimer();
    }
    onStop() {
        if (!this.props.running)
            return;
        this.props.running = false;
        this._timer && window.clearInterval(this._timer);
    }
    onReset() {
        this.props.ms = 0;
    }
};
StopWatch = __decorate([
    config({
        is: 'stop-watch',
        css: StopWatchCSS,
        html: StopWatchHTML
    })
], StopWatch);
export { StopWatch };

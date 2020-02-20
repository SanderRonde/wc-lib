var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, config, Listeners, } from '../modules/wc-lib/wc-lib.js';
import { StopWatchTypedHTMLHTML } from './stop-watch-typed-html.html.js';
import { StopWatchTypedHTMLCSS } from './stop-watch-typed-html.css.js';
// 10 MS precision
const TIMER_PRECISION = 10;
let StopWatchTypedHTML = class StopWatchTypedHTML extends ConfigurableWebComponent {
    constructor() {
        super(...arguments);
        this._timer = null;
        this._ms = 0;
        this._running = false;
    }
    _change() {
        this.$.header.innerText = `Stopwatch ${this._running ? 'running' : 'not running'}`;
        this.$.time.innerText = this.formatTime(this._ms);
    }
    formatTime(ms) {
        return `${Math.round(ms / 1000)}.${(ms % 1000) / TIMER_PRECISION}`;
    }
    onStart() {
        if (this._running)
            return;
        this._running = true;
        this._change();
        this._timer = window.setInterval(() => {
            this._ms += TIMER_PRECISION;
            this._change();
        }, TIMER_PRECISION);
    }
    onStop() {
        if (!this._running)
            return;
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
};
StopWatchTypedHTML = __decorate([
    config({
        is: 'stop-watch-typed-html',
        css: StopWatchTypedHTMLCSS,
        html: StopWatchTypedHTMLHTML,
    })
], StopWatchTypedHTML);
export { StopWatchTypedHTML };

import { render } from '../../node_modules/lit-html/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../build/es/wc-lib.js';
import { StopWatch } from './stop-watch.js';

export const StopWatchHTML = new TemplateFn<StopWatch>(
    function(html, props) {
        return html`
            <h1>Stopwatch ${props.running ? 'running' : 'not running'}</h1>
            <div id="time">${this.formatTime(props.ms)}</div>
            <br />
            <div id="buttons">
                <button @click="${this.onStart}" class="inline">Start</button>
                <button @click="${this.onStop}" class="inline">Stop</button>
                <button @click="${this.onReset}" class="inline">Reset</button>
            </div>
        `;
    },
    CHANGE_TYPE.PROP,
    render
);

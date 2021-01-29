import { render } from '../../node_modules/lit-html/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../build/es/wc-lib.js';
export const StopWatchTypedHTMLHTML = new TemplateFn(function (html, { props }) {
    return html `
            <h1 id="header">
                Stopwatch ${props.running ? 'running' : 'not running'}
            </h1>
            <div id="time">${props.seconds}</div>
            <br />
            <div id="buttons">
                <button id="start" class="inline">Start</button>
                <button id="stop" class="inline">Stop</button>
                <button id="reset" class="inline">Reset</button>
            </div>
        `;
}, CHANGE_TYPE.NEVER, render);

import { render } from '../modules/lit-html-bundled/lit-html.js';
import { StopWatchTypedHTML } from './stop-watch-typed-html.js';
import { TemplateFn, CHANGE_TYPE } from '../modules/wc-lib/wc-lib.js';

export const StopWatchTypedHTMLCSS = new TemplateFn<StopWatchTypedHTML>(
    function(html) {
        return html`
            <style>
                .inline {
                    display: inline-block;
                }
            </style>
        `;
    },
    CHANGE_TYPE.THEME,
    render
);

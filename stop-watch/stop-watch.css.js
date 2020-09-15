import { render } from '../modules/lit-html-bundled/lit-html.js';
import { TemplateFn } from '../modules/wc-lib/wc-lib.js';
export const StopWatchCSS = new TemplateFn(function (html) {
    return html `
            <style>
                .inline {
                    display: inline-block;
                }
            </style>
        `;
}, 0 /* NEVER */, render);

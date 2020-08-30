import { render } from '../../node_modules/lit-html/lit-html.js';
import { TemplateFn } from '../../build/es/wc-lib.js';
export const StopWatchCSS = new TemplateFn(function (html) {
    return html `
            <style>
                .inline {
                    display: inline-block;
                }
            </style>
        `;
}, 4 /* NEVER */, render);

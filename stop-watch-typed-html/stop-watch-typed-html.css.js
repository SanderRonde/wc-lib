import { render } from '../modules/lit-html-bundled/lit-html.js';
import { TemplateFn } from '../modules/wc-lib/wc-lib.js';
export const StopWatchTypedHTMLCSS = new TemplateFn(function (html) {
    return html `
            <style>
                .inline {
                    display: inline-block;
                }
            </style>
        `;
}, 2 /* THEME */, render);

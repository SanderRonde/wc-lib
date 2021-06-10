import { render } from '../modules/lit-html-bundled/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../modules/wc-lib/wc-lib.js';
export const StopWatchTypedHTMLCSS = new TemplateFn(function (html) {
    return html `
            <style>
                .inline {
                    display: inline-block;
                }
            </style>
        `;
}, CHANGE_TYPE.THEME, render);

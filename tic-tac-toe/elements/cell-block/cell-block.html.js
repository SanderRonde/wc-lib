import { render } from '../../../modules/lit-html-bundled/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../../modules/wc-lib/wc-lib.js';
export const CellBlockHTML = new TemplateFn(function (html, { props }) {
    return html `
            <div
                id="cell"
                class="${{
        ["state-none" /* NONE */]: props.state === "" /* NONE */,
        ["state-x" /* X */]: props.state === "X" /* X */,
        ["state-o" /* O */]: props.state === "O" /* O */,
    }}"
                @click="${this.onClick}"
            >
                <div id="cellContainer">
                    <div id="x">
                        <div id="topLeft"></div>
                        <div id="topRight"></div>
                    </div>
                    <div id="o">
                        <div id="circle"></div>
                    </div>
                </div>
            </div>
        `;
}, CHANGE_TYPE.PROP, render);

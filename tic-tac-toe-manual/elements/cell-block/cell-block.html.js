import { render } from '../../../../node_modules/lit-html/lit-html.js';
import { TemplateFn, CHANGE_TYPE, watchFn, } from '../../../../build/es/wc-lib.js';
export const CellBlockHTML = new TemplateFn(function (html, { props }) {
    return html `
            <div
                id="cell"
                class="${watchFn(props).state((state) => ({
        ["state-none" /* NONE */]: state === "" /* NONE */,
        ["state-x" /* X */]: state === "X" /* X */,
        ["state-o" /* O */]: state === "O" /* O */,
    }))}"
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
}, CHANGE_TYPE.MANUAL, render);

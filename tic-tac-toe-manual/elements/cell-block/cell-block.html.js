import { render } from '../../../modules/lit-html-bundled/lit-html.js';
import { TemplateFn, watchFn, } from '../../../modules/wc-lib/wc-lib.js';
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
}, 0 /* MANUAL */, render);

import { render } from '../../../modules/lit-html-bundled/lit-html.js';
import { TemplateFn, css } from '../../../modules/wc-lib/wc-lib.js';
export const CellBlockCSS = new TemplateFn(function (html, { theme }) {
    return html `
            <style>
                ${css(this).$.topLeft.or.$.topRight} {
                    width: 10vw;
                    height: 0.3vw;
                    background-color: ${theme.primary};
                    margin-top: 3.5vw;
                    margin-left: -1.4vw;
                    position: absolute;
                    border-radius: 1vw;
                }

                ${css(this).$.topLeft} {
                    transform: rotate(45deg);
                }

                ${css(this).$.topRight} {
                    transform: rotate(-45deg);
                }

                ${css(this).$.circle} {
                    height: 6vw;
                    width: 6vw;
                    border: 0.3vw solid ${theme.primary};
                    background-color: transparent;
                    border-radius: 50%;
                    margin-left: 0.3vw;
                    margin-top: 0.3vw;
                    position: absolute;
                }

                ${css(this).$.cellContainer} {
                    width: 7.2vw;
                    height: 7.2vw;
                    padding: 1.5vw;
                }

                ${css(this).$.cell.toggle['state-none']} {
                    cursor: pointer;
                }

                ${css(this).$.x.or.$.o} {
                    opacity: 0;
                    transition: opacity 300ms ease-in;
                }

                ${css(this).$.cell.toggle['state-x'].descendant.$.x.or.$.cell
        .toggle['state-o'].descendant.$.o} {
                    opacity: 1;
                }
            </style>
        `;
}, 2 /* THEME */, render);

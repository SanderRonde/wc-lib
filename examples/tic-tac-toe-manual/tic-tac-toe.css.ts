import { TemplateFn, CHANGE_TYPE, css } from '../../build/es/wc-lib.js';
import { render } from '../../node_modules/lit-html/lit-html.js';
import { TicTacToe } from './tic-tac-toe-manual.js';

export const TicTacToeCSS = new TemplateFn<TicTacToe>(
    function (html, { theme }) {
        return html`
            <style>
                ${css(this).class['vertical-centerer'].or.class[
                        'horizontal-centerer'
                    ]} {
                    display: flex;
                    justify-content: center;
                }

                ${css(this).class['vertical-centerer']} {
                    flex-direction: column;
                    height: 100%;
                }

                ${css(this).class['horizontal-centerer']} {
                    flex-direction: row;
                }

                ${css(this).$.main} {
                    background-color: ${theme.background};
                    height: 100%;
                }

                ${css(this).tag.table} {
                    border: none;
                    border-collapse: collapse;
                }

                ${css(this).tag.td} {
                    border-top: 0.3vw solid ${theme.primary};
                    border-left: 0.3vw solid ${theme.primary};
                }

                ${css(this).tag.td.pseudo('first-child')} {
                    border-left: none;
                }

                ${css(this).tag.tr.pseudo('first-child').descendant.tag.td} {
                    border-top: none;
                }

                ${css(this).$.container} {
                    opacity: 0;
                    transition: opacity 500ms ease-in;
                }

                ${css(this).$.container.toggle.active} {
                    opacity: 1;
                }

                ${css(this).$['lang-switcher']} {
                    position: absolute;
                    right: 0.5vw;
                    top: 0.5vw;
                }

                ${css(this).class.language.or.class['theme-preview']} {
                    height: 2vw;
                    width: 2vw;
                    border: 0.16vw solid transparent;
                    border-radius: 50%;
                    cursor: pointer;
                    margin-left: 0.16vw;
                }

                ${css(this).class.language.toggle.active.or.class[
                        'theme-preview'
                    ].toggle.active} {
                    border: 0.16vw solid ${theme.primary};
                }

                ${css(this).$['theme-switcher']} {
                    position: absolute;
                    right: 0.5vw;
                    bottom: 0.5vw;
                    display: flex;
                    flex-direction: row;
                }

                ${css(this).$['winner-banner']} {
                    position: absolute;
                    width: 100vw;
                    pointer-events: none;
                    bottom: 3vw;
                    transform: translateY(6vw);
                    transition: transform 500ms ease-in;
                }

                ${css(this).$['winner-banner'].toggle.active} {
                    transform: translateY(0);
                }

                ${css(this).$['winner-text']} {
                    font-size: 200%;
                    font-family: sans-serif;
                    border-bottom: 0.3vw solid ${theme.primary};
                    display: inline;
                    pointer-events: all;
                    color: ${theme.text};
                }
            </style>
        `;
    },
    CHANGE_TYPE.THEME,
    render
);

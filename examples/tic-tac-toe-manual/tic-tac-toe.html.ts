import { TemplateFn, CHANGE_TYPE, watchFn } from '../../build/es/wc-lib.js';
import { TicTacToe, languages, ACTIVITY_STATE } from './tic-tac-toe-manual.js';
import {
    render,
    directive,
    Part,
} from '../../node_modules/lit-html/lit-html.js';
import { theme } from './theme.js';

function setLocalStorageItem(name: string, value: string) {
    if (typeof localStorage !== 'undefined') {
        return localStorage.setItem(name, value);
    }
    return null;
}

const globalPropChangeDirective = directive(
    (component: TicTacToe, key: string, render: () => any) => (part: Part) => {
        part.setValue(render());
        part.commit();

        component.listenGP<{
            [k: string]: string;
        }>('globalPropChange', (prop) => {
            if (prop === key) {
                part.setValue(render());
                part.commit();
            }
        });
    }
);

export const TicTacToeHTML = new TemplateFn<TicTacToe>(
    function (html, { props }) {
        return html`
            <div id="lang-switcher">
                ${globalPropChangeDirective(this, 'lang', () => {
                    return languages.map((lang) => {
                        return html`
                            <img
                                class="${{
                                    language: true,
                                    [ACTIVITY_STATE.ACTIVE]:
                                        this.getLang() === lang,
                                }}"
                                src="images/${lang}.png"
                                title="${this.__('change_lang')}"
                                @click="${() => {
                                    setLocalStorageItem('lang', lang);
                                    this.setLang(lang);
                                }}"
                            />
                        `;
                    });
                })}
            </div>
            <div id="theme-switcher">
                ${globalPropChangeDirective(this, 'theme', () => {
                    Object.getOwnPropertyNames(theme).map(
                        (themeName: keyof typeof theme) => {
                            return html`
                                <div
                                    class="${{
                                        'theme-preview': true,
                                        [ACTIVITY_STATE.ACTIVE]:
                                            this.getThemeName() === themeName,
                                    }}"
                                    style="background-color: ${theme[themeName]
                                        .background}"
                                    title="${this.__('change_theme')}"
                                    @click="${() => {
                                        setLocalStorageItem('theme', themeName);
                                        this.setTheme(themeName);
                                    }}"
                                ></div>
                            `;
                        }
                    );
                })}
            </div>
            <div id="winner-banner" class="horizontal-centerer">
                <div id="winner-text">
                    ${this.__('has_won', this.getWinner())}
                </div>
            </div>
            <div id="main" class="horizontal-centerer">
                <div class="vertical-centerer">
                    <table id="container">
                        ${watchFn(props).board((board) => {
                            return board.map((row, y) => {
                                return html`
                                    <tr class="row">
                                        ${row.map((cell, x) => {
                                            return html`
                                                <td>
                                                    <cell-block
                                                        @@click="${this
                                                            .cellClick}"
                                                        x="${x}"
                                                        y="${y}"
                                                        class="cell"
                                                        state="${cell}"
                                                    >
                                                    </cell-block>
                                                </td>
                                            `;
                                        })}
                                    </tr>
                                `;
                            });
                        })}
                    </table>
                </div>
            </div>
        `;
    },
    CHANGE_TYPE.PROP,
    render
);

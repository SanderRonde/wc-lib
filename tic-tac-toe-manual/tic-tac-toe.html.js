import { TemplateFn, CHANGE_TYPE, watchFn } from '../modules/wc-lib/wc-lib.js';
import { languages } from './tic-tac-toe-manual.js';
import { render, directive, } from '../modules/lit-html-bundled/lit-html.js';
import { theme } from './theme.js';
function setLocalStorageItem(name, value) {
    if (typeof localStorage !== 'undefined') {
        return localStorage.setItem(name, value);
    }
    return null;
}
const globalPropChangeDirective = directive((component, key, render) => (part) => {
    part.setValue(render());
    part.commit();
    component.listenGP('globalPropChange', (prop) => {
        if (prop === key) {
            part.setValue(render());
            part.commit();
        }
    });
});
export const TicTacToeHTML = new TemplateFn(function (html, { props }) {
    return html `
            <div id="lang-switcher">
                ${globalPropChangeDirective(this, 'lang', () => {
        return languages.map((lang) => {
            return html `
                            <img
                                class="${{
                language: true,
                ["active" /* ACTIVE */]: this.getLang() === lang,
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
        Object.getOwnPropertyNames(theme).map((themeName) => {
            return html `
                                <div
                                    class="${{
                'theme-preview': true,
                ["active" /* ACTIVE */]: this.getThemeName() === themeName,
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
        });
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
            return html `
                                    <tr class="row">
                                        ${row.map((cell, x) => {
                return html `
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
}, CHANGE_TYPE.PROP, render);

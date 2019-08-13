import { languages } from './tic-tac-toe.js';
import { render } from '../modules/lit-html/lit-html.js';
import { TemplateFn } from '../modules/wc-lib/wc-lib.js';
import { theme } from './index.js';
export const TicTacToeHTML = new TemplateFn(function (html, props) {
    return html `
		<div id="lang-switcher">
			${languages.map((lang) => {
        return html `<img class="${{
            language: true,
            ["active" /* ACTIVE */]: this.getLang() === lang
        }}" src="images/${lang}.png" title="${this.__('change_lang')}"
					@click="${() => {
            localStorage.setItem('lang', lang);
            this.setLang(lang);
        }}">`;
    })}
		</div>
		<div id="theme-switcher">
			${Object.getOwnPropertyNames(theme).map((themeName) => {
        return html `<div class="${{
            "theme-preview": true,
            ["active" /* ACTIVE */]: this.getThemeName() === themeName
        }}" 
					style="background-color: ${theme[themeName].background}"
					title="${this.__('change_theme')}" @click="${() => {
            localStorage.setItem('theme', themeName);
            this.setTheme(themeName);
        }}">
				</div>`;
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
					${props.board.map((row, y) => {
        return html `
							<tr class="row">
								${row.map((cell, x) => {
            return html `
										<td>
											<cell-block @@click="${this.cellClick}" 
												x="${x}" y="${y}" class="cell" 
												state="${cell}">
											</cell-block>
										</td>`;
        })}
							</tr>
						`;
    })}
				</table>
			</div>
		</div>
	`;
}, 1 /* PROP */ | 8 /* LANG */ | 2 /* THEME */, render);

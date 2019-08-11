import { render } from '../../node_modules/lit-html/lit-html.js';
import { TemplateFn, css } from '../../src/wclib.js';
export const ThemedComponentCSS = new TemplateFn(function (html, _, theme) {
    return html `<style>
		${css(this).$["horizontal-centerer"]} {
			display: flex;
			flex-direction: row;
			justify-content: center;
		}

		${css(this).$["vertical-centerer"]} {
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		${css(this).$.background} {
			width: 90vw;
			height: 90vw;
			background-color: ${theme.background};
		}

		${css(this).$.primary} {
			color: ${theme.primary};
		}

		${css(this).$.secondary} {
			color: ${theme.secondary};
		}

		${css(this).$.regular} {
			color: ${theme.regular}
		}

		${css(this).class["theme-option"]} {
			font-weight: normal;
		}

		${css(this).class["theme-option"].toggle.active} {
			font-weight: bold;
		}
	</style>`;
}, 2 /* THEME */, render);

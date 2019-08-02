import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { ThemedComponent } from './themed-component.js';
import { render } from 'lit-html';

export const ThemedComponentCSS = new TemplateFn<ThemedComponent>(function (html, _, theme) {
	return html`<style>
		#horizontal-centerer {
			display: flex;
			flex-direction: row;
			justify-content: center;
		}

		#vertical-centerer {
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		#background {
			width: 90vw;
			height: 90vw;
			background-color: ${theme.background};
		}

		#primary {
			color: ${theme.primary};
		}

		#secondary {
			color: ${theme.secondary};
		}

		#regular {
			color: ${theme.regular}
		}
	</style>`
}, CHANGE_TYPE.THEME, render);

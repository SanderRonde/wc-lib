import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { TicTacToe } from './tic-tac-toe.js';
import { render } from 'lit-html';

export const TicTacToeCSS = new TemplateFn<TicTacToe>(function (html) {
	return html`<style>
		
	</style>`
}, CHANGE_TYPE.THEME, render);

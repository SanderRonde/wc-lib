import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { TicTacToe } from './tic-tac-toe.js';
import { render } from 'lit-html';

export const TicTacToeHTML = new TemplateFn<TicTacToe>(function (html, props) {
	return html`
		<div></div>
	`
}, CHANGE_TYPE.PROP, render);

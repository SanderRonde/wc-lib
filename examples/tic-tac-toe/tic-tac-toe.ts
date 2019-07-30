import { ConfigurableWebComponent, Props, PROP_TYPE, config } from '../../src/wclib';
import { TicTacToeHTML } from './tic-tac-toe.html.js';
import { TicTacToeCSS } from './tic-tac-toe.css.js';

@config({
	is: 'tic-tac-toe',
	css: TicTacToeCSS,
	html: TicTacToeHTML
})
export class TicTacToe extends ConfigurableWebComponent {
	props = Props.define(this, {
		// ...
	});

	mounted() {
		// ...
	}

	firstRender() {
		// ...
	}
}
import { ConfigurableWebComponent, Props, config, ComplexType } from '../../build/es/wc-lib.js';
import { CellBlock } from './elements/cell-block/cell-block.js';
import { TicTacToeHTML } from './tic-tac-toe.html.js';
import { TicTacToeCSS } from './tic-tac-toe.css.js';
import { theme, LangFile } from './index.js';

export const enum PLAYER {
	X = 'X',
	O = 'O',
	NONE = ''
}

type RowState = [PLAYER, PLAYER, PLAYER];
type BoardState = [RowState, RowState, RowState];

export const enum ACTIVITY_STATE {
	ACTIVE = "active"
}

export const languages: ('en'|'nl'|'es'|'de')[] = ['en', 'nl', 'es', 'de'];

@config({
	is: 'tic-tac-toe',
	css: TicTacToeCSS,
	html: TicTacToeHTML,
	dependencies: [
		CellBlock
	]
})
export class TicTacToe extends ConfigurableWebComponent<{
	themes: typeof theme;
	selectors: {
		IDS: {
			"lang-switcher": HTMLDivElement;
			"theme-switcher": HTMLDivElement;
			"container": HTMLTableElement;
			"winner-banner": HTMLDivElement;
			"winner-text": HTMLDivElement;
			main: HTMLDivElement;
		};
		CLASSES: {
			"horizontal-centerer": HTMLDivElement;
			"vertical-centerer": HTMLDivElement;
			row: HTMLTableRowElement;
			cell: CellBlock;
			language: HTMLImageElement;
			"theme-preview": HTMLDivElement;
		};
		TAGS: {
			div: HTMLDivElement;
			"cell-block": CellBlock;
			table: HTMLTableElement;
			tr: HTMLTableRowElement;
			td: HTMLTableCellElement;
		};
		TOGGLES: ACTIVITY_STATE;
	};
	langs: typeof languages[Extract<keyof typeof languages, number>];
	i18n: LangFile;
}> {
	private _turn: PLAYER = PLAYER.X;
	private _frozen: boolean = false;
	private _winner: PLAYER = PLAYER.NONE;

	props = Props.define(this, {
		reflect: {
			board: {
				type: ComplexType<BoardState>(),
				value: [
					[PLAYER.NONE, PLAYER.NONE, PLAYER.NONE],
					[PLAYER.NONE, PLAYER.NONE, PLAYER.NONE],
					[PLAYER.NONE, PLAYER.NONE, PLAYER.NONE]
				],
				watchProperties: [
					'*.*'
				]
			}
		}
	});

	private _areSame(...values: PLAYER[]) {
		if (values[0] === PLAYER.NONE) return false;

		const last = values[0];
		for (const value of values.slice(1)) {
			if (value !== last) return false;
		}
		return true;
	}

	private _onWin(winner: PLAYER) {
		this._frozen = true;
		this._winner = winner;
		this.$["winner-banner"].classList.add(ACTIVITY_STATE.ACTIVE);
	}

	getWinner() {
		return this._winner;
	}

	private _checkWin() {
		// Check horizontal
		for (const row of this.props.board) {
			if (this._areSame(...row)) {
				return this._onWin(row[0]);
			}
		}

		// Check vertical
		for (let i = 0; i < this.props.board[0].length; i++) {
			if (this._areSame(...this.props.board.map(r => r[i]))) {
				return this._onWin(this.props.board[0][i]);
			}
		}
		
		// Check diagonals

		// Just check if diagonals exist in these dimensions
		if (this.props.board.length !== this.props.board[0].length) return;
		const indexArr = new Array(this.props.board.length).fill(0).map((_, i) => i);
		if (this._areSame(...indexArr.map(i => this.props.board[i][i]))) {
			return this._onWin(this.props.board[0][0]);
		}
		if (this._areSame(...indexArr.map(i => this.props.board[i][
			(this.props.board.length - 1) - i
		]))) {
			return this._onWin(this.props.board[0][0]);
		}
	}

	cellClick(cell: CellBlock) {
		if (this._frozen) return;
		this.props.board[cell.props.y!][cell.props.x!] = 
			this._turn === PLAYER.X ? PLAYER.X : PLAYER.O;
		this._turn = this._turn === PLAYER.X ? 
			PLAYER.O : PLAYER.X;
		this._checkWin();
	}

	firstRender() {
		setTimeout(() => {
			this.$.container.classList.add(ACTIVITY_STATE.ACTIVE)
		}, 200);
	}
}
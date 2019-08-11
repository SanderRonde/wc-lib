var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, Props, config, ComplexType } from '../../src/wclib.js';
import { CellBlock } from './elements/cell-block/cell-block.js';
import { TicTacToeHTML } from './tic-tac-toe.html.js';
import { TicTacToeCSS } from './tic-tac-toe.css.js';
export const languages = ['en', 'nl', 'es', 'de'];
let TicTacToe = class TicTacToe extends ConfigurableWebComponent {
    constructor() {
        super(...arguments);
        this._turn = "X" /* X */;
        this._frozen = false;
        this._winner = "" /* NONE */;
        this.props = Props.define(this, {
            reflect: {
                board: {
                    type: ComplexType(),
                    value: [
                        ["" /* NONE */, "" /* NONE */, "" /* NONE */],
                        ["" /* NONE */, "" /* NONE */, "" /* NONE */],
                        ["" /* NONE */, "" /* NONE */, "" /* NONE */]
                    ],
                    watchProperties: [
                        '*.*'
                    ]
                }
            }
        });
    }
    _areSame(...values) {
        if (values[0] === "" /* NONE */)
            return false;
        const last = values[0];
        for (const value of values.slice(1)) {
            if (value !== last)
                return false;
        }
        return true;
    }
    _onWin(winner) {
        this._frozen = true;
        this._winner = winner;
        this.$["winner-banner"].classList.add("active" /* ACTIVE */);
    }
    getWinner() {
        return this._winner;
    }
    _checkWin() {
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
        if (this.props.board.length !== this.props.board[0].length)
            return;
        const indexArr = new Array(this.props.board.length).fill(0).map((_, i) => i);
        if (this._areSame(...indexArr.map(i => this.props.board[i][i]))) {
            return this._onWin(this.props.board[0][0]);
        }
        if (this._areSame(...indexArr.map(i => this.props.board[i][(this.props.board.length - 1) - i]))) {
            return this._onWin(this.props.board[0][0]);
        }
    }
    cellClick(cell) {
        if (this._frozen)
            return;
        this.props.board[cell.props.y][cell.props.x] =
            this._turn === "X" /* X */ ? "X" /* X */ : "O" /* O */;
        this._turn = this._turn === "X" /* X */ ?
            "O" /* O */ : "X" /* X */;
        this._checkWin();
    }
    firstRender() {
        setTimeout(() => {
            this.$.container.classList.add("active" /* ACTIVE */);
        }, 200);
    }
};
TicTacToe = __decorate([
    config({
        is: 'tic-tac-toe',
        css: TicTacToeCSS,
        html: TicTacToeHTML,
        dependencies: [
            CellBlock
        ]
    })
], TicTacToe);
export { TicTacToe };

import { render } from '../../../modules/lit-html/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../../modules/wc-lib/wc-lib.js';
import { PLAYER } from '../../tic-tac-toe.js';
import { CellBlock } from './cell-block.js';

export const enum CELL_CLASSES {
	NONE = "state-none",
	X = "state-x",
	O = "state-o"
}

export const CellBlockHTML = new TemplateFn<CellBlock>(function (html, props) {
	return html`
		<div id="cell" class="${{
			[CELL_CLASSES.NONE]: props.state === PLAYER.NONE,	
			[CELL_CLASSES.X]: props.state === PLAYER.X,
			[CELL_CLASSES.O]: props.state === PLAYER.O
		}}" @click="${this.onClick}">
			<div id="cellContainer">
				<div id="x">
					<div id="topLeft"></div>
					<div id="topRight"></div>
				</div>
				<div id="o">
					<div id="circle"></div>
				</div>
			</div>
		</div>
	`
}, CHANGE_TYPE.PROP, render);

import {
    ConfigurableWebComponent,
    Props,
    config,
    PROP_TYPE,
} from '../../../../build/es/wc-lib.js';
import { CellBlockHTML, CELL_CLASSES } from './cell-block.html.js';
import { CellBlockCSS } from './cell-block.css.js';
import { PLAYER } from '../../tic-tac-toe.js';
import { theme } from '../../theme.js';

@config({
    is: 'cell-block',
    css: CellBlockCSS,
    html: CellBlockHTML,
})
export class CellBlock extends ConfigurableWebComponent<{
    events: {
        click: {
            args: [CellBlock];
        };
    };
    selectors: {
        IDS: {
            cell: HTMLDivElement;
            cellContainer: HTMLDivElement;
            x: HTMLDivElement;
            topLeft: HTMLDivElement;
            topRight: HTMLDivElement;
            o: HTMLDivElement;
            circle: HTMLDivElement;
        };
        TAGS: {
            div: HTMLDivElement;
        };
        TOGGLES: CELL_CLASSES;
    };
    themes: typeof theme;
}> {
    props = Props.define(this, {
        reflect: {
            x: {
                type: PROP_TYPE.NUMBER,
                isDefined: true,
            },
            y: {
                type: PROP_TYPE.NUMBER,
                isDefined: true,
            },
            state: {
                type: PROP_TYPE.STRING,
                value: PLAYER.NONE,
                exactType: '' as PLAYER,
            },
        },
    });

    onClick() {
        if (this.props.state === PLAYER.NONE) {
            this.fire('click', this);
        }
    }
}

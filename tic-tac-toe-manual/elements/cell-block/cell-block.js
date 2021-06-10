var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, Props, config, PROP_TYPE, } from '../../../modules/wc-lib/wc-lib.js';
import { CellBlockHTML } from './cell-block.html.js';
import { CellBlockCSS } from './cell-block.css.js';
let CellBlock = class CellBlock extends ConfigurableWebComponent {
    constructor() {
        super(...arguments);
        this.props = Props.define(this, {
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
                    value: "" /* NONE */,
                    exactType: '',
                },
            },
        });
    }
    onClick() {
        if (this.props.state === "" /* NONE */) {
            this.fire('click', this);
        }
    }
};
CellBlock = __decorate([
    config({
        is: 'cell-block',
        css: CellBlockCSS,
        html: CellBlockHTML,
    })
], CellBlock);
export { CellBlock };

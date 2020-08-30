var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, config, TemplateFn, Props, } from '../../build/es/wc-lib.js';
import { render, html } from '../../node_modules/lit-html/lit-html.js';
let SimpleClock = class SimpleClock extends ConfigurableWebComponent {
    constructor() {
        super(...arguments);
        this.props = Props.define(this, {
            reflect: {
                seconds: {
                    type: "number" /* NUMBER */,
                    value: 0,
                },
            },
        });
    }
    _startClock() {
        window.setInterval(() => {
            this.props.seconds++;
        }, 1000);
    }
    mounted() {
        this._startClock();
    }
};
SimpleClock = __decorate([
    config({
        is: 'simple-clock',
        html: new TemplateFn((_, { props }) => {
            return html `
                <div>
                    Right now ${props.seconds} seconds have passed
                </div>
            `;
        }, 1 /* PROP */, render),
        css: null,
    })
], SimpleClock);
export { SimpleClock };

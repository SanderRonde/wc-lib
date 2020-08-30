var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, Props, config, TemplateFn } from '../../build/es/wc-lib.js';
import { render } from '../../node_modules/lit-html/lit-html.js';
let JsxInput = class JsxInput extends ConfigurableWebComponent {
    constructor() {
        super(...arguments);
        this._lastVal = '';
        this.props = Props.define(this, {
            reflect: {
                name: {
                    type: "string" /* STRING */,
                    value: 'name'
                },
                placeholder: {
                    type: "string" /* STRING */,
                    value: 'placeholder'
                },
                type: {
                    type: "string" /* STRING */,
                    exactType: '',
                    required: true
                }
            }
        });
    }
    onChange() {
        const newVal = this.$.input.value;
        if (newVal === this.props.placeholder)
            return;
        const lastVal = this._lastVal;
        this.fire('change', lastVal, newVal);
        this._lastVal = newVal;
    }
    onFocus() {
        if (this.$.input.value === this.props.placeholder) {
            this.$.input.classList.remove('placeholder');
            this.$.input.type = this.props.type;
            this.$.input.value = '';
        }
    }
    onBlur() {
        if (this.$.input.value === '') {
            this.$.input.classList.add('placeholder');
            this.$.input.value = this.props.placeholder;
            this.$.input.type = 'text';
        }
    }
};
JsxInput = __decorate([
    config({
        is: 'jsx-input',
        css: new TemplateFn((html) => {
            return html `<style>
			input.placeholder {
				color: grey;
			}
		</style>`;
        }, 4 /* NEVER */, render),
        html: new TemplateFn(function (html, { props }) {
            return (html.jsx("div", { id: "container" },
                html.jsx("h2", null, props.name),
                html.jsx("input", Object.assign({}, { "@": {
                        "change": this.onChange,
                        "focus": this.onFocus,
                        "blur": this.onBlur
                    } }, { class: "placeholder", type: "text", value: props.placeholder, id: "input" }))));
        }, 1 /* PROP */, render)
    })
], JsxInput);
export { JsxInput };

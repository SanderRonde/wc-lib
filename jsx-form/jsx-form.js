var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, config } from '../../src/wclib.js';
import { JsxFormHTML } from './jsx-form.html.js';
import { JsxInput } from './jsx-input.js';
let JsxForm = class JsxForm extends ConfigurableWebComponent {
};
JsxForm = __decorate([
    config({
        is: 'jsx-form',
        css: null,
        html: JsxFormHTML,
        dependencies: [
            JsxInput
        ]
    })
], JsxForm);
export { JsxForm };

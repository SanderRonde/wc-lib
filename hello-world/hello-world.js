var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE, } from '../../build/es/wc-lib.js';
import { render, html } from '../../node_modules/lit-html/lit-html.js';
let HelloWorld = class HelloWorld extends ConfigurableWebComponent {
};
HelloWorld = __decorate([
    config({
        is: 'hello-world',
        html: new TemplateFn(() => {
            return html `
                <div>Hello world</div>
            `;
        }, CHANGE_TYPE.NEVER, render),
        css: null,
    })
], HelloWorld);
export { HelloWorld };

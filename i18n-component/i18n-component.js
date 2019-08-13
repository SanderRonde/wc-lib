var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, config, TemplateFn } from '../modules/wc-lib/wc-lib.js';
import { render } from '../modules/lit-html/lit-html.js';
import { I18nComponentHTML } from './i18n-component.html.js';
let I18nComponent = class I18nComponent extends ConfigurableWebComponent {
};
I18nComponent = __decorate([
    config({
        is: 'i18n-component',
        css: new TemplateFn((html) => {
            return html `
			<style>
				button, #input {
					display: inline-block;
				}
			</style>`;
        }, 4 /* NEVER */, render),
        html: I18nComponentHTML
    })
], I18nComponent);
export { I18nComponent };

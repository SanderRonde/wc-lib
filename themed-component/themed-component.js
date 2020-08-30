var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ConfigurableWebComponent, config } from '../../build/es/wc-lib.js';
import { ThemedComponentHTML } from './themed-component.html.js';
import { ThemedComponentCSS } from './themed-component.css.js';
let ThemedComponent = class ThemedComponent extends ConfigurableWebComponent {
    changeTheme(color) {
        Array.from(this.root.querySelectorAll('.theme-option')).forEach((option) => {
            option.classList.remove("active" /* ACTIVE */);
        });
        this.$[color].classList.add("active" /* ACTIVE */);
        this.setTheme(color);
    }
};
ThemedComponent = __decorate([
    config({
        is: 'themed-component',
        css: ThemedComponentCSS,
        html: ThemedComponentHTML,
    })
], ThemedComponent);
export { ThemedComponent };

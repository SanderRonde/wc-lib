import {
    ConfigurableWebComponent,
    config,
    TemplateFn,
    CHANGE_TYPE,
} from '../../../../../../build/es/wc-lib.js';
import { render } from '../../../../../../node_modules/lit-html/lit-html.js';
import { TestElement } from '../../elements/test-element.js';

@config({
    is: 'custom-css-element',
    html: new TemplateFn<CustomCSSElement>(
        (html) => {
            return html`
                <test-element
                    custom-css="${new TemplateFn<CustomCSSElement>(
                        (html) => {
                            return html`
                                <style>
                                    * {
                                        color: blue !important;
                                    }
                                </style>
                            `;
                        },
                        CHANGE_TYPE.NEVER,
                        render
                    )}"
                ></test-element>
            `;
        },
        CHANGE_TYPE.NEVER,
        render
    ),
    dependencies: [TestElement],
})
export class CustomCSSElement extends ConfigurableWebComponent {}

@config({
    is: 'wrong-custom-css-element',
    html: new TemplateFn<WrongCustomCSSElement>(
        (html) => {
            return html`
                <test-element custom-css="${{}}"></test-element>
                <test-element custom-css="${false}"></test-element>
            `;
        },
        CHANGE_TYPE.NEVER,
        render
    ),
    dependencies: [TestElement],
})
export class WrongCustomCSSElement extends ConfigurableWebComponent {}

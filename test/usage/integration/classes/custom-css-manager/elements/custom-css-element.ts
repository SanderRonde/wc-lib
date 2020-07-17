import {
    ConfigurableWebComponent,
    config,
    TemplateFn,
    CHANGE_TYPE,
} from '../../../../../../build/es/wc-lib.js';
import { render } from '../../../../../../node_modules/lit-html/lit-html.js';
import { TestElement } from '../../elements/test-element.js';

export interface ExtendedWindow extends Window {
    redTextTemplate: TemplateFn;
}
declare const window: ExtendedWindow;

export const blueTextTemplate = new TemplateFn<CustomCSSElement>(
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
);

export const redTextTemplate = new TemplateFn<CustomCSSElement>(
    (html) => {
        return html`
            <style>
                * {
                    color: red !important;
                }
            </style>
        `;
    },
    CHANGE_TYPE.NEVER,
    render
);

@config({
    is: 'custom-css-element',
    html: new TemplateFn<CustomCSSElement>(
        (html) => {
            return html`
                <test-element custom-css="${blueTextTemplate}"></test-element>
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

window.redTextTemplate = redTextTemplate;

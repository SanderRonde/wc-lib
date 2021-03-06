import {
    ConfigurableWebComponent,
    TemplateFn,
    CHANGE_TYPE,
    config,
    Props,
    PROP_TYPE,
} from '../../../../../build/es/wc-lib.js';
import { TestGlobalProperties } from '../hierarchy-manager/fixtures/standard/hierarchy-manager.fixture.js';
import { render, html } from '../../../../../node_modules/lit-html/lit-html.js';

const TestElementHTML = new TemplateFn<TestElement>(
    (_, { props }) => {
        return html`
            <div class="divClass" id="divId">Test</div>
            <h1 id="headerId" class="headerClass">${props.x}</h1>
        `;
    },
    CHANGE_TYPE.PROP,
    render
);

const TestElementCSS = new TemplateFn<TestElement>(
    () => {
        return html`
            <style>
                * {
                    color: red;
                }
            </style>
        `;
    },
    CHANGE_TYPE.NEVER,
    render
);

@config({
    is: 'test-element',
    html: TestElementHTML,
    css: TestElementCSS,
})
export class TestElement extends ConfigurableWebComponent<{
    selectors: {
        IDS: {
            divId: HTMLDivElement;
            headerId: HTMLHeadingElement;
        };
        CLASSES: {
            divClass: HTMLDivElement;
            headerClass: HTMLHeadingElement;
        };
    };
    events: {
        test: {
            args: [number, number];
        };
        test2: {
            args: [];
            returnType: number;
        };
    };
    globalProps: TestGlobalProperties;
}> {
    props = Props.define(this, {
        reflect: {
            x: {
                type: PROP_TYPE.NUMBER,
                value: 1,
            },
        },
    });
}

export interface TestWindow extends Window {
    TestElement: typeof TestElement;
}
declare const window: TestWindow;
window.TestElement = TestElement;

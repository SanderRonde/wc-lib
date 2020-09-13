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
import { TestElementFactory } from './test-element-factory.js';
import { RenderableComponent } from '../../../../types/test-types.js';

declare class ParentElement extends ConfigurableWebComponent<{
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
    props: { x: number };
}

export interface TestParentWindow extends Window {
    ParentElement: typeof ParentElement;
}

declare const window: TestParentWindow;

export const ParentElementFactory = (base: typeof RenderableComponent) => {
    const ParentElementHTML = new TemplateFn<ParentElement>(
        () => {
            return html`
                <test-element></test-element>
            `;
        },
        CHANGE_TYPE.NEVER,
        render
    );

    const ParentElementCSS = new TemplateFn<ParentElement>(
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
        is: 'parent-element',
        html: ParentElementHTML,
        css: ParentElementCSS,
        dependencies: [TestElementFactory(base)],
    })
    class ParentElement extends base {
        props = Props.define(this as any, {
            reflect: {
                x: {
                    type: PROP_TYPE.NUMBER,
                    value: 1,
                },
            },
        });
    }

    window.ParentElement = ParentElement as any;
    return ParentElement;
};

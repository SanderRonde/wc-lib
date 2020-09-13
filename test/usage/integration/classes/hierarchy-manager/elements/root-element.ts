import {
    TemplateFn,
    CHANGE_TYPE,
    config,
    Props,
    PROP_TYPE,
    ConfigurableWebComponent,
    EventListenerObj,
    SelectorMap,
} from '../../../../../../build/es/wc-lib.js';
import { TestGlobalProperties } from '../fixtures/standard/hierarchy-manager.fixture.js';
import {
    render,
    html,
} from '../../../../../../node_modules/lit-html/lit-html.js';
import { ParentElementFactory } from '../../elements/parent-element-factory.js';
import type { RenderableComponent } from '../../../../../types/test-types.js';
import { TestElementFactory } from '../../elements/test-element-factory.js';

export declare class RootElement extends ConfigurableWebComponent<{
    events: {
        test: {
            args: [number, number];
        };
        test2: {
            args: [];
            returnType: number;
        };
    };
    root: RootElement;
    globalProps: TestGlobalProperties;
}> {
    lastRenderGP: any;
    renders: number;
    props: { x: number };
}

declare class RootSuperComponent<
    GA extends {
        i18n?: any;
        langs?: string;
        events?: EventListenerObj;
        themes?: {
            [key: string]: any;
        };
        selectors?: SelectorMap;
        root?: any;
        parent?: any;
        globalProps?: {
            [key: string]: any;
        };
        subtreeProps?: {
            [key: string]: any;
        };
    } = {}
> extends RenderableComponent<GA> {}

export const RootElementFactory = (superFn: typeof RootSuperComponent) => {
    const RootElementHTML = new TemplateFn<_RootElement>(
        function (_, { globalProps }) {
            this.lastRenderGP = globalProps;
            return html`
                <test-element></test-element>
                <parent-element></parent-element>
                <parent-element></parent-element>
                <test-element></test-element>
            `;
        },
        CHANGE_TYPE.NEVER,
        render
    );

    const RootElementCSS = new TemplateFn<RootElement>(
        function () {
            this.renders++;
            return html`
                <style>
                    * {
                        color: red;
                    }
                </style>
            `;
        },
        CHANGE_TYPE.GLOBAL_PROPS,
        render
    );

    @config({
        is: 'root-element',
        html: RootElementHTML,
        css: RootElementCSS,
        dependencies: [
            ParentElementFactory(superFn),
            TestElementFactory(superFn),
        ] as any,
    })
    class _RootElement extends superFn<{
        events: {
            test: {
                args: [number, number];
            };
            test2: {
                args: [];
                returnType: number;
            };
        };
        root: RootElement;
        globalProps: TestGlobalProperties;
    }> {
        public renders: number = 0;
        public lastRenderGP: any;

        props = Props.define(this as any, {
            reflect: {
                x: {
                    type: PROP_TYPE.NUMBER,
                    value: 1,
                },
            },
        });
    }
    return (_RootElement as unknown) as typeof RootElement;
};

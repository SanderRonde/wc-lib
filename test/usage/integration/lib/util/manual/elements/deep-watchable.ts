import {
    ConfigurableWebComponent,
    TemplateFn,
    CHANGE_TYPE,
    config,
    Props,
    PROP_TYPE,
    ComplexType,
} from '../../../../../../../build/es/wc-lib.js';
import {
    render,
    html,
} from '../../../../../../../node_modules/lit-html/lit-html.js';

const DeepWatchableHTML = new TemplateFn<DeepWatchable>(
    (_, { props }) => {
        return html`
            <div class="divClass" id="divId">Test</div>
            <h1 id="headerId" class="headerClass">${props.x}</h1>
        `;
    },
    CHANGE_TYPE.PROP,
    render
);

const DeepWatchableCSS = new TemplateFn<DeepWatchable>(
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
    is: 'deep-watchable',
    html: DeepWatchableHTML,
    css: DeepWatchableCSS,
})
export class DeepWatchable extends ConfigurableWebComponent<{
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
}> {
    props = Props.define(this, {
        reflect: {
            x: {
                type: PROP_TYPE.NUMBER,
                value: 1,
            },
            y: {
                type: ComplexType<{
                    property: number;
                }>(),
                value: {
                    property: 1,
                },
            },
        },
    });
}

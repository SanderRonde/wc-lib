import {
    TemplateFn,
    CHANGE_TYPE,
    config,
    Props,
    PROP_TYPE,
} from '../../../../../../../build/es/wc-lib.js';
import {
    render,
    html,
} from '../../../../../../../node_modules/lit-html/lit-html.js';
import { TestElement } from '../../../../classes/elements/test-element.js';

const TestElementHTML = new TemplateFn<JoinedPropsElement>(
    (_, { props }) => {
        return html`
            <div class="divClass" id="divId">Test</div>
            <h1 id="headerId" class="headerClass">${props.x}</h1>
        `;
    },
    CHANGE_TYPE.PROP,
    render
);

const TestElementCSS = new TemplateFn<JoinedPropsElement>(
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
    is: 'joined-props',
    html: TestElementHTML,
    css: TestElementCSS,
})
export class JoinedPropsElement extends TestElement {
    props = Props.define(
        this,
        {
            reflect: {
                y: {
                    type: PROP_TYPE.NUMBER,
                    value: 1,
                },
            },
        },
        super.props
    );
}

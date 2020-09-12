import {
    TemplateFn,
    CHANGE_TYPE,
    config,
    Props,
    PROP_TYPE,
    ConfigurableWebComponent,
} from '../../../../../../build/es/wc-lib.js';
import {
    render,
    html,
} from '../../../../../../node_modules/lit-html/lit-html.js';
import { ParentElementFactory } from '../../elements/parent-element-factory.js';
import { TestElementFactory } from '../../elements/test-element-factory.js';

export declare class SubtreeElement extends ConfigurableWebComponent<{}> {
    props: { x: number; y: number };
    updateSubtree(): void;
    register(): void;
    registerEmpty(): void;
}

export const SubtreeFactory = (superFn: any) => {
    const SubtreeElementHTML = new TemplateFn<SubtreeElement>(
        () => {
            return html`
                <slot></slot>
            `;
        },
        CHANGE_TYPE.NEVER,
        render
    );

    @config({
        is: 'subtree-element',
        html: SubtreeElementHTML,
        css: null,
        dependencies: [
            ParentElementFactory(superFn),
            TestElementFactory(superFn),
        ] as any,
    })
    class _SubtreeElement extends superFn<{}> {
        props = Props.define(this as any, {
            reflect: {
                x: {
                    type: PROP_TYPE.NUMBER,
                    coerce: true,
                    value: 1,
                },
                y: {
                    type: PROP_TYPE.NUMBER,
                    coerce: true,
                    value: 1,
                },
            },
        });

        register() {
            this.registerAsSubTreeRoot({
                x: 0,
                y: 0,
            });
        }

        registerEmpty() {
            this.registerAsSubTreeRoot();
        }

        updateSubtree() {
            this.setSubTreeProps({
                x: this.props.x,
                y: this.props.y,
            });
        }
    }
    return (_SubtreeElement as unknown) as typeof SubtreeElement;
};

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
import {
    render,
    html,
} from '../../../../../../node_modules/lit-html/lit-html.js';
import { RenderableComponent } from '../../../../../types/test-types.js';
import { ParentElementFactory } from '../../elements/parent-element-factory.js';
import { TestElementFactory } from '../../elements/test-element-factory.js';

export declare class SubtreeElement extends ConfigurableWebComponent<{}> {
    props: { x: number; y: number };
    renders: number;
    lastRenderSubtreeProps: any;
    updateSubtree(): void;
    register(): void;
    registerEmpty(): void;
}

declare class SubtreeSuperComponent<
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
> extends RenderableComponent<GA> {
    registerAsSubTreeRoot(props?: any): void;
    setSubTreeProps(props: any): void;
}

export const SubtreeFactory = (superFn: typeof SubtreeSuperComponent) => {
    const SubtreeElementHTML = new TemplateFn<_SubtreeElement>(
        function(_, { subtreeProps }) {
            this.lastRenderSubtreeProps = subtreeProps;
            return html`
                <slot></slot>
            `;
        },
        CHANGE_TYPE.NEVER,
        render
    );

    const SubtreeElementCSS = new TemplateFn<SubtreeElement>(
        function() {
            this.renders++;
            return html`
                <style></style>
            `;
        },
        CHANGE_TYPE.SUBTREE_PROPS,
        render
    );

    @config({
        is: 'subtree-element',
        html: SubtreeElementHTML,
        css: SubtreeElementCSS,
        dependencies: [
            ParentElementFactory(superFn),
            TestElementFactory(superFn),
        ] as any,
    })
    class _SubtreeElement extends superFn {
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

        public lastRenderSubtreeProps: any;

        public renders: number = 0;

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

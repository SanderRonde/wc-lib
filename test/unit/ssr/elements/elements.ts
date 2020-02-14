import {
    config,
    TemplateFn,
    CHANGE_TYPE,
    Props,
    PROP_TYPE,
    WebComponent,
} from '../../../../build/cjs/wc-lib.js';
import {
    render as _render,
    html as _html,
    TemplateResult,
    PropertyCommitter,
    EventPart,
    BooleanAttributePart,
    AttributeCommitter,
    NodePart,
    isDirective,
    noChange,
    // @ts-ignore
} from '../../../modules/lit-html.js';
import { html as htmlType, render as renderType } from 'lit-html';

const html = _html as typeof htmlType;
const render = _render as typeof renderType;

export function elementFactory<
    C extends {
        define(isRoot?: boolean): void;
        new (...args: any[]): {};
    }
>(base: C, isComplex: boolean = false) {
    @config({
        is: 'simple-element',
        html: new TemplateFn<SimpleElement>(
            () => {
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class SimpleElement extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'simple-element-empty-props',
        html: new TemplateFn<SimpleElementEmptyProps>(
            () => {
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class SimpleElementEmptyProps extends base {
        constructor() {
            super();
        }

        props = Props.define(this as any, {});
    }

    @config({
        is: 'simple-element-x',
        html: new TemplateFn<SimpleElementX>(
            () => {
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class SimpleElementX extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: (null as unknown) as string,
        html: new TemplateFn<SimpleElement>(
            () => {
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class NoIs extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'parent-element-same',
        html: new TemplateFn<ParentElementSame>(
            () => {
                return html`
                    <no-is></no-is>
                    <no-is></no-is>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [],
    })
    //@ts-ignore
    class ParentElementSame extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'parent-element-different',
        html: new TemplateFn<ParentElementDifferent>(
            () => {
                return html`
                    <simple-element></simple-element>
                    <simple-element-x></simple-element-x>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [SimpleElement, SimpleElementX],
    })
    //@ts-ignore
    class ParentElementDifferent extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'with-attributes',
        html: new TemplateFn<WithAttributes>(
            () => {
                return html`
                    <div a="b" c="d" e='"f'></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class WithAttributes extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'auto-closing',
        html: new TemplateFn<AutoClosing>(
            () => {
                return html`
                    <br />
                    <img />
                    <input />
                    <link a="b" />
                    <hr b="c" />
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class AutoClosing extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'with-props',
        html: new TemplateFn<WithProps>(
            (_, props) => {
                return html`
                    <div>${props.x || '?'}</div>
                    <div>${props.y || '?'}</div>
                    <div>${props.a || '?'}</div>
                    <div>${props.b || '?'}</div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class WithProps extends base {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                x: PROP_TYPE.NUMBER,
                y: {
                    value: 5,
                    type: PROP_TYPE.NUMBER,
                },
            },
            priv: {
                a: PROP_TYPE.NUMBER,
                b: {
                    value: 5,
                    type: PROP_TYPE.NUMBER,
                },
            },
        });
    }

    @config({
        is: 'with-priv-props',
        html: new TemplateFn<WithPrivProps>(
            (_, props) => {
                return html`
                    <div>${props.a || '?'}</div>
                    <div>${props.b || '?'}</div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class WithPrivProps extends base {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            priv: {
                a: PROP_TYPE.NUMBER,
                b: {
                    value: 5,
                    type: PROP_TYPE.NUMBER,
                },
            },
        });
    }

    @config({
        is: 'with-css',
        html: new TemplateFn<WithCSS>(
            () => {
                return html`
                    <div id="a" class="b"></div>
                    <div id="c" class="b c d"></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        css: [
            new TemplateFn<WithCSS>(
                () => {
                    return html`
                        <style>
                            #a {
                                color: red;
                            }
                        </style>
                    `;
                },
                CHANGE_TYPE.NEVER,
                render
            ),
            new TemplateFn<WithCSS>(
                () => {
                    return html`
                        <style>
                            #c {
                                color: blue;
                            }
                        </style>
                    `;
                },
                CHANGE_TYPE.PROP,
                render
            ),
        ],
    })
    //@ts-ignore
    class WithCSS extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'multi-css',
        html: new TemplateFn<MultiCSS>(
            () => {
                return html`
                    <with-css></with-css>
                    <with-css></with-css>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [WithCSS],
    })
    //@ts-ignore
    class MultiCSS extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'nested-css',
        html: new TemplateFn<NestedCSS>(
            () => {
                return html``;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        css: [
            new TemplateFn<WithCSS>(
                () => {
                    return html`
                        <style>
                            #a {
                                color: red;
                            }
                        </style>
                    `;
                },
                CHANGE_TYPE.NEVER,
                render
            ),
        ],
    })
    //@ts-ignore
    class NestedCSS extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'single-child',
        html: new TemplateFn<SingleChild>(
            () => {
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class SingleChild extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'multi-child',
        html: new TemplateFn<MultiChild>(
            () => {
                return html`
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class MultiChild extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'nested-child',
        html: new TemplateFn<NestedChild>(
            () => {
                return html`
                    <div>
                        <div>
                            <div>test</div>
                        </div>
                    </div>
                    <div></div>
                    <span>
                        <div>
                            <br />
                        </div>
                    </span>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class NestedChild extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'different-child',
        html: new TemplateFn<DifferentChild>(
            () => {
                return html`
                    <simple-element></simple-element>
                    <simple-element></simple-element>
                    <simple-element></simple-element>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [SimpleElement],
    })
    //@ts-ignore
    class DifferentChild extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'undefined-child',
        html: new TemplateFn<UndefinedChild>(
            () => {
                return html`
                    <simple-element></simple-element>
                    <simple-element></simple-element>
                    <simple-element></simple-element>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [],
    })
    //@ts-ignore
    class UndefinedChild extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'nested-tag',
        html: new TemplateFn<NestedTag>(
            (_, props) => {
                return html`
                    ${props.child ? `<nested-tag></nested-tag>` : '<div></div>'}
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [],
    })
    //@ts-ignore
    class NestedTag extends base {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                child: {
                    type: PROP_TYPE.BOOL,
                    value: false,
                },
            },
        });
    }

    @config({
        is: 'render-error',
        html: new TemplateFn<RenderError>(
            () => {
                throw new Error('oh no');
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [],
    })
    //@ts-ignore
    class RenderError extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'css-error',
        html: new TemplateFn<CSSError>(
            () => {
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        css: new TemplateFn<CSSError>(
            () => {
                return html`
                    <style>
                        this is some invalid css { foo bar }
                    </style>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class CSSError extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'complex-tag',
        html: new TemplateFn<ComplexTag>(
            (html) => {
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [],
    })
    //@ts-ignore
    class ComplexTag extends base {
        constructor() {
            super();
        }
    }

    if (isComplex) {
        ((base as unknown) as typeof WebComponent).initComplexTemplateProvider({
            TemplateResult,
            PropertyCommitter,
            EventPart,
            BooleanAttributePart,
            AttributeCommitter,
            NodePart,
            isDirective,
            noChange,
        });
    }

    @config({
        is: 'default-slot',
        html: new TemplateFn<DefaultSlot>(
            () => {
                return html`
                    <div></div>
                    <slot><div>default</div></slot>
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class DefaultSlot extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'default-slot-multi',
        html: new TemplateFn<DefaultSlotMulti>(
            () => {
                return html`
                    <div></div>
                    <slot><div>default</div></slot>
                    <slot><div>default2</div></slot>
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class DefaultSlotMulti extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'default-slot-multi-user',
        html: new TemplateFn<DefaultSlotMultiUser>(
            () => {
                return html`
                    <default-slot-multi>
                        <span>content</span>
                    </default-slot-multi>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [DefaultSlotMulti],
    })
    //@ts-ignore
    class DefaultSlotMultiUser extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'default-slot-user-empty',
        html: new TemplateFn<DefaultSlotUserEmpty>(
            () => {
                return html`
                    <default-slot></default-slot>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [DefaultSlot],
    })
    //@ts-ignore
    class DefaultSlotUserEmpty extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'default-slot-user',
        html: new TemplateFn<DefaultSlotUser>(
            () => {
                return html`
                    <default-slot><span>content</span></default-slot>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [DefaultSlot],
    })
    //@ts-ignore
    class DefaultSlotUser extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'default-slot-user-multi',
        html: new TemplateFn<DefaultSlotUserMulti>(
            () => {
                return html`
                    <default-slot>
                        <span>content</span>
                        <span>content2</span>
                    </default-slot>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [DefaultSlot],
    })
    //@ts-ignore
    class DefaultSlotUserMulti extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'named-slot',
        html: new TemplateFn<NamedSlot>(
            () => {
                return html`
                    <div></div>
                    <slot name="a"></slot>
                    <div></div>
                    <slot name="b"></slot>
                    <div></div>
                    <slot name="c"></slot>
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class NamedSlot extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'named-slot-user',
        html: new TemplateFn<NamedSlotUser>(
            () => {
                return html`
                    <named-slot>
                        <span slot="c">c-content</span>
                        <span slot="a">a-content</span>
                        <span slot="d">wrong-slot</span>
                        <span>ignored</span>
                    </named-slot>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [NamedSlot],
    })
    //@ts-ignore
    class NamedSlotUser extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'both-slots',
        html: new TemplateFn<BothSlots>(
            () => {
                return html`
                    <div></div>
                    <slot name="a">default-a</slot>
                    <div></div>
                    <slot></slot>
                    <div></div>
                    <slot name="c">default-c</slot>
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class BothSlots extends base {
        constructor() {
            super();
        }
    }

    @config({
        is: 'both-slots-user',
        html: new TemplateFn<BothSlotsUser>(
            () => {
                return html`
                    <both-slots>
                        <span slot="c">c-content</span>
                        <span slot="b">b-content</span>
                        <span>default-content</span>
                    </both-slots>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [BothSlots],
    })
    //@ts-ignore
    class BothSlotsUser extends base {
        constructor() {
            super();
        }
    }

    return {
        SimpleElement,
        NoIs,
        ParentElementSame,
        ParentElementDifferent,
        WithAttributes,
        AutoClosing,
        WithProps,
        WithCSS,
        MultiCSS,
        SingleChild,
        MultiChild,
        NestedChild,
        DifferentChild,
        UndefinedChild,
        NestedTag,
        RenderError,
        CSSError,
        ComplexTag,
        DefaultSlotUserEmpty,
        DefaultSlotUser,
        DefaultSlotUserMulti,
        NamedSlotUser,
        BothSlotsUser,
        DefaultSlotMultiUser,
        SimpleElementEmptyProps,
        WithPrivProps,
        NamedSlot,
        DefaultSlot,
    };
}

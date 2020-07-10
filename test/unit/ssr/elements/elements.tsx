import {
    config,
    TemplateFn,
    CHANGE_TYPE,
    Props,
    PROP_TYPE,
    WebComponent,
    ComplexType,
    JSXBase,
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

declare global {
    namespace JSX {
        type IntrinsicElements = JSXBase.IntrinsicElements;
        type ElementAttributesProperty = JSXBase.ElementAttributesProperty;
    }
}

const html = _html as typeof htmlType;
const render = _render as typeof renderType;

export function elementFactory<
    C extends {
        define(isRoot?: boolean): void;
        new (...args: any[]): {};
    }
>(base: C, isComplex: boolean = false) {
    type CStatic = C & {
        __prom(key: string, ...values: any[]): Promise<string>;
        __(key: string, ...values: any[]): string;
    };
    const typedBase = (base as unknown) as CStatic & {
        new (...args: any[]): {
            __prom(key: string, ...values: any[]): Promise<string | undefined>;
            __(key: string, ...values: any[]): string | undefined;
            props: any;
            constructor: CStatic;
        };
    };

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
    class SimpleElement extends typedBase {
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
    class SimpleElementEmptyProps extends typedBase {
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
    class SimpleElementX extends typedBase {
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
    class NoIs extends typedBase {
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
    class ParentElementSame extends typedBase {
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
    class ParentElementDifferent extends typedBase {
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
    class WithAttributes extends typedBase {
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
    class AutoClosing extends typedBase {
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
    class WithProps extends typedBase {
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
    class WithPrivProps extends typedBase {
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
    class WithCSS extends typedBase {
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
    class MultiCSS extends typedBase {
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
    class NestedCSS extends typedBase {
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
    class SingleChild extends typedBase {
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
    class MultiChild extends typedBase {
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
    class NestedChild extends typedBase {
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
    class DifferentChild extends typedBase {
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
    class UndefinedChild extends typedBase {
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
    class NestedTag extends typedBase {
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
    class RenderError extends typedBase {
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
    class CSSError extends typedBase {
        constructor() {
            super();
        }
    }

    @config({
        is: 'script-tag',
        html: new TemplateFn<ScriptTag>(
            () => {
                return html`
                    <div></div>
                    <script>
                        console.log('some code');
                    </script>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class ScriptTag extends typedBase {
        constructor() {
            super();
        }
    }

    @config({
        is: 'complex-tag',
        html: new TemplateFn<ComplexTag>(
            (html, props) => {
                return html`
                    <div
                        class="${{
                            a: true,
                            b: true,
                        }}"
                    ></div>
                    <div>${['a', 'b', 'c', 'd']}</div>
                    <div>${[1, 2, 3, 4]}</div>
                    <div>
                        ${[
                            ['a', 'b'],
                            ['c', 'd'],
                        ]}
                    </div>
                    <div>
                        ${[1, 2].map((number) => {
                            return html`
                                <div>${number}</div>
                            `;
                        })}
                    </div>
                    <!-- prettier-ignore -->
                    <div
                        ?prop="${props.x}"
                        ?prop2='${props.x}'
                        ?prop3=${props.x}
                        ?prop4="${props.y}"
                        ?prop5='${props.y}'
                        ?prop6=${props.y}
                    ></div>
                    <!-- prettier-ignore -->
                    <div
                        prop="${{}}"
                        prop2='${{}}'
                        prop3="${[]}"
                        prop4='${[]}'
                        prop5=${{}}
                        prop6=${[]}
                        prop7="${() => {}}"
                    ></div>
                    <div>
                        ${[1, 2].map(() => {
                            return {};
                        })}
                    </div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [],
    })
    //@ts-ignore
    class ComplexTag extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                x: {
                    value: false,
                    type: PROP_TYPE.BOOL,
                },
                y: {
                    value: true,
                    type: PROP_TYPE.BOOL,
                },
            },
        });
    }

    @config({
        is: 'text-tag',
        html: new TemplateFn<TextTag>(
            () => {
                return 'some text';
            },
            CHANGE_TYPE.NEVER,
            (result) => result
        ),
        dependencies: [],
    })
    //@ts-ignore
    class TextTag extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                x: {
                    value: false,
                    type: PROP_TYPE.BOOL,
                },
                y: {
                    value: true,
                    type: PROP_TYPE.BOOL,
                },
            },
        });
    }

    @config({
        is: 'obj-text-tag',
        html: new TemplateFn<ObjTextTag>(
            () => {
                return {
                    toText() {
                        return 'more text';
                    },
                };
            },
            CHANGE_TYPE.NEVER,
            (result) => result
        ),
        dependencies: [],
    })
    //@ts-ignore
    class ObjTextTag extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                x: {
                    value: false,
                    type: PROP_TYPE.BOOL,
                },
                y: {
                    value: true,
                    type: PROP_TYPE.BOOL,
                },
            },
        });
    }

    @config({
        is: 'complex-prop-receiver',
        html: new TemplateFn<ComplexPropReceiver>(
            (_, props) => {
                return html`
                    <div>${props.x}</div>
                    <div>${props.y.a}</div>
                    <div>${props.z}</div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class ComplexPropReceiver extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                x: {
                    type: PROP_TYPE.NUMBER,
                    value: 1,
                },
                y: {
                    type: ComplexType<{
                        a: number;
                    }>(),
                    value: {
                        a: 1,
                    },
                },
                z: {
                    type: PROP_TYPE.STRING,
                    value: 'a',
                },
            },
        });
    }

    @config({
        is: 'complex-prop-user',
        html: new TemplateFn<ComplexPropUser>(
            () => {
                return html`
                    <div>
                        <complex-prop-receiver
                            z="b"
                            x="${2}"
                            y="${{ a: 2 }}"
                        ></complex-prop-receiver>
                    </div>
                    <div>
                        ${[2, 3, 4, 5].map((num) => {
                            return html`
                                <complex-prop-receiver
                                    z="b"
                                    x="${num}"
                                    y="${{ a: num }}"
                                ></complex-prop-receiver>
                            `;
                        })}
                    </div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [ComplexPropReceiver],
    })
    //@ts-ignore
    class ComplexPropUser extends typedBase {
        constructor() {
            super();
        }

        props = Props.define(this as any, {
            reflect: {
                x: {
                    type: PROP_TYPE.NUMBER,
                    value: 1,
                },
                y: {
                    type: ComplexType<{
                        a: number;
                    }>(),
                    value: {
                        a: 1,
                    },
                },
            },
        });
    }

    if (isComplex) {
        ((typedBase as unknown) as typeof WebComponent).initComplexTemplateProvider(
            {
                TemplateResult,
                PropertyCommitter,
                EventPart,
                BooleanAttributePart,
                AttributeCommitter,
                NodePart,
                isDirective,
                noChange,
            }
        );
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
    class DefaultSlot extends typedBase {
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
    class DefaultSlotMulti extends typedBase {
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
    class DefaultSlotMultiUser extends typedBase {
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
    class DefaultSlotUserEmpty extends typedBase {
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
    class DefaultSlotUser extends typedBase {
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
    class DefaultSlotUserMulti extends typedBase {
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
    class NamedSlot extends typedBase {
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
    class NamedSlotUser extends typedBase {
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
    class BothSlots extends typedBase {
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
    class BothSlotsUser extends typedBase {
        constructor() {
            super();
        }
    }

    @config({
        is: 'nested-slots',
        html: new TemplateFn<BothSlotsUser>(
            () => {
                return html`
                    <default-slot>
                        <default-slot-user></default-slot-user>
                    </default-slot>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [DefaultSlot, DefaultSlotUser],
    })
    //@ts-ignore
    class NestedSlots extends typedBase {
        constructor() {
            super();
        }
    }

    @config({
        is: 'i18n-user',
        html: new TemplateFn<I18nComponent>(
            function() {
                return html`
                    <div>${this.__('known_key')}</div>
                    <div>${this.isPromise(this.__prom('known_key'))}</div>
                    <div>${this.__('unknown_key')}</div>
                    <div>${this.__('values', 'a', 'b', 'c')}</div>
                    <div>${this.constructor.__('known_key')}</div>
                    <div>
                        ${this.isPromise(this.constructor.__prom('known_key'))}
                    </div>
                    <div>${this.constructor.__('unknown_key')}</div>
                    <div>${this.constructor.__('values', 'a', 'b', 'c')}</div>
                    <div>${(this as any).getLang()}</div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class I18nComponent extends typedBase {
        constructor() {
            super();
        }

        isPromise(value: any): value is Promise<any> {
            return value instanceof Promise;
        }
    }

    @config({
        is: 'theme-user',
        html: new TemplateFn<ThemeUser>(
            function() {
                return html`
                    <div>${(this as any).getThemeName()}</div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        css: [
            new TemplateFn<WithCSS>(
                (_html, _props, theme) => {
                    return html`
                        <style>
                            #a {
                                color: ${((theme as unknown) as {
                                    color: string;
                                })['color']};
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
    class ThemeUser extends typedBase {
        constructor() {
            super();
        }
    }

    @config({
        is: 'jsx-element',
        html: new TemplateFn<JSXElement>(
            (html) => {
                return <div id="some-id"></div>;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    //@ts-ignore
    class JSXElement extends typedBase {
        constructor() {
            super();
        }
    }

    @config({
        is: 'jsx-element-children',
        html: new TemplateFn<JSXElementChildren>(
            (html) => {
                return (
                    <div>
                        <div />
                        <div></div>
                    </div>
                );
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [],
    })
    //@ts-ignore
    class JSXElementChildren extends typedBase {
        constructor() {
            super();
        }
    }

    @config({
        is: 'jsx-element-components',
        html: new TemplateFn<JSXElementComponents>(
            (html) => {
                return (
                    <div>
                        <JSXElement />
                        <JSXElement></JSXElement>
                    </div>
                );
            },
            CHANGE_TYPE.NEVER,
            render
        ),
        dependencies: [JSXElement],
    })
    //@ts-ignore
    class JSXElementComponents extends typedBase {
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
        I18nComponent,
        ThemeUser,
        TextTag,
        ObjTextTag,
        ComplexPropUser,
        ComplexPropReceiver,
        ScriptTag,
        JSXElement,
        JSXElementChildren,
        JSXElementComponents,
        NestedSlots,
    };
}

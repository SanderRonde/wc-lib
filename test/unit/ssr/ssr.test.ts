import {
    BasicWebComponent,
    ComplexTemplatingWebComponent,
    I18NWebComponent,
    ThemingWebComponent,
} from '../../../build/cjs/classes/partial.js';
import {
    ssr,
    createSSRSession,
    SSR,
} from '../../../build/cjs/wc-lib-ssr.all.js';
import { ConfigurableWebComponent } from '../../../build/cjs/wc-lib.js';
import { elementFactory } from './elements/elements';
import { toTestTags } from './util/test-tags.js';
import _test, { TestInterface } from 'ava';

const baseComponents: {
    // This makes type checking a bit easier
    component: typeof ConfigurableWebComponent;
    isComplex: boolean;
    name: string;
}[] = [
    {
        component: ConfigurableWebComponent,
        isComplex: true,
        name: 'ConfigurableWebComponent',
    },
    {
        component: (BasicWebComponent as unknown) as typeof ConfigurableWebComponent,
        isComplex: false,
        name: 'BasicWebComponent',
    },
    {
        component: (ThemingWebComponent as unknown) as typeof ConfigurableWebComponent,
        isComplex: false,
        name: 'ThemingWebComponent',
    },
    {
        component: (I18NWebComponent as unknown) as typeof ConfigurableWebComponent,
        isComplex: false,
        name: 'I18NWebComponent',
    },
    {
        component: (ComplexTemplatingWebComponent as unknown) as typeof ConfigurableWebComponent,
        isComplex: true,
        name: 'ComplexTemplatingWebComponent',
    },
];

function wrapFnTitle(
    name: string,
    original: Function,
    thisArg: any,
    args: any[]
) {
    if (typeof args[0] !== 'string') {
        return original.apply(thisArg, [args[0], ...args.slice(1)]);
    }
    return original.apply(thisArg, [
        `${name}: ${args[0]}`,
        args[1],
        ...args.slice(2),
    ]);
}

function wrapFnTitleWrapper(name: string, original: Function) {
    return function(...args: any[]) {
        return wrapFnTitle(name, original, this, args);
    };
}

function genTestFn(name: string): TestInterface {
    return new Proxy(_test, {
        get(target, key) {
            if (key === 'only' || key === 'skip') {
                return wrapFnTitleWrapper(name, target[key]);
            }
            if (key === 'todo') {
                return function(title: string) {
                    return target.todo.apply(this, [`${name}: ${title}`]);
                };
            }
            return target[key];
        },
        apply(target, thisArg, args: any[]) {
            return wrapFnTitle(name, target, thisArg, args);
        },
    });
}

baseComponents.forEach(({ component, isComplex, name }) => {
    const {
        NoIs,
        SimpleElement,
        ParentElementSame,
        AutoClosing,
        CSSError,
        DifferentChild,
        MultiCSS,
        MultiChild,
        NestedChild,
        NestedTag,
        ParentElementDifferent,
        RenderError,
        SingleChild,
        UndefinedChild,
        WithAttributes,
        WithCSS,
        WithProps,
        ComplexTag,
        BothSlotsUser,
        DefaultSlotUser,
        DefaultSlotUserEmpty,
        DefaultSlotUserMulti,
        NamedSlotUser,
        DefaultSlotMultiUser,
        SimpleElementEmptyProps,
        WithPrivProps,
    } = elementFactory(component, isComplex);

    const test = genTestFn(name);

    {
        // Children
        test('a single child can be rendered', (t) => {
            const root = toTestTags(t, ssr(SingleChild));

            root.assertFormat([SingleChild.is, [['div', []]]]);
        });
        test('multiple children are rendered', (t) => {
            const root = toTestTags(t, ssr(MultiChild));

            root.assertFormat([
                MultiChild.is,
                [
                    ['div', []],
                    ['div', []],
                    ['div', []],
                    ['div', []],
                ],
            ]);
        });
        test('text is rendered', (t) => {
            const root = toTestTags(t, ssr(NestedChild));

            root.assertTag();
            root.assertChildren(3);

            root[0][0][0].c[0].assertText();
        });
        test('nested children are rendered', (t) => {
            const root = toTestTags(t, ssr(NestedChild));

            root.assertFormat([
                NestedChild.is,
                [
                    ['div', [['div', [['div', ['test']]]]]],
                    ['div', []],
                    ['span', [['div', [['br', []]]]]],
                ],
            ]);
        });
        test('other different tags can be rendered as children', (t) => {
            const root = toTestTags(t, ssr(DifferentChild));

            root.assertTag();
            root.assertTagName(DifferentChild.is);
            root.assertChildren(3);

            root[0].assertTag();
            root[0].assertTagName('simple-element');
            root[0].assertChildren();

            root[0][0].assertTag();
            root[0][0].assertTagName('div');
        });
        test('a different tag can be rendered as a child multiple times', (t) => {
            const root = toTestTags(t, ssr(DifferentChild));

            root.assertFormat([
                DifferentChild.is,
                [
                    ['simple-element', [['div', []]]],
                    ['simple-element', [['div', []]]],
                    ['simple-element', [['div', []]]],
                ],
            ]);
        });
        test('other tags are not expanded when not defined', (t) => {
            const root = toTestTags(t, ssr(UndefinedChild));

            root.assertFormat([
                UndefinedChild.is,
                [
                    ['simple-element', []],
                    ['simple-element', []],
                    ['simple-element', []],
                ],
            ]);
        });
        test('the same tag can be its own (optional) child', (t) => {
            const root = toTestTags(t, ssr(NestedTag, { child: true }));

            root.assertFormat([NestedTag.is, [[NestedTag.is, [['div', []]]]]]);
        });
    }

    {
        // Tagname
        test('element with tagname gets its tag name', (t) => {
            const root = toTestTags(t, ssr(SimpleElement));

            root.assertFormat([SimpleElement.is, [['div', []]]]);
        });
        test('element without tagname gets default tagname', (t) => {
            const root = toTestTags(t, ssr(NoIs));

            root.assertTag();
            root.assertTagName('wclib-element1');
            root.assertChildren(1);

            root.c[0].assertTag();
        });
        test('a child element without an is property keeps its tagname', (t) => {
            const root = toTestTags(t, ssr(ParentElementSame));

            root.assertTag();
            root.assertTagName(ParentElementSame.is);
            root.assertChildren(2);

            root[0].assertTagName('no-is');
            root[1].assertTagName('no-is');
        });
        test('another element without a tagname gets a different tagname', (t) => {
            const root = toTestTags(t, ssr(ParentElementDifferent));

            root.assertTag();
            root.assertTagName(ParentElementDifferent.is);
            root.assertChildren(2);

            root[0].assertTagName('simple-element');
            root[1].assertTagName('simple-element-x');
        });
    }

    {
        // Attributes
        test('attributes on the elements are applied', (t) => {
            const attributes = {
                a: 'b',
                c: 'd',
                e: '"f"',
            };
            const root = toTestTags(t, ssr(SimpleElement, {}, attributes));

            root.assertFormat([SimpleElement.is, [['div', []]]]);
            root.assertAttributes(attributes);
        });
        test('no attributes are applied when no attributes are passed', (t) => {
            const root = toTestTags(t, ssr(SimpleElement));

            root.assertFormat([SimpleElement.is, [['div', []]]]);
            root.assertAttributes({});
        });
        test('attributes are applied to children', (t) => {
            const root = toTestTags(t, ssr(WithAttributes));

            root.assertFormat([WithAttributes.is, [['div', []]]]);
            root.assertAttributes({});
            root[0].assertAttributes(
                {
                    a: 'b',
                    c: 'd',
                    e: '"f',
                },
                false
            );
        });
        test('non-strings are converted to strings', (t) => {
            const root = toTestTags(
                t,
                ssr(
                    SimpleElement,
                    {},
                    {
                        a: 0,
                        c: /x/,
                        e: true,
                    }
                )
            );

            root.assertFormat([SimpleElement.is, [['div', []]]]);
            root.assertAttributes({
                a: '0',
                c: '/x/',
                e: 'true',
            });
        });
        test('iterables have their values converted to strings', (t) => {
            const root = toTestTags(
                t,
                ssr(
                    SimpleElement,
                    {},
                    {
                        a: [0, 1, 2],
                        c: [/x/, /y/, /z/],
                        e: [true, false, true],
                        f: [0, /x/, true],
                        g: ['a', 'b', 'c'],
                    }
                )
            );

            root.assertFormat([SimpleElement.is, [['div', []]]]);
            root.assertAttributes({
                a: '012',
                c: '/x//y//z/',
                e: 'truefalsetrue',
                f: '0/x/true',
                g: 'abc',
            });
        });
    }

    {
        // Autoclosing
        test('autoclosing tags are still autoclosing', (t) => {
            const root = toTestTags(t, ssr(AutoClosing));

            root.assertTag();
            root.assertTagName(AutoClosing.is);
            root.assertChildren(5);

            root[0].assertAutoClosing();
            root[1].assertAutoClosing();
            root[2].assertAutoClosing();
            root[3].assertAutoClosing();
            root[4].assertAutoClosing();

            root[3].assertAttribute('a', 'b');
            root[4].assertAttribute('b', 'c');
        });
        test('not autoclosing tags are not autoclosing', (t) => {
            const root = toTestTags(t, ssr(SimpleElement));

            root.assertFormat([SimpleElement.is, [['div', []]]]);

            root[0].assertAutoClosing(false);
        });
    }

    {
        // Props
        test('properties are applied in render', (t) => {
            const root = toTestTags(
                t,
                ssr(WithProps, {
                    x: 1,
                    y: 2,
                    a: 3,
                    b: 4,
                })
            );

            root.assertFormat([
                WithProps.is,
                [
                    ['div', ['1']],
                    ['div', ['2']],
                    ['div', ['3']],
                    ['div', ['4']],
                ],
            ]);
        });
        test('properties are applied in render when only private props are set', (t) => {
            const root = toTestTags(
                t,
                ssr(WithPrivProps, {
                    a: 3,
                    b: 4,
                })
            );

            root.assertFormat([
                WithPrivProps.is,
                [
                    ['div', ['3']],
                    ['div', ['4']],
                ],
            ]);
        });
        test('missing props are not set', (t) => {
            const root = toTestTags(
                t,
                ssr(WithProps, {
                    y: 2,
                    b: 4,
                })
            );

            root.assertFormat([
                WithProps.is,
                [
                    ['div', ['?']],
                    ['div', ['2']],
                    ['div', ['?']],
                    ['div', ['4']],
                ],
            ]);
        });
        test('extra props are ignored', (t) => {
            const root = toTestTags(
                t,
                ssr(WithProps, {
                    y: 2,
                    b: 4,
                    extra: 1,
                    prop: 3,
                })
            );

            root.assertFormat([
                WithProps.is,
                [
                    ['div', ['?']],
                    ['div', ['2']],
                    ['div', ['?']],
                    ['div', ['4']],
                ],
            ]);
        });
        test('default props are applied when no values are passed', (t) => {
            const root = toTestTags(
                t,
                ssr(WithProps, {
                    x: 1,
                    a: 3,
                })
            );

            root.assertFormat([
                WithProps.is,
                [
                    ['div', ['1']],
                    ['div', ['5']],
                    ['div', ['3']],
                    ['div', ['5']],
                ],
            ]);
        });
        test('reflective props are reflected to the element', (t) => {
            const root = toTestTags(
                t,
                ssr(WithProps, {
                    x: 1,
                    y: 2,
                    a: 3,
                    b: 4,
                })
            );

            root.assertAttribute('x', '1');
            root.assertAttribute('y', '2');
        });
        test('non-reflective props are hidden', (t) => {
            const root = toTestTags(
                t,
                ssr(WithProps, {
                    x: 1,
                    y: 2,
                    a: 3,
                    b: 4,
                })
            );

            root.assertDoesNotHaveAttribute('a');
            root.assertDoesNotHaveAttribute('b');
        });
        test('works fine with an empty props object', (t) => {
            const root = toTestTags(t, ssr(SimpleElementEmptyProps));

            root.assertFormat([SimpleElementEmptyProps.is, [['div', []]]]);
        });
    }

    {
        // CSS
        test('css stylesheet is rendered', (t) => {
            const root = toTestTags(t, ssr(WithCSS));

            root.assertTag();
            root.assertTagName(WithCSS.is);
            root.assertChildren(4);

            root[2].assertTagName('div');
            root[2].assertAttribute('id', 'a');
            root[3].assertTagName('div');
            root[3].assertAttribute('id', 'c');

            root[0].assertTagName('style');
            root[1].assertTagName('style');
        });
        test('css contains rules', (t) => {
            const root = toTestTags(t, ssr(WithCSS));

            root.assertTag();
            root.assertTagName(WithCSS.is);
            root.assertChildren(4);

            root[0].assertTagName('style');
            root[1].assertTagName('style');

            root[0].assertChildren(1);
            root[0][0].assertText();

            root[1].assertChildren(1);
            root[1][0].assertText();

            t.true(
                root[0][0].content.includes('color: red'),
                'Style rule is rendered'
            );
            t.true(
                root[1][0].content.includes('color: blue'),
                'Style rule is rendered'
            );
        });
        test('existing classnames are not removed', (t) => {
            const root = toTestTags(t, ssr(WithCSS));

            root.assertTag();
            root.assertTagName(WithCSS.is);
            root.assertChildren(4);

            root[2].assertHasClasses('b');
            root[3].assertHasClasses('b', 'c', 'd');
        });
        test('element-global classnames are applied', (t) => {
            const root = toTestTags(t, ssr(MultiCSS));

            root.assertTag();
            root.assertTagName(MultiCSS.is);
            root.assertChildren(2);

            root.forEach((c) => c.assertTagName('with-css'));

            root[0].assertChildren(4);
            root[0][2].assertHasClasses('css-with-css');
            root[0][2].assertDoesNotHaveClasses('css-multi-css');

            root[1].assertChildren(3);
            root[1][1].assertHasClasses('css-with-css');
            root[1][1].assertDoesNotHaveClasses('css-multi-css');
        });
        test('element-specific classnames are applied', (t) => {
            const root = toTestTags(t, ssr(MultiCSS));

            root.assertTag();
            root.assertTagName(MultiCSS.is);
            root.assertChildren(2);

            root.forEach((c) => c.assertTagName('with-css'));

            root[0].assertChildren(4);
            root[0][2].assertHasClasses('css-with-css-0');
            root[0][2].assertDoesNotHaveClasses('css-multi-css');

            root[1].assertChildren(3);
            root[1][1].assertHasClasses('css-with-css-1');
            root[1][1].assertDoesNotHaveClasses('css-multi-css');
        });
        test('CHANGE_TYPE.THEME and CHANGE_TYPE.NEVER are only rendered once', (t) => {
            const root = toTestTags(t, ssr(MultiCSS));

            root.assertTag();
            root.assertTagName(MultiCSS.is);
            root.assertChildren(2);

            root.forEach((c) => c.assertTagName('with-css'));

            root[0].assertChildren(4);
            root[0][0].assertTagName('style');
            root[0][1].assertTagName('style');

            root[1].assertChildren(3);
            root[1][1].assertTagName('div');
        });
        test('other change type stylesheets are rendered multiple times', (t) => {
            const root = toTestTags(t, ssr(MultiCSS));

            root.assertTag();
            root.assertTagName(MultiCSS.is);
            root.assertChildren(2);

            root.forEach((c) => c.assertTagName('with-css'));

            root[0].assertChildren(4);
            root[0][0].assertTagName('style');
            root[0][1].assertTagName('style');

            root[1].assertChildren(3);
            root[1][0].assertTagName('style');
            root[1][0].assertChildren(1);
            root[1][0][0].assertText();
            t.true(
                root[1][0][0].content.includes('color: blue'),
                'rendered correct stylesheet'
            );
        });
    }

    {
        // Statelessness
        test('renders are stateless by default - unnamed tag test', (t) => {
            const root = toTestTags(t, ssr(NoIs));
            const root2 = toTestTags(t, ssr(NoIs));

            root.assertTagName('wclib-element1');
            root2.assertTagName('wclib-element1');
        });
        test('renders are stateless by default - tagname map test', (t) => {
            const root = toTestTags(t, ssr(DifferentChild));
            const root2 = toTestTags(t, ssr(UndefinedChild));

            root.assertTagName(DifferentChild.is);
            root2.assertTagName(UndefinedChild.is);

            root.assertFormat([
                DifferentChild.is,
                [
                    ['simple-element', [['div', []]]],
                    ['simple-element', [['div', []]]],
                    ['simple-element', [['div', []]]],
                ],
            ]);
            // Elements are still undefined
            root2.assertFormat([
                UndefinedChild.is,
                [
                    ['simple-element', []],
                    ['simple-element', []],
                    ['simple-element', []],
                ],
            ]);
        });
        test('renders are stateless by default - css test', (t) => {
            const root = toTestTags(t, ssr(WithCSS));
            const root2 = toTestTags(t, ssr(WithCSS));

            root.assertTagName(WithCSS.is);
            root2.assertTagName(WithCSS.is);
            root.assertChildren(4);
            root2.assertChildren(4);
        });
        test('renders can have state if set explicitly - unnamed tag test', (t) => {
            const session = createSSRSession();

            const root = toTestTags(t, ssr(NoIs, {}, {}, {}, session));
            const root2 = toTestTags(t, ssr(NoIs, {}, {}, {}, session));

            root.assertTagName('wclib-element1');
            root2.assertTagName('wclib-element2');
        });
        test('renders can have state if set explicitly - tagname map test', (t) => {
            const session = createSSRSession();

            const root = toTestTags(
                t,
                ssr(DifferentChild, {}, {}, {}, session)
            );
            const root2 = toTestTags(
                t,
                ssr(UndefinedChild, {}, {}, {}, session)
            );

            root.assertTagName(DifferentChild.is);
            root2.assertTagName(UndefinedChild.is);

            root.assertFormat([
                DifferentChild.is,
                [
                    ['simple-element', [['div', []]]],
                    ['simple-element', [['div', []]]],
                    ['simple-element', [['div', []]]],
                ],
            ]);
            // Elements are now defined
            root2.assertFormat([
                UndefinedChild.is,
                [
                    ['simple-element', [['div', []]]],
                    ['simple-element', [['div', []]]],
                    ['simple-element', [['div', []]]],
                ],
            ]);
        });
        test('renders can have state if set explicitly - css test', (t) => {
            const session = createSSRSession();

            const root = toTestTags(t, ssr(WithCSS, {}, {}, {}, session));
            const root2 = toTestTags(t, ssr(WithCSS, {}, {}, {}, session));

            root.assertTagName(WithCSS.is);
            root2.assertTagName(WithCSS.is);
            root.assertChildren(4);
            root2.assertChildren(3);
        });
    }

    {
        // Errors
        test('errors during rendering are captured', (t) => {
            const err = t.throws<SSR.Errors.RenderError>(
                () => {
                    toTestTags(t, ssr(RenderError));
                },
                {
                    message: /Error while rendering component on the server: Error, oh no/,
                    name: 'RenderError',
                    instanceOf: SSR.Errors.RenderError,
                }
            );
            t.true(err.source instanceof Error, 'source is an error');
            t.is(err.stack, err.source.stack, 'stack is copied over');
        });
        test('errors during CSS parsing are captured', (t) => {
            const err = t.throws<SSR.Errors.CSSParseError>(
                () => {
                    toTestTags(t, ssr(CSSError));
                },
                {
                    message: /Error while parsing rendered CSS/,
                    name: 'CSSParseError',
                    instanceOf: SSR.Errors.CSSParseError,
                }
            );
            t.true(err.source instanceof Error, 'source is an error');
            t.is(err.stack, err.source.stack, 'stack is copied over');
            t.truthy(err.file, 'file is attached');
        });
    }

    {
        // Complex
        test('complex templates still render (without complex features)', (t) => {
            const root = toTestTags(t, ssr(ComplexTag));

            root.assertFormat([ComplexTag.is, [['div', []]]]);
        });
    }

    {
        // Slots
        test("empty default slots don't use the default value", (t) => {
            const root = toTestTags(t, ssr(DefaultSlotUserEmpty));

            root.assertFormat([
                DefaultSlotUserEmpty.is,
                [
                    [
                        'default-slot',
                        [
                            ['div', []],
                            ['slot', []],
                            ['div', []],
                        ],
                    ],
                ],
            ]);
        });
        test('default slot values can be filled', (t) => {
            const root = toTestTags(t, ssr(DefaultSlotUser));

            root.assertFormat([
                DefaultSlotUser.is,
                [
                    [
                        'default-slot',
                        [
                            ['div', []],
                            ['slot', [['span', ['content']]]],
                            ['div', []],
                        ],
                    ],
                ],
            ]);
        });
        test('only the first default slot is used for slotting', (t) => {
            const root = toTestTags(t, ssr(DefaultSlotMultiUser));

            root.assertFormat([
                DefaultSlotMultiUser.is,
                [
                    [
                        'default-slot-multi',
                        [
                            ['div', []],
                            ['slot', [['span', ['content']]]],
                            ['slot', [['div', ['default2']]]],
                            ['div', []],
                        ],
                    ],
                ],
            ]);
        });
        test('multiple tags can be put into a default slot', (t) => {
            const root = toTestTags(t, ssr(DefaultSlotUserMulti));

            root.assertFormat([
                DefaultSlotUserMulti.is,
                [
                    [
                        'default-slot',
                        [
                            ['div', []],
                            [
                                'slot',
                                [
                                    ['span', ['content']],
                                    ['span', ['content2']],
                                ],
                            ],
                            ['div', []],
                        ],
                    ],
                ],
            ]);
        });
        test('named slots are filled with their values', (t) => {
            const root = toTestTags(t, ssr(NamedSlotUser));

            root.assertTagName(NamedSlotUser.is);
            root.assertChildren(1);
            root[0].assertMinChildren(7);
            root[0][1].assertTag();
            root[0][1].assertTagName('slot');
            root[0][1][0].assertTag();
            root[0][1][0].assertTagName('span');
            root[0][1][0][0].assertContent('a-content');

            root[0][5].assertTag();
            root[0][5].assertTagName('slot');
            root[0][5][0].assertTag();
            root[0][5][0].assertTagName('span');
            root[0][5][0][0].assertContent('c-content');
        });
        test('unnamed values are ignored when no slot exists for them', (t) => {
            const root = toTestTags(t, ssr(NamedSlotUser));

            root.assertFormat([
                NamedSlotUser.is,
                [
                    [
                        'named-slot',
                        [
                            ['div', []],
                            ['slot', [['span', ['a-content']]]],
                            ['div', []],
                            ['slot', []],
                            ['div', []],
                            ['slot', [['span', ['c-content']]]],
                            ['div', []],
                        ],
                    ],
                ],
            ]);
        });
        test('empty named slots use the default value', (t) => {
            const root = toTestTags(t, ssr(BothSlotsUser));

            root.assertTagName(BothSlotsUser.is);
            root.assertChildren(1);
            root[0].assertMinChildren(2);
            root[0][1].assertTag();
            root[0][1].assertTagName('slot');
            root[0][1].assertChildren(1);
            root[0][1][0].assertContent('default-a');
        });
        test('tags with the wrong slot name are ignored when no default slot exists', (t) => {
            const root = toTestTags(t, ssr(BothSlotsUser));

            root.assertTagName(BothSlotsUser.is);
            root.assertChildren(1);
            root[0].assertChildren(7);
        });
        test('tags with the wrong slot name are still ignored if a default slot exists', (t) => {
            const root = toTestTags(t, ssr(BothSlotsUser));

            root.assertTagName(BothSlotsUser.is);
            root.assertChildren(1);
            root[0].assertChildren(7);
            root[0][3].assertTag();
            root[0][3].assertTagName('slot');
            root[0][3].assertChildren(1);
            root[0][3][0].assertTagName('span');
            root[0][3][0].assertChildren();
            root[0][3][0][0].assertContent('default-content');
        });
        test('default slots and named slots can work together', (t) => {
            const root = toTestTags(t, ssr(BothSlotsUser));

            root.assertFormat([
                BothSlotsUser.is,
                [
                    [
                        'both-slots',
                        [
                            ['div', []],
                            ['slot', ['default-a']],
                            ['div', []],
                            ['slot', [['span', ['default-content']]]],
                            ['div', []],
                            ['slot', [['span', ['c-content']]]],
                            ['div', []],
                        ],
                    ],
                ],
            ]);
        });
    }
});

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
import { toTestTags, TestTagFormat } from './util/test-tags.js';
import { elementFactory } from './elements/elements';
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
    return function(this: any, ...args: any[]) {
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
                return function(this: any, title: string) {
                    return target.todo.apply(this, [`${name}: ${title}`]);
                };
            }
            return (target as any)[key];
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
        DynamicCSS,
        PromiseElement,
    } = elementFactory(component, isComplex);

    const test = genTestFn(name);

    {
        // Children
        test('a single child can be rendered', async (t) => {
            const root = toTestTags(t, await ssr(SingleChild));

            root.assertFormat([SingleChild.is, [['span', [['div', []]]]]]);
        });
        test('multiple children are rendered', async (t) => {
            const root = toTestTags(t, await ssr(MultiChild));

            root.assertFormat([
                MultiChild.is,
                [
                    [
                        'span',
                        [
                            ['div', []],
                            ['div', []],
                            ['div', []],
                            ['div', []],
                        ],
                    ],
                ],
            ]);
        });
        test('text is rendered', async (t) => {
            const root = toTestTags(t, await ssr(NestedChild));

            root.assertTag();
            root[0].assertChildren(3);

            root[0][0][0][0].c[0].assertText();
        });
        test('nested children are rendered', async (t) => {
            const root = toTestTags(t, await ssr(NestedChild));

            root.assertFormat([
                NestedChild.is,
                [
                    [
                        'span',
                        [
                            ['div', [['div', [['div', ['test']]]]]],
                            ['div', []],
                            ['span', [['div', [['br', []]]]]],
                        ],
                    ],
                ],
            ]);
        });
        test('other different tags can be rendered as children', async (t) => {
            const root = toTestTags(t, await ssr(DifferentChild));

            root.assertTag();
            root.assertTagName(DifferentChild.is);
            root[0].assertChildren(3);

            root[0][0].assertTag();
            root[0][0].assertTagName('simple-element');
            root[0][0].assertChildren();

            root[0][0][0][0].assertTag();
            root[0][0][0][0].assertTagName('div');
        });
        test('a different tag can be rendered as a child multiple times', async (t) => {
            const root = toTestTags(t, await ssr(DifferentChild));

            root.assertFormat([
                DifferentChild.is,
                [
                    [
                        'span',
                        [
                            ['simple-element', [['span', [['div', []]]]]],
                            ['simple-element', [['span', [['div', []]]]]],
                            ['simple-element', [['span', [['div', []]]]]],
                        ],
                    ],
                ],
            ]);
        });
        test('other tags are not expanded when not defined', async (t) => {
            const root = toTestTags(t, await ssr(UndefinedChild));

            root.assertFormat([
                UndefinedChild.is,
                [
                    [
                        'span',
                        [
                            ['simple-element', []],
                            ['simple-element', []],
                            ['simple-element', []],
                        ],
                    ],
                ],
            ]);
        });
        test('the same tag can be its own (optional) child', async (t) => {
            const root = toTestTags(
                t,
                await ssr(NestedTag, { props: { child: true } })
            );

            root.assertFormat([
                NestedTag.is,
                [['span', [[NestedTag.is, [['span', [['div', []]]]]]]]],
            ]);
        });
        if (isComplex) {
            test('async values can be not awaited', async (t) => {
                const root = toTestTags(
                    t,
                    await ssr(PromiseElement, {
                        props: {
                            promise: new Promise((resolve) => resolve('value')),
                        },
                    })
                );

                root.assertTagName(PromiseElement.is);
                root.assertChildren(1);
                root[0].assertTagName('span');
                root[0].assertChildren(2);
                root[0][0].assertTagName('div');
                root[0][0].assertChildren(1);
                root[0][0][0].assertContent('[object Promise]');
            });
            test('async values can be awaited', async (t) => {
                const root = toTestTags(
                    t,
                    await ssr(PromiseElement, {
                        props: {
                            promise: new Promise((resolve) => resolve('value')),
                        },
                        await: true,
                    })
                );

                root.assertTagName(PromiseElement.is);
                root.assertChildren(1);
                root[0].assertTagName('span');
                root[0].assertChildren(2);
                root[0][0].assertTagName('div');
                root[0][0].assertChildren(1);
                root[0][0][0].assertContent('value');
            });
            test('async attributes can be awaited', async (t) => {
                const root = toTestTags(
                    t,
                    await ssr(PromiseElement, {
                        props: {
                            promise: new Promise((resolve) => resolve('value')),
                        },
                        await: true,
                    })
                );

                root.assertTagName(PromiseElement.is);
                root.assertChildren(1);
                root[0].assertTagName('span');
                root[0].assertChildren(2);
                root[0][0].assertTagName('div');
                root[0][0].assertChildren(1);
                root[0][0][0].assertContent('value');

                root[0][1].assertHasAttribute('attr');
                root[0][1].assertAttribute('attr', 'attrvalue');
            });
        }
    }

    {
        if (isComplex) {
            // JSX
            test('JSX element with no children can be rendered', async (t) => {
                const root = toTestTags(t, await ssr(JSXElement));

                root[0].assertChildren(1);

                root[0][0].assertTagName('div');
            });
            test('JSX element with multiple children can be rendered', async (t) => {
                const root = toTestTags(t, await ssr(JSXElementChildren));

                root[0].assertChildren(1);
                root[0][0].assertChildren(2);

                root[0][0][0].assertTagName('div');
                root[0][0][1].assertTagName('div');
            });
            test('JSX element with components as children can be rendered', async (t) => {
                const root = toTestTags(t, await ssr(JSXElementComponents));

                root[0].assertChildren(1);
                root[0][0].assertChildren(2);

                root[0][0][0].assertTagName(JSXElement.is);
                root[0][0][1].assertTagName(JSXElement.is);
            });
        }
    }

    {
        // Tagname
        test('element with tagname gets its tag name', async (t) => {
            const root = toTestTags(t, await ssr(SimpleElement));

            root.assertFormat([SimpleElement.is, [['span', [['div', []]]]]]);
        });
        test('element without tagname gets default tagname', async (t) => {
            const root = toTestTags(t, await ssr(NoIs));

            root.assertTag();
            root.assertTagName('wclib-element0');
            root[0].assertChildren(1);

            root[0].c[0].assertTag();
        });
        test('a child element without an is property keeps its tagname', async (t) => {
            const root = toTestTags(t, await ssr(ParentElementSame));

            root.assertTag();
            root.assertTagName(ParentElementSame.is);
            root[0].assertChildren(2);

            root[0][0].assertTagName('no-is');
            root[0][1].assertTagName('no-is');
        });
        test('another element without a tagname gets a different tagname', async (t) => {
            const root = toTestTags(t, await ssr(ParentElementDifferent));

            root.assertTag();
            root.assertTagName(ParentElementDifferent.is);
            root[0].assertChildren(2);

            root[0][0].assertTagName('simple-element');
            root[0][1].assertTagName('simple-element-x');
        });
    }

    {
        // Attributes
        test('attributes on the elements are applied', async (t) => {
            const attributes = {
                a: 'b',
                c: 'd',
                e: '"f"',
            };
            const root = toTestTags(
                t,
                await ssr(SimpleElement, { attributes })
            );

            root.assertFormat([SimpleElement.is, [['span', [['div', []]]]]]);
            root.assertAttributes(attributes);
        });
        test('no attributes are applied when no attributes are passed', async (t) => {
            const root = toTestTags(t, await ssr(SimpleElement));

            root.assertFormat([SimpleElement.is, [['span', [['div', []]]]]]);
            root.assertAttributes({});
        });
        test('attributes are applied to children', async (t) => {
            const root = toTestTags(t, await ssr(WithAttributes));

            root.assertFormat([WithAttributes.is, [['span', [['div', []]]]]]);
            root.assertAttributes({});
            root[0][0].assertAttributes(
                {
                    a: 'b',
                    c: 'd',
                    e: '"f',
                },
                false
            );
        });
        test('non-strings are converted to strings', async (t) => {
            const root = toTestTags(
                t,
                await ssr(SimpleElement, {
                    attributes: {
                        a: 0,
                        c: /x/,
                        e: true,
                    },
                })
            );

            root.assertFormat([SimpleElement.is, [['span', [['div', []]]]]]);
            root.assertAttributes({
                a: '0',
                c: '/x/',
                e: 'true',
            });
        });
        test('iterables have their values converted to strings', async (t) => {
            const root = toTestTags(
                t,
                await ssr(SimpleElement, {
                    attributes: {
                        a: [0, 1, 2],
                        c: [/x/, /y/, /z/],
                        e: [true, false, true],
                        f: [0, /x/, true],
                        g: ['a', 'b', 'c'],
                    },
                })
            );

            root.assertFormat([SimpleElement.is, [['span', [['div', []]]]]]);
            root.assertAttributes({
                a: '012',
                c: '/x//y//z/',
                e: 'truefalsetrue',
                f: '0/x/true',
                g: 'abc',
            });
        });
        test('uppercase letters are replaced with dashes', async (t) => {
            const attributes = {
                'with-dashes': 'abc',
                withoutdashes: 'def',
                withUppercase: 'ghi',
            };
            const html = await ssr(SimpleElement, { attributes });
            const root = toTestTags(t, html);

            root.assertFormat([SimpleElement.is, [['span', [['div', []]]]]]);
            root.assertAttributes({
                // HTML parsing removes casing
                'with-dashes': 'abc',
                withoutdashes: 'def',
                'with-uppercase': 'ghi',
            });
            t.true(
                html.indexOf('with-uppercase') > -1,
                'attribute is now partially dashed'
            );
        });
        test('attributes that are invalid in HTML are ignored', async (t) => {
            const attributes = {
                '#invalid': 'abc',
                valid: 'def',
            };
            const html = await ssr(SimpleElement, { attributes });
            const root = toTestTags(t, html);

            root.assertFormat([SimpleElement.is, [['span', [['div', []]]]]]);
            root.assertAttributes({
                valid: 'def',
            });
        });
    }

    {
        // Autoclosing
        test('autoclosing tags are still autoclosing', async (t) => {
            const root = toTestTags(t, await ssr(AutoClosing));

            root.assertTag();
            root.assertTagName(AutoClosing.is);
            root[0].assertChildren(5);

            root[0][0].assertAutoClosing();
            root[0][1].assertAutoClosing();
            root[0][2].assertAutoClosing();
            root[0][3].assertAutoClosing();
            root[0][4].assertAutoClosing();

            root[0][3].assertAttribute('a', 'b');
            root[0][4].assertAttribute('b', 'c');
        });
        test('not autoclosing tags are not autoclosing', async (t) => {
            const root = toTestTags(t, await ssr(SimpleElement));

            root.assertFormat([SimpleElement.is, [['span', [['div', []]]]]]);

            root[0][0].assertAutoClosing(false);
        });
    }

    {
        // Props
        test('properties are applied in render', async (t) => {
            const root = toTestTags(
                t,
                await ssr(WithProps, {
                    props: {
                        x: 1,
                        y: 2,
                        a: 3,
                        b: 4,
                    },
                })
            );

            root.assertFormat([
                WithProps.is,
                [
                    [
                        'span',
                        [
                            ['div', ['1']],
                            ['div', ['2']],
                            ['div', ['3']],
                            ['div', ['4']],
                        ],
                    ],
                ],
            ]);
        });
        test('properties are applied in render when only private props are set', async (t) => {
            const root = toTestTags(
                t,
                await ssr(WithPrivProps, {
                    props: {
                        a: 3,
                        b: 4,
                    },
                })
            );

            root.assertFormat([
                WithPrivProps.is,
                [
                    [
                        'span',
                        [
                            ['div', ['3']],
                            ['div', ['4']],
                        ],
                    ],
                ],
            ]);
        });
        test('missing props are not set', async (t) => {
            const root = toTestTags(
                t,
                await ssr(WithProps, {
                    props: {
                        y: 2,
                        b: 4,
                    },
                })
            );

            root.assertFormat([
                WithProps.is,
                [
                    [
                        'span',
                        [
                            ['div', ['?']],
                            ['div', ['2']],
                            ['div', ['?']],
                            ['div', ['4']],
                        ],
                    ],
                ],
            ]);
        });
        test('extra props are ignored', async (t) => {
            const root = toTestTags(
                t,
                await ssr(WithProps, {
                    props: {
                        y: 2,
                        b: 4,
                        extra: 1,
                        prop: 3,
                    },
                })
            );

            root.assertFormat([
                WithProps.is,
                [
                    [
                        'span',
                        [
                            ['div', ['?']],
                            ['div', ['2']],
                            ['div', ['?']],
                            ['div', ['4']],
                        ],
                    ],
                ],
            ]);
        });
        test('default props are applied when no values are passed', async (t) => {
            const root = toTestTags(
                t,
                await ssr(WithProps, {
                    props: {
                        x: 1,
                        a: 3,
                    },
                })
            );

            root.assertFormat([
                WithProps.is,
                [
                    [
                        'span',
                        [
                            ['div', ['1']],
                            ['div', ['5']],
                            ['div', ['3']],
                            ['div', ['5']],
                        ],
                    ],
                ],
            ]);
        });
        test('reflective props are reflected to the element', async (t) => {
            const root = toTestTags(
                t,
                await ssr(WithProps, {
                    props: {
                        x: 1,
                        y: 2,
                        a: 3,
                        b: 4,
                    },
                })
            );

            root.assertAttribute('x', '1');
            root.assertAttribute('y', '2');
        });
        test('non-reflective props are hidden', async (t) => {
            const root = toTestTags(
                t,
                await ssr(WithProps, {
                    props: {
                        x: 1,
                        y: 2,
                        a: 3,
                        b: 4,
                    },
                })
            );

            root.assertDoesNotHaveAttribute('a');
            root.assertDoesNotHaveAttribute('b');
        });
        test('works fine with an empty props object', async (t) => {
            const root = toTestTags(t, await ssr(SimpleElementEmptyProps));

            root.assertFormat([
                SimpleElementEmptyProps.is,
                [['span', [['div', []]]]],
            ]);
        });
        if (isComplex) {
            test('passes on complex props', async (t) => {
                const root = toTestTags(
                    t,
                    await ssr(ComplexPropReceiver, {
                        props: {
                            x: 2,
                            y: {
                                a: 2,
                            },
                            z: 'b',
                        },
                    })
                );

                root.assertFormat([
                    ComplexPropReceiver.is,
                    [
                        [
                            'span',
                            [
                                ['div', ['2']],
                                ['div', ['2']],
                                ['div', ['b']],
                            ],
                        ],
                    ],
                ]);
            });
        }
    }

    {
        // CSS
        test('css stylesheet is rendered', async (t) => {
            const root = toTestTags(t, await ssr(WithCSS));

            root.assertTag();
            root.assertTagName(WithCSS.is);
            root.assertChildren(3);

            root[0].assertTagName('span');
            root[0].assertAttribute('data-type', 'css');
            root[0][0].assertTagName('style');
            root[1].assertTagName('span');
            root[1].assertAttribute('data-type', 'css');
            root[1][0].assertTagName('style');

            root[2].assertTagName('span');
            root[2].assertAttribute('data-type', 'html');

            root[2][0].assertTagName('div');
            root[2][0].assertAttribute('id', 'a');
            root[2][1].assertTagName('div');
            root[2][1].assertAttribute('id', 'c');
        });
        test('css contains rules', async (t) => {
            const root = toTestTags(t, await ssr(WithCSS));

            root.assertTag();
            root.assertTagName(WithCSS.is);
            root.assertChildren(3);

            root[0].assertTagName('span');
            root[0].assertAttribute('data-type', 'css');
            root[0][0].assertTagName('style');
            root[1].assertTagName('span');
            root[1].assertAttribute('data-type', 'css');
            root[1][0].assertTagName('style');

            root[0][0].assertChildren(1);
            root[0][0][0].assertText();

            root[1][0].assertChildren(1);
            root[1][0][0].assertText();

            t.true(
                root[0][0][0].content.includes('color: red'),
                'Style rule is rendered'
            );
            t.true(
                root[1][0][0].content.includes('color: blue'),
                'Style rule is rendered'
            );
        });
        test('existing classnames are not removed', async (t) => {
            const root = toTestTags(t, await ssr(WithCSS));

            root.assertTag();
            root.assertTagName(WithCSS.is);
            root.assertChildren(3);

            root[2][0].assertHasClasses('b');
            root[2][1].assertHasClasses('b', 'c', 'd');
        });
        test('element-global classnames are applied', async (t) => {
            const root = toTestTags(t, await ssr(MultiCSS));

            root.assertTag();
            root.assertTagName(MultiCSS.is);
            root[0].assertChildren(2);

            root[0].forEach((c) => c.assertTagName('with-css'));

            root[0][0][2].assertChildren(2);
            root[0][0][2][0].assertHasClasses('css-with-css');
            root[0][0][2][0].assertDoesNotHaveClasses('css-multi-css');

            root[0][1][1].assertChildren(2);
            root[0][1][1][1].assertHasClasses('css-with-css');
            root[0][1][1][1].assertDoesNotHaveClasses('css-multi-css');
        });
        test('element-specific classnames are applied', async (t) => {
            const root = toTestTags(t, await ssr(MultiCSS));

            root.assertTag();
            root.assertTagName(MultiCSS.is);
            root[0].assertChildren(2);

            root[0].forEach((c) => c.assertTagName('with-css'));

            root[0][0][2].assertChildren(2);
            root[0][0][2][0].assertHasClasses('css-with-css-0');
            root[0][0][2][0].assertDoesNotHaveClasses('css-multi-css');

            root[0][1][1].assertChildren(2);
            root[0][1][1][1].assertHasClasses('css-with-css-1');
            root[0][1][1][1].assertDoesNotHaveClasses('css-multi-css');
        });
        test('CHANGE_TYPE.THEME and CHANGE_TYPE.NEVER are only rendered once', async (t) => {
            const root = toTestTags(t, await ssr(MultiCSS));

            root.assertTag();
            root.assertTagName(MultiCSS.is);
            root[0].assertChildren(2);

            root[0].forEach((c) => c.assertTagName('with-css'));

            root[0][0].assertChildren(3);
            root[0][0][0][0].assertTagName('style');
            root[0][0][1][0].assertTagName('style');

            root[0][1].assertChildren(2);
            root[0][1][1][0].assertTagName('div');
        });
        test('other change type stylesheets are rendered multiple times', async (t) => {
            const root = toTestTags(t, await ssr(MultiCSS));

            root.assertTag();
            root.assertTagName(MultiCSS.is);
            root[0].assertChildren(2);

            root[0].forEach((c) => c.assertTagName('with-css'));

            root[0][0].assertChildren(3);
            root[0][0][0][0].assertTagName('style');
            root[0][0][1][0].assertTagName('style');

            root[0][1].assertChildren(2);
            root[0][1][0][0].assertTagName('style');
            root[0][1][0][0].assertChildren(1);
            root[0][1][0][0][0].assertText();

            t.true(
                root[0][1][0][0][0].content.includes('color: blue'),
                'rendered correct stylesheet'
            );
        });
        test('themes can be passed', async (t) => {
            const root = toTestTags(
                t,
                await ssr(ThemeUser, {
                    theme: {
                        color: 'red',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(ThemeUser.is);
            root.assertChildren(2);
            root[0].assertTag();
            root[0][0].assertTagName('style');
            t.true(root[0][0][0].content.includes('red'), 'theme is used');
        });
        test('themeName can be passed', async (t) => {
            const themeName = 'somethemename';
            const root = toTestTags(
                t,
                await ssr(ThemeUser, {
                    theme: {
                        color: 'red',
                    },
                    themeName,
                })
            );

            root.assertTag();
            root.assertTagName(ThemeUser.is);
            root.assertChildren(2);
            root[0].assertTag();
            root[0][0].assertTagName('style');
            t.true(root[0][0][0].content.includes('red'), 'theme is used');

            root[1].assertTag();
            root[1][0].assertTagName('div');
            root[1][0].assertChildren(1);
            root[1][0][0].assertText();
            root[1][0][0].assertContent(themeName);
        });
        test('scripts are rendered as well', async (t) => {
            const root = toTestTags(t, await ssr(ScriptTag));

            root.assertTag();
            root.assertTagName(ScriptTag.is);
            root[0].assertChildren(2);
            root[0][0].assertTag();
            root[0][0].assertTagName('div');
            root[0][1].assertTag();
            root[0][1].assertTagName('script');
            root[0][1].assertChildren(1);
            root[0][1][0].assertText();
            root[0][1][0].assertContent("console.log('some code');");
        });

        test('basic ID selectors are converted properly', async (t) => {
            const root = toTestTags(
                t,
                await ssr(DynamicCSS, {
                    props: {
                        selector: '#id',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(DynamicCSS.is);
            root.assertChildren(2);
            root[0].assertTagName('span');
            root[0].assertChildren(1);
            root[0][0].assertTagName('style');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();

            t.true(root[0][0][0].content.includes('#id'));
            t.true(root[0][0][0].content.includes('#id.css-dynamic-css-0'));
        });
        test('basic class selectors are converted properly', async (t) => {
            const root = toTestTags(
                t,
                await ssr(DynamicCSS, {
                    props: {
                        selector: '.class',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(DynamicCSS.is);
            root.assertChildren(2);
            root[0].assertTagName('span');
            root[0].assertChildren(1);
            root[0][0].assertTagName('style');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();

            t.true(root[0][0][0].content.includes('.class'));
            t.true(root[0][0][0].content.includes('.class.css-dynamic-css-0'));
        });
        test('basic tagname selectors are converted properly', async (t) => {
            const root = toTestTags(
                t,
                await ssr(DynamicCSS, {
                    props: {
                        selector: 'tag',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(DynamicCSS.is);
            root.assertChildren(2);
            root[0].assertTagName('span');
            root[0].assertChildren(1);
            root[0][0].assertTagName('style');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();

            t.true(root[0][0][0].content.includes('tag'));
            t.true(root[0][0][0].content.includes('tag.css-dynamic-css-0'));
        });
        test('star selectors are converted properly', async (t) => {
            const root = toTestTags(
                t,
                await ssr(DynamicCSS, {
                    props: {
                        selector: '*',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(DynamicCSS.is);
            root.assertChildren(2);
            root[0].assertTagName('span');
            root[0].assertChildren(1);
            root[0][0].assertTagName('style');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();

            t.true(root[0][0][0].content.includes('.css-dynamic-css-0'));
        });
        test('descendant selectors are converted properly', async (t) => {
            const root = toTestTags(
                t,
                await ssr(DynamicCSS, {
                    props: {
                        selector: '#parent #child',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(DynamicCSS.is);
            root.assertChildren(2);
            root[0].assertTagName('span');
            root[0].assertChildren(1);
            root[0][0].assertTagName('style');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();

            t.true(root[0][0][0].content.includes('#parent.css-dynamic-css-0'));
            t.true(root[0][0][0].content.includes('#child.css-dynamic-css-0'));
            t.true(
                root[0][0][0].content.includes(
                    '#parent.css-dynamic-css-0 #child.css-dynamic-css-0'
                )
            );
        });
        test('direct descendant selectors are converted properly', async (t) => {
            const root = toTestTags(
                t,
                await ssr(DynamicCSS, {
                    props: {
                        selector: '#parent > #child',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(DynamicCSS.is);
            root.assertChildren(2);
            root[0].assertTagName('span');
            root[0].assertChildren(1);
            root[0][0].assertTagName('style');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();

            t.true(root[0][0][0].content.includes('#parent.css-dynamic-css-0'));
            t.true(root[0][0][0].content.includes('#child.css-dynamic-css-0'));
            t.true(
                root[0][0][0].content.includes(
                    '#parent.css-dynamic-css-0 > #child.css-dynamic-css-0'
                )
            );
        });
        test('pseudo selectors with a single colon are converted properly', async (t) => {
            const root = toTestTags(
                t,
                await ssr(DynamicCSS, {
                    props: {
                        selector: '#selector:hover',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(DynamicCSS.is);
            root.assertChildren(2);
            root[0].assertTagName('span');
            root[0].assertChildren(1);
            root[0][0].assertTagName('style');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();

            t.true(
                root[0][0][0].content.includes(
                    '#selector.css-dynamic-css-0:hover'
                )
            );
        });
        test('pseudo selectors with two colons are converted properly', async (t) => {
            const root = toTestTags(
                t,
                await ssr(DynamicCSS, {
                    props: {
                        selector: '#selector::after',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(DynamicCSS.is);
            root.assertChildren(2);
            root[0].assertTagName('span');
            root[0].assertChildren(1);
            root[0][0].assertTagName('style');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();

            t.true(
                root[0][0][0].content.includes(
                    '#selector.css-dynamic-css-0::after'
                )
            );
        });
    }

    {
        // Statelessness
        test('renders are stateless by default - unnamed tag test', async (t) => {
            const root = toTestTags(t, await ssr(NoIs));
            const root2 = toTestTags(t, await ssr(NoIs));

            root.assertTagName('wclib-element0');
            root2.assertTagName('wclib-element0');
        });
        test('renders are stateless by default - tagname map test', async (t) => {
            const root = toTestTags(t, await ssr(DifferentChild));
            const root2 = toTestTags(t, await ssr(UndefinedChild));

            root.assertTagName(DifferentChild.is);
            root2.assertTagName(UndefinedChild.is);

            root.assertFormat([
                DifferentChild.is,
                [
                    [
                        'span',
                        [
                            ['simple-element', [['span', [['div', []]]]]],
                            ['simple-element', [['span', [['div', []]]]]],
                            ['simple-element', [['span', [['div', []]]]]],
                        ],
                    ],
                ],
            ]);
            // Elements are still undefined
            root2.assertFormat([
                UndefinedChild.is,
                [
                    [
                        'span',
                        [
                            ['simple-element', []],
                            ['simple-element', []],
                            ['simple-element', []],
                        ],
                    ],
                ],
            ]);
        });
        test('renders are stateless by default - css test', async (t) => {
            const root = toTestTags(t, await ssr(WithCSS));
            const root2 = toTestTags(t, await ssr(WithCSS));

            root.assertTagName(WithCSS.is);
            root2.assertTagName(WithCSS.is);
            root.assertChildren(3);
            root2.assertChildren(3);
        });
        test('renders can have state if set explicitly - unnamed tag test', async (t) => {
            const session = createSSRSession();

            const root = toTestTags(
                t,
                await ssr(NoIs, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                await ssr(NoIs, {
                    documentSession: session,
                })
            );

            root.assertTagName('wclib-element0');
            root2.assertTagName('wclib-element1');
        });
        test('renders can have state if set explicitly - tagname map test', async (t) => {
            const session = createSSRSession();

            const root = toTestTags(
                t,
                await ssr(DifferentChild, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                await ssr(UndefinedChild, {
                    documentSession: session,
                })
            );

            root.assertTagName(DifferentChild.is);
            root2.assertTagName(UndefinedChild.is);

            root.assertFormat([
                DifferentChild.is,
                [
                    [
                        'span',
                        [
                            ['simple-element', [['span', [['div', []]]]]],
                            ['simple-element', [['span', [['div', []]]]]],
                            ['simple-element', [['span', [['div', []]]]]],
                        ],
                    ],
                ],
            ]);
            // Elements are now defined
            root2.assertFormat([
                UndefinedChild.is,
                [
                    [
                        'span',
                        [
                            ['simple-element', [['span', [['div', []]]]]],
                            ['simple-element', [['span', [['div', []]]]]],
                            ['simple-element', [['span', [['div', []]]]]],
                        ],
                    ],
                ],
            ]);
        });
        test('renders can have state if set explicitly - css test', async (t) => {
            const session = createSSRSession();

            const root = toTestTags(
                t,
                await ssr(WithCSS, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                await ssr(WithCSS, {
                    documentSession: session,
                })
            );

            root.assertTagName(WithCSS.is);
            root2.assertTagName(WithCSS.is);
            root.assertChildren(3);
            root2.assertChildren(2);
        });
    }

    {
        // Errors
        test('errors during rendering are captured', async (t) => {
            const err = await t.throwsAsync<SSR.Errors.RenderError>(
                async () => {
                    toTestTags(t, await ssr(RenderError));
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
        test('errors during CSS parsing are captured', async (t) => {
            const err = await t.throwsAsync<SSR.Errors.CSSParseError>(
                async () => {
                    toTestTags(t, await ssr(CSSError));
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

    if (isComplex) {
        // Complex
        test('the class attribute is applied', async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(1);
            root[0][0].assertTag();
            root[0][0].assertTagName('div');
            root[0][0].assertHasClasses('a', 'b');
        });
        test("the style attribute is applied when it's an object", async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(1);
            root[0][8].assertTag();
            root[0][8].assertTagName('div');
            root[0][8].assertHasAttribute('style');
            root[0][8].assertAttribute(
                'style',
                'color: red; background-color: blue;'
            );
        });
        test("the style attribute is applied when it's a primitive", async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(1);
            root[0][9].assertTag();
            root[0][9].assertTagName('div');
            root[0][9].assertHasAttribute('style');
            root[0][9].assertAttribute('style', 'color: red;');
        });
        test('strings are joined', async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(2);
            root[0][1].assertTag();
            root[0][1].assertTagName('div');
            root[0][1].assertChildren(1);
            root[0][1][0].assertContent('abcd');
        });
        test('numbers are joined', async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(3);
            root[0][2].assertTag();
            root[0][2].assertTagName('div');
            root[0][2].assertChildren(1);
            root[0][2][0].assertContent('1234');
        });
        test('nested arrays are joined', async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(4);
            root[0][3].assertTag();
            root[0][3].assertTagName('div');
            root[0][3].assertChildren(1);
            root[0][3][0].assertContent('abcd');
        });
        test('template arrays are joined', async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(5);
            root[0][4].assertTag();
            root[0][4].assertTagName('div');
            root[0][4].assertChildren(2);
            root[0][4][0].assertChildren(1);
            root[0][4][0][0].assertContent('1');
            root[0][4][1].assertChildren(1);
            root[0][4][1][0].assertContent('2');
        });
        test('boolean attributes are applied', async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(6);
            root[0][5].assertTag();
            root[0][5].assertTagName('div');
            root[0][5].assertDoesNotHaveAttributes('prop', 'prop2', 'prop3');
            root[0][5].assertHasAttributes('prop4', 'prop5', 'prop6');
        });
        test('complex values are removed altogether', async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(7);
            root[0][6].assertTag();
            root[0][6].assertTagName('div');
            root[0][6].assertDoesNotHaveAttributes(
                'prop',
                'prop2',
                'prop3',
                'prop4',
                'prop5',
                'prop6',
                'prop6'
            );
        });
        test('regular objects are turned into strings', async (t) => {
            const root = toTestTags(t, await ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root[0].assertMinChildren(8);
            root[0][7].assertTag();
            root[0][7].assertTagName('div');
            root[0][7].assertChildren(1);
            root[0][7][0].assertText();
            root[0][7][0].assertContent('[object Object][object Object]');
        });
        test('non-lit-html pure text tags are still rendered to text', async (t) => {
            const root = toTestTags(t, await ssr(TextTag));

            root.assertTag();
            root.assertTagName(TextTag.is);
            root[0].assertChildren(1);
            root[0][0].assertText();
            root[0][0].assertContent('some text');
        });
        test('non-lit-html object text tags are still rendered to text', async (t) => {
            const root = toTestTags(t, await ssr(ObjTextTag));

            root.assertTag();
            root.assertTagName(ObjTextTag.is);
            root[0].assertChildren(1);
            root[0][0].assertText();
            root[0][0].assertContent('more text');
        });
        test('complex values are still passed on to components', async (t) => {
            const root = toTestTags(t, await ssr(ComplexPropUser));

            root.assertTag();
            root.assertTagName(ComplexPropUser.is);
            root[0].assertMinChildren(1);
            root[0][0].assertTag();
            root[0][0].assertTagName('div');
            root[0][0].assertChildren(1);
            root[0][0][0].assertTag();
            root[0][0][0].assertTagName('complex-prop-receiver');
            root[0][0][0][0].assertChildren(3);
            root[0][0][0][0][0].assertChildren(1);
            root[0][0][0][0][0][0].assertContent('2');
            root[0][0][0][0][1].assertChildren(1);
            root[0][0][0][0][1][0].assertContent('2');
            root[0][0][0][0][2].assertChildren(1);
            root[0][0][0][0][2][0].assertContent('b');
        });
        test('complex values are passed on to nested templates', async (t) => {
            const root = toTestTags(t, await ssr(ComplexPropUser));

            root.assertFormat([
                ComplexPropUser.is,
                [
                    [
                        'span',
                        [
                            [
                                'div',
                                [
                                    [
                                        'complex-prop-receiver',
                                        [
                                            [
                                                'span',
                                                [
                                                    ['div', ['2']],
                                                    ['div', ['2']],
                                                    ['div', ['b']],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                'div',
                                [2, 3, 4, 5].map((num) => {
                                    return [
                                        'complex-prop-receiver',
                                        [
                                            [
                                                'span',
                                                [
                                                    ['div', [`${num}`]],
                                                    ['div', [`${num}`]],
                                                    ['div', ['b']],
                                                ],
                                            ],
                                        ],
                                    ] as TestTagFormat;
                                }),
                            ],
                        ],
                    ],
                ],
            ]);
        });
    }

    {
        // Slots
        test("empty default slots don't use the default value", async (t) => {
            const root = toTestTags(t, await ssr(DefaultSlotUserEmpty));

            root.assertFormat([
                DefaultSlotUserEmpty.is,
                [
                    [
                        'span',
                        [
                            [
                                'default-slot',
                                [
                                    [
                                        'span',
                                        [
                                            ['div', []],
                                            ['slot', []],
                                            ['div', []],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });
        test('default slot values can be filled', async (t) => {
            const root = toTestTags(t, await ssr(DefaultSlotUser));

            root.assertFormat([
                DefaultSlotUser.is,
                [
                    [
                        'span',
                        [
                            [
                                'default-slot',
                                [
                                    [
                                        'span',
                                        [
                                            ['div', []],
                                            ['slot', [['span', ['content']]]],
                                            ['div', []],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });
        test('only the first default slot is used for slotting', async (t) => {
            const root = toTestTags(t, await ssr(DefaultSlotMultiUser));

            root.assertFormat([
                DefaultSlotMultiUser.is,
                [
                    [
                        'span',
                        [
                            [
                                'default-slot-multi',
                                [
                                    [
                                        'span',
                                        [
                                            ['div', []],
                                            ['slot', [['span', ['content']]]],
                                            ['slot', [['div', ['default2']]]],
                                            ['div', []],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });
        test('multiple tags can be put into a default slot', async (t) => {
            const root = toTestTags(t, await ssr(DefaultSlotUserMulti));

            root.assertFormat([
                DefaultSlotUserMulti.is,
                [
                    [
                        'span',
                        [
                            [
                                'default-slot',
                                [
                                    [
                                        'span',
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
                            ],
                        ],
                    ],
                ],
            ]);
        });
        test('named slots are filled with their values', async (t) => {
            const root = toTestTags(t, await ssr(NamedSlotUser));

            root.assertTagName(NamedSlotUser.is);
            root[0].assertChildren(1);
            root[0][0][0].assertMinChildren(7);
            root[0][0][0][1].assertTag();
            root[0][0][0][1].assertTagName('slot');
            root[0][0][0][1][0].assertTag();
            root[0][0][0][1][0].assertTagName('span');
            root[0][0][0][1][0][0].assertContent('a-content');

            root[0][0][0][5].assertTag();
            root[0][0][0][5].assertTagName('slot');
            root[0][0][0][5][0].assertTag();
            root[0][0][0][5][0].assertTagName('span');
            root[0][0][0][5][0][0].assertContent('c-content');
        });
        test('unnamed values are ignored when no slot exists for them', async (t) => {
            const root = toTestTags(t, await ssr(NamedSlotUser));

            root.assertFormat([
                NamedSlotUser.is,
                [
                    [
                        'span',
                        [
                            [
                                'named-slot',
                                [
                                    [
                                        'span',
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
                            ],
                        ],
                    ],
                ],
            ]);
        });
        test('empty named slots use the default value', async (t) => {
            const root = toTestTags(t, await ssr(BothSlotsUser));

            root.assertTagName(BothSlotsUser.is);
            root[0].assertChildren(1);
            root[0][0][0].assertMinChildren(2);
            root[0][0][0][1].assertTag();
            root[0][0][0][1].assertTagName('slot');
            root[0][0][0][1].assertChildren(1);
            root[0][0][0][1][0].assertContent('default-a');
        });
        test('tags with the wrong slot name are ignored when no default slot exists', async (t) => {
            const root = toTestTags(t, await ssr(BothSlotsUser));

            root.assertTagName(BothSlotsUser.is);
            root[0].assertChildren(1);
            root[0][0][0].assertChildren(7);
        });
        test('tags with the wrong slot name are still ignored if a default slot exists', async (t) => {
            const root = toTestTags(t, await ssr(BothSlotsUser));

            root.assertTagName(BothSlotsUser.is);
            root[0].assertChildren(1);
            root[0][0][0].assertChildren(7);
            root[0][0][0][3].assertTag();
            root[0][0][0][3].assertTagName('slot');
            root[0][0][0][3].assertChildren(1);
            root[0][0][0][3][0].assertTagName('span');
            root[0][0][0][3][0].assertChildren();
            root[0][0][0][3][0][0].assertContent('default-content');
        });
        test('default slots and named slots can work together', async (t) => {
            const root = toTestTags(t, await ssr(BothSlotsUser));

            root.assertFormat([
                BothSlotsUser.is,
                [
                    [
                        'span',
                        [
                            [
                                'both-slots',
                                [
                                    [
                                        'span',
                                        [
                                            ['div', []],
                                            ['slot', ['default-a']],
                                            ['div', []],
                                            [
                                                'slot',
                                                [['span', ['default-content']]],
                                            ],
                                            ['div', []],
                                            ['slot', [['span', ['c-content']]]],
                                            ['div', []],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });
        test('root can have named slots as children', async (t) => {
            await t.notThrowsAsync(async () => {
                toTestTags(t, await ssr(NamedSlot));
            });
        });
        test("root can't have unnamed slots as children", async (t) => {
            await t.throwsAsync(
                async () => {
                    toTestTags(t, await ssr(DefaultSlot));
                },
                {
                    message:
                        "Root element can't have unnamed slots as children",
                    instanceOf: Error,
                }
            );
        });
        test('nested slots are not re-slotted', async (t) => {
            const root = toTestTags(t, await ssr(NestedSlots));

            root.assertTagName(NestedSlots.is);
            root.assertChildren(1);
            root[0].assertChildren(1);
            root[0][0].assertTagName('default-slot');
            root[0][0].assertChildren(1);
            root[0][0][0].assertTagName('span');
            root[0][0][0].assertChildren(3);
            root[0][0][0][0].assertTagName('div');
            root[0][0][0][2].assertTagName('div');

            root[0][0][0][1].assertTagName('slot');
            root[0][0][0][1].assertChildren(1);
            root[0][0][0][1][0].assertTagName('default-slot-user');
            root[0][0][0][1][0].assertChildren(1);
            root[0][0][0][1][0][0].assertTagName('span');
            root[0][0][0][1][0][0].assertChildren(1);
            root[0][0][0][1][0][0][0].assertTagName('default-slot');
            root[0][0][0][1][0][0][0].assertChildren(1);
            root[0][0][0][1][0][0][0][0].assertTagName('span');
            root[0][0][0][1][0][0][0][0].assertChildren(3);
            root[0][0][0][1][0][0][0][0][0].assertTagName('div');
            root[0][0][0][1][0][0][0][0][2].assertTagName('div');

            root[0][0][0][1][0][0][0][0][1].assertTagName('slot');
            root[0][0][0][1][0][0][0][0][1].assertChildren(1);
            root[0][0][0][1][0][0][0][0][1][0].assertTagName('span');
            root[0][0][0][1][0][0][0][0][1][0].assertChildren(1);
            root[0][0][0][1][0][0][0][0][1][0][0].assertText();
            root[0][0][0][1][0][0][0][0][1][0][0].assertContent('content');
        });
    }

    {
        const defaultI18n = {
            known_key: 'a',
            values: 'text',
        };

        // I18N
        test('valid entries are displayed when using __', async (t) => {
            const root = toTestTags(
                t,
                await ssr(I18nComponent, {
                    i18n: defaultI18n,
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root[0].assertMinChildren(5);

            root[0][0].assertTagName('div');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();
            root[0][0][0].assertContent(defaultI18n['known_key']);

            root[0][4].assertTagName('div');
            root[0][4].assertChildren(1);
            root[0][4][0].assertText();
            root[0][4][0].assertContent(defaultI18n['known_key']);
        });
        test('getLang() can be used', async (t) => {
            const language = 'somelanguage';
            const root = toTestTags(
                t,
                await ssr(I18nComponent, {
                    i18n: defaultI18n,
                    lang: language,
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root[0].assertChildren(9);

            root[0][0].assertTagName('div');
            root[0][0].assertChildren(1);
            root[0][0][0].assertText();
            root[0][0][0].assertContent(defaultI18n['known_key']);

            root[0][4].assertTagName('div');
            root[0][4].assertChildren(1);
            root[0][4][0].assertText();
            root[0][4][0].assertContent(defaultI18n['known_key']);

            root[0][8].assertTagName('div');
            root[0][8].assertChildren(1);
            root[0][8][0].assertText();
            root[0][8][0].assertContent(language);
        });
        test('__prom returns a promise', async (t) => {
            const root = toTestTags(
                t,
                await ssr(I18nComponent, {
                    i18n: defaultI18n,
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root[0].assertMinChildren(6);

            root[0][1].assertTagName('div');
            root[0][1].assertChildren(1);
            root[0][1][0].assertText();
            root[0][1][0].assertContent('true');

            root[0][5].assertTagName('div');
            root[0][5].assertChildren(1);
            root[0][5][0].assertText();
            root[0][5][0].assertContent('true');
        });
        test('unknown keys display nothing by default when using __', async (t) => {
            const root = toTestTags(
                t,
                await ssr(I18nComponent, {
                    i18n: defaultI18n,
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root[0].assertMinChildren(7);

            root[0][2].assertTagName('div');
            root[0][2].assertChildren(0);

            root[0][6].assertTagName('div');
            root[0][6].assertChildren(0);
        });
        test('unknown keys can display fallback when using getMessage', async (t) => {
            const root = toTestTags(
                t,
                await ssr(I18nComponent, {
                    i18n: defaultI18n,
                    getMessage(langFile, key) {
                        if (key in langFile) return langFile[key];
                        return `{{${key}}}`;
                    },
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root[0].assertMinChildren(7);

            root[0][2].assertTagName('div');
            root[0][2].assertChildren(1);
            root[0][2][0].assertText();
            root[0][2][0].assertContent('{{unknown_key}}');

            root[0][6].assertTagName('div');
            root[0][6].assertChildren(1);
            root[0][6][0].assertText();
            root[0][6][0].assertContent('{{unknown_key}}');
        });
        test('values can be passed along when using getMessage', async (t) => {
            const root = toTestTags(
                t,
                await ssr(I18nComponent, {
                    i18n: defaultI18n,
                    getMessage(langFile, key, values) {
                        if (!(key in langFile)) {
                            return `{{${key}}}`;
                        }
                        return `${langFile[key]} ${values.join(',')}`;
                    },
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root[0].assertMinChildren(8);

            root[0][3].assertTagName('div');
            root[0][3].assertChildren(1);
            root[0][3][0].assertText();
            root[0][3][0].assertContent('text a,b,c');

            root[0][7].assertTagName('div');
            root[0][7].assertChildren(1);
            root[0][7][0].assertText();
            root[0][7][0].assertContent('text a,b,c');
        });
        test('is empty when no i18n is passed', async (t) => {
            const root = toTestTags(t, await ssr(I18nComponent, {}));

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root[0].assertMinChildren(5);

            root[0][0].assertTagName('div');
            root[0][0].assertChildren(0);

            root[0][4].assertTagName('div');
            root[0][4].assertChildren(0);
        });
    }

    {
        // Sessions
        test('theme can be passed through session', async (t) => {
            const session = createSSRSession({
                theme: {
                    color: 'red',
                },
            });

            const root1 = toTestTags(
                t,
                await ssr(ThemeUser, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                await ssr(ThemeUser, {
                    documentSession: session,
                })
            );

            [root1, root2].forEach((root) => {
                root.assertTag();
                root.assertTagName(ThemeUser.is);
                root.assertChildren(2);
                root[0][0].assertTag();
                root[0][0].assertTagName('style');
                t.true(root[0][0][0].content.includes('red'), 'theme is used');
            });
        });
        test('i18n and getMessage can be passed through session', async (t) => {
            const session = createSSRSession({
                i18n: {
                    known_key: 'text',
                },
                getMessage(langFile, key) {
                    if (!(key in langFile)) return '';

                    return `${langFile[key]}-postfix`;
                },
            });

            const root1 = toTestTags(
                t,
                await ssr(I18nComponent, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                await ssr(I18nComponent, {
                    documentSession: session,
                })
            );

            [root1, root2].forEach((root) => {
                root.assertTag();
                root.assertTagName(I18nComponent.is);
                root[0].assertMinChildren(8);

                root[0][0].assertTagName('div');
                root[0][0].assertChildren(1);
                root[0][0][0].assertText();
                root[0][0][0].assertContent('text-postfix');

                root[0][4].assertTagName('div');
                root[0][4].assertChildren(1);
                root[0][4][0].assertText();
                root[0][4][0].assertContent('text-postfix');
            });
        });
        test('render config overrides session theme and only once', async (t) => {
            const session = createSSRSession({
                theme: {
                    color: 'red',
                },
            });

            const root1 = toTestTags(
                t,
                await ssr(ThemeUser, {
                    documentSession: session,
                    theme: {
                        color: 'blue',
                    },
                })
            );
            const root2 = toTestTags(
                t,
                await ssr(ThemeUser, {
                    documentSession: session,
                })
            );

            root1.assertTag();
            root1.assertTagName(ThemeUser.is);
            root1.assertChildren(2);
            root1[0][0].assertTag();
            root1[0][0].assertTagName('style');
            t.true(root1[0][0][0].content.includes('blue'), 'theme is used');

            root2.assertTag();
            root2.assertTagName(ThemeUser.is);
            root2.assertChildren(2);
            root2[0][0].assertTag();
            root2[0][0].assertTagName('style');
            t.true(root2[0][0][0].content.includes('red'), 'theme is used');
        });
        test('render config overrides session theme i18n and getMessage and only once', async (t) => {
            const session = createSSRSession({
                i18n: {
                    known_key: 'text',
                },
                getMessage(langFile, key) {
                    if (!(key in langFile)) return '';

                    return `${langFile[key]}-postfix`;
                },
            });

            const content = await ssr(I18nComponent, {
                documentSession: session,
                i18n: {
                    known_key: 'text2',
                },
                getMessage(langFile, key) {
                    if (!(key in langFile)) return '';

                    return `${langFile[key]}-postfix2`;
                },
            });
            const root1 = toTestTags(t, content);
            const content2 = await ssr(I18nComponent, {
                documentSession: session,
            });
            const root2 = toTestTags(t, content2);

            root1.assertTag();
            root1.assertTagName(I18nComponent.is);
            root1[0].assertMinChildren(8);

            root1[0][0].assertTagName('div');
            root1[0][0].assertChildren(1);
            root1[0][0][0].assertText();
            root1[0][0][0].assertContent('text2-postfix2');

            root1[0][4].assertTagName('div');
            root1[0][4].assertChildren(1);
            root1[0][4][0].assertText();
            root1[0][4][0].assertContent('text2-postfix2');

            root2.assertTag();
            root2.assertTagName(I18nComponent.is);
            root2[0].assertMinChildren(8);

            root2[0][0].assertTagName('div');
            root2[0][0].assertChildren(1);
            root2[0][0][0].assertText();
            root2[0][0][0].assertContent('text-postfix');

            root2[0][4].assertTagName('div');
            root2[0][4].assertChildren(1);
            root2[0][4][0].assertText();
            root2[0][4][0].assertContent('text-postfix');
        });
        test('sessions can be manually merged into with configs', async (t) => {
            const session = createSSRSession({
                theme: {
                    color: 'red',
                },
            });
            const session2 = createSSRSession({
                theme: {
                    color: 'blue',
                },
            });

            const root = toTestTags(
                t,
                await ssr(ThemeUser, {
                    documentSession: session.merge(session2),
                })
            );

            root.assertTag();
            root.assertTagName(ThemeUser.is);
            root.assertChildren(2);
            root[0][0].assertTag();
            root[0][0].assertTagName('style');
            t.true(root[0][0][0].content.includes('blue'), 'theme is used');
        });
        test('sessions can be manually merged into with maps', async (t) => {
            const session = createSSRSession();
            const session2 = createSSRSession();

            const root = toTestTags(
                t,
                await ssr(NoIs, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                await ssr(NoIs, {
                    documentSession: session2,
                })
            );

            root.assertTagName('wclib-element0');
            root2.assertTagName('wclib-element0');

            const root3 = toTestTags(
                t,
                await ssr(NoIs, {
                    documentSession: SSR.DocumentSession.merge(
                        session,
                        session2
                    ),
                })
            );
            root3.assertTagName('wclib-element1');
        });
    }

    {
        // Mergables
        {
            // Mergable weakmap
            test('weakmap - set values can be retrieved', async (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                t.true(map.get(key) === undefined, 'key does not exist');
                map.set(key, 'value');
                t.is(map.get(key), 'value', 'value was set');
            });
            test('weakmap - deleted keys no longer exist', async (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                map.set(key, 'value');
                t.is(map.get(key), 'value', 'value was set');
                map.delete(key);
                t.true(map.get(key) === undefined, 'key was deleted');
            });
            test('weakmap - the presence of keys can be checked with has', async (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                t.true(map.get(key) === undefined, 'key does not exist');
                map.set(key, 'value');
                t.true(map.has(key), 'value was set');
            });
            test('weakmap - cloned maps contain the values of the source', async (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                map.set(key, 'value');
                t.is(map.get(key), 'value', 'value was set');

                const clone = map.clone();
                t.is(clone.get(key), 'value', 'value was set');
            });
            test('weakmap - changing a cloned map does not change the original', async (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                const key2 = {};
                map.set(key, 'value');
                t.is(map.get(key), 'value', 'value was set');

                const clone = map.clone();
                clone.set(key2, 'value');
                t.false(map.has(key2), 'value was not set in the original');
            });
            test('weakmap - merged maps contain the values of both', async (t) => {
                const map1 = new SSR.MergableWeakMap();
                const map2 = new SSR.MergableWeakMap();

                const key1 = {};
                const key2 = {};

                map1.set(key1, 'value');
                map2.set(key2, 'value');

                t.true(map1.has(key1), 'map contains key');
                t.true(map2.has(key2), 'map contains key');

                const merged = map1.merge(map2);
                t.true(merged.has(key1), 'map contains key');
                t.true(merged.has(key2), 'map contains key');
            });
            test('weakmap - delete returns value based on whether something was deleted', async (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                map.set(key, 'value');
                t.is(map.get(key), 'value', 'value was set');
                t.true(map.delete(key));
                t.true(map.get(key) === undefined, 'key was deleted');
                t.false(map.delete(key));
            });
        }
        {
            // Mergable weakset
            test('weakset - set values can be retrieved', async (t) => {
                const set = new SSR.MergableWeakSet();

                const key = {};
                t.false(set.has(key), 'key does not exist');
                set.add(key);
                t.true(set.has(key), 'value was set');
            });
            test('weakset - deleted keys no longer exist', async (t) => {
                const set = new SSR.MergableWeakSet();

                const key = {};
                set.add(key);
                t.true(set.has(key), 'value was set');
                set.delete(key);
                t.false(set.has(key), 'key was deleted');
            });
            test('weakset - cloned sets contain the values of the source', async (t) => {
                const set = new SSR.MergableWeakSet();

                const key = {};
                set.add(key);
                t.true(set.has(key), 'value was set');

                const clone = set.clone();
                t.true(clone.has(key), 'value was set');
            });
            test('weakset - changing a cloned set does not change the original', async (t) => {
                const set = new SSR.MergableWeakSet();

                const key = {};
                const key2 = {};
                set.add(key);
                t.true(set.has(key), 'value was set');

                const clone = set.clone();
                clone.add(key2);
                t.false(set.has(key2), 'value was not set in the original');
            });
            test('weakset - merged sets contain the values of both', async (t) => {
                const set1 = new SSR.MergableWeakSet();
                const set2 = new SSR.MergableWeakSet();

                const key1 = {};
                const key2 = {};

                set1.add(key1);
                set2.add(key2);

                t.true(set1.has(key1), 'map contains key');
                t.true(set2.has(key2), 'map contains key');

                const merged = set1.merge(set2);
                t.true(merged.has(key1), 'map contains key');
                t.true(merged.has(key2), 'map contains key');
            });
            test('weakset - delete returns value based on whether something was deleted', (t) => {
                const map = new SSR.MergableWeakSet();

                const key = {};
                map.add(key);
                t.true(map.has(key), 'value was set');
                t.true(map.delete(key));
                t.false(map.has(key), 'key was deleted');
                t.false(map.delete(key));
            });
        }
    }
});

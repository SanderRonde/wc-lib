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
            const root = toTestTags(
                t,
                ssr(NestedTag, { props: { child: true } })
            );

            root.assertFormat([NestedTag.is, [[NestedTag.is, [['div', []]]]]]);
        });
    }

    {
        if (isComplex) {
            // JSX
            test('JSX element with no children can be rendered', (t) => {
                const root = toTestTags(t, ssr(JSXElement));

                root.assertChildren(1);

                root[0].assertTagName('div');
            });
            test('JSX element with multiple children can be rendered', (t) => {
                const root = toTestTags(t, ssr(JSXElementChildren));

                root.assertChildren(1);
                root[0].assertChildren(2);

                root[0][0].assertTagName('div');
                root[0][1].assertTagName('div');
            });
            test('JSX element with components as children can be rendered', (t) => {
                const root = toTestTags(t, ssr(JSXElementComponents));

                root.assertChildren(1);
                root[0].assertChildren(2);

                root[0][0].assertTagName(JSXElement.is);
                root[0][1].assertTagName(JSXElement.is);
            });
        }
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
            root.assertTagName('wclib-element0');
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
            const root = toTestTags(t, ssr(SimpleElement, { attributes }));

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
                ssr(SimpleElement, {
                    attributes: {
                        a: 0,
                        c: /x/,
                        e: true,
                    },
                })
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
                ssr(SimpleElement, {
                    attributes: {
                        a: [0, 1, 2],
                        c: [/x/, /y/, /z/],
                        e: [true, false, true],
                        f: [0, /x/, true],
                        g: ['a', 'b', 'c'],
                    },
                })
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
        test('dashes are replaced with uppercase letters', (t) => {
            const attributes = {
                'with-dashes': 'abc',
                withoutdashes: 'def',
            };
            const html = ssr(SimpleElement, { attributes });
            const root = toTestTags(t, html);

            root.assertFormat([SimpleElement.is, [['div', []]]]);
            root.assertAttributes({
                // HTML parsing removes casing
                withdashes: 'abc',
                withoutdashes: 'def',
            });
            t.true(
                html.indexOf('withDashes') > -1,
                'attribute is now partially uppercase'
            );
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
                    props: {
                        a: 3,
                        b: 4,
                    },
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
                    props: {
                        y: 2,
                        b: 4,
                    },
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
                    props: {
                        x: 1,
                        a: 3,
                    },
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
        test('non-reflective props are hidden', (t) => {
            const root = toTestTags(
                t,
                ssr(WithProps, {
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
        test('works fine with an empty props object', (t) => {
            const root = toTestTags(t, ssr(SimpleElementEmptyProps));

            root.assertFormat([SimpleElementEmptyProps.is, [['div', []]]]);
        });
        if (isComplex) {
            test('passes on complex props', (t) => {
                const root = toTestTags(
                    t,
                    ssr(ComplexPropReceiver, {
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
                        ['div', ['2']],
                        ['div', ['2']],
                        ['div', ['b']],
                    ],
                ]);
            });
        }
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
        test('themes can be passed', (t) => {
            const root = toTestTags(
                t,
                ssr(ThemeUser, {
                    theme: {
                        color: 'red',
                    },
                })
            );

            root.assertTag();
            root.assertTagName(ThemeUser.is);
            root.assertChildren(2);
            root[0].assertTag();
            root[0].assertTagName('style');
            t.true(root[0][0].content.includes('red'), 'theme is used');
        });
        test('themeName can be passed', (t) => {
            const themeName = 'somethemename';
            const root = toTestTags(
                t,
                ssr(ThemeUser, {
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
            root[0].assertTagName('style');
            t.true(root[0][0].content.includes('red'), 'theme is used');

            root[1].assertTag();
            root[1].assertTagName('div');
            root[1].assertChildren(1);
            root[1][0].assertText();
            root[1][0].assertContent(themeName);
        });
        test('scripts are rendered as well', (t) => {
            const root = toTestTags(t, ssr(ScriptTag));

            root.assertTag();
            root.assertTagName(ScriptTag.is);
            root.assertChildren(2);
            root[0].assertTag();
            root[0].assertTagName('div');
            root[1].assertTag();
            root[1].assertTagName('script');
            root[1].assertChildren(1);
            root[1][0].assertText();
            root[1][0].assertContent("console.log('some code');");
        });
    }

    {
        // Statelessness
        test('renders are stateless by default - unnamed tag test', (t) => {
            const root = toTestTags(t, ssr(NoIs));
            const root2 = toTestTags(t, ssr(NoIs));

            root.assertTagName('wclib-element0');
            root2.assertTagName('wclib-element0');
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

            const root = toTestTags(
                t,
                ssr(NoIs, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                ssr(NoIs, {
                    documentSession: session,
                })
            );

            root.assertTagName('wclib-element0');
            root2.assertTagName('wclib-element1');
        });
        test('renders can have state if set explicitly - tagname map test', (t) => {
            const session = createSSRSession();

            const root = toTestTags(
                t,
                ssr(DifferentChild, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                ssr(UndefinedChild, {
                    documentSession: session,
                })
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

            const root = toTestTags(
                t,
                ssr(WithCSS, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                ssr(WithCSS, {
                    documentSession: session,
                })
            );

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

    if (isComplex) {
        // Complex
        test('the class attribute is applied', (t) => {
            const root = toTestTags(t, ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root.assertMinChildren(1);
            root[0].assertTag();
            root[0].assertTagName('div');
            root[0].assertHasClasses('a', 'b');
        });
        test('strings are joined', (t) => {
            const root = toTestTags(t, ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root.assertMinChildren(2);
            root[1].assertTag();
            root[1].assertTagName('div');
            root[1].assertChildren(1);
            root[1][0].assertContent('abcd');
        });
        test('numbers are joined', (t) => {
            const root = toTestTags(t, ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root.assertMinChildren(3);
            root[2].assertTag();
            root[2].assertTagName('div');
            root[2].assertChildren(1);
            root[2][0].assertContent('1234');
        });
        test('nested arrays are joined', (t) => {
            const root = toTestTags(t, ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root.assertMinChildren(4);
            root[3].assertTag();
            root[3].assertTagName('div');
            root[3].assertChildren(1);
            root[3][0].assertContent('abcd');
        });
        test('template arrays are joined', (t) => {
            const root = toTestTags(t, ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root.assertMinChildren(5);
            root[4].assertTag();
            root[4].assertTagName('div');
            root[4].assertChildren(2);
            root[4][0].assertChildren(1);
            root[4][0][0].assertContent('1');
            root[4][1].assertChildren(1);
            root[4][1][0].assertContent('2');
        });
        test('boolean attributes are applied', (t) => {
            const root = toTestTags(t, ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root.assertMinChildren(6);
            root[5].assertTag();
            root[5].assertTagName('div');
            root[5].assertDoesNotHaveAttributes('prop', 'prop2', 'prop3');
            root[5].assertHasAttributes('prop4', 'prop5', 'prop6');
        });
        test('complex values are removed altogether', (t) => {
            const root = toTestTags(t, ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root.assertMinChildren(7);
            root[6].assertTag();
            root[6].assertTagName('div');
            root[6].assertDoesNotHaveAttributes(
                'prop',
                'prop2',
                'prop3',
                'prop4',
                'prop5',
                'prop6',
                'prop6'
            );
        });
        test('regular objects are turned into strings', (t) => {
            const root = toTestTags(t, ssr(ComplexTag));

            root.assertTag();
            root.assertTagName(ComplexTag.is);

            root.assertMinChildren(8);
            root[7].assertTag();
            root[7].assertTagName('div');
            root[7].assertChildren(1);
            root[7][0].assertText();
            root[7][0].assertContent('[object Object][object Object]');
        });
        test('non-lit-html pure text tags are still rendered to text', (t) => {
            const root = toTestTags(t, ssr(TextTag));

            root.assertTag();
            root.assertTagName(TextTag.is);
            root.assertChildren(1);
            root[0].assertText();
            root[0].assertContent('some text');
        });
        test('non-lit-html object text tags are still rendered to text', (t) => {
            const root = toTestTags(t, ssr(ObjTextTag));

            root.assertTag();
            root.assertTagName(ObjTextTag.is);
            root.assertChildren(1);
            root[0].assertText();
            root[0].assertContent('more text');
        });
        test('complex values are still passed on to components', (t) => {
            const root = toTestTags(t, ssr(ComplexPropUser));

            root.assertTag();
            root.assertTagName(ComplexPropUser.is);
            root.assertMinChildren(1);
            root[0].assertTag();
            root[0].assertTagName('div');
            root[0].assertChildren(1);
            root[0][0].assertTag();
            root[0][0].assertTagName('complex-prop-receiver');
            root[0][0].assertChildren(3);
            root[0][0][0].assertChildren(1);
            root[0][0][0][0].assertContent('2');
            root[0][0][1].assertChildren(1);
            root[0][0][1][0].assertContent('2');
            root[0][0][2].assertChildren(1);
            root[0][0][2][0].assertContent('b');
        });
        test('complex values are passed on to nested templates', (t) => {
            const root = toTestTags(t, ssr(ComplexPropUser));

            root.assertFormat([
                ComplexPropUser.is,
                [
                    [
                        'div',
                        [
                            [
                                'complex-prop-receiver',
                                [
                                    ['div', ['2']],
                                    ['div', ['2']],
                                    ['div', ['b']],
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
                                    ['div', [`${num}`]],
                                    ['div', [`${num}`]],
                                    ['div', ['b']],
                                ],
                            ] as TestTagFormat;
                        }),
                    ],
                ],
            ]);
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
        test('root can have named slots as children', (t) => {
            t.notThrows(() => {
                toTestTags(t, ssr(NamedSlot));
            });
        });
        test("root can't have unnamed slots as children", (t) => {
            t.throws(
                () => {
                    toTestTags(t, ssr(DefaultSlot));
                },
                {
                    message:
                        "Root element can't have unnamed slots as children",
                    instanceOf: Error,
                }
            );
        });
    }

    {
        const defaultI18n = {
            known_key: 'a',
            values: 'text',
        };

        // I18N
        test('valid entries are displayed when using __', (t) => {
            const root = toTestTags(
                t,
                ssr(I18nComponent, {
                    i18n: defaultI18n,
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root.assertMinChildren(5);

            root[0].assertTagName('div');
            root[0].assertChildren(1);
            root[0][0].assertText();
            root[0][0].assertContent(defaultI18n['known_key']);

            root[4].assertTagName('div');
            root[4].assertChildren(1);
            root[4][0].assertText();
            root[4][0].assertContent(defaultI18n['known_key']);
        });
        test('getLang() can be used', (t) => {
            const language = 'somelanguage';
            const root = toTestTags(
                t,
                ssr(I18nComponent, {
                    i18n: defaultI18n,
                    lang: language,
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root.assertChildren(9);

            root[0].assertTagName('div');
            root[0].assertChildren(1);
            root[0][0].assertText();
            root[0][0].assertContent(defaultI18n['known_key']);

            root[4].assertTagName('div');
            root[4].assertChildren(1);
            root[4][0].assertText();
            root[4][0].assertContent(defaultI18n['known_key']);

            root[8].assertTagName('div');
            root[8].assertChildren(1);
            root[8][0].assertText();
            root[8][0].assertContent(language);
        });
        test('__prom returns a promise', (t) => {
            const root = toTestTags(
                t,
                ssr(I18nComponent, {
                    i18n: defaultI18n,
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root.assertMinChildren(6);

            root[1].assertTagName('div');
            root[1].assertChildren(1);
            root[1][0].assertText();
            root[1][0].assertContent('true');

            root[5].assertTagName('div');
            root[5].assertChildren(1);
            root[5][0].assertText();
            root[5][0].assertContent('true');
        });
        test('unknown keys display nothing by default when using __', (t) => {
            const root = toTestTags(
                t,
                ssr(I18nComponent, {
                    i18n: defaultI18n,
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root.assertMinChildren(7);

            root[2].assertTagName('div');
            root[2].assertChildren(0);

            root[6].assertTagName('div');
            root[6].assertChildren(0);
        });
        test('unknown keys can display fallback when using getMessage', (t) => {
            const root = toTestTags(
                t,
                ssr(I18nComponent, {
                    i18n: defaultI18n,
                    getMessage(langFile, key) {
                        if (key in langFile) return langFile[key];
                        return `{{${key}}}`;
                    },
                })
            );

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root.assertMinChildren(7);

            root[2].assertTagName('div');
            root[2].assertChildren(1);
            root[2][0].assertText();
            root[2][0].assertContent('{{unknown_key}}');

            root[6].assertTagName('div');
            root[6].assertChildren(1);
            root[6][0].assertText();
            root[6][0].assertContent('{{unknown_key}}');
        });
        test('values can be passed along when using getMessage', (t) => {
            const root = toTestTags(
                t,
                ssr(I18nComponent, {
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
            root.assertMinChildren(8);

            root[3].assertTagName('div');
            root[3].assertChildren(1);
            root[3][0].assertText();
            root[3][0].assertContent('text a,b,c');

            root[7].assertTagName('div');
            root[7].assertChildren(1);
            root[7][0].assertText();
            root[7][0].assertContent('text a,b,c');
        });
        test('is empty when no i18n is passed', (t) => {
            const root = toTestTags(t, ssr(I18nComponent, {}));

            root.assertTag();
            root.assertTagName(I18nComponent.is);
            root.assertMinChildren(5);

            root[0].assertTagName('div');
            root[0].assertChildren(0);

            root[4].assertTagName('div');
            root[4].assertChildren(0);
        });
    }

    {
        // Sessions
        test('theme can be passed through session', (t) => {
            const session = createSSRSession({
                theme: {
                    color: 'red',
                },
            });

            const root1 = toTestTags(
                t,
                ssr(ThemeUser, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                ssr(ThemeUser, {
                    documentSession: session,
                })
            );

            [root1, root2].forEach((root) => {
                root.assertTag();
                root.assertTagName(ThemeUser.is);
                root.assertChildren(2);
                root[0].assertTag();
                root[0].assertTagName('style');
                t.true(root[0][0].content.includes('red'), 'theme is used');
            });
        });
        test('i18n and getMessage can be passed through session', (t) => {
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
                ssr(I18nComponent, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                ssr(I18nComponent, {
                    documentSession: session,
                })
            );

            [root1, root2].forEach((root) => {
                root.assertTag();
                root.assertTagName(I18nComponent.is);
                root.assertMinChildren(8);

                root[0].assertTagName('div');
                root[0].assertChildren(1);
                root[0][0].assertText();
                root[0][0].assertContent('text-postfix');

                root[4].assertTagName('div');
                root[4].assertChildren(1);
                root[4][0].assertText();
                root[4][0].assertContent('text-postfix');
            });
        });
        test('render config overrides session theme and only once', (t) => {
            const session = createSSRSession({
                theme: {
                    color: 'red',
                },
            });

            const root1 = toTestTags(
                t,
                ssr(ThemeUser, {
                    documentSession: session,
                    theme: {
                        color: 'blue',
                    },
                })
            );
            const root2 = toTestTags(
                t,
                ssr(ThemeUser, {
                    documentSession: session,
                })
            );

            root1.assertTag();
            root1.assertTagName(ThemeUser.is);
            root1.assertChildren(2);
            root1[0].assertTag();
            root1[0].assertTagName('style');
            t.true(root1[0][0].content.includes('blue'), 'theme is used');

            root2.assertTag();
            root2.assertTagName(ThemeUser.is);
            root2.assertChildren(2);
            root2[0].assertTag();
            root2[0].assertTagName('style');
            t.true(root2[0][0].content.includes('red'), 'theme is used');
        });
        test('render config overrides session theme i18n and getMessage and only once', (t) => {
            const session = createSSRSession({
                i18n: {
                    known_key: 'text',
                },
                getMessage(langFile, key) {
                    if (!(key in langFile)) return '';

                    return `${langFile[key]}-postfix`;
                },
            });

            const content = ssr(I18nComponent, {
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
            const content2 = ssr(I18nComponent, {
                documentSession: session,
            });
            const root2 = toTestTags(t, content2);

            root1.assertTag();
            root1.assertTagName(I18nComponent.is);
            root1.assertMinChildren(8);

            root1[0].assertTagName('div');
            root1[0].assertChildren(1);
            root1[0][0].assertText();
            root1[0][0].assertContent('text2-postfix2');

            root1[4].assertTagName('div');
            root1[4].assertChildren(1);
            root1[4][0].assertText();
            root1[4][0].assertContent('text2-postfix2');

            root2.assertTag();
            root2.assertTagName(I18nComponent.is);
            root2.assertMinChildren(8);

            root2[0].assertTagName('div');
            root2[0].assertChildren(1);
            root2[0][0].assertText();
            root2[0][0].assertContent('text-postfix');

            root2[4].assertTagName('div');
            root2[4].assertChildren(1);
            root2[4][0].assertText();
            root2[4][0].assertContent('text-postfix');
        });
        test('sessions can be manually merged into with configs', (t) => {
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
                ssr(ThemeUser, {
                    documentSession: session.merge(session2),
                })
            );

            root.assertTag();
            root.assertTagName(ThemeUser.is);
            root.assertChildren(2);
            root[0].assertTag();
            root[0].assertTagName('style');
            t.true(root[0][0].content.includes('blue'), 'theme is used');
        });
        test('sessions can be manually merged into with maps', (t) => {
            const session = createSSRSession();
            const session2 = createSSRSession();

            const root = toTestTags(
                t,
                ssr(NoIs, {
                    documentSession: session,
                })
            );
            const root2 = toTestTags(
                t,
                ssr(NoIs, {
                    documentSession: session2,
                })
            );

            root.assertTagName('wclib-element0');
            root2.assertTagName('wclib-element0');

            const root3 = toTestTags(
                t,
                ssr(NoIs, {
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
            test('weakmap - set values can be retrieved', (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                t.true(map.get(key) === undefined, 'key does not exist');
                map.set(key, 'value');
                t.is(map.get(key), 'value', 'value was set');
            });
            test('weakmap - deleted keys no longer exist', (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                map.set(key, 'value');
                t.is(map.get(key), 'value', 'value was set');
                map.delete(key);
                t.true(map.get(key) === undefined, 'key was deleted');
            });
            test('weakmap - the presence of keys can be checked with has', (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                t.true(map.get(key) === undefined, 'key does not exist');
                map.set(key, 'value');
                t.true(map.has(key), 'value was set');
            });
            test('weakmap - cloned maps contain the values of the source', (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                map.set(key, 'value');
                t.is(map.get(key), 'value', 'value was set');

                const clone = map.clone();
                t.is(clone.get(key), 'value', 'value was set');
            });
            test('weakmap - changing a cloned map does not change the original', (t) => {
                const map = new SSR.MergableWeakMap();

                const key = {};
                const key2 = {};
                map.set(key, 'value');
                t.is(map.get(key), 'value', 'value was set');

                const clone = map.clone();
                clone.set(key2, 'value');
                t.false(map.has(key2), 'value was not set in the original');
            });
            test('weakmap - merged maps contain the values of both', (t) => {
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
            test('weakmap - delete returns value based on whether something was deleted', (t) => {
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
            test('weakset - set values can be retrieved', (t) => {
                const set = new SSR.MergableWeakSet();

                const key = {};
                t.false(set.has(key), 'key does not exist');
                set.add(key);
                t.true(set.has(key), 'value was set');
            });
            test('weakset - deleted keys no longer exist', (t) => {
                const set = new SSR.MergableWeakSet();

                const key = {};
                set.add(key);
                t.true(set.has(key), 'value was set');
                set.delete(key);
                t.false(set.has(key), 'key was deleted');
            });
            test('weakset - cloned sets contain the values of the source', (t) => {
                const set = new SSR.MergableWeakSet();

                const key = {};
                set.add(key);
                t.true(set.has(key), 'value was set');

                const clone = set.clone();
                t.true(clone.has(key), 'value was set');
            });
            test('weakset - changing a cloned set does not change the original', (t) => {
                const set = new SSR.MergableWeakSet();

                const key = {};
                const key2 = {};
                set.add(key);
                t.true(set.has(key), 'value was set');

                const clone = set.clone();
                clone.add(key2);
                t.false(set.has(key2), 'value was not set in the original');
            });
            test('weakset - merged sets contain the values of both', (t) => {
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

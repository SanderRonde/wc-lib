import {
    BasicWebComponent,
    ComplexTemplatingWebComponent,
    I18NWebComponent,
    ThemingWebComponent,
} from '../../../build/cjs/classes/partial.js';
import {
    generateHTMLCustomData,
    HTMLCustomData,
    joinCustomData,
} from '../../../build/cjs/tasks/html-custom-data';
import { ConfigurableWebComponent } from '../../../build/cjs/wc-lib';
import _test, { TestInterface, ExecutionContext } from 'ava';
import { elementFactory } from './elements/elements.js';

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

interface CustomDataComparison {
    tagName: string;
    description?: string;
    attributes?: {
        [name: string]: string | void;
    };
}

function compareCustomData(
    t: ExecutionContext<unknown>,
    actual: HTMLCustomData,
    expected: CustomDataComparison[]
) {
    t.deepEqual(
        actual,
        {
            version: 1.1,
            globalAttributes: [],
            valueSets: [],
            tags: expected.map(
                (expectedTag): HTMLCustomData.Types.CustomDataTag => {
                    const attributes = Object.keys(
                        expectedTag.attributes || {}
                    ).map((key) => {
                        const base: HTMLCustomData.Types.Attribute = {
                            name: key,
                        };
                        if (expectedTag.attributes![key]) {
                            base.description = expectedTag.attributes![
                                key
                            ] as string;
                        }
                        return base;
                    });
                    const tag: HTMLCustomData.Types.CustomDataTag = {
                        name: expectedTag.tagName,
                        attributes: attributes,
                    };
                    if (expectedTag.description) {
                        tag.description = expectedTag.description;
                    }
                    return tag;
                }
            ),
        },
        'Custom data matches'
    );
}

baseComponents.forEach(({ component, name }) => {
    const {
        AttributeDescription,
        CasingTest,
        ComponentDescription,
        JoinedData,
        NestedComponent,
        PrivData,
        ReflectData,
        RegularOne,
        RegularTwo,
        NoProps,
    } = elementFactory(component);

    const test = genTestFn(name);

    {
        // HTMLCustomData
        test('generates component data', (t) => {
            const component = NoProps;
            compareCustomData(t, generateHTMLCustomData(component), [
                {
                    tagName: component.is,
                },
            ]);
        });
        test('generates priv data', (t) => {
            const component = PrivData;
            compareCustomData(t, generateHTMLCustomData(component), [
                {
                    tagName: component.is,
                    attributes: {
                        a: undefined,
                        b: undefined,
                        c: undefined,
                    },
                },
            ]);
        });
        test('generates reflect data', (t) => {
            const component = ReflectData;
            compareCustomData(t, generateHTMLCustomData(component), [
                {
                    tagName: component.is,
                    attributes: {
                        a: undefined,
                        b: undefined,
                        c: undefined,
                    },
                },
            ]);
        });
        test('generates joined custom data', (t) => {
            const component = JoinedData;
            compareCustomData(t, generateHTMLCustomData(component), [
                {
                    tagName: component.is,
                    attributes: {
                        a: undefined,
                        b: undefined,
                        c: undefined,
                        d: undefined,
                        e: undefined,
                        f: undefined,
                    },
                },
            ]);
        });
        test('uses the description', (t) => {
            const component = ComponentDescription;
            compareCustomData(t, generateHTMLCustomData(component), [
                {
                    tagName: component.is,
                    description: 'Some description',
                    attributes: {
                        d: undefined,
                        e: undefined,
                        f: undefined,
                    },
                },
            ]);
        });
        test('converts camelcase to dashes', (t) => {
            const component = CasingTest;
            compareCustomData(t, generateHTMLCustomData(component), [
                {
                    tagName: component.is,
                    attributes: {
                        'camel-case': undefined,
                        'uses-dashes': undefined,
                    },
                },
            ]);
        });
        test("uses the attributes' descriptions", (t) => {
            const component = AttributeDescription;
            compareCustomData(t, generateHTMLCustomData(component), [
                {
                    tagName: component.is,
                    attributes: {
                        a: 'Some description',
                        b: undefined,
                    },
                },
            ]);
        });
        test("generates multiple components's custom data", (t) => {
            const component1 = RegularOne;
            const component2 = RegularTwo;
            compareCustomData(
                t,
                generateHTMLCustomData([component1, component2]),
                [
                    {
                        tagName: component1.is,
                        attributes: {
                            a: 'description a',
                            b: 'description b',
                            c: 'description c',
                        },
                    },
                    {
                        tagName: component2.is,
                        attributes: {
                            c: 'description c',
                            d: 'description d',
                            e: 'description e',
                        },
                    },
                ]
            );
        });
        test('can generate nested custom data', (t) => {
            const component = NestedComponent;
            compareCustomData(t, generateHTMLCustomData(component), [
                {
                    tagName: component.is,
                    attributes: {
                        e: 'description e',
                        f: 'description f',
                        g: 'description g',
                    },
                },
                {
                    tagName: RegularOne.is,
                    attributes: {
                        a: 'description a',
                        b: 'description b',
                        c: 'description c',
                    },
                },
                {
                    tagName: RegularTwo.is,
                    attributes: {
                        c: 'description c',
                        d: 'description d',
                        e: 'description e',
                    },
                },
            ]);
        });
        test('skips nested components when flag is off', (t) => {
            const component = NestedComponent;
            compareCustomData(t, generateHTMLCustomData(component, false), [
                {
                    tagName: component.is,
                    attributes: {
                        e: 'description e',
                        f: 'description f',
                        g: 'description g',
                    },
                },
            ]);
        });
    }

    {
        // Joining
        test('can merge custom data with nothing', (t) => {
            const customData: HTMLCustomData = {
                version: 1.1,
                tags: [
                    {
                        name: 'some-name',
                        description: 'some-description',
                        references: [
                            {
                                name: 'some-reference',
                                url: 'some-url',
                            },
                        ],
                        attributes: [
                            {
                                name: 'some-attribute',
                                description: 'some-description',
                            },
                        ],
                    },
                ],
                globalAttributes: [
                    {
                        name: 'some-attribute',
                        description: 'some-description',
                    },
                ],
                valueSets: [
                    {
                        name: 'some-valueset',
                        values: [],
                    },
                ],
            };
            t.deepEqual(
                joinCustomData(customData),
                customData,
                'value is the same'
            );
        });
        test('can merge global attributes', (t) => {
            t.deepEqual(
                joinCustomData(
                    {
                        version: 1.1,
                        globalAttributes: [
                            {
                                name: 'attr-1',
                                description: 'some-description',
                                valueSet: 'some-valueset',
                                values: [
                                    {
                                        name: 'some-value',
                                        description: 'some-description',
                                        references: [
                                            {
                                                name: 'some-reference',
                                                url: 'some-url',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'attr-2',
                                description: 'some-description',
                                valueSet: 'some-valueset',
                                values: [
                                    {
                                        name: 'some-value',
                                        description: 'some-description',
                                        references: [
                                            {
                                                name: 'some-reference',
                                                url: 'some-url',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'attr-3',
                            },
                        ],
                    },
                    {
                        version: 1.1,
                        globalAttributes: [
                            {
                                name: 'attr-2',
                                description: 'some-description2',
                                valueSet: 'some-valueset2',
                                values: [
                                    {
                                        name: 'some-value2',
                                        description: 'some-description2',
                                        references: [
                                            {
                                                name: 'some-reference2',
                                                url: 'some-url2',
                                            },
                                        ],
                                    },
                                    {
                                        name: 'some-value',
                                        description: 'some-description2',
                                        references: [
                                            {
                                                name: 'some-reference2',
                                                url: 'some-url2',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'attr-3',
                                description: 'some-description',
                                valueSet: 'some-valueset',
                                values: [
                                    {
                                        name: 'some-value',
                                        description: 'some-description',
                                        references: [
                                            {
                                                name: 'some-reference',
                                                url: 'some-url',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    }
                ),
                {
                    version: 1.1,
                    tags: [],
                    valueSets: [],
                    globalAttributes: [
                        {
                            name: 'attr-1',
                            description: 'some-description',
                            valueSet: 'some-valueset',
                            values: [
                                {
                                    name: 'some-value',
                                    description: 'some-description',
                                    references: [
                                        {
                                            name: 'some-reference',
                                            url: 'some-url',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            name: 'attr-2',
                            description: 'some-description',
                            valueSet: 'some-valueset',
                            values: [
                                {
                                    name: 'some-value',
                                    description: 'some-description',
                                    references: [
                                        {
                                            name: 'some-reference',
                                            url: 'some-url',
                                        },
                                        {
                                            name: 'some-reference2',
                                            url: 'some-url2',
                                        },
                                    ],
                                },
                                {
                                    name: 'some-value2',
                                    description: 'some-description2',
                                    references: [
                                        {
                                            name: 'some-reference2',
                                            url: 'some-url2',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            name: 'attr-3',
                            description: 'some-description',
                            valueSet: 'some-valueset',
                            values: [
                                {
                                    name: 'some-value',
                                    description: 'some-description',
                                    references: [
                                        {
                                            name: 'some-reference',
                                            url: 'some-url',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }
            );
        });
        test('can merge valueSets', (t) => {
            t.deepEqual(
                joinCustomData(
                    {
                        version: 1.1,
                        valueSets: [
                            {
                                name: 'name-1',
                                values: [
                                    {
                                        name: 'some-name',
                                        description: 'some-description',
                                        references: [
                                            {
                                                name: 'some-reference',
                                                url: 'some-url',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'name-2',
                                values: [
                                    {
                                        name: 'some-name',
                                        description: 'some-description',
                                        references: [
                                            {
                                                name: 'some-reference',
                                                url: 'some-url',
                                            },
                                        ],
                                    },
                                    {
                                        name: 'some-name2',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        version: 1.1,
                        valueSets: [
                            {
                                name: 'name-2',
                                values: [
                                    {
                                        name: 'some-name',
                                        description: 'some-description',
                                        references: [
                                            {
                                                name: 'some-reference2',
                                                url: 'some-url2',
                                            },
                                        ],
                                    },
                                    {
                                        name: 'some-name2',
                                        description: 'some-description',
                                        references: [
                                            {
                                                name: 'some-reference2',
                                                url: 'some-url2',
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'name-3',
                                values: [
                                    {
                                        name: 'some-name',
                                        description: 'some-description',
                                        references: [
                                            {
                                                name: 'some-reference',
                                                url: 'some-url',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    }
                ),
                {
                    version: 1.1,
                    globalAttributes: [],
                    tags: [],
                    valueSets: [
                        {
                            name: 'name-1',
                            values: [
                                {
                                    name: 'some-name',
                                    description: 'some-description',
                                    references: [
                                        {
                                            name: 'some-reference',
                                            url: 'some-url',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            name: 'name-2',
                            values: [
                                {
                                    name: 'some-name',
                                    description: 'some-description',
                                    references: [
                                        {
                                            name: 'some-reference',
                                            url: 'some-url',
                                        },
                                        {
                                            name: 'some-reference2',
                                            url: 'some-url2',
                                        },
                                    ],
                                },
                                {
                                    name: 'some-name2',
                                    description: 'some-description',
                                    references: [
                                        {
                                            name: 'some-reference2',
                                            url: 'some-url2',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            name: 'name-3',
                            values: [
                                {
                                    name: 'some-name',
                                    description: 'some-description',
                                    references: [
                                        {
                                            name: 'some-reference',
                                            url: 'some-url',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }
            );
        });
        test('can join duplicate tags', (t) => {
            t.deepEqual(
                joinCustomData(
                    {
                        version: 1.1,
                        tags: [
                            {
                                name: 'name-1',
                                description: 'some-description',
                                references: [
                                    {
                                        name: 'ref-1',
                                        url: 'url-1',
                                    },
                                ],
                                attributes: [
                                    {
                                        name: 'attr-1',
                                        description: 'decr-1',
                                        valueSet: 'value-set',
                                        values: [
                                            {
                                                name: 'value-1',
                                                description: 'descr-1',
                                                references: [
                                                    {
                                                        name: 'ref-1',
                                                        url: 'url-1',
                                                    },
                                                ],
                                            },
                                            {
                                                name: 'value-2',
                                            },
                                        ],
                                    },
                                    {
                                        name: 'attr-2',
                                        valueSet: 'value-set',
                                        values: [
                                            {
                                                name: 'value-1',
                                                description: 'descr-1',
                                                references: [
                                                    {
                                                        name: 'ref-1',
                                                        url: 'url-1',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        version: 1.1,
                        tags: [
                            {
                                name: 'name-1',
                                references: [
                                    {
                                        name: 'ref-1',
                                        url: 'url-2',
                                    },
                                    {
                                        name: 'ref-2',
                                        url: 'url-2',
                                    },
                                ],
                                attributes: [
                                    {
                                        name: 'attr-1',
                                        description: 'descr-2',
                                        valueSet: 'value-set-2',
                                        values: [
                                            {
                                                name: 'value-1',
                                                description: 'descr-2',
                                                references: [
                                                    {
                                                        name: 'ref-1',
                                                        url: 'url-2',
                                                    },
                                                    {
                                                        name: 'ref-2',
                                                        url: 'url-2',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        name: 'attr-2',
                                        description: 'descr-2',
                                        valueSet: 'value-set-2',
                                        values: [
                                            {
                                                name: 'value-1',
                                                description: 'descr-1',
                                                references: [
                                                    {
                                                        name: 'ref-1',
                                                        url: 'url-1',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        name: 'attr-3',
                                        description: 'descr-3',
                                        valueSet: 'value-set-3',
                                        values: [
                                            {
                                                name: 'value-1',
                                                description: 'descr-1',
                                                references: [
                                                    {
                                                        name: 'ref-1',
                                                        url: 'url-1',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                            {
                                name: 'name-2',
                                references: [
                                    {
                                        name: 'ref-1',
                                        url: 'url-2',
                                    },
                                    {
                                        name: 'ref-2',
                                        url: 'url-2',
                                    },
                                ],
                                attributes: [
                                    {
                                        name: 'attr-1',
                                        description: 'descr-2',
                                        valueSet: 'value-set-2',
                                        values: [
                                            {
                                                name: 'value-1',
                                                description: 'descr-2',
                                                references: [
                                                    {
                                                        name: 'ref-1',
                                                        url: 'url-2',
                                                    },
                                                    {
                                                        name: 'ref-2',
                                                        url: 'url-2',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        name: 'value-2',
                                        description: 'descr-2',
                                        valueSet: 'value-set-2',
                                        values: [
                                            {
                                                name: 'value-1',
                                                description: 'descr-1',
                                                references: [
                                                    {
                                                        name: 'ref-1',
                                                        url: 'url-1',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    {
                                        name: 'value-3',
                                        description: 'descr-3',
                                        valueSet: 'value-set-3',
                                        values: [
                                            {
                                                name: 'value-1',
                                                description: 'descr-1',
                                                references: [
                                                    {
                                                        name: 'ref-1',
                                                        url: 'url-1',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    }
                ),
                {
                    version: 1.1,
                    tags: [
                        {
                            name: 'name-1',
                            description: 'some-description',
                            references: [
                                {
                                    name: 'ref-1',
                                    url: 'url-1',
                                },
                                {
                                    name: 'ref-2',
                                    url: 'url-2',
                                },
                            ],
                            attributes: [
                                {
                                    name: 'attr-1',
                                    description: 'decr-1',
                                    valueSet: 'value-set',
                                    values: [
                                        {
                                            name: 'value-1',
                                            description: 'descr-1',
                                            references: [
                                                {
                                                    name: 'ref-1',
                                                    url: 'url-1',
                                                },
                                                {
                                                    name: 'ref-2',
                                                    url: 'url-2',
                                                },
                                            ],
                                        },
                                        {
                                            name: 'value-2',
                                        },
                                    ],
                                },
                                {
                                    name: 'attr-2',
                                    description: 'descr-2',
                                    valueSet: 'value-set',
                                    values: [
                                        {
                                            name: 'value-1',
                                            description: 'descr-1',
                                            references: [
                                                {
                                                    name: 'ref-1',
                                                    url: 'url-1',
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    name: 'attr-3',
                                    description: 'descr-3',
                                    valueSet: 'value-set-3',
                                    values: [
                                        {
                                            name: 'value-1',
                                            description: 'descr-1',
                                            references: [
                                                {
                                                    name: 'ref-1',
                                                    url: 'url-1',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            name: 'name-2',
                            references: [
                                {
                                    name: 'ref-1',
                                    url: 'url-2',
                                },
                                {
                                    name: 'ref-2',
                                    url: 'url-2',
                                },
                            ],
                            attributes: [
                                {
                                    name: 'attr-1',
                                    description: 'descr-2',
                                    valueSet: 'value-set-2',
                                    values: [
                                        {
                                            name: 'value-1',
                                            description: 'descr-2',
                                            references: [
                                                {
                                                    name: 'ref-1',
                                                    url: 'url-2',
                                                },
                                                {
                                                    name: 'ref-2',
                                                    url: 'url-2',
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    name: 'value-2',
                                    description: 'descr-2',
                                    valueSet: 'value-set-2',
                                    values: [
                                        {
                                            name: 'value-1',
                                            description: 'descr-1',
                                            references: [
                                                {
                                                    name: 'ref-1',
                                                    url: 'url-1',
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    name: 'value-3',
                                    description: 'descr-3',
                                    valueSet: 'value-set-3',
                                    values: [
                                        {
                                            name: 'value-1',
                                            description: 'descr-1',
                                            references: [
                                                {
                                                    name: 'ref-1',
                                                    url: 'url-1',
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    globalAttributes: [],
                    valueSets: [],
                }
            );
        });
        test('ensure fallbacks', (t) => {
            t.deepEqual(
                joinCustomData(
                    {
                        version: 1.1,
                        tags: [
                            {
                                name: 'some-name',
                                attributes: [],
                            },
                        ],
                    },
                    {
                        version: 1.1,
                        tags: [
                            {
                                name: 'some-name',
                                description: 'description',
                                attributes: [],
                            },
                        ],
                    }
                ),
                {
                    version: 1.1,
                    tags: [
                        {
                            name: 'some-name',
                            description: 'description',
                            attributes: [],
                            references: [],
                        },
                    ],
                    valueSets: [],
                    globalAttributes: [],
                }
            );
            t.deepEqual(
                joinCustomData(
                    {
                        version: 1.1,
                        tags: [
                            {
                                name: 'some-name',
                                attributes: [],
                                references: [
                                    {
                                        name: 'some-ref',
                                        url: 'some-url',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        version: 1.1,
                        tags: [
                            {
                                name: 'some-name',
                                attributes: [],
                            },
                        ],
                    }
                ),
                {
                    version: 1.1,
                    tags: [
                        {
                            name: 'some-name',
                            description: undefined,
                            attributes: [],
                            references: [
                                {
                                    name: 'some-ref',
                                    url: 'some-url',
                                },
                            ],
                        },
                    ],
                    valueSets: [],
                    globalAttributes: [],
                }
            );
            t.deepEqual(
                joinCustomData(
                    {
                        version: 1.1,
                        tags: [
                            {
                                name: 'some-name',
                                attributes: [],
                            },
                        ],
                    },
                    {
                        version: 1.1,
                        tags: [
                            {
                                name: 'some-name',
                                attributes: [],
                                references: [
                                    {
                                        name: 'some-ref',
                                        url: 'some-url',
                                    },
                                ],
                            },
                        ],
                    }
                ),
                {
                    version: 1.1,
                    tags: [
                        {
                            name: 'some-name',
                            description: undefined,
                            attributes: [],
                            references: [
                                {
                                    name: 'some-ref',
                                    url: 'some-url',
                                },
                            ],
                        },
                    ],
                    valueSets: [],
                    globalAttributes: [],
                }
            );
            t.deepEqual(
                joinCustomData(
                    {
                        version: 1.1,
                        globalAttributes: [
                            {
                                name: 'some-name',
                                values: [
                                    {
                                        name: 'some-value',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        version: 1.1,
                        globalAttributes: [
                            {
                                name: 'some-name',
                            },
                        ],
                    }
                ),
                {
                    version: 1.1,
                    tags: [],
                    valueSets: [],
                    globalAttributes: [
                        {
                            name: 'some-name',
                            description: undefined,
                            valueSet: undefined,
                            values: [
                                {
                                    name: 'some-value',
                                },
                            ],
                        },
                    ],
                }
            );
            t.deepEqual(
                joinCustomData(
                    {
                        version: 1.1,
                        globalAttributes: [
                            {
                                name: 'some-name',
                                values: [
                                    {
                                        name: 'some-value',
                                        references: [
                                            {
                                                name: 'some-ref',
                                                url: 'some-url',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        version: 1.1,
                        globalAttributes: [
                            {
                                name: 'some-name',
                                values: [
                                    {
                                        name: 'some-value',
                                    },
                                ],
                            },
                        ],
                    }
                ),
                {
                    version: 1.1,
                    tags: [],
                    valueSets: [],
                    globalAttributes: [
                        {
                            name: 'some-name',
                            description: undefined,
                            valueSet: undefined,
                            values: [
                                {
                                    name: 'some-value',
                                    description: undefined,
                                    references: [
                                        {
                                            name: 'some-ref',
                                            url: 'some-url',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                }
            );
        });
    }
});

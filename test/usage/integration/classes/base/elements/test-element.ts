import {
    TemplateFn,
    CHANGE_TYPE,
    config,
    Props,
    PROP_TYPE,
    ConfigurableWebComponent,
    bindToClass,
    Renderer,
    createUniqueChangeType,
} from '../../../../../../build/es/wc-lib.js';
import {
    render,
    html,
} from '../../../../../../node_modules/lit-html/lit-html.js';
import { RenderableComponent } from '../../../../../types/test-types.js';

export declare class BindTest extends ConfigurableWebComponent {
    fn(): this;
}

export declare class TestElementBase extends ConfigurableWebComponent {
    props: {
        x: number;
    };
}

export declare class TestElement extends TestElementBase {}

export declare class ChangeNever extends ConfigurableWebComponent {}

export declare class HTMLElementTemplate extends ConfigurableWebComponent {}

export interface RenderTestWindow extends Window {
    HTMLElement: typeof HTMLElement;
    renderCalled: {
        never: number;
        prop: number;
        theme: number;
        lang: number;
        always: number;
        'prop-theme': number;
        'prop-lang': number;
        'theme-lang': number;
        'subtree-props': number;
        'global-props': number;
        all: number;
        custom: number;
    };
    customChangeTypeNumber: number;
    TestElement: typeof TestElement;
    WrongBindTest: () => any;
    templates: {
        regular: (valGetter: () => string) => TemplateFn;
        nested: TemplateFn;
        customToText: TemplateFn;
        customProps: TemplateFn;
        customString: TemplateFn;
        customNull: TemplateFn;
        customNoText: TemplateFn;
        customNoRenderer: TemplateFn;
        htmlElementTemplate: TemplateFn;
    };
    html: typeof html;
}
declare const window: RenderTestWindow;

export function baseTestElementFactory(base: typeof RenderableComponent) {
    window.renderCalled = {} as any;

    const TestElementHTML = new TemplateFn<TestElement>(
        (_, { props }) => {
            return html`
                <div>Test</div>
                <h1>${props.x}</h1>
            `;
        },
        CHANGE_TYPE.PROP,
        render
    );

    const TestElementCSS = new TemplateFn<TestElement>(
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

    class TestElementBase extends base {
        props = Props.define(this as any, {
            reflect: {
                x: {
                    type: PROP_TYPE.NUMBER,
                    value: 1,
                },
            },
        });
    }

    @config({
        is: 'test-element',
        html: TestElementHTML,
        css: TestElementCSS,
    })
    class TestElement extends TestElementBase {}

    window.renderCalled['never'] = 0;
    @config({
        is: 'render-test-never',
        html: new TemplateFn<RenderTestElementNever>(
            () => {
                window.renderCalled['never']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    class RenderTestElementNever extends TestElementBase {}

    window.renderCalled['prop'] = 0;
    @config({
        is: 'render-test-prop',
        html: new TemplateFn<RenderTestElementProp>(
            () => {
                window.renderCalled['prop']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.PROP,
            render
        ),
    })
    class RenderTestElementProp extends TestElementBase {}

    window.renderCalled['theme'] = 0;
    @config({
        is: 'render-test-theme',
        html: new TemplateFn<RenderTestElementTheme>(
            () => {
                window.renderCalled['theme']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.THEME,
            render
        ),
    })
    class RenderTestElementTheme extends TestElementBase {}

    window.renderCalled['lang'] = 0;
    @config({
        is: 'render-test-lang',
        html: new TemplateFn<RenderTestElementLang>(
            () => {
                window.renderCalled['lang']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.LANG,
            render
        ),
    })
    class RenderTestElementLang extends TestElementBase {}

    window.renderCalled['always'] = 0;
    @config({
        is: 'render-test-always',
        html: new TemplateFn<RenderTestElementAlways>(
            () => {
                window.renderCalled['always']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.ALWAYS,
            render
        ),
    })
    class RenderTestElementAlways extends TestElementBase {}

    window.renderCalled['prop-theme'] = 0;
    @config({
        is: 'render-test-prop-theme',
        html: new TemplateFn<RenderTestElementPropTheme>(
            () => {
                window.renderCalled['prop-theme']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.PROP | CHANGE_TYPE.THEME,
            render
        ),
    })
    class RenderTestElementPropTheme extends TestElementBase {}

    window.renderCalled['prop-lang'] = 0;
    @config({
        is: 'render-test-prop-lang',
        html: new TemplateFn<RenderTestElementPropLang>(
            () => {
                window.renderCalled['prop-lang']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.PROP | CHANGE_TYPE.LANG,
            render
        ),
    })
    class RenderTestElementPropLang extends TestElementBase {}

    window.renderCalled['theme-lang'] = 0;
    @config({
        is: 'render-test-theme-lang',
        html: new TemplateFn<RenderTestElementThemeLang>(
            () => {
                window.renderCalled['theme-lang']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.THEME | CHANGE_TYPE.LANG,
            render
        ),
    })
    class RenderTestElementThemeLang extends TestElementBase {}

    window.renderCalled['all'] = 0;
    @config({
        is: 'render-test-all',
        html: new TemplateFn<RenderTestElementAll>(
            () => {
                window.renderCalled['all']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.PROP | CHANGE_TYPE.THEME | CHANGE_TYPE.LANG,
            render
        ),
    })
    class RenderTestElementAll extends TestElementBase {}

    window.renderCalled['custom'] = 0;
    window.customChangeTypeNumber = createUniqueChangeType();
    @config({
        is: 'render-test-custom',
        html: new TemplateFn<RenderTestElementAll>(
            () => {
                window.renderCalled['custom']++;
                return html`
                    <div></div>
                `;
            },
            window.customChangeTypeNumber,
            render
        ),
    })
    class RenderTestElementCustom extends TestElementBase {}

    window.renderCalled['subtree-props'] = 0;
    @config({
        is: 'render-test-subtree-props',
        html: new TemplateFn<RenderTestElementAll>(
            () => {
                window.renderCalled['subtree-props']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.SUBTREE_PROPS,
            render
        ),
    })
    class RenderTestElementSubtreeProps extends TestElementBase {}

    window.renderCalled['global-props'] = 0;
    @config({
        is: 'render-test-global-props',
        html: new TemplateFn<RenderTestElementAll>(
            () => {
                window.renderCalled['global-props']++;
                return html`
                    <div></div>
                `;
            },
            CHANGE_TYPE.GLOBAL_PROPS,
            render
        ),
    })
    class RenderTestElementGlobalProps extends TestElementBase {}

    class NoCSS extends base {
        static is = 'no-css';
        static html = new TemplateFn<NoCSS>(
            () => {
                return html`
                    <div id="content">test</div>
                `;
            },
            CHANGE_TYPE.PROP,
            render
        );
        static dependencies = [];
        static mixins = [];

        get self() {
            return NoCSS;
        }
    }

    @config({
        is: 'bind-test',
        html: null,
    })
    class BindTest extends base {
        @bindToClass
        fn() {
            return this;
        }
    }

    window.TestElement = TestElement as any;
    window.WrongBindTest = () => {
        @config({
            is: 'wrong-bind-test',
            html: null,
        })
        class WrongBindTest extends base {
            @(bindToClass as any)
            fn: boolean = true;
        }
        return WrongBindTest;
    };

    const renderRegularTemplate = (valGetter: () => string) => {
        return new TemplateFn<any>(
            () => {
                return html`
                    <div>${valGetter()}</div>
                `;
            },
            CHANGE_TYPE.ALWAYS,
            render
        );
    };
    const nestedHTMLTemplate = new TemplateFn<any>(
        function(html, { changeType }) {
            return html`
                ${new TemplateFn<any>(
                    (html) => {
                        return html`
                            <div id="inner">testInner</div>
                        `;
                    },
                    CHANGE_TYPE.ALWAYS,
                    render
                ).renderSame(changeType, this, html)}
                <div id="outer">testOuter</div>
            `;
        },
        CHANGE_TYPE.ALWAYS,
        render
    );

    interface CustomTemplaterData {
        __data: {
            strings: TemplateStringsArray;
            values: any[];
        };
        toText(): string;
        strings: TemplateStringsArray;
        values: any[];
    }
    const customTemplaterData = (
        strings: TemplateStringsArray,
        ...values: any[]
    ) => {
        return {
            strings,
            values,
        };
    };
    const customRender: Renderer<CustomTemplaterData> = (
        template: CustomTemplaterData,
        container: HTMLElement
    ) => {
        const result = template.__data.strings.join(template.__data.values[0]);
        container.innerHTML = result;
    };
    const customTemplateToText = new TemplateFn<any>(
        () => {
            const renderFn = (
                strings: TemplateStringsArray,
                ...values: any[]
            ): CustomTemplaterData & {
                toText(): string;
            } => {
                return {
                    __data: customTemplaterData(strings, values),
                    toText: () => {
                        return strings.join(values[0]);
                    },
                } as any;
            };
            return renderFn`<div id="content">${'test'}</div>`;
        },
        CHANGE_TYPE.ALWAYS,
        customRender
    );
    const customTemplateProps = new TemplateFn<any>(
        () => {
            const renderFn = (
                strings: TemplateStringsArray,
                ...values: any[]
            ): CustomTemplaterData & {
                strings: TemplateStringsArray;
                values: any[];
            } => {
                return {
                    __data: customTemplaterData(strings, values),
                    strings,
                    values,
                } as any;
            };
            return renderFn`<div>${'test'}</div>`;
        },
        CHANGE_TYPE.ALWAYS,
        customRender
    );
    const customTemplateString = new TemplateFn<any>(
        () => {
            const renderFn = (
                strings: TemplateStringsArray,
                ...values: any[]
            ): string => {
                return strings.join(values[0]);
            };
            return renderFn`<div>${'test'}</div>`;
        },
        CHANGE_TYPE.ALWAYS,
        customRender
    );
    const customTemplateNull = new TemplateFn<any>(
        () => {
            return null as any;
        },
        CHANGE_TYPE.ALWAYS,
        customRender
    );
    const customTemplateNoText = new TemplateFn<any>(
        () => {
            const renderFn = (
                strings: TemplateStringsArray,
                ...values: any[]
            ): CustomTemplaterData => {
                return {
                    __data: customTemplaterData(strings, values),
                } as any;
            };
            return renderFn`<div>${'test'}</div>` as any;
        },
        CHANGE_TYPE.ALWAYS,
        customRender
    );
    const customTemplateNoRenderer = new TemplateFn<any>(
        () => {
            const renderFn = (
                strings: TemplateStringsArray,
                ...values: any[]
            ): CustomTemplaterData & {
                toText(): string;
            } => {
                return {
                    __data: customTemplaterData(strings, values),
                    toText: () => {
                        return strings.join(values[0]);
                    },
                } as any;
            };
            return renderFn`<div id="content">${'test'}</div>`;
        },
        CHANGE_TYPE.ALWAYS,
        null as any
    );

    @config({
        is: 'change-never',
        html: new TemplateFn<any>(
            () => {
                return html`
                    <h1>${'test'}</h1>
                `;
            },
            CHANGE_TYPE.NEVER,
            render
        ),
    })
    class ChangeNever extends base {}

    const htmlElementTemplate = new TemplateFn<any>(
        () => {
            const el = document.createElement('div');
            el.id = 'sub-el';
            el.setAttribute('a', 'b');
            el.setAttribute('c', 'd');
            el.appendChild(document.createElement('span'));
            return el;
        },
        CHANGE_TYPE.NEVER,
        render
    );

    @config({
        is: 'html-element-template',
        html: htmlElementTemplate,
    })
    class HTMLElementTemplate extends base {}

    TestElement.define(true);
    ChangeNever.define(true);
    RenderTestElementNever.define(true);
    RenderTestElementProp.define(true);
    RenderTestElementTheme.define(true);
    RenderTestElementLang.define(true);
    RenderTestElementAlways.define(true);
    RenderTestElementPropTheme.define(true);
    RenderTestElementPropLang.define(true);
    RenderTestElementThemeLang.define(true);
    RenderTestElementAll.define(true);
    RenderTestElementCustom.define(true);
    RenderTestElementSubtreeProps.define(true);
    RenderTestElementGlobalProps.define(true);
    HTMLElementTemplate.define(true);

    NoCSS.define(true);
    BindTest.define(true);

    window.html = html;
    window.templates = {
        regular: renderRegularTemplate,
        nested: nestedHTMLTemplate,
        customToText: customTemplateToText,
        customProps: customTemplateProps,
        customString: customTemplateString,
        customNull: customTemplateNull,
        customNoText: customTemplateNoText,
        customNoRenderer: customTemplateNoRenderer,
        htmlElementTemplate,
    };
}

import {
    expectPropertyExists,
    expectPrivatePropertyExists,
    expectMethodExists,
} from '../../../lib/assertions';
import {
    TestElement,
    TestElementBase,
    RenderTestWindow,
    BindTest,
    ChangeNever,
} from './elements/test-element';
import { CHANGE_TYPE, TemplateFnLike } from '../../../../../build/es/wc-lib.js';
import { SLOW } from '../../../lib/timing.js';

function assertTemplate(template: TemplateFnLike) {
    expectPrivatePropertyExists(template, '_template');
    expectPrivatePropertyExists(template, '_renderer');
    expectPrivatePropertyExists(template, '_lastRenderChanged');

    expectPropertyExists(template, 'changeOn');

    expectMethodExists(template, 'renderAsText');
    expectMethodExists(template, 'renderTemplate');
    expectMethodExists(template, 'renderSame');
    expectMethodExists(template, 'render');
    expectMethodExists(template, 'renderIfNew');
}

export function baseSpec(fixture: string) {
    context('Base', function() {
        this.slow(SLOW);
        before(() => {
            cy.visit(fixture);
        });

        context('Mounting', () => {
            it('renders the element with its content', () => {
                cy.get('#test')
                    .shadowFind('div')
                    .shadowContains('Test');
            });
        });
        context('Properties/Methods', () => {
            before(() => {
                cy.visit(fixture);
            });
            it('exposes an .html property that contains the template', () => {
                cy.window().then((window: RenderTestWindow) => {
                    expectPropertyExists(window.TestElement, 'html');

                    assertTemplate(window.TestElement.html);
                });
            });
            it('exposes an .css property that contains the template(s)', () => {
                cy.window().then((window: RenderTestWindow) => {
                    expectPropertyExists(window.TestElement, 'css');

                    if (Array.isArray(window.TestElement.css)) {
                        expect(window.TestElement.css.length).to.be.at.least(
                            1,
                            'has at least one css template'
                        );
                        for (const css of window.TestElement.css) {
                            assertTemplate(css);
                        }
                    } else {
                        assertTemplate(window.TestElement.css);
                    }
                });
            });
            it('exposes a .customCSS property that contains the template(s)', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'customCSS');

                    const customCSS = el.customCSS();
                    if (Array.isArray(customCSS)) {
                        for (const sheet of customCSS) {
                            assertTemplate(sheet);
                        }
                    } else {
                        assertTemplate(customCSS);
                    }
                });
            });
            it('exposes a .root property that contains the shadowRoot', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectPropertyExists(el, 'root');
                    const rootProp = el.root;
                    expect(rootProp).to.be.equal(
                        el.shadowRoot,
                        'shadowRoots match'
                    );
                });
            });
            it('exposes a .self property that contains a reference to the constructor', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectPropertyExists(el, 'self');

                    const self = el.self;
                    expect(self).to.be.equal(el.constructor);
                });
            });
            it('exposes a #renderToDOM method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'renderToDOM');
                });
            });
            it('exposes render hooks', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'preRender');
                    expectMethodExists(el, 'postRender');
                    expectMethodExists(el, 'firstRender');
                });
            });
        });

        context('Creation', () => {
            before(() => {
                cy.visit(fixture);
            });
            it('can be dynamically created', () => {
                cy.document().then((document) => {
                    const el = document.createElement('test-element');
                    el.id = 'test2';
                    document.body.appendChild(el);

                    cy.get('#test2');
                });
            });
            it('still renders when CSS is set to null/undefined', () => {
                cy.document().then((document) => {
                    const el = document.createElement('no-css');
                    el.id = 'test3';
                    document.body.appendChild(el);

                    cy.wait(50)
                        .get('#test3')
                        .shadowFind('#content')
                        .shadowContains('test');
                });
            });
            after(() => {
                cy.visit(fixture);
            });
        });

        context('Rendering', () => {
            beforeEach(() => {
                cy.visit(fixture);
            });

            it('re-renders the element when a property is changed', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'renderToDOM');
                    cy.get('#test')
                        .shadowFind('h1')
                        .shadowContains('1')
                        .then(() => {
                            el.props.x = 2;

                            cy.get('#test')
                                .shadowFind('h1')
                                .shadowContains('2');
                        });
                });
            });
            it('calls the render hooks when rendering', () => {
                cy.get('#test').then(async ([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'renderToDOM');

                    el.preRender = cy.spy() as any;
                    el.postRender = cy.spy() as any;

                    el.props.x = 2;

                    cy.wait(50).then(() => {
                        expect(el.preRender).to.be.called;
                        expect(el.postRender).to.be.called;
                    });
                });
            });
            it('cancels rendering when false is returned by #preRender', () => {
                cy.get('#test').then(async ([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'renderToDOM');

                    // Don't cancel initial render
                    cy.wait(100).then(() => {
                        el.preRender = () => false;
                        el.props.x = 2;

                        cy.wait(50)
                            .get('#test')
                            .shadowFind('h1')
                            .shadowContains('1');
                    });
                });
            });
            it('calls firstRender on the very first render', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'test-element'
                    ) as TestElement;
                    el.firstRender = cy.spy() as any;
                    el.id = 'test2';
                    document.body.appendChild(el);

                    cy.get('#test2').then(([el]: JQuery<TestElement>) => {
                        el.props.x = 2;

                        expect(el.firstRender).to.be.calledOnce;
                    });
                });
            });
            it('renders well using prop change if getTheme is not present in the component', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'test-element'
                    ) as TestElement;

                    // @ts-expect-error
                    delete el.getTheme;
                    el.id = 'test2';
                    document.body.appendChild(el);

                    cy.wait(50)
                        .get('#test2')
                        .shadowFind('h1')
                        .shadowContains('1')
                        .then(() => {
                            el.props.x = 2;

                            cy.wait(50)
                                .get('#test2')
                                .shadowFind('h1')
                                .shadowContains('2');
                        });
                });
            });
            it('renders well using CHANGE_TYPE.ALWAYS if getTheme is not present in the component', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'test-element'
                    ) as TestElement;

                    // @ts-expect-error
                    delete el.getTheme;

                    Object.defineProperty(el, 'getTheme', {
                        get() {
                            return undefined;
                        },
                    });

                    el.id = 'test2';
                    document.body.appendChild(el);

                    cy.wait(50)
                        .get('#test2')
                        .shadowFind('h1')
                        .shadowContains('1')
                        .then(() => {
                            el.renderToDOM();
                        });
                });
            });
            it('renders well using CHANGE_TYPE.NEVER if getTheme is not present in the component', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'change-never'
                    ) as ChangeNever;

                    // @ts-expect-error
                    delete el.getTheme;

                    Object.defineProperty(el, 'getTheme', {
                        get() {
                            return undefined;
                        },
                    });

                    el.id = 'test4';
                    document.body.appendChild(el);

                    cy.wait(50)
                        .get('#test4')
                        .shadowFind('h1')
                        .shadowContains('test');
                });
            });
            it('does not call renderToDOM twice when calling renderToDOM in the prerender', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const renderToDOM = cy.spy(el, 'renderToDOM');
                    const postRender = cy.spy(el, 'postRender');

                    el.preRender = () => {
                        el.renderToDOM();
                    };

                    el.renderToDOM();

                    cy.wrap(renderToDOM).should('be.calledTwice');
                    cy.wrap(postRender).should('be.calledOnce');
                });
            });
        });
        context('Change types', () => {
            before(() => {
                cy.document().then((document) => {
                    document.body.appendChild(
                        document.createElement('render-test-never')
                    );
                    document.body.appendChild(
                        document.createElement('render-test-prop')
                    );
                    document.body.appendChild(
                        document.createElement('render-test-theme')
                    );
                    document.body.appendChild(
                        document.createElement('render-test-lang')
                    );
                    document.body.appendChild(
                        document.createElement('render-test-always')
                    );
                    document.body.appendChild(
                        document.createElement('render-test-prop-theme')
                    );
                    document.body.appendChild(
                        document.createElement('render-test-prop-lang')
                    );
                    document.body.appendChild(
                        document.createElement('render-test-theme-lang')
                    );
                    document.body.appendChild(
                        document.createElement('render-test-all')
                    );
                });
            });

            function genChangeTypeCases(
                changeType: CHANGE_TYPE,
                changeTypes: {
                    never: boolean;
                    prop: boolean;
                    theme: boolean;
                    lang: boolean;
                    always: boolean;
                    'prop-theme': boolean;
                    'prop-lang': boolean;
                    'theme-lang': boolean;
                    all: boolean;
                }
            ) {
                for (const change in changeTypes) {
                    const shouldChange =
                        changeTypes[change as keyof typeof changeTypes];
                    it(
                        shouldChange
                            ? `renders change-type "${change}"`
                            : `does not render change-type "${change}"`,
                        () => {
                            cy.get(`render-test-${change}`).then(
                                ([element]: JQuery<TestElementBase>) => {
                                    cy.window().then(
                                        async (cyWindow: RenderTestWindow) => {
                                            const renders =
                                                cyWindow.renderCalled[
                                                    change as keyof typeof cyWindow.renderCalled
                                                ];

                                            element.renderToDOM(changeType);

                                            if (shouldChange) {
                                                expect(cyWindow.renderCalled)
                                                    .to.have.property(change)
                                                    .to.be.equal(
                                                        renders + 1,
                                                        'render was called'
                                                    );
                                            } else {
                                                expect(cyWindow.renderCalled)
                                                    .to.have.property(change)
                                                    .to.be.equal(
                                                        renders,
                                                        'render was not called'
                                                    );
                                            }
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            }

            context('CHANGE_TYPE.PROP', () => {
                genChangeTypeCases(CHANGE_TYPE.PROP, {
                    never: false,
                    prop: true,
                    theme: false,
                    lang: false,
                    always: true,
                    'prop-theme': true,
                    'prop-lang': true,
                    'theme-lang': false,
                    all: true,
                });
            });
            context('CHANGE_TYPE.THEME', () => {
                genChangeTypeCases(CHANGE_TYPE.THEME, {
                    never: false,
                    prop: false,
                    theme: true,
                    lang: false,
                    always: true,
                    'prop-theme': true,
                    'prop-lang': false,
                    'theme-lang': true,
                    all: true,
                });
            });
            context('CHANGE_TYPE.LANG', () => {
                genChangeTypeCases(CHANGE_TYPE.LANG, {
                    never: false,
                    prop: false,
                    theme: false,
                    lang: true,
                    always: true,
                    'prop-theme': false,
                    'prop-lang': true,
                    'theme-lang': true,
                    all: true,
                });
            });
            context('CHANGE_TYPE.ALWAYS', () => {
                genChangeTypeCases(CHANGE_TYPE.ALWAYS, {
                    never: false,
                    prop: true,
                    theme: true,
                    lang: true,
                    always: true,
                    'prop-theme': true,
                    'prop-lang': true,
                    'theme-lang': true,
                    all: true,
                });
            });
            context('CHANGE_TYPE.FORCE', () => {
                genChangeTypeCases(CHANGE_TYPE.FORCE, {
                    never: false,
                    prop: true,
                    theme: true,
                    lang: true,
                    always: true,
                    'prop-theme': true,
                    'prop-lang': true,
                    'theme-lang': true,
                    all: true,
                });
            });
        });
        context('Template', () => {
            let lastId = 0;
            function genId() {
                return lastId++ + '';
            }
            it('can render HTML to a template', () => {
                cy.window().then((window: RenderTestWindow) => {
                    cy.document().then((document) => {
                        const container = document.createElement('div');
                        container.id = `container${genId()}`;
                        document.body.appendChild(container);

                        const val = Math.random() + '';
                        const template = window.templates.regular(() => val);
                        template.render(
                            template.renderTemplate(11, { props: {} } as any),
                            container
                        );

                        cy.get(`#${container.id}`)
                            .find('div')
                            .contains(val);
                    });
                });
            });
            it('re-renders if the template changed', () => {
                cy.window().then((window: RenderTestWindow) => {
                    cy.document().then((document) => {
                        const container = document.createElement('div');
                        container.id = `container${genId()}`;
                        document.body.appendChild(container);

                        const val = Math.random() + '';
                        let currentVal: string = val;
                        const template = window.templates.regular(
                            () => currentVal
                        );

                        const spy = cy.spy(template, '_renderer' as any);

                        template.render(
                            template.renderTemplate(11, { props: {} } as any),
                            container
                        );

                        cy.get(`#${container.id}`)
                            .find('div')
                            .contains(val)
                            .then(() => {
                                cy.wrap(spy)
                                    .should('be.calledOnce')
                                    .then(() => {
                                        const newVal = Math.random() + '';
                                        currentVal = newVal;
                                        template.renderIfNew(
                                            template.renderTemplate(11, {
                                                props: {},
                                            } as any),
                                            container
                                        );

                                        cy.get(`#${container.id}`)
                                            .find('div')
                                            .contains(currentVal);

                                        cy.wrap(spy).should('be.calledTwice');
                                    });
                            });
                    });
                });
            });
            it('renders elements if template returns an element', () => {
                cy.window().then((window: RenderTestWindow) => {
                    cy.get('#element')
                        .shadowFind('#sub-el')
                        .then(([el]: JQuery<HTMLElement>) => {
                            expect(el instanceof window.HTMLElement).to.be.true;
                            expect(el).to.have.attr('a', 'b');
                            expect(el).to.have.attr('c', 'd');
                            expect(el.children).to.have.length(1);
                        });
                });
            });
            it('can #renderAsText', () => {
                cy.window().then((window: RenderTestWindow) => {
                    const val = Math.random() + '';
                    const template = window.templates.regular(() => val);

                    const text = template.renderAsText(11, {
                        props: {},
                    } as any);
                    expect(text.trim()).to.be.equal(`<div>${val}</div>`);
                });
            });
            it('can convert html element templates to text', () => {
                cy.window().then((window: RenderTestWindow) => {
                    const template = window.templates.htmlElementTemplate;

                    const text = template.renderAsText(11, {
                        props: {},
                    } as any);
                    expect(text.trim()).to.be.equal(
                        `<div id="sub-el" a="b" c="d"><span></span></div>`
                    );
                });
            });
            it('can use #renderSame when using #renderTemplate', () => {
                cy.window().then((window: RenderTestWindow) => {
                    cy.document().then((document) => {
                        const container = document.createElement('div');
                        container.id = `container${genId()}`;
                        document.body.appendChild(container);

                        window.templates.nested.render(
                            window.templates.nested.renderTemplate(11, {
                                props: {},
                                generateHTMLTemplate: window.html,
                            } as any),
                            container
                        );

                        cy.get(`#${container.id}`)
                            .find('#outer')
                            .contains('testOuter');

                        cy.get(`#${container.id}`)
                            .find('#inner')
                            .contains('testInner');
                    });
                });
            });
            it('can use #renderSame when using #renderAsText', () => {
                cy.window().then((window: RenderTestWindow) => {
                    const string = window.templates.nested.renderAsText(11, {
                        props: {},
                        generateHTMLTemplate: window.html,
                    } as any);
                    expect(string).to.have.string('testOuter');
                    expect(string).to.have.string('testInner');
                });
            });
            it('can use a custom templater and renderer', () => {
                cy.window().then((window: RenderTestWindow) => {
                    cy.document().then((document) => {
                        const container = document.createElement('div');
                        container.id = `container${genId()}`;
                        document.body.appendChild(container);

                        window.templates.customToText.render(
                            window.templates.customToText.renderTemplate(11, {
                                props: {},
                            } as any),
                            container
                        );

                        cy.get(`#${container.id}`)
                            .find('#content')
                            .contains('test');
                    });
                });
            });
            it('uses the string for string conversion if the custom template is a string', () => {
                cy.window().then((window: RenderTestWindow) => {
                    expect(
                        window.templates.customString.renderAsText(11, {
                            props: {},
                        } as any)
                    ).to.be.equal('<div>test</div>');
                });
            });
            it('transforms "null" into the empty string when rendering text', () => {
                cy.window().then((window: RenderTestWindow) => {
                    expect(
                        window.templates.customNull.renderAsText(11, {
                            props: {},
                        } as any)
                    ).to.be.equal('');
                });
            });
            it("uses the custom template's #toText function", () => {
                cy.window().then((window: RenderTestWindow) => {
                    expect(
                        window.templates.customToText.renderAsText(11, {
                            props: {},
                        } as any)
                    ).to.be.equal('<div id="content">test</div>');
                });
            });
            it("uses the custom template's .strings and .values properties", () => {
                cy.window().then((window: RenderTestWindow) => {
                    expect(
                        window.templates.customProps.renderAsText(11, {
                            props: {},
                        } as any)
                    ).to.be.equal('<div>test</div>');
                });
            });
            it("throws an error if a custom template can't be converted to text", () => {
                cy.window().then((window: RenderTestWindow) => {
                    expect(() => {
                        window.templates.customNoText.renderAsText(11, {
                            props: {},
                        } as any);
                    }).to.throw(
                        'Failed to convert template to text because there'
                    );
                });
            });
            it('throws an error if no renderer is provided when rendering to HTML', () => {
                cy.window().then((window: RenderTestWindow) => {
                    cy.document().then((document) => {
                        const container = document.createElement('div');
                        container.id = `container${genId()}`;
                        document.body.appendChild(container);

                        expect(() => {
                            window.templates.customNoRenderer.render(
                                window.templates.customNoRenderer.renderTemplate(
                                    11,
                                    { props: {} } as any
                                ),
                                container
                            );
                        }).to.throw('Missing renderer');

                        expect(() => {
                            window.templates.customNoRenderer.renderIfNew(
                                window.templates.customNoRenderer.renderTemplate(
                                    11,
                                    { props: {} } as any
                                ),
                                container
                            );
                        }).to.throw('Missing renderer');
                    });
                });
            });
            it('throws no error if no renderer is provided when rendering to text', () => {
                cy.window().then((window: RenderTestWindow) => {
                    expect(() => {
                        expect(
                            window.templates.customNoRenderer.renderAsText(11, {
                                props: {},
                            } as any)
                        ).to.be.equal('<div id="content">test</div>');
                    }).to.not.throw();
                });
            });
        });
        context('Exports', () => {
            context('bindToClass', () => {
                it('preserves "this" when called normally', () => {
                    cy.document().then((document) => {
                        const el = document.createElement(
                            'bind-test'
                        ) as BindTest;

                        expect(el)
                            .to.have.property('fn')
                            .to.be.a('function');
                        expect(el.fn()).to.be.equal(el);
                    });
                });
                it('preserves "this" when called with .apply', () => {
                    cy.document().then((document) => {
                        const el = document.createElement(
                            'bind-test'
                        ) as BindTest;

                        expect(el)
                            .to.have.property('fn')
                            .to.be.a('function');
                        expect(el.fn.apply({})).to.be.equal(el);
                    });
                });
                it('preserves "this" when called with .call', () => {
                    cy.document().then((document) => {
                        const el = document.createElement(
                            'bind-test'
                        ) as BindTest;

                        expect(el)
                            .to.have.property('fn')
                            .to.be.a('function');
                        expect(el.fn.call({})).to.be.equal(el);
                    });
                });
                it('preserves "this" when called with .bind', () => {
                    cy.document().then((document) => {
                        const el = document.createElement(
                            'bind-test'
                        ) as BindTest;

                        expect(el)
                            .to.have.property('fn')
                            .to.be.a('function');
                        expect(el.fn.bind({})()).to.be.equal(el);
                    });
                });
                it('throws an error when bound to a non-function property', () => {
                    cy.window().then((window: RenderTestWindow) => {
                        expect(window.WrongBindTest).to.throw(
                            'Only methods can be decorated with @bind. <fn> is not a method!'
                        );
                    });
                });
            });
        });
    });
}

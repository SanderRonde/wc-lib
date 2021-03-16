import {
    OtherClass,
    JSXElement,
    SpecialPropClass,
    JSXElement3,
    JSXElement4,
    JSXElement5,
    JSXElement6,
    JSXElement9,
} from './elements/jsx-element.js';
import { CHANGE_TYPE } from '../../../../../build/es/wc-lib.js';
import { getLibFixture } from '../../../lib/testing.js';
import { SLOW } from '../../../lib/timing.js';

function jsxRenderSpec(fixture: string) {
    context('JSX-Render', function () {
        this.slow(SLOW);
        before(() => {
            cy.visit(fixture);
        });

        context('Basic rendering', () => {
            context('to DOM', () => {
                it('renders a simple element to DOM', () => {
                    cy.get('#test').shadowFind('#simple');
                });
                it('renders nested elements to DOM', () => {
                    cy.get('#test')
                        .shadowFind('#nested')
                        .shadowFind('#nestedChild');
                });
                it('renders unknown tagnames to DOM', () => {
                    cy.get('#test').shadowFind('unknown');
                });
                it('renders passed class components to DOM', () => {
                    cy.get('#test')
                        .shadowFind('#classComponent')
                        .then(([el]: JQuery<OtherClass>) => {
                            expect(el).to.have.property('isOtherClass');
                            expect(el.isOtherClass()).to.be.true;
                        });
                });
                it('sets attributes/props', () => {
                    cy.get('#test').then(([jsxEl]: JQuery<JSXElement>) => {
                        const x = jsxEl.props.x;
                        const y = jsxEl.props.y;
                        cy.get('#test')
                            .shadowFind('#simple')
                            .then(([el]: JQuery<HTMLDivElement>) => {
                                expect(el).to.have.attr('x', x);
                                expect(el).to.have.attr('y', y + '');
                                expect(el).to.have.attr('id', 'simple');
                            });
                    });
                });
                it('defines elements that are not already defined', () => {
                    cy.window().then((window) => {
                        const undefinedElement = (window as any)
                            .JSXUndefinedElement;
                        const spy = cy.spy(undefinedElement, 'define');

                        cy.document().then((document) => {
                            const element = document.createElement(
                                'jsx-render-8'
                            );
                            document.body.appendChild(element);

                            expect(spy).to.be.called;
                        });
                    });
                });
            });
            context('to text', () => {
                it('renders a simple element to text', () => {
                    cy.get('#test').then(([jsxEl]: JQuery<JSXElement>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            '<div x="x" y="1" id="simple"></div>'
                        );
                    });
                });
                it('can use html.Fragment', () => {
                    cy.get('#test3').then(([jsxEl]: JQuery<JSXElement3>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            '<div id="1"></div><div id="2"></div><div id="3"></div>'
                        );
                    });
                    cy.get('#test4').then(([jsxEl]: JQuery<JSXElement4>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            '<div id="1"></div><div id="2"></div><div id="3"></div>'
                        );
                    });
                });
                it('renders nested elements to text', () => {
                    cy.get('#test').then(([jsxEl]: JQuery<JSXElement>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            `<div id="nested">
								<div>
									<div id="nestedChild"></div>
								</div>
								<div></div>
								<div></div>
							</div>`.replace(/\n|\t/g, '')
                        );
                    });
                });
                it('renders unknown tagnames to text', () => {
                    cy.get('#test').then(([jsxEl]: JQuery<JSXElement>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include('<unknown></unknown>');
                    });
                });
                it('renders passed class components to text', () => {
                    cy.get('#test').then(([jsxEl]: JQuery<JSXElement>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            '<other-class id="classComponent"></other-class'
                        );
                    });
                });
                it("doesn't render junk", () => {
                    cy.get('#test').then(([jsxEl]: JQuery<JSXElement>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.not.include('12345');
                    });
                });
                it('displays a warning when rendering junk', () => {
                    cy.window().then((window) => {
                        const stub = cy.stub(
                            (window as any).console,
                            'warn',
                            (...args: any[]) => {
                                expect(args[0]).to.be.equal(
                                    'Unknown tag value'
                                );
                            }
                        );

                        cy.get('#test').then(([jsxEl]: JQuery<JSXElement>) => {
                            jsxEl.renderToDOM();

                            cy.wrap(stub).should('be.called');
                        });
                    });
                });
                it("renders functions that don't use attributes to text", () => {
                    cy.get('#test').then(([jsxEl]: JQuery<JSXElement>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            '<div id="fnWithoutArgs"></div>'
                        );
                    });
                });
                it('renders functions that use attributes to text', () => {
                    cy.get('#test').then(([jsxEl]: JQuery<JSXElement>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            '<div id="fnWithArgs" a="1" b="2"></div>'
                        );
                    });
                });
                it('does not render "false"', () => {
                    cy.get('#test2').then(([jsxEl]: JQuery<JSXElement>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.not.include('not-rendered');
                        expect(textRender).to.not.include('false');
                    });
                });
                it('can use delayed execution JSX in regular JSX parents', () => {
                    cy.get('#test5').then(([jsxEl]: JQuery<JSXElement5>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            '<div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div>'
                        );
                    });
                });
                it('can use delayed execution JSX in delayed parents', () => {
                    cy.get('#test6').then(([jsxEl]: JQuery<JSXElement6>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            '<div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div>'
                        );
                    });
                });
                it('can use delayed execution JSX in arrays (deeply)', () => {
                    cy.get('#test9').then(([jsxEl]: JQuery<JSXElement9>) => {
                        const textRender = jsxEl.self.html.renderAsText(
                            CHANGE_TYPE.FORCE,
                            jsxEl
                        );
                        expect(textRender).to.include(
                            '<div id="1"></div><div id="2"></div><div id="3"></div><div id="4"></div>,<div id="5"></div>'
                        );
                    });
                });
            });
        });
        context('Special props', () => {
            context('Group-based', () => {
                it('adds event listeners in the __listeners and @ groups', () => {
                    cy.get('#test').then(([el]: JQuery<JSXElement>) => {
                        const stub = cy.stub(el, 'onEvent');
                        cy.get('#test')
                            .shadowFind('#listener-at')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                el.click();
                                expect(stub).to.be.calledOnce;
                            });

                        cy.get('#test')
                            .shadowFind('#listener-group')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                el.click();
                                expect(stub).to.be.calledTwice;
                            });
                    });
                });
                it('adds custom event listeners in the __component_listeners and @@ groups', () => {
                    cy.get('#test').then(([el]: JQuery<JSXElement>) => {
                        const stub = cy.stub(el, 'onEvent');
                        cy.get('#test')
                            .shadowFind('#special-listeners')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                el.fire('something');
                                expect(stub).to.be.calledOnce;
                                el.fire('other');
                                expect(stub).to.be.calledTwice;
                            });
                    });
                });
                it('sets boolean values in the __bools and ? groups if true', () => {
                    cy.get('#test')
                        .shadowFind('#bool-true')
                        .then(([el]: JQuery<SpecialPropClass>) => {
                            expect(el).to.have.attr('bool');
                            expect(el).to.have.attr('bool-type');
                        });
                });
                it('does not set boolean values in the __bools and ? groups if false', () => {
                    cy.get('#test')
                        .shadowFind('#bool-false')
                        .then(([el]: JQuery<SpecialPropClass>) => {
                            expect(el).to.not.have.attr('bool');
                            expect(el).to.not.have.attr('bool-type');
                        });
                });
                it('generates ref for attributes in the __refs and # groups', () => {
                    cy.get('#test').then(([el]: JQuery<JSXElement>) => {
                        el.props.someComplex = {};
                        const complex = el.props.someComplex!;

                        cy.get('#test')
                            .shadowFind('#refs')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                expect(el).to.have.attr('complex');
                                expect(el).to.have.attr('complex-type');

                                expect(
                                    el.getParentRef(el.getAttribute('complex')!)
                                ).to.be.equal(complex);
                                expect(
                                    el.getParentRef(
                                        el.getAttribute('complex-type')!
                                    )
                                ).to.be.equal(complex);
                            });
                    });
                });
            });
            context('Name-based', () => {
                it('adds listener to attributes prefixed by @', () => {
                    cy.get('#test').then(([el]: JQuery<JSXElement>) => {
                        const stub = cy.stub(el, 'onEvent');
                        cy.get('#test')
                            .shadowFind('#listener-name')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                el.click();
                                expect(stub).to.be.calledOnce;
                            });
                    });
                });
                it('adds custom listener to attributes prefixed by @@', () => {
                    cy.get('#test').then(([el]: JQuery<JSXElement>) => {
                        const stub = cy.stub(el, 'onEvent');
                        cy.get('#test')
                            .shadowFind('#special-listener-name')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                el.fire('something');
                                expect(stub).to.be.calledOnce;
                            });
                    });
                });
                it('sets true attributes when prefixed by ?', () => {
                    cy.get('#test')
                        .shadowFind('#bool-true-name')
                        .then(([el]: JQuery<SpecialPropClass>) => {
                            expect(el).to.have.attr('bool');
                        });
                });
                it('does not set false attributes when prefixed by ?``', () => {
                    cy.get('#test')
                        .shadowFind('#bool-false-name')
                        .then(([el]: JQuery<SpecialPropClass>) => {
                            expect(el).to.not.have.attr('bool');
                        });
                });
                it('correctly calculates class string based on object when attr name is "class"', () => {
                    cy.get('#test')
                        .shadowFind('#class-name')
                        .then(([el]: JQuery<SpecialPropClass>) => {
                            expect(el).to.have.attr('class', 'a c');
                        });
                });
                it('generates ref for attributes starting with #', () => {
                    cy.get('#test').then(([el]: JQuery<JSXElement>) => {
                        el.props.someComplex = {};
                        const complex = el.props.someComplex;

                        cy.get('#test')
                            .shadowFind('#refs-name')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                expect(el).to.have.attr('complex');

                                expect(
                                    el.getParentRef(el.getAttribute('complex')!)
                                ).to.be.equal(complex);
                            });
                    });
                });
                it('sets properties for attributes starting with .', () => {
                    cy.get('#test').then(([el]: JQuery<JSXElement>) => {
                        el.props.someComplex = {};
                        const complex = el.props.someComplex;

                        cy.get('#test')
                            .shadowFind('#refs-prop')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                expect(el).to.have.attr('complex');

                                expect(
                                    el.getParentRef(el.getAttribute('complex')!)
                                ).to.be.equal(complex);
                            });
                    });
                });
                it('autodetects complex refs for complex attributes', () => {
                    cy.get('#test').then(([el]: JQuery<JSXElement>) => {
                        el.props.someComplex = {};
                        const complex = el.props.someComplex;

                        cy.get('#test')
                            .shadowFind('#refs-name2')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                expect(el).to.have.attr('complex');

                                expect(
                                    el.getParentRef(el.getAttribute('complex')!)
                                ).to.be.equal(complex);
                            });
                        cy.get('#test')
                            .shadowFind('#refs-name3')
                            .then(([el]: JQuery<SpecialPropClass>) => {
                                expect(el).to.have.attr('complexpriv');

                                expect(
                                    el.getParentRef(
                                        el.getAttribute('complexpriv')!
                                    )
                                ).to.be.equal(complex);
                            });
                    });
                });
            });
        });
    });
}

jsxRenderSpec(getLibFixture('jsx-render'));

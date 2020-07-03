import {
    ComplexElement,
    EventTriggeringElement,
    BooleanElement,
    ComplexReceiverElement,
} from './elements/complex-element';
import { TestElement, TestWindow } from '../elements/test-element';
import { expectMethodExists } from '../../../lib/assertions.js';
import { CHANGE_TYPE } from '../../../../../build/es/wc-lib.js';
import { SLOW } from '../../../lib/timing.js';
export function templateManagerSpec(fixtures: {
    standard: string;
    wrong: string;
}) {
    context('Template Manager', function() {
        this.slow(SLOW);
        before(() => {
            cy.visit(fixtures.standard);
        });
        context('Init', () => {
            before(() => {
                cy.visit(fixtures.wrong);
            });
            it('gives a warning if the templater is not initialized', () => {
                cy.document().then((document) => {
                    cy.window().then((window) => {
                        const stub = cy.stub(
                            (window as any).console,
                            'warn',
                            (...args: any[]) => {
                                expect(args[0]).to.contain(
                                    'Missing templater, please initialize it'
                                );
                            }
                        );
                        document.body.appendChild(
                            document.createElement('wrong-element-listen')
                        );
                        cy.wrap(stub).should('be.calledOnce');
                    });
                });
            });
            after(() => {
                cy.visit(fixtures.standard);
            });
        });
        context('Properties/Methods', () => {
            it('exposes a #generateHTMLTemplate method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'generateHTMLTemplate');
                });
            });
            it('exposes a #getRef method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'getRef');
                });
            });
            it('exposes a #getParentRef method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'getParentRef');
                });
            });
            it('exposes a #genRef method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'genRef');
                });
            });
            it('exposes a static #initComplexTemplateProvider method', () => {
                cy.window().then((window: TestWindow) => {
                    expectMethodExists(
                        window.TestElement,
                        'initComplexTemplateProvider'
                    );
                });
            });
        });
        context('Attributes', () => {
            context('Event handler', () => {
                beforeEach(() => {
                    cy.visit(fixtures.standard);
                });
                it('fires the handler when a listened-to event is fired', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const clickStub = cy.stub(complex, 'clickHandler');
                            cy.get('#complex')
                                .shadowFind('#eventTest')
                                .shadowClick()
                                .then(() => {
                                    expect(clickStub).to.be.called;
                                });
                        }
                    );
                });
                it('can be a directive', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const clickStub = cy.stub(complex, 'clickHandler');
                            cy.get('#complex')
                                .shadowFind('#eventDirective')
                                .shadowClick()
                                .then(() => {
                                    expect(clickStub).to.be.called;
                                });
                        }
                    );
                });
            });
            context('Custom Event Handler', () => {
                beforeEach(() => {
                    cy.visit(fixtures.standard);
                });
                it('fires the handler when a custom event is fired', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const arg1 = Math.random();
                            const arg2 = Math.random();
                            const clickStub = cy
                                .stub(complex, 'customClickHandler')
                                .withArgs(arg1, arg2);
                            cy.get('#complex')
                                .shadowFind('#customEventTest')
                                .then(
                                    ([el]: JQuery<EventTriggeringElement>) => {
                                        console.log('here');
                                        el.fire('ev', arg1, arg2);
                                        expect(clickStub).to.be.called;
                                    }
                                );
                        }
                    );
                });
                it('can be a directive', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const arg1 = Math.random();
                            const arg2 = Math.random();
                            const clickStub = cy
                                .stub(complex, 'customClickHandler')
                                .withArgs(arg1, arg2);
                            cy.get('#complex')
                                .shadowFind('#customEventDirective')
                                .then(
                                    ([el]: JQuery<EventTriggeringElement>) => {
                                        el.fire('ev', arg1, arg2);
                                        expect(clickStub).to.be.called;
                                    }
                                );
                        }
                    );
                });
                it('only uses the latest listener', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const arg1 = Math.random();
                            const arg2 = Math.random();
                            let wasCalled: boolean = false;
                            const clickStub = cy.stub(
                                complex,
                                'customClickHandler',
                                (value: number) => {
                                    if (wasCalled) {
                                        expect(value).to.be.equal(
                                            arg1 + 2,
                                            'registered the newest listener'
                                        );
                                    } else {
                                        expect(value).to.be.equal(
                                            arg1 + 1,
                                            'is still using the old listener'
                                        );
                                        wasCalled = true;
                                    }
                                }
                            );
                            cy.get('#complex')
                                .shadowFind('#customEventReplaced')
                                .then(
                                    ([el]: JQuery<EventTriggeringElement>) => {
                                        el.fire('ev', arg1, arg2);
                                        expect(clickStub).to.be.calledOnce;
                                        cy.wait(1000);
                                        cy.get('#complex')
                                            .shadowFind('#customEventReplaced')
                                            .then(
                                                ([el]: JQuery<
                                                    EventTriggeringElement
                                                >) => {
                                                    el.fire('ev', arg1, arg2);
                                                    expect(clickStub).to.be
                                                        .calledTwice;
                                                }
                                            );
                                    }
                                );
                        }
                    );
                });
                it('can remove the listener', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const arg1 = Math.random();
                            const arg2 = Math.random();
                            const clickStub = cy
                                .stub(complex, 'customClickHandler')
                                .withArgs(arg1, arg2);
                            cy.get('#complex')
                                .shadowFind('#customEventRemoved')
                                .then(
                                    ([el]: JQuery<EventTriggeringElement>) => {
                                        el.fire('ev', arg1, arg2);
                                        expect(clickStub).to.be.calledOnce;
                                        cy.wait(1000);
                                        cy.get('#complex')
                                            .shadowFind('#customEventRemoved')
                                            .then(
                                                ([el]: JQuery<
                                                    EventTriggeringElement
                                                >) => {
                                                    el.fire('ev', arg1, arg2);
                                                    expect(clickStub).to.be
                                                        .calledOnce;
                                                }
                                            );
                                    }
                                );
                        }
                    );
                });
                it('can add the listener', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const arg1 = Math.random();
                            const arg2 = Math.random();
                            const clickStub = cy
                                .stub(complex, 'customClickHandler')
                                .withArgs(arg1, arg2);
                            cy.get('#complex')
                                .shadowFind('#customEventDefined')
                                .then(
                                    ([el]: JQuery<EventTriggeringElement>) => {
                                        el.fire('ev', arg1, arg2);
                                        expect(clickStub).to.not.be.called;
                                        cy.wait(1000);
                                        cy.get('#complex')
                                            .shadowFind('#customEventDefined')
                                            .then(
                                                ([el]: JQuery<
                                                    EventTriggeringElement
                                                >) => {
                                                    el.fire('ev', arg1, arg2);
                                                    expect(clickStub).to.be
                                                        .calledOnce;
                                                }
                                            );
                                    }
                                );
                        }
                    );
                });
                it('can use handleEvent', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const arg1 = Math.random();
                            const arg2 = Math.random();
                            const clickStub = cy
                                .stub(complex, 'handleEvent')
                                .withArgs(arg1, arg2);
                            cy.get('#complex')
                                .shadowFind('#handleEvent')
                                .then(
                                    ([el]: JQuery<EventTriggeringElement>) => {
                                        el.fire('ev', arg1, arg2);
                                        expect(clickStub).to.be.called;
                                    }
                                );
                        }
                    );
                });
                it('captures the return value with functions', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const arg1 = Math.random();
                            const arg2 = Math.random();
                            const retval = Math.random();
                            const clickStub = cy
                                .stub(complex, 'customClickHandler')
                                .withArgs(arg1, arg2)
                                .returns(retval);
                            cy.get('#complex')
                                .shadowFind('#customEventTest')
                                .then(
                                    ([el]: JQuery<EventTriggeringElement>) => {
                                        const fireReturned = el.fire(
                                            'ev',
                                            arg1,
                                            arg2
                                        );
                                        expect(clickStub).to.be.called;
                                        expect(fireReturned).to.have.length(1);
                                        expect(fireReturned).to.include(retval);
                                    }
                                );
                        }
                    );
                });
                it('captures the return value with handleEvent', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            const arg1 = Math.random();
                            const arg2 = Math.random();
                            const retval = Math.random();
                            const clickStub = cy
                                .stub(complex, 'handleEvent')
                                .withArgs(arg1, arg2)
                                .returns(retval);
                            cy.get('#complex')
                                .shadowFind('#handleEvent')
                                .then(
                                    ([el]: JQuery<EventTriggeringElement>) => {
                                        const fireReturned = el.fire(
                                            'ev',
                                            arg1,
                                            arg2
                                        );
                                        expect(clickStub).to.be.called;
                                        expect(fireReturned).to.have.length(1);
                                        expect(fireReturned).to.include(retval);
                                    }
                                );
                        }
                    );
                });
                it('gives a warning when listening to a non-webcomponent', () => {
                    cy.document().then((document) => {
                        cy.window().then((window) => {
                            const stub = cy.stub(
                                (window as any).console,
                                'warn',
                                (...args: any[]) => {
                                    expect(args[0]).to.be.equal(
                                        'Attempting to listen using webcomponent listener on non-webcomponent element'
                                    );
                                }
                            );
                            document.body.appendChild(
                                document.createElement('wrong-element-listen')
                            );
                            cy.wrap(stub).should('be.calledOnce');
                        });
                    });
                });
            });
            context('Boolean Attribute', () => {
                it('sets boolean attribute if value is truthy', () => {
                    cy.get('#complex')
                        .shadowFind('#booleanTestTrue')
                        .then(([el]: JQuery<BooleanElement>) => {
                            expect(el.props.bool).to.be.true;
                        });
                });
                it('does not set boolean attribute if value is falsy', () => {
                    cy.get('#complex')
                        .shadowFind('#booleanTestFalse')
                        .then(([el]: JQuery<BooleanElement>) => {
                            expect(el.props.bool).to.be.false;
                        });
                });
            });
            context('Class', () => {
                it('applies the class object correctly', () => {
                    cy.get('#complex')
                        .shadowFind('#classTestObj')
                        .then(([el]: JQuery<HTMLDivElement>) => {
                            expect(el.getAttribute('class')).to.be.equal(
                                'a',
                                'applies class correctly'
                            );
                        });
                });
                it('applies the class string correctly', () => {
                    cy.get('#complex')
                        .shadowFind('#classTestString')
                        .then(([el]: JQuery<HTMLDivElement>) => {
                            expect(el.getAttribute('class')).to.be.equal(
                                'a b c',
                                'applies class correctly'
                            );
                        });
                });
                it('applies the class array correctly', () => {
                    cy.get('#complex')
                        .shadowFind('#classTestArr')
                        .then(([el]: JQuery<HTMLDivElement>) => {
                            expect(el.getAttribute('class')).to.be.equal(
                                'a c d e',
                                'applies class correctly'
                            );
                        });
                });
                it('can be a directive', () => {
                    cy.get('#complex')
                        .shadowFind('#classDirective')
                        .then(([el]: JQuery<HTMLDivElement>) => {
                            expect(el.getAttribute('class')).to.be.equal(
                                'a b c',
                                'applies class correctly'
                            );
                        });
                });
            });
            context('Style', () => {
                it('applies the style object correctly', () => {
                    cy.get('#complex')
                        .shadowFind('#styleTestObj')
                        .then(([el]: JQuery<HTMLDivElement>) => {
                            expect(el.getAttribute('style')).to.be.equal(
                                'color: red; background-color: blue;',
                                'applies style correctly'
                            );
                        });
                });
                it('applies the style string correctly', () => {
                    cy.get('#complex')
                        .shadowFind('#styleTestObj')
                        .then(([el]: JQuery<HTMLDivElement>) => {
                            expect(el.getAttribute('style')).to.be.equal(
                                'color: red; background-color: blue;',
                                'applies style correctly'
                            );
                        });
                });
                it('can be a directive', () => {
                    cy.get('#complex')
                        .shadowFind('#styleDirective')
                        .then(([el]: JQuery<HTMLDivElement>) => {
                            expect(el.getAttribute('style')).to.be.equal(
                                'color: red; background-color: blue;',
                                'applies style correctly'
                            );
                        });
                });
            });
            context('Complex Values', () => {
                it('passes complex references', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            cy.get('#complex')
                                .shadowFind('#refTest')
                                .then(
                                    ([el]: JQuery<ComplexReceiverElement>) => {
                                        expect(el.props.parent).to.be.equal(
                                            complex,
                                            'complex attribute is set'
                                        );
                                    }
                                );
                        }
                    );
                });
                it('can be a directive', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            cy.get('#complex')
                                .shadowFind('#refDirective')
                                .then(
                                    ([el]: JQuery<ComplexReceiverElement>) => {
                                        expect(el.props.parent).to.be.equal(
                                            complex,
                                            'complex attribute is set'
                                        );
                                    }
                                );
                        }
                    );
                });
                it('preserves the connection on re-render', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            cy.get('#complex')
                                .shadowFind('#refTest')
                                .then(
                                    ([el]: JQuery<ComplexReceiverElement>) => {
                                        expect(el.props.parent).to.be.equal(
                                            complex,
                                            'complex attribute is set'
                                        );
                                        complex.renderToDOM(CHANGE_TYPE.FORCE);
                                        cy.get('#complex').then(
                                            ([complex]: JQuery<
                                                ComplexElement
                                            >) => {
                                                cy.get('#complex')
                                                    .shadowFind('#refTest')
                                                    .then(
                                                        ([el]: JQuery<
                                                            ComplexReceiverElement
                                                        >) => {
                                                            expect(
                                                                el.props.parent
                                                            ).to.be.equal(
                                                                complex,
                                                                'complex attribute is set'
                                                            );
                                                            complex.renderToDOM(
                                                                CHANGE_TYPE.FORCE
                                                            );
                                                        }
                                                    );
                                            }
                                        );
                                    }
                                );
                        }
                    );
                });
                it('gives a warning when using an invalid ref type', () => {
                    cy.window().then((window) => {
                        const stub = cy.stub(
                            (window as any).console,
                            'warn',
                            (...args: any[]) => {
                                expect(args[0]).to.be.equal('Invalid ref');
                            }
                        );
                        cy.get('#complex').then(
                            ([complex]: JQuery<ComplexElement>) => {
                                complex.getRef(0 as any);
                                cy.wrap(stub).should('be.calledOnce');
                            }
                        );
                    });
                });
                it('returns undefined when the ref points to nothing', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            expect(
                                complex.getRef('___complex_ref10000')
                            ).to.be.equal(undefined);
                        }
                    );
                });
                it('gives a warning when a component has no parent and getParentRef is called', () => {
                    cy.window().then((window) => {
                        const warnStub = cy.stub(
                            (window as any).console,
                            'warn',
                            (...args: any[]) => {
                                expect(args[0]).to.be.equal(
                                    'Could not find parent of'
                                );
                            }
                        );
                        cy.get('#complex').then(
                            ([complex]: JQuery<ComplexElement>) => {
                                const getParentStub = cy.stub(
                                    complex,
                                    'getParent',
                                    () => {
                                        return undefined;
                                    }
                                );
                                complex.getParentRef('___complex_ref1');
                                cy.wrap(warnStub).should('be.calledOnce');
                                cy.wrap(getParentStub).should('be.calledOnce');
                            }
                        );
                    });
                });
                it('automatically applies complex if type is complex', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            cy.get('#complex')
                                .shadowFind('#refTest3')
                                .then(
                                    ([el]: JQuery<ComplexReceiverElement>) => {
                                        expect(el.props.parent).to.be.equal(
                                            complex,
                                            'complex attribute is set'
                                        );
                                    }
                                );
                        }
                    );
                });
                it('does not automatically apply complex if type is not complex', () => {
                    cy.get('#complex').then(
                        ([complex]: JQuery<ComplexElement>) => {
                            cy.get('#complex')
                                .shadowFind('#refTest4')
                                .then(([el]: JQuery<TestElement>) => {
                                    expect(el.getAttribute('x')).to.be.equal(
                                        complex.toString(),
                                        'regular attribute is set to stringified value'
                                    );
                                });
                        }
                    );
                });
            });
            context('Other', () => {
                it('sets an attribute normally when using non-special chars', () => {
                    cy.get('#complex')
                        .shadowFind('#regular')
                        .then(([regular]: JQuery<TestElement>) => {
                            expect(regular).to.have.attr(':key', 'value');
                        });
                });
            });
        });
        context('References', () => {
            it('can get a reference through #getRef', () => {
                cy.get('#complex').then(([complex]: JQuery<ComplexElement>) => {
                    cy.get('#complex')
                        .shadowFind('#refTest2')
                        .then(([el]: JQuery<TestElement>) => {
                            const refName = el.getAttribute('parent')!;
                            expect(complex.getRef(refName)).to.be.equal(
                                complex,
                                'complex attribute resolves to the component'
                            );
                        });
                });
            });
            it('can get a reference through #getParentRef', () => {
                cy.get('#complex').then(([complex]: JQuery<ComplexElement>) => {
                    cy.get('#complex')
                        .shadowFind('#refTest2')
                        .then(([el]: JQuery<TestElement>) => {
                            const refName = el.getAttribute('parent')!;
                            expect(el.getParentRef(refName)).to.be.equal(
                                complex,
                                'complex attribute resolves to the component'
                            );
                        });
                });
            });
            it('can create a reference through #genRef', () => {
                cy.get('#complex').then(([complex]: JQuery<ComplexElement>) => {
                    const someValue = {};
                    expect(
                        complex.getRef(complex.genRef(someValue))
                    ).to.be.equal(someValue);
                });
            });
        });
    });
}

import { LifecycleElement } from './elements/lifecycle-element.js';
import { expectMethodExists } from '../../../lib/assertions.js';
import { TestElement } from '../elements/test-element';
import { SLOW } from '../../../lib/timing.js';
export function componentSpec(fixture: string) {
    context('Component', function() {
        this.slow(SLOW);
        before(() => {
            cy.visit(fixture);
        });
        context('Properties/Methods', () => {
            it('exposes a #$ property/method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expect(el).to.have.property('$');
                    const value = el.$;
                    expect(typeof value).to.be.equal('function');
                });
            });
            it('exposes a #$$ method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, '$$');
                });
            });
            it('exposes a #connectedCallback method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'connectedCallback');
                });
            });
            it('exposes a #disconnectedCallback method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'disconnectedCallback');
                });
            });
            it('exposes a #layoutMounted method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'layoutMounted');
                });
            });
            it('exposes a #mounted method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'mounted');
                });
            });
            it('exposes a #unmounted method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'unmounted');
                });
            });
            it('exposes a #listenProp method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'listenProp');
                });
            });
        });
        context('Lifecycle Events', () => {
            beforeEach(() => {
                cy.visit(fixture);
            });
            it('sets isMounted to true when the component is mounted', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'test-element'
                    ) as TestElement;
                    expect(el).to.have.property('isMounted').to.be.false;
                    document.body.appendChild(el);
                    cy.wrap(el)
                        .should('have.property', 'isMounted')
                        .and('be.equal', true);
                });
            });
            it('calls all disposables when the element is disconnected', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const spy = cy.spy();
                    (el as any).disposables.push(spy);
                    el.remove();
                    expect(spy).to.be.called;
                });
            });
            it('calls #connectedCallback when created', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'lifecycle-element'
                    ) as LifecycleElement;
                    document.body.appendChild(el);
                    expect(el)
                        .to.have.property('lifeCycleCalls')
                        .to.have.property('connected')
                        .to.be.equal(1, 'connectedCallback was called once');
                });
            });
            it('calls #disconnectedCallback when removed', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'lifecycle-element'
                    ) as LifecycleElement;
                    document.body.appendChild(el);
                    expect(el)
                        .to.have.property('lifeCycleCalls')
                        .to.have.property('disconnected')
                        .to.be.equal(
                            0,
                            'disconnectedCallback was not called yet'
                        );
                    el.remove();
                    expect(el)
                        .to.have.property('lifeCycleCalls')
                        .to.have.property('disconnected')
                        .to.be.equal(1, 'disconnectedCallback was called');
                });
            });
            it('calls #layoutMounted as a part of the constructor', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'lifecycle-element'
                    ) as LifecycleElement;
                    document.body.appendChild(el);
                    expect(el)
                        .to.have.property('lifeCycleCalls')
                        .to.have.property('layoutMounted')
                        .to.be.equal(1, 'layoutMounted was called');
                });
            });
            it('calls #mounted after the component has been rendered', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'lifecycle-element'
                    ) as LifecycleElement;
                    document.body.appendChild(el);
                    expect(el)
                        .to.have.property('lifeCycleCalls')
                        .to.have.property('mounted')
                        .to.be.equal(
                            0,
                            'mounted was not called in the constructor'
                        );
                    cy.wrap(el)
                        .should('have.property', 'lifeCycleCalls')
                        .and('have.property', 'mounted')
                        .and('be.equal', 1, 'mounted is eventually called');
                });
            });
            it('calls #unmounted when removed', () => {
                cy.document().then((document) => {
                    const el = document.createElement(
                        'lifecycle-element'
                    ) as LifecycleElement;
                    document.body.appendChild(el);
                    expect(el)
                        .to.have.property('lifeCycleCalls')
                        .to.have.property('unmounted')
                        .to.be.equal(0, 'unmounted was not called yet');
                    el.remove();
                    expect(el)
                        .to.have.property('lifeCycleCalls')
                        .to.have.property('unmounted')
                        .to.be.equal(1, 'unmounted was called');
                });
            });
        });
        context('ListenProp', () => {
            beforeEach(() => {
                cy.visit(fixture);
            });
            it('allows listening for property change events', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expect(el.listenProp).to.not.throw;
                    expect(() => {
                        el.listenProp('propChange', () => {});
                    }).to.not.throw;
                });
            });
            it('calls the listener with the correct arguments', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const listener = cy.spy((key, newValue, oldValue) => {
                        expect(key).to.be.equal('x', 'changed value is x');
                        expect(newValue).to.be.equal(
                            2,
                            'value was changed to 2'
                        );
                        expect(oldValue).to.be.equal(1, 'value was 1');
                    });
                    el.listenProp('propChange', listener as any);
                    el.props.x = 2;
                    expect(listener).to.be.called;
                });
            });
            it('fires the beforePropChange event before the change', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const listener = cy.spy((key, newValue, oldValue) => {
                        expect(el)
                            .to.have.property('props')
                            .to.have.property('x')
                            .to.be.equal(1, 'prop is still set to old value');
                        expect(key).to.be.equal('x', 'changed value is x');
                        expect(newValue).to.be.equal(
                            2,
                            'value was changed to 2'
                        );
                        expect(oldValue).to.be.equal(1, 'value was 1');
                    });
                    el.listenProp('beforePropChange', listener as any);
                    el.props.x = 2;
                    expect(listener).to.be.called;
                });
            });
            it('fires the propChange event after the change', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const listener = cy.spy((key, newValue, oldValue) => {
                        expect(el)
                            .to.have.property('props')
                            .to.have.property('x')
                            .to.be.equal(2, 'prop is set to new value');
                        expect(key).to.be.equal('x', 'changed value is x');
                        expect(newValue).to.be.equal(
                            2,
                            'value was changed to 2'
                        );
                        expect(oldValue).to.be.equal(1, 'value was 1');
                    });
                    el.listenProp('propChange', listener as any);
                    el.props.x = 2;
                    expect(listener).to.be.called;
                });
            });
            it('calls the listener multiple times if the value changes multiple times', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const listener = cy.spy((key, newValue, oldValue) => {
                        expect(el)
                            .to.have.property('props')
                            .to.have.property('x')
                            .to.be.above(1, 'prop was set to higher value');
                        expect(newValue).to.not.be.equal(
                            oldValue,
                            'new and old are not the same'
                        );
                        expect(key).to.be.equal('x', 'changed value is x');
                        expect(newValue).to.be.above(
                            1,
                            'value was changed to a higher value'
                        );
                    });
                    el.listenProp('propChange', listener as any);
                    el.props.x = 2;
                    el.props.x = 3;
                    expect(listener).to.be.calledTwice;
                });
            });
            it('only calls the listener once if once is set to true', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const listener = cy.spy((key, newValue, oldValue) => {
                        expect(el)
                            .to.have.property('props')
                            .to.have.property('x')
                            .to.be.equal(2, 'prop is set to new value');
                        expect(key).to.be.equal('x', 'changed value is x');
                        expect(newValue).to.be.equal(
                            2,
                            'value was changed to 2'
                        );
                        expect(oldValue).to.be.equal(1, 'value was 1');
                    });
                    el.listenProp('propChange', listener as any, true);
                    el.props.x = 2;
                    el.props.x = 3;
                    expect(listener).to.be.calledOnce;
                });
            });
            it('fires multiple listeners if there are more than one', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const listener1 = cy.spy(() => {});
                    const listener2 = cy.spy(() => {});
                    el.listenProp('propChange', listener1 as any, true);
                    el.listenProp('propChange', listener2 as any, true);
                    el.props.x = 2;
                    expect(listener1).to.be.calledOnce;
                    expect(listener2).to.be.calledOnce;
                });
            });
            it('does not fire the listener if the value does not change', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const listener = cy.spy(() => {});
                    el.listenProp('propChange', listener as any);
                    el.props.x = 1;
                    expect(listener).to.not.be.called;
                });
            });
        });
        context('Selectors', () => {
            it('runs querySelectorAll on the local root when calling #$$', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    const selectors = [
                        '#divId',
                        '.divClass',
                        'div',
                        '#headerId',
                        '.headerClass',
                        'h1',
                        'div[id]',
                        'div[class]',
                        'h1[id]',
                        'h1[class]',
                        '*',
                        'nonexistent',
                    ];
                    for (const selector of selectors) {
                        expect([...el.$$(selector)]).to.have.same.members(
                            [...el.root.querySelectorAll(selector)],
                            'selectors return the same values'
                        );
                    }
                });
            });
            context('Proxy', () => {
                it('runs querySelector on the local root when calling #$', () => {
                    cy.get('#test').then(([el]: JQuery<TestElement>) => {
                        const selectors = [
                            '#divId',
                            '.divClass',
                            'div',
                            '#headerId',
                            '.headerClass',
                            'h1',
                            'div[id]',
                            'div[class]',
                            'h1[id]',
                            'h1[class]',
                            '*',
                            'nonexistent',
                        ];
                        for (const selector of selectors) {
                            expect(
                                el.$(selector) ===
                                    el.root.querySelector(selector),
                                'selectors return the same value'
                            ).to.be.true;
                        }
                    });
                });
                it('returns element with given ID when accessed', () => {
                    cy.get('#test').then(([el]: JQuery<TestElement>) => {
                        cy.get('#test')
                            .shadowFind('div')
                            .then(([div]: JQuery<HTMLDivElement>) => {
                                expect(
                                    el.$.divId === div,
                                    'found the correct element'
                                ).to.be.true;
                            });
                    });
                });
                it('caches an element if called multiple times', () => {
                    cy.get('#test').then(([el]: JQuery<TestElement>) => {
                        cy.get('#test')
                            .shadowFind('div')
                            .then(([div]: JQuery<HTMLDivElement>) => {
                                expect(
                                    el.$.divId === div,
                                    'found the correct element'
                                ).to.be.true;
                                // No real way to check this except for code coverage
                                expect(
                                    el.$.divId === div,
                                    'found the correct element'
                                ).to.be.true;
                            });
                    });
                });
                it('returns undefined when the element does not exist', () => {
                    cy.get('#test').then(([el]: JQuery<TestElement>) => {
                        expect((el.$ as any).nonexistent).to.be.undefined;
                    });
                });
                it('returns undefined if the selector is not a string', () => {
                    cy.get('#test').then(([el]: JQuery<TestElement>) => {
                        expect((el.$ as any)[Symbol()]).to.be.undefined;
                    });
                });
            });
            context('No-Proxy', () => {
                beforeEach(() => {
                    cy.visit(fixture, {
                        onBeforeLoad(win) {
                            delete (win as any).Proxy;
                        },
                    });
                });
                it('runs querySelector on the local root when calling #$', () => {
                    cy.get('#test').then(([el]: JQuery<TestElement>) => {
                        const selectors = [
                            '#divId',
                            '.divClass',
                            'div',
                            '#headerId',
                            '.headerClass',
                            'h1',
                            'div[id]',
                            'div[class]',
                            'h1[id]',
                            'h1[class]',
                            '*',
                            'nonexistent',
                        ];
                        for (const selector of selectors) {
                            expect(
                                el.$(selector) ===
                                    el.root.querySelector(selector),
                                'selectors return the same value'
                            ).to.be.true;
                        }
                    });
                });
                it('no longer has access to window.Proxy', () => {
                    cy.window().then((window) => {
                        expect(
                            (window as any).Proxy,
                            'proxy does not exist anymore'
                        ).to.be.undefined;
                    });
                });
                it('returns element with given ID when accessed', () => {
                    cy.get('#test').then(([el]: JQuery<TestElement>) => {
                        cy.get('#test')
                            .shadowFind('div')
                            .then(([div]: JQuery<HTMLDivElement>) => {
                                expect(
                                    el.$.divId === div,
                                    'found the correct element'
                                ).to.be.true;
                            });
                    });
                });
                it('returns undefined if the selector is not a string', () => {
                    cy.get('#test').then(([el]: JQuery<TestElement>) => {
                        expect((el.$ as any)[Symbol()]).to.be.undefined;
                    });
                });
                it('returns undefined when the element does not exist', () => {
                    cy.get('#test').then(([el]: JQuery<TestElement>) => {
                        expect((el.$ as any).nonexistent).to.be.undefined;
                    });
                });
            });
        });
    });
}

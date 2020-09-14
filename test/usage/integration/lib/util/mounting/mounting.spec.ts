import { TestElement } from '../../../classes/elements/test-element';
import { Mounting } from '../../../../../../build/es/wc-lib.js';
import { getFixture } from '../../../../lib/testing';
import { SLOW } from '../../../../lib/timing';

context('Timeout', function () {
    this.slow(SLOW);
    before(() => {
        cy.visit(getFixture('lib/util', 'mounting', 'standard'));
    });

    context('#awaitMounted', () => {
        it('return immediately if already mounted', () => {
            cy.get('#test').then(([el]: JQuery<TestElement>) => {
                const resolve = cy.spy();
                el.isMounted = true;
                Mounting.awaitMounted(el).then(resolve as any);
                cy.wait(0).then(() => {
                    expect(resolve).to.be.calledOnce;
                });
            });
        });
        it('waits if component.mounted does not exist yet', () => {
            cy.document().then((document) => {
                const el = document.createElement(
                    'test-element'
                ) as TestElement;

                const resolve = cy.spy();
                const originalMounted = el.mounted;
                el.mounted = null as any;
                Mounting.awaitMounted(el).then(resolve as any);
                cy.wrap(resolve)
                    .should('not.be.called')
                    .then(() => {
                        el.mounted = originalMounted;

                        cy.wait(100).then(() => {
                            el.mounted();
                            cy.wrap(resolve).should('be.calledOnce');
                        });
                    });
            });
        });
        it('overrides component.mounted', () => {
            cy.document().then((document) => {
                const el = document.createElement(
                    'test-element'
                ) as TestElement;

                const prevMounted = el.mounted;
                const resolve = cy.spy();
                Mounting.awaitMounted(el).then(resolve as any);

                expect(el.mounted).to.not.be.equal(prevMounted);
            });
        });
        it('still calls the original mounted function', () => {
            cy.document().then((document) => {
                const el = document.createElement(
                    'test-element'
                ) as TestElement;

                const mounted = cy.spy();
                el.mounted = mounted as any;

                const resolve = cy.spy();
                Mounting.awaitMounted(el).then(resolve as any);
                expect(resolve).to.not.be.called;

                document.body.appendChild(el);

                cy.wrap(resolve).should('be.calledOnce');
                cy.wrap(mounted).should('be.calledOnce');
            });
        });
        it('resolves when mounted has been called', () => {
            cy.document().then((document) => {
                const el = document.createElement(
                    'test-element'
                ) as TestElement;

                const resolve = cy.spy();
                Mounting.awaitMounted(el).then(resolve as any);
                expect(resolve).to.not.be.called;

                document.body.appendChild(el);

                cy.wrap(resolve).should('be.calledOnce');
            });
        });
    });
    context('#hookIntoMount', () => {
        it('calls the callback function as well when mounted has been called', () => {
            cy.get('#test').then(([el]: JQuery<TestElement>) => {
                const resolve = cy.spy();
                const callback = cy.spy();
                Mounting.hookIntoMount(el, callback as any).then(
                    resolve as any
                );
                cy.wait(0).then(() => {
                    expect(resolve).to.be.calledOnce;
                    expect(callback).to.be.calledOnce;
                });
            });
        });
        it('waits if component.mounted does not exist yet', () => {
            cy.document().then((document) => {
                const el = document.createElement(
                    'test-element'
                ) as TestElement;

                const resolve = cy.spy();
                const callback = cy.spy();
                const originalMounted = el.mounted;
                el.mounted = null as any;
                Mounting.hookIntoMount(el, callback as any).then(
                    resolve as any
                );
                cy.wrap(resolve)
                    .should('not.be.called')
                    .then(() => {
                        el.mounted = originalMounted;

                        cy.wait(100).then(() => {
                            el.mounted();
                            cy.wrap(resolve).should('be.calledOnce');
                            cy.wrap(callback).should('be.calledOnce');
                        });
                    });
            });
        });
        it('overrides component.mounted', () => {
            cy.document().then((document) => {
                const el = document.createElement(
                    'test-element'
                ) as TestElement;

                const prevMounted = el.mounted;
                const resolve = cy.spy();
                const callback = cy.spy();
                Mounting.hookIntoMount(el, callback as any).then(
                    resolve as any
                );

                expect(el.mounted).to.not.be.equal(prevMounted);
            });
        });
        it('still calls the original mounted function', () => {
            cy.document().then((document) => {
                const el = document.createElement(
                    'test-element'
                ) as TestElement;

                const mounted = cy.spy();
                el.mounted = mounted as any;

                const resolve = cy.spy();
                const callback = cy.spy();
                Mounting.hookIntoMount(el, callback as any).then(
                    resolve as any
                );
                expect(resolve).to.not.be.called;

                document.body.appendChild(el);

                cy.wrap(resolve).should('be.calledOnce');
                cy.wrap(mounted).should('be.calledOnce');
                cy.wrap(callback).should('be.calledOnce');
            });
        });
        it('resolves when mounted has been called', () => {
            cy.document().then((document) => {
                const el = document.createElement(
                    'test-element'
                ) as TestElement;

                const resolve = cy.spy();
                const callback = cy.spy();
                Mounting.hookIntoMount(el, callback as any).then(
                    resolve as any
                );
                expect(resolve).to.not.be.called;

                document.body.appendChild(el);

                cy.wrap(resolve).should('be.calledOnce');
                cy.wrap(callback).should('be.calledOnce');
            });
        });
    });
});

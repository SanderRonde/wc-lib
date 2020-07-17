/// <reference types="Cypress" />

import { expectMethodExists } from '../../../lib/assertions.js';
import { getClassFixture } from '../../../lib/testing.js';
import { TestElement } from '../elements/test-element';
import { SLOW } from '../../../lib/timing.js';
import {
    CustomCSSElement,
    ExtendedWindow,
} from './elements/custom-css-element.js';

context('Custom CSS Manager', function() {
    this.slow(SLOW);
    before(() => {
        cy.visit(getClassFixture('custom-css-manager'));
    });

    context('Properties/Methods', () => {
        it('exposes a #customCSS method', () => {
            cy.get('#test').then(([el]: JQuery<TestElement>) => {
                expectMethodExists(el, 'customCSS');
            });
        });
        it('exposes a #__hasCustomCSS method', () => {
            cy.get('#test').then(([el]: JQuery<TestElement>) => {
                expectMethodExists(el, '__hasCustomCSS');
            });
        });
    });

    context('Stylesheet', () => {
        it('applies the stylesheet', () => {
            cy.get('#custom')
                .shadowFind('test-element')
                .shadowFind('div')
                .then(([div]: JQuery<HTMLDivElement>) => {
                    cy.window().then((window) => {
                        expect(window.getComputedStyle(div).color).to.be.equal(
                            'rgb(0, 0, 255)',
                            'color is overridden'
                        );
                    });
                });
        });
    });

    context('custom-css property', () => {
        it('displays a warning when a non-TemplateFnLike is used', () => {
            cy.document().then((document) => {
                cy.window().then((window) => {
                    const stub = cy.stub(
                        (window as any).console,
                        'warn',
                        (...args: any[]) => {
                            expect(args[0]).to.be.equal(
                                'Attempting to use non TemplateFn value for custom-css property'
                            );
                        }
                    );
                    document.body.appendChild(
                        document.createElement('wrong-custom-css-element')
                    );
                    cy.wrap(stub).should('be.calledTwice');
                });
            });
        });
        it('re-renders when the property is re-set after mount', () => {
            cy.get('#custom')
                .shadowFind('test-element')
                .shadowFind('div')
                .then(([div]: JQuery<HTMLDivElement>) => {
                    cy.window().then((window: ExtendedWindow) => {
                        expect(window.getComputedStyle(div).color).to.be.equal(
                            'rgb(0, 0, 255)',
                            'color is overridden'
                        );

                        cy.get('#custom').then(
                            ([customCSSElement]: JQuery<CustomCSSElement>) => {
                                const ref = customCSSElement.genRef(
                                    window.redTextTemplate
                                );

                                cy.get('#custom')
                                    .shadowFind('test-element')
                                    .then(
                                        ([testElement]: JQuery<
                                            TestElement
                                        >) => {
                                            testElement.setAttribute(
                                                'custom-css',
                                                ref
                                            );
                                            cy.get('#custom')
                                                .shadowFind('test-element')
                                                .shadowFind('div')
                                                .then(
                                                    ([div]: JQuery<
                                                        HTMLDivElement
                                                    >) => {
                                                        expect(
                                                            window.getComputedStyle(
                                                                div
                                                            ).color
                                                        ).to.be.equal(
                                                            'rgb(255, 0, 0)',
                                                            'color is overridden'
                                                        );
                                                    }
                                                );
                                        }
                                    );
                            }
                        );
                    });
                });
        });
    });
});

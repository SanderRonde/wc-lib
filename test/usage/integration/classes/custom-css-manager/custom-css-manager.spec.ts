/// <reference types="Cypress" />

import { expectMethodExists } from "../../../lib/assertions.js";
import { TestElement } from "../elements/test-element";
import { getFixture } from "../../../lib/testing.js";

context('Custom CSS Manager', function() {
	before(() => {
		cy.visit(getFixture('custom-css-manager'));
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
				.shadowFind('div').then(([div]: JQuery<HTMLDivElement>) => {
					cy.window().then((window) => {
						expect(window.getComputedStyle(div).color)
							.to.be.equal('rgb(0, 0, 255)', 
								'color is overridden');
					});
				});
		});
	});

	context('custom-css property', () => {
		it('displays a warning when a non-TemplateFnLike is used', () => {
			cy.document().then((document) => {
				cy.window().then((window) => {
					const stub = cy.stub(window.console, 'warn', (...args: any[]) => {
						expect(args[0]).to.be.equal(
							'Attempting to use non TemplateFn value for custom-css property');
					});
					document.body.appendChild(document.createElement('wrong-custom-css-element'));
					cy.wrap(stub).should('be.calledTwice');
				});
			});
		});
	});
});
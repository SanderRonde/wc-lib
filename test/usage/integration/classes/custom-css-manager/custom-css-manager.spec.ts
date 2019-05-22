/// <reference types="Cypress" />

import { expectMethodExists } from "../../../lib/assertions.js";
import { TestElement } from "../elements/test-element";

context('Custom CSS Manager', function() {
	before(() => {
		cy.visit('http://localhost:1251/test/usage/integration/classes/custom-css-manager/custom-css-manager.fixture.html');
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
});
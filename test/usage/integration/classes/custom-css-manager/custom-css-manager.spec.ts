/// <reference types="Cypress" />

import { assertMethodExists } from "../../../lib/assertions.js";
import { TestElement } from "../elements/test-element";

context('Custom CSS Manager', function() {
	before(() => {
		cy.visit('http://localhost:1251/test/usage/integration/classes/custom-css-manager/custom-css-manager.fixture.html');
	});

	context('Properties/Methods', () => {
		it('exposes a #customCSS method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'customCSS');
			});
		});
		it('exposes a #__hasCustomCSS method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, '__hasCustomCSS');
			});
		});
	});

	context('Stylesheet', () => {
		it('applies the stylesheet', () => {
			cy.get('#custom')
				.shadowFind('test-element')
				.shadowFind('div').then(([div]: JQuery<HTMLDivElement>) => {
					cy.window().then((window) => {
						assert.strictEqual(
							window.getComputedStyle(div).color,
							'rgb(0, 0, 255)', 'color is overridden');
					});
				});
		});
	});
});
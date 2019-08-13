/// <reference types="Cypress" />

import { expectMethodExists, expectPropertyExists } from "../../../lib/assertions";
import { TestParentWindow } from "../elements/parent-element";
import { DefineMetadata } from "../../../../../build/es/wc-lib";
import { TestWindow } from "../elements/test-element";
import { SLOW } from "../../../lib/timing.js";

interface DefineMetaDataWindow extends Window {
	DefineMetadata: typeof DefineMetadata;
}

export function definerSpec(fixture: string) {
	context('Definer', function() {
		this.slow(SLOW);
		before(() => {
			cy.visit(fixture);
		});

		context('Properties/Methods', () => {
			it('exposes a static .dependencies property', () => {
				cy.window().then((window: TestWindow) => {
					expectPropertyExists(window.TestElement, 'dependencies');
				});
			});
			it('exposes a static .is property', () => {
				cy.window().then((window: TestWindow) => {
					expectPropertyExists(window.TestElement, 'is');
				});
			});
			it('exposes a static #define method', () => {
				cy.window().then((window: TestWindow) => {
					expectMethodExists(window.TestElement, 'define');
				});
			});
		});
		context('Defining', () => {
			beforeEach(() => {
				cy.visit(fixture);
			});
			it('defines the component when calling #define', () => {
				cy.window().then((window: TestParentWindow) => {
					expect(window.customElements.get('parent-element'))
						.to.be.undefined;
					window.ParentElement.define();
					expect(window.customElements.get('parent-element'))
						.to.be.equal(window.ParentElement);
				});
			});
			it('defines any dependencies when calling #define', () => {
				cy.window().then((window: TestParentWindow & TestWindow) => {
					expect(window.customElements.get('parent-element'))
						.to.be.undefined;
					expect(window.customElements.get('test-element'))
						.to.be.undefined;
					window.ParentElement.define();
					expect(window.customElements.get('parent-element'))
						.to.be.equal(window.ParentElement);
					expect(window.customElements.get('test-element'))
						.to.be.equal(window.TestElement);
				});
			});
			it('sets isMounted when the component is mounted', () => {
				cy.window().then((window: TestParentWindow) => {
					expect(window.customElements.get('parent-element'))
						.to.be.undefined;
					window.ParentElement.define();
					expect(window.customElements.get('parent-element'))
						.to.be.equal(window.ParentElement);
					
					cy.document().then((document) => {
						const parent = document.createElement('parent-element');

						document.body.appendChild(parent);

						cy.wrap(parent).should('have.property',
							'isMounted').should('be.equal', true);
					});
				});
			});
			it('falls back to webkitRequestAnimationFrame if requestAnimationFrame is not available', () => {
				cy.visit(fixture, {
					onBeforeLoad(win) {
						delete win.requestAnimationFrame;
					}
				});
				cy.window().then((window: TestParentWindow) => {
					expect(window.customElements.get('parent-element'))
						.to.be.undefined;
					window.ParentElement.define();
					expect(window.customElements.get('parent-element'))
						.to.be.equal(window.ParentElement);
					
					cy.document().then((document) => {
						const parent = document.createElement('parent-element');

						document.body.appendChild(parent);

						cy.wrap(parent).should('have.property',
							'isMounted').should('be.equal', true);
					});
				});
			});
			it('falls back to sync implementation if requestAnimationFrame is not available', () => {
				cy.visit(fixture, {
					onBeforeLoad(win) {
						delete win.requestAnimationFrame;
						delete win.webkitRequestAnimationFrame;
					}
				});
				cy.window().then((window: TestParentWindow) => {
					expect(window.customElements.get('parent-element'))
						.to.be.undefined;
					window.ParentElement.define();
					expect(window.customElements.get('parent-element'))
						.to.be.equal(window.ParentElement);
					
					cy.document().then((document) => {
						const parent = document.createElement('parent-element');

						document.body.appendChild(parent);

						cy.wrap(parent).should('have.property',
							'isMounted').should('be.equal', true);
					});
				});
			});
		});
		context('Metadata', () => {
			beforeEach(() => {
				cy.visit(fixture);
			});
			it('has defined 0 elements initially', () => {
				cy.window().then((window: DefineMetaDataWindow) => {
					expect(window.DefineMetadata).to.have.property('defined')
						.to.be.equal(0, 'no elements are defined initially');
				});
			});
			it('increases the counter when a component is defined', () => {
				cy.window().then((window: DefineMetaDataWindow & TestParentWindow) => {
					expect(window.DefineMetadata).to.have.property('defined')
						.to.be.equal(0, 'no elements are defined initially');
					window.ParentElement.define();
					expect(window.DefineMetadata).to.have.property('defined')
						.to.be.equal(2, 'new elements were defined');
				});
			});
			it('calls listeners when a component is defined', () => {
				cy.window().then((window: DefineMetaDataWindow & TestParentWindow) => {
					const listener = cy.spy((amount: number) => {
						expect(amount).to.be.at.least(1,
							'at least 1 element has been defined');
					}) as any;
					window.DefineMetadata.onDefine(listener);

					expect(listener).to.not.be.called;
					window.ParentElement.define();
					expect(listener).to.be.calledTwice;
				});
			});
			it('calls onReach when the desired amount has been reached', () => {
				cy.window().then((window: DefineMetaDataWindow & TestParentWindow) => {
					const listener = cy.spy() as any;
					window.DefineMetadata.onReach(2, listener);

					expect(listener).to.not.be.called;
					window.ParentElement.define();
					expect(listener).to.be.calledOnce;
				});
			});
		});
	});
}
/// <reference types="Cypress" />

import { ComplexElement, EventTriggeringElement, BooleanElement, ComplexReceiverElement } from "./elements/complex-element";
import { TestElement, TestWindow } from "../elements/test-element";
import { expectMethodExists } from "../../../lib/assertions.js";

context('Template Manager', function() {
	before(() => {
		cy.visit('http://localhost:1251/test/usage/integration/classes/template-manager/template-manager.fixture.html');
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
		it('exposes a static #initComplexTemplateProvider method', () => {
			cy.window().then((window: TestWindow) => {
				expectMethodExists(window.TestElement, 'initComplexTemplateProvider');
			});
		});
	});	

	context('Attributes', () => {
		it('fires the handler when a listened-to event is fired', () => {
			cy.get('#complex').then(([complex]: JQuery<ComplexElement>) => {
				const clickStub = cy.stub(complex, 'clickHandler');

				cy.get('#complex')
					.shadowFind('#eventTest')
					.shadowClick().then(() => {
						expect(clickStub).to.be.called;
					});
			});
		});
		it('fires the handler when a custom event is fired', () => {
			cy.get('#complex').then(([complex]: JQuery<ComplexElement>) => {
				const arg = Math.random();
				const clickStub = cy.stub(complex, 'customClickHandler').withArgs(arg);

				cy.get('#complex')
					.shadowFind('#customEventTest').then(([el]: JQuery<EventTriggeringElement>) => {
						el.fire('ev', arg);

						expect(clickStub).to.be.called;
					});
			});
		});
		it('sets boolean attribute if value is truthy', () => {
			cy.get('#complex')
				.shadowFind('#booleanTestTrue').then(([el]: JQuery<BooleanElement>) => {
					expect(el.props.bool).to.be.true;
				});
		});
		it('does not set boolean attribute if value is falsey', () => {
			cy.get('#complex')
				.shadowFind('#booleanTestFalse').then(([el]: JQuery<BooleanElement>) => {
					expect(el.props.bool).to.be.undefined;
				});
		});
		it('applies the class object correctly', () => {
			cy.get('#complex')
				.shadowFind('#classTestObj').then(([el]: JQuery<HTMLDivElement>) => {
					expect(el.getAttribute('class')).to.be.equal(
						'a', 'applies class correctly');
				});
		});
		it('applies the class string correctly', () => {
			cy.get('#complex')
				.shadowFind('#classTestString').then(([el]: JQuery<HTMLDivElement>) => {
					expect(el.getAttribute('class')).to.be.equal(
						'a b c', 'applies class correctly');
				});
		});
		it('applies the class array correctly', () => {
			cy.get('#complex')
				.shadowFind('#classTestArr').then(([el]: JQuery<HTMLDivElement>) => {
					expect(el.getAttribute('class')).to.be.equal(
						'a c d e', 'applies class correctly');
				});
		});
		it('passes complex references', () => {
			cy.get('#complex').then(([complex]: JQuery<ComplexElement>) => {
				cy.get('#complex')
					.shadowFind('#refTest').then(([el]: JQuery<ComplexReceiverElement>) => {
						expect(el.props.parent).to.be.equal(
							complex, 'complex attribute is set');
					});
			});
		});
	});
	context('References', () => {
		it('can get a reference through #getRef', () => {
			cy.get('#complex').then(([complex]: JQuery<ComplexElement>) => {
				cy.get('#complex')
					.shadowFind('#refTest2').then(([el]: JQuery<TestElement>) => {
						const refName = el.getAttribute('parent')!;

						expect(complex.getRef(refName))
							.to.be.equal(complex, 
								'complex attribute resolves to the component');
					});
			});
		});
		it('can get a reference through #getParentRef', () => {
			cy.get('#complex').then(([complex]: JQuery<ComplexElement>) => {
				cy.get('#complex')
					.shadowFind('#refTest2').then(([el]: JQuery<TestElement>) => {
						const refName = el.getAttribute('parent')!;

						expect(el.getParentRef(refName))
							.to.be.equal(complex, 
								'complex attribute resolves to the component');
					});
			});
		});
	});
});
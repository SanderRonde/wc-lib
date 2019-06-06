/// <reference types="Cypress" />

import { expectPropertyExists, expectPrivatePropertyExists, expectMethodExists } from "../../../lib/assertions";
import { TestElement, TestElementBase, RenderTestWindow } from "./elements/test-element";
import { CHANGE_TYPE, TemplateFnLike } from "../../../../../src/wclib";
import { getClassFixture } from "../../../lib/testing";

function assertTemplate(template: TemplateFnLike) {
	expectPrivatePropertyExists(template, '_template');
	expectPrivatePropertyExists(template, '_renderer');
	expectPrivatePropertyExists(template, '_lastRenderChanged');

	expectPropertyExists(template, 'changeOn');
	
	expectMethodExists(template, 'renderAsText');
	expectMethodExists(template, 'renderTemplate');
	expectMethodExists(template, 'renderSame');
	expectMethodExists(template, 'render');
	expectMethodExists(template, 'renderIfNew');
}

context('Base', function() {
	before(() => {
		cy.visit(getClassFixture('base'));
	});

	context('Mounting', () => {
		it('renders the element with its content', () => {
			cy.get('#test')
				.shadowFind('div')
				.shadowContains('Test');
		});
	});
	context('Properties/Methods', () => {
		it('exposes an .html property that contains the template', () => {
			cy.window().then((window: RenderTestWindow) => {
				expectPropertyExists(window.TestElement, 'html');

				assertTemplate(window.TestElement.html);
			});
		});
		it('exposes an .css property that contains the template(s)', () => {
			cy.window().then((window: RenderTestWindow) => {
				expectPropertyExists(window.TestElement, 'css');

				if (Array.isArray(window.TestElement.css)) {
					expect(window.TestElement.css.length).to.be.at.least(1,
						'has at least one css template');
					for (const css of window.TestElement.css) {
						assertTemplate(css);	
					}
				} else {
					assertTemplate(window.TestElement.css);
				}
			});
		});
		it('exposes a .customCSS property that contains the template(s)', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				expectMethodExists(el, 'customCSS');
				
				const customCSS = el.customCSS();
				if (Array.isArray(customCSS)) {
					for (const sheet of customCSS) {
						assertTemplate(sheet);	
					}
				} else {
					assertTemplate(customCSS);
				}
			});
		});
		it('exposes a .root property that contains the shadowRoot', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				expectPropertyExists(el, 'root');
				const rootProp = el.root;
				expect(rootProp).to.be.equal(el.shadowRoot, 
					'shadowRoots match')
			});
		});
		it('exposes a .self property that contains a reference to the constructor', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				expectPropertyExists(el, 'self');

				const self = el.self;
				expect(self).to.be.equal(el.constructor);
			});
		});
		it('exposes a #renderToDOM method', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				expectMethodExists(el, 'renderToDOM');
			});
		});
		it('exposes render hooks', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				expectMethodExists(el, 'preRender');
				expectMethodExists(el, 'postRender');
				expectMethodExists(el, 'firstRender');
			});
		});
	});

	context('Creation', () => {
		it('can be dynamically created', () => {
			cy.document().then((document) => {
				const el = document.createElement('test-element');
				el.id = 'test2';
				document.body.appendChild(el);

				cy.get('#test2');
			});
		});
	});

	context('Rendering', () => {
		beforeEach(() => {
			cy.visit(getClassFixture('base'));
		});

		it('re-renders the element when a property is changed', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				expectMethodExists(el, 'renderToDOM');
				cy.get('#test')
					.shadowFind('h1')
					.shadowContains('1')
					.then(() => {
						el.props.x = 2;

						cy.get('#test')
							.shadowFind('h1')
							.shadowContains('2');
					});
			});
		});
		it('calls the render hooks when rendering', () => {
			cy.get('#test').then(async ([ el ]: JQuery<TestElement>) => {
				expectMethodExists(el, 'renderToDOM');

				el.preRender = cy.spy() as any;
				el.postRender = cy.spy() as any;

				el.props.x = 2;

				cy.wait(50).then(() => {
					expect(el.preRender).to.be.called;
					expect(el.postRender).to.be.called;
				});
			});
		});
		it('cancels rendering when false is returned by #preRender', () => {
			cy.get('#test').then(async ([ el ]: JQuery<TestElement>) => {
				expectMethodExists(el, 'renderToDOM');

				// Don't cancel initial render
				cy.wait(100).then(() => {
					el.preRender = () => false;
					el.props.x = 2;

					cy.wait(50)
						.get('#test')
						.shadowFind('h1')
						.shadowContains('1');
				});
			});
		});
		it('calls firstRender on the very first render', () => {
			cy.document().then((document) => {
				const el = document.createElement('test-element') as TestElement;
				el.firstRender = cy.spy() as any;
				el.id = 'test2';
				document.body.appendChild(el);
	
				cy.get('#test2').then(([el]: JQuery<TestElement>) => {
					el.props.x = 2;
	
					expect(el.firstRender).to.be.calledOnce;
				});
			});
		});
	});
	context('Change types', () => {
		before(() => {
			cy.document().then((document) => {
				document.body.appendChild(document.createElement('render-test-never'));
				document.body.appendChild(document.createElement('render-test-prop'));
				document.body.appendChild(document.createElement('render-test-theme'));
				document.body.appendChild(document.createElement('render-test-lang'));
				document.body.appendChild(document.createElement('render-test-always'));
				document.body.appendChild(document.createElement('render-test-prop-theme'));
				document.body.appendChild(document.createElement('render-test-prop-lang'));
				document.body.appendChild(document.createElement('render-test-theme-lang'));
				document.body.appendChild(document.createElement('render-test-all'));
			});
		});

		function genChangeTypeCases(changeType: CHANGE_TYPE, changeTypes: {
			never: boolean;
			prop: boolean;
			theme: boolean;
			lang: boolean;
			always: boolean;
			'prop-theme': boolean;
			'prop-lang': boolean;
			'theme-lang': boolean;
			all: boolean;
		}) {
			for (const change in changeTypes) {
				const shouldChange = changeTypes[change as keyof typeof changeTypes];
				it(shouldChange ? 
					`renders change-type "${change}"` : 
					`does not render change-type "${change}"`, () => {
						cy.get(`render-test-${change}`).then(([element]: JQuery<TestElementBase>) => {
							cy.window().then(async (cyWindow: RenderTestWindow) => {
								const renders = cyWindow.renderCalled[change as keyof typeof cyWindow.renderCalled];

								element.renderToDOM(changeType);

								if (shouldChange) {
									expect(cyWindow.renderCalled).to.have.property(change)
										.to.be.equal(renders + 1, 'render was called');
								} else {
									expect(cyWindow.renderCalled).to.have.property(change)
										.to.be.equal(renders, 'render was not called');
								}
							});
						});
					});
			}
		}

		context('CHANGE_TYPE.PROP', () => {
			genChangeTypeCases(CHANGE_TYPE.PROP, {
				never: false,
				prop: true,
				theme: false,
				lang: false,
				always: true,
				"prop-theme": true,
				"prop-lang": true,
				"theme-lang": false,
				all: true
			});
		});
		context('CHANGE_TYPE.THEME', () => {
			genChangeTypeCases(CHANGE_TYPE.THEME, {
				never: false,
				prop: false,
				theme: true,
				lang: false,
				always: true,
				"prop-theme": true,
				"prop-lang": false,
				"theme-lang": true,
				all: true
			});
		});
		context('CHANGE_TYPE.LANG', () => {
			genChangeTypeCases(CHANGE_TYPE.LANG, {
				never: false,
				prop: false,
				theme: false,
				lang: true,
				always: true,
				"prop-theme": false,
				"prop-lang": true,
				"theme-lang": true,
				all: true
			});
		});
		context('CHANGE_TYPE.ALWAYS', () => {
			genChangeTypeCases(CHANGE_TYPE.ALWAYS, {
				never: false,
				prop: true,
				theme: true,
				lang: true,
				always: true,
				"prop-theme": true,
				"prop-lang": true,
				"theme-lang": true,
				all: true
			});
		});
		context('CHANGE_TYPE.FORCE', () => {
			genChangeTypeCases(CHANGE_TYPE.FORCE, {
				never: false,
				prop: true,
				theme: true,
				lang: true,
				always: true,
				"prop-theme": true,
				"prop-lang": true,
				"theme-lang": true,
				all: true
			});
		});
	});
});
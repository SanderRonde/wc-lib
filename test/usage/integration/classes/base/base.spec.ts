/// <reference types="Cypress" />

import { assertPropertyExists, assertPrivatePropertyExists, assertMethodExists } from "../../../lib/assertions";
import { TestElement, TestElementBase, RenderTestWindow } from "./elements/test-element";
import { TemplateFn, CHANGE_TYPE } from "../../../../../src/wclib";

function assertTemplate(template: TemplateFn) {
	assertPrivatePropertyExists(template, '_template');
	assertPrivatePropertyExists(template, '_renderer');
	assertPrivatePropertyExists(template, '_lastRenderChanged');

	assertPropertyExists(template, 'changeOn');
	
	assertMethodExists(template, 'renderAsText');
	assertMethodExists(template, 'renderTemplate');
	assertMethodExists(template, 'renderSame');
	assertMethodExists(template, 'render');
	assertMethodExists(template, 'renderIfNew');
}

context('Base', function() {
	before(() => {
		cy.server();
		cy.visit('http://localhost:1251/test/usage/integration/classes/base/base.fixture.html');
	});

	context('Mounting', () => {
		it('renders the element with its content', () => {
			cy.get('#test')
				.shadowFind('div')
				.shadowContains('Test');
		});
	});
	context('Properties/Methods', () => {
		it('exposes an `html` property that contains the template', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				assertPropertyExists(el, 'html');
				
				assertTemplate(el.html);
			});
		});
		it('exposes a `css` property that contains the template(s)', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				assertPropertyExists(el, 'css');
				
				if (Array.isArray(el.css)) {
					assert.isAtLeast(el.css.length, 1, 'has at least one css template');
					for (const css of el.css) {
						assertTemplate(css);	
					}
				} else {
					assertTemplate(el.css);
				}
			});
		});
		it('exposes a `customCSS` property that contains the template(s)', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				assertMethodExists(el, 'customCSS');
				
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
		it('exposes a `root` property that contains the shadowRoot', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				assertPropertyExists(el, 'root');
				const rootProp = el.root;
				assert.strictEqual(rootProp, el.shadowRoot, 
					'shadowRoots match');
			});
		});
		it('exposes a `self` property that contains a reference to the constructor', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				assertPropertyExists(el, 'self');

				const self = el.self;
				assert.strictEqual(self, el.constructor);
			});
		});
		it('exposes a `renderToDOM` method', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				assertMethodExists(el, 'renderToDOM');
			});
		});
		it('exposes render hooks', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				assertMethodExists(el, 'preRender');
				assertMethodExists(el, 'postRender');
				assertMethodExists(el, 'firstRender');
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
		it('re-renders the element when a property is changed', () => {
			cy.get('#test').then(([ el ]: JQuery<TestElement>) => {
				assertMethodExists(el, 'renderToDOM');
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
				assertMethodExists(el, 'renderToDOM');

				let preRenderCalled: boolean = false;
				let postRenderCalled: boolean = false;
				el.preRender = () => {
					preRenderCalled = true;
				}
				el.postRender = () => {
					postRenderCalled = true;
				}

				el.props.x = 2;

				cy.wait(50).then(() => {
					assert.isTrue(preRenderCalled, 'preRender was called');
					assert.isTrue(postRenderCalled, 'postRender was called');
				});
			});
		});
		it('cancels rendering when false is returned by `preRender`', () => {
			cy.get('#test').then(async ([ el ]: JQuery<TestElement>) => {
				assertMethodExists(el, 'renderToDOM');

				// Reset x
				el.props.x = 1;

				cy.wait(50)
					.get('#test')
					.shadowFind('h1')
					.shadowContains('1')
					.then(async () => {
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
				let firstRenderCalls = 0;
	
				const el = document.createElement('test-element') as TestElement;
				el.firstRender = () => {
					firstRenderCalls++;
				}
				el.id = 'test2';
				document.body.appendChild(el);
	
				cy.get('#test2').then(([el]: JQuery<TestElement>) => {
					el.props.x = 2;
	
					assert.strictEqual(firstRenderCalls, 1, 'firstRender was only called');
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

									debugger;
									element.renderToDOM(changeType);

									if (shouldChange) {
										assert.strictEqual(
											cyWindow.renderCalled[change as keyof typeof cyWindow.renderCalled],
											renders + 1, 'render was called');
									} else {
										assert.strictEqual(
											cyWindow.renderCalled[change as keyof typeof cyWindow.renderCalled],
											renders, 'render was not called');
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
});
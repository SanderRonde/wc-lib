/// <reference types="Cypress" />

import { expectMethodExists, expectPropertyExists, expectPromise } from "../../../lib/assertions";
import { RootElement } from "../hierarchy-manager/elements/root-element";
import { TestWindow, TestElement } from "../elements/test-element";
import { WebComponentI18NManager } from "../../../../../src/wclib";
import { LangElement } from "./elements/test-lang-element";
import { ParentElement } from "../elements/parent-element";

interface I18NTestWindow extends Window {
	WebComponentI18NManager: typeof WebComponentI18NManager;
}

function getRootChildren() {
	return cy.get('root-element')
		.shadowFind('parent-element').then((parents: JQuery<ParentElement>) => {
			return cy.get('root-element')
				.shadowFind('test-element')
				.then((shallowTests: JQuery<TestElement>) => {
					return cy.get('root-element')
						.shadowFind('parent-element')
						.shadowFind('test-element').then((deepTests: JQuery<TestElement>) => {
							return cy.get('root-element').then(([root]: JQuery<RootElement>) => {
								const elements = [
									root,
									...parents,
									...shallowTests,
									...deepTests
								];

								return elements;
							});
						});
				});
		});
}

const URL_PREFIX = 'http://localhost:1251/test/usage/integration/classes/i18n-manager/fixtures/';

context('I18n-Manager', function() {
	before(() => {
		cy.visit(
			`${URL_PREFIX}/standard/i18n-manager.fixture.html`, {
				onBeforeLoad(win) {
					delete win.fetch;
				}
			});
	});

	context('Properties/Methods', () => {
		it('exposes a #setLang method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'setLang');
			});
		});
		it('exposes a #getLang method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'getLang');
			});
		});

		it('exposes a #__prom method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, '__prom');
			});
		});
		it('exposes a #__ method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, '__');
			});
		});

		it('exposes a static #initTheme method', () => {
			cy.window().then((window: TestWindow) => {
				expectMethodExists(window.TestElement, 'initI18N');
			});
		});
		it('exposes a static #__prom method', () => {
			cy.window().then((window: TestWindow) => {
				expectMethodExists(window.TestElement, '__prom');
			});
		});
		it('exposes a static #__ method', () => {
			cy.window().then((window: TestWindow) => {
				expectMethodExists(window.TestElement, '__');
			});
		});
		it('exposes a static #langReady method', () => {
			cy.window().then((window: TestWindow) => {
				expectPropertyExists(window.TestElement, 'langReady');
			});
		});
	});

	context('Setting/Getting', () => {
		it('returns the currently active language on #getLang call', () => {
			cy.get('#lang').then(([el]: JQuery<LangElement>) => {
				expect(el.getLang()).to.be.equal('en',
					'uses the default language');
			});
		});
		it('changes the current language on #setLang call', () => {
			cy.get('#lang').then(([el]: JQuery<LangElement>) => {
				expect(el.getLang()).to.be.equal('en',
					'uses the default language');
				el.setLang('nl');
				expect(el.getLang()).to.be.equal('nl',
					'uses the new language');
			});
		});
		it('can set the language by setting prop_lang on the root', () => {
			cy.visit(`${URL_PREFIX}/root/i18n-manager.fixture.html`);
			cy.get('root-element')
				.then(([el]: JQuery<RootElement>) => {
					expect(el.getLang()).to.be.equal('test',
						'uses the globally set language');
				});
			getRootChildren().then((children) => {
				for (const child of children) {
					expect(child.getLang()).to.be.equal('test',
						'uses the globally set language');
				}
			});
		});
		it('will adapt to the global language when placed in a root', () => {
			cy.visit(`${URL_PREFIX}/root/i18n-manager.fixture.html`);
			cy.document().then((document) => {
				const el = document.createElement('test-element') as TestElement;
				cy.get('root-element')	
					.then(([rootNode]: JQuery<RootElement>) => {
						rootNode.root.appendChild(el);

						expect(el.getLang()).to.be.equal('test',
							'uses the globally set language');
					});
			});
		});
		after(() => {
			cy.visit(`${URL_PREFIX}/i18n-manager.fixture.html`, {
				onBeforeLoad(win) {
					delete win.fetch;
				}
			});
		});
	});

	context('Server Offline', () => {
		beforeEach(() => {
			cy.fixture('i18n/en.json').as('i18n-en');
			cy.fixture('i18n/nl.json').as('i18n-nl');

			cy.server({
				status: 404
			});
			cy.route('test/usage/fixtures/i18n/en.json', '@i18n-en').as('getLangEn');
			cy.route('test/usage/fixtures/i18n/nl.json', '@i18n-nl').as('getLangNl');

			cy.visit(`${URL_PREFIX}/standard/i18n-manager.fixture.html`, {
				onBeforeLoad(win) {
					delete win.fetch;
				}
			});
		});

		it('attempts to load the default language file', () => {
			cy.wait('@getLangEn');
		});
		it('uses placeholders', () => {
			cy.get('#lang')
				.shadowFind('#placeholdertest, #promiseTest, #returnerTest')
				.shadowContains('{{test}}');
			cy.get('#lang')
				.shadowFind('#nonexistent')
				.shadowContains('{{nonexistent}}');
			cy.get('#lang')
				.shadowFind('#returnerValues, #placeholderValues')
				.shadowContains('{{values}}');
		});
		it('can still change the language', () => {
			cy.get('#lang').then(([el]: JQuery<LangElement>) => {
				expect(el.getLang()).to.be.equal('en',
					'uses the default language');
				el.setLang('nl');
				expect(el.getLang()).to.be.equal('nl',
					'uses the new language');
				cy.wait('@getLangNl');
			});
		});
	});

	function setupServerStub() {
		cy.fixture('i18n/en.json').as('i18n-en');
		cy.fixture('i18n/nl.json').as('i18n-nl');

		cy.server({
			delay: 250
		});
		cy.route('test/usage/fixtures/i18n/en.json', '@i18n-en').as('getLangEn');
		cy.route('test/usage/fixtures/i18n/nl.json', '@i18n-nl').as('getLangNl');

		cy.visit(`${URL_PREFIX}/standard/i18n-manager.fixture.html`, {
			onBeforeLoad(win) {
				delete win.fetch;
			}
		});
	}

	context('Server Online', () => {
		context('From Template', () => {
			it('uses placeholders initially', () => {
				cy.get('#lang')
					.shadowFind('#placeholdertest, #promiseTest, #returnerTest')
					.shadowContains('{{test}}');
				cy.get('#lang')
					.shadowFind('#nonexistent')
					.shadowContains('{{nonexistent}}');
				cy.get('#lang')
					.shadowFind('#returnerValues, #placeholderValues')
					.shadowContains('{{values}}');
			});
			it('replaces the values after the XHR has loaded', () => {
				setupServerStub();

				cy.wait('@getLangEn');

				cy.get('#lang')
					.shadowFind('#placeholdertest, #promiseTest, #returnerTest')
					.shadowContains('english');
				cy.get('#lang')
					.shadowFind('#nonexistent')
					.shadowContains('not found');
				cy.get('#lang')
					.shadowFind('#returnerValues, #placeholderValues')
					.shadowContains('test 1 2 3 value');
			});
			it('replaces the values again if the language changes', () => {
				setupServerStub();

				cy.get('#lang').then(([el]: JQuery<LangElement>) => {
					el.setLang('nl');
					cy.wait('@getLangNl');
				});

				cy.get('#lang')
					.shadowFind('#placeholdertest, #promiseTest, #returnerTest')
					.shadowContains('dutch');
				cy.get('#lang')
					.shadowFind('#nonexistent')
					.shadowContains('not found');
				cy.get('#lang')
					.shadowFind('#returnerValues, #placeholderValues')
					.shadowContains('test 1 2 3 waarde');
			});
			it('applies messages as values', () => {
				setupServerStub();

				cy.wait('@getLangEn');

				cy.get('#lang')
					.shadowFind('#msgAsValue')
					.shadowContains('test english 2 english value');
			});
		});

		context('Methods', () => {
			it('returns a promise that resolves to the value when calling #__prom', () => {
				cy.get('#lang').then(([el]: JQuery<LangElement>) => {
					const prom = el.__prom('test');
					expectPromise(prom);
					prom.then((value) => {
						expect(value).to.be.equal('english',
							'promise resolves to message value');
					});
				});
			});
			it('returns whatever options.returner returns when calling #__', () => {
				cy.get('#lang').then(([el]: JQuery<LangElement>) => {
					const returned = el.__<(() => void) & {
						___marker: boolean;
					}>('test');
					
					expect(returned, 'marker exists')
						.to.have.property('___marker', true, 'marker exists');
				});
			});
			it('returns a promise that resolves to the value when calling ' +
				'WebComponentI18NManager.__prom', () => {
					cy.window().then((window: I18NTestWindow) => {
						const prom = window.WebComponentI18NManager.__prom('test');
						expectPromise(prom);
						prom.then((value) => {
							expect(value).to.be.equal('english',
								'promise resolves to message value');
						});
					});
				});	
			it('returns whatever options.returner returns when calling ' +
				'WebComponentI18NManager.__', () => {
					cy.window().then((window: I18NTestWindow) => {
						const returned = window.WebComponentI18NManager.__<(() => void) & {
							___marker: boolean;
						}>('test');
						
						expect(returned, 'marker exists')
							.to.have.property('___marker', true, 'marker exists');
					});
				});	
		});
	});
});
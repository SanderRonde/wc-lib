/// <reference types="Cypress" />

import { assertMethodExists, assertPropertyExists, assertPromise } from "../../../lib/assertions";
import { TestWindow, TestElement } from "../elements/test-element";
import { WebComponentI18NManager } from "../../../../../src/wclib";
import { LangElement } from "./elements/test-lang-element";

interface I18NTestWindow extends Window {
	WebComponentI18NManager: typeof WebComponentI18NManager;
}

context('I18n-Manager', function() {
	before(() => {
		cy.visit(
			'http://localhost:1251/test/usage/integration/classes/i18n-manager/i18n-manager.fixture.html', {
				onBeforeLoad(win) {
					delete win.fetch;
				}
			});
	});

	context('Properties/Methods', () => {
		it('exposes a #setLang method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'setLang');
			});
		});
		it('exposes a #getLang method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'getLang');
			});
		});

		it('exposes a #__prom method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, '__prom');
			});
		});
		it('exposes a #__ method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, '__');
			});
		});

		it('exposes a static #initTheme method', () => {
			cy.window().then((window: TestWindow) => {
				assertMethodExists(window.TestElement, 'initI18N');
			});
		});
		it('exposes a static #__prom method', () => {
			cy.window().then((window: TestWindow) => {
				assertMethodExists(window.TestElement, '__prom');
			});
		});
		it('exposes a static #__ method', () => {
			cy.window().then((window: TestWindow) => {
				assertMethodExists(window.TestElement, '__');
			});
		});
		it('exposes a static #langReady method', () => {
			cy.window().then((window: TestWindow) => {
				assertPropertyExists(window.TestElement, 'langReady');
			});
		});
	});

	context('Setting/Getting', () => {
		it('returns the currently active language on #getLang call', () => {
			cy.get('#lang').then(([el]: JQuery<LangElement>) => {
				assert.strictEqual(el.getLang(), 'en',
					'uses the default language');
			});
		});
		it('changes the current language on #setLang call', () => {
			cy.get('#lang').then(([el]: JQuery<LangElement>) => {
				assert.strictEqual(el.getLang(), 'en',
					'uses the default language');
				el.setLang('nl');
				assert.strictEqual(el.getLang(), 'nl',
					'uses the new language');
			});
		});

		after(() => {
			cy.visit('http://localhost:1251/test/usage/integration/classes/i18n-manager/i18n-manager.fixture.html', {
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

			cy.visit('http://localhost:1251/test/usage/integration/classes/i18n-manager/i18n-manager.fixture.html', {
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
				assert.strictEqual(el.getLang(), 'en',
					'uses the default language');
				el.setLang('nl');
				assert.strictEqual(el.getLang(), 'nl',
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

		cy.visit('http://localhost:1251/test/usage/integration/classes/i18n-manager/i18n-manager.fixture.html', {
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
					assertPromise(prom);
					prom.then((value) => {
						assert.strictEqual(value, 'english',
							'promise resolves to message value');
					});
				});
			});
			it('returns whatever options.returner returns when calling #__', () => {
				cy.get('#lang').then(([el]: JQuery<LangElement>) => {
					const returned = el.__<(() => void) & {
						___marker: boolean;
					}>('test');
					
					assert.property(returned, '___marker',	
						'marker exists');
					assert.isTrue((returned as any).___marker,	
						'marker is set to true');
				});
			});
			it('returns a promise that resolves to the value when calling ' +
				'WebComponentI18NManager.__prom', () => {
					cy.window().then((window: I18NTestWindow) => {
						const prom = window.WebComponentI18NManager.__prom('test');
						assertPromise(prom);
						prom.then((value) => {
							assert.strictEqual(value, 'english',
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
						
						assert.property(returned, '___marker',	
							'marker exists');
						assert.isTrue((returned as any).___marker,	
							'marker is set to true');
					});
				});	
		});
	});
});
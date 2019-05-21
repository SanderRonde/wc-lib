/// <reference types="Cypress" />

import { assertMethodExists } from "../../../lib/assertions.js";
import { ThemedElement, ThemedElementParent } from "./elements/themed-element.js";
import { TestElement } from "../elements/test-element";

export interface TestThemeManagerWindow extends Window {
	TestElement: typeof TestElement;
}

export interface TestTheme {
	color1: string;
	color2: string;
};

const usedThemes: {
	first: TestTheme;
	second: TestTheme;
	third: TestTheme;
} = {
	first: {
		color1: 'rgb(255, 0, 0)',
		color2: 'rgb(0, 255, 255)'
	},
	second: {
		color1: 'rgb(0, 255, 0)',
		color2: 'rgb(255, 0, 255)'
	},
	third: {
		color1: 'rgb(0, 0, 255)',
		color2: 'rgb(255, 255, 0)'
	}
};
const defaultTheme: keyof typeof usedThemes = 'first';

interface ThemeGlobalProps {
	theme: keyof typeof usedThemes;
}

function getDefaultThemedElements() {
	return cy.get('themed-element-parent').then((themeParent: JQuery<ThemedElementParent>) => {
		return getDeepThemedElements().then((deepThemed) => {
			return [...themeParent, ...deepThemed];
		});
	});
}

function getDeepThemedElements() {
	return cy.get('themed-element-parent')
		.shadowFind('themed-element').then((themedDeep: JQuery<ThemedElement>) => {
			return [...themedDeep];
		});
}

context('Listener', function() {
	before(() => {
		cy.server();
		cy.visit('http://localhost:1251/test/usage/integration/classes/theme-manager/theme-manager.fixture.html');
	});

	context('Properties/Methods', () => {
		it('exposes a `getThemeName` method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'getThemeName');
			});
		});
		it('exposes a `getTheme` method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'getTheme');
			});
		});
		it('exposes a static `initTheme` method', () => {
			cy.window().then((window: TestThemeManagerWindow) => {
				assertMethodExists(window.TestElement, 'initTheme');
			});
		});
		it('exposes a static `setDefaultTheme` method', () => {
			cy.window().then((window: TestThemeManagerWindow) => {
				assertMethodExists(window.TestElement, 'setDefaultTheme');
			});
		});
	});

	context('Theming', () => {
		context('Default', () => {
			it('uses the default theme name', () => {
				getDefaultThemedElements().then((elements) => {
					for (const element of elements) {
						assert.strictEqual(element.getThemeName(), defaultTheme,
							'default theme name is set');
					}
				});
			});
			it('uses the default theme', () => {
				getDefaultThemedElements().then((elements) => {
					for (const element of elements) {
						assert.deepEqual(element.getTheme(), usedThemes[defaultTheme],
							'default theme is set');
					}
				});
			});
			it('uses the different theme name when a global theme prop is set', () => {
				cy.get('themed-element[id=different]').then(([el]: JQuery<ThemedElement>) => {
					assert.strictEqual(el.getThemeName(), 'second',
						'uses different theme name');
				});
			});
			it('uses the different theme when a global theme prop is set', () => {
				cy.get('themed-element[id=different]').then(([el]: JQuery<ThemedElement>) => {
					assert.deepEqual(el.getTheme(), usedThemes['second'],
						'uses different theme');
				});
			});
			it('applies the theme', () => {
				getDeepThemedElements().then((elements) => {
					cy.window().then((window) => {
						for (const element of elements) {
							assert.strictEqual(
								window.getComputedStyle(element.$('.text')!)
									.color, usedThemes[defaultTheme].color1,
									'color1 is used');
							assert.strictEqual(
								window.getComputedStyle(element.$('.text2')!)
									.color, usedThemes[defaultTheme].color2,
									'color2 is used');
						}
					});
				});
			});
		});
		context('Changing', () => {
			beforeEach(() => {
				// Change theme to default
				cy.get('#default').then(([el]: JQuery<ThemedElementParent>) => {
					el.globalProps<ThemeGlobalProps>().set('theme', 'first');
				});
			});

			it('changes the theme across all elements in the scope', () => {
				getDefaultThemedElements().then((elements) => {
					for (const element of elements) {
						assert.strictEqual(element.getThemeName(), defaultTheme,
							'default theme name is set');
						assert.deepEqual(element.getTheme(), usedThemes[defaultTheme],
							'default theme is set');
					}
				});

				cy.get('#default').then(([el]: JQuery<ThemedElementParent>) => {
					el.globalProps<ThemeGlobalProps>().set('theme', 'second');
				});

				getDefaultThemedElements().then((elements) => {
					for (const element of elements) {
						assert.strictEqual(element.getThemeName(), 'second',
							'theme name is changed');
						assert.deepEqual(element.getTheme(), usedThemes['second'],
							'theme is changed');
					}
				});
			});
			it('applies the changed theme', () => {
				getDeepThemedElements().then((elements) => {
					for (const element of elements) {
						assert.strictEqual(
							window.getComputedStyle(element.$('.text')!)
								.color, usedThemes[defaultTheme].color1,
								'color1 is used');
						assert.strictEqual(
							window.getComputedStyle(element.$('.text2')!)
								.color, usedThemes[defaultTheme].color2,
								'color2 is used');
					}
				});

				cy.get('#default').then(([el]: JQuery<ThemedElementParent>) => {
					el.globalProps<ThemeGlobalProps>().set('theme', 'second');
				});

				getDeepThemedElements().then((elements) => {
					for (const element of elements) {
						assert.strictEqual(
							window.getComputedStyle(element.$('.text')!)
								.color, usedThemes['second'].color1,
								'color1 is used');
						assert.strictEqual(
							window.getComputedStyle(element.$('.text2')!)
								.color, usedThemes['second'].color2,
								'color2 is used');
					}
				});
			});
			it('applies the theme using adoptedStyleSheets', () => {
				// The #separate element is not part of the hierarchy
				// and as such won't receive the change in theme.
				// The only way for its styles to change is for an
				// adoptedStylesheet to change the global styles
				// for the themed-element element
				getDeepThemedElements().then((elements) => {
					cy.get('#separate').then((separate: JQuery<ThemedElement>) => {
						for (const element of [...elements, ...separate]) {
							assert.strictEqual(
								window.getComputedStyle(element.$('.text')!)
									.color, usedThemes[defaultTheme].color1,
									'color1 is used');
							assert.strictEqual(
								window.getComputedStyle(element.$('.text2')!)
									.color, usedThemes[defaultTheme].color2,
									'color2 is used');
						}
					});
				});

				cy.get('#default').then(([el]: JQuery<ThemedElementParent>) => {
					el.globalProps<ThemeGlobalProps>().set('theme', 'second');
				});

				getDeepThemedElements().then((elements) => {
					cy.get('#separate').then((separate: JQuery<ThemedElement>) => {
						for (const element of [...elements, ...separate]) {
							assert.strictEqual(
								window.getComputedStyle(element.$('.text')!)
									.color, usedThemes['second'].color1,
									'color1 is used');
							assert.strictEqual(
								window.getComputedStyle(element.$('.text2')!)
									.color, usedThemes['second'].color2,
									'color2 is used');
						}
					});
				});
			});
		});
	});
});
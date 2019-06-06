/// <reference types="Cypress" />

import { ThemedElement, ThemedElementParent } from "./elements/themed-element.js";
import { TestElement, TestWindow } from "../elements/test-element";
import { expectMethodExists } from "../../../lib/assertions.js";
import { getFixture } from "../../../lib/testing.js";

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

context('Theme Manager', function() {
	before(() => {
		cy.visit(getFixture('theme-manager'));
	});

	context('Properties/Methods', () => {
		it('exposes a #getThemeName method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'getThemeName');
			});
		});
		it('exposes a #getTheme method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'getTheme');
			});
		});
		it('exposes a static #initTheme method', () => {
			cy.window().then((window: TestWindow) => {
				expectMethodExists(window.TestElement, 'initTheme');
			});
		});
		it('exposes a static #setDefaultTheme method', () => {
			cy.window().then((window: TestWindow) => {
				expectMethodExists(window.TestElement, 'setDefaultTheme');
			});
		});
	});

	context('Theming', () => {
		context('Default', () => {
			it('uses the default theme name', () => {
				getDefaultThemedElements().then((elements) => {
					for (const element of elements) {
						expect(element.getThemeName()).to.be.equal(defaultTheme,
							'default theme name is set');
					}
				});
			});
			it('uses the default theme', () => {
				getDefaultThemedElements().then((elements) => {
					for (const element of elements) {
						expect(element.getTheme()).to.be.deep.equal(usedThemes[defaultTheme],
							'default theme is set');
					}
				});
			});
			it('uses the different theme name when a global theme prop is set', () => {
				cy.get('themed-element[id=different]').then(([el]: JQuery<ThemedElement>) => {
					expect(el.getThemeName()).to.be.equal('second',
						'uses different theme name');
				});
			});
			it('uses the different theme when a global theme prop is set', () => {
				cy.get('themed-element[id=different]').then(([el]: JQuery<ThemedElement>) => {
					expect(el.getTheme()).to.be.deep.equal(usedThemes['second'],
						'uses different theme');
				});
			});
			it('applies the theme', () => {
				getDeepThemedElements().then((elements) => {
					cy.window().then((window) => {
						for (const element of elements) {
							expect(window.getComputedStyle(element.$('.text')!))
								.to.have.property('color')
								.to.be.equal(usedThemes[defaultTheme].color1,
									'color1 is used');
							expect(window.getComputedStyle(element.$('.text2')!))
								.to.have.property('color')
								.to.be.equal(usedThemes[defaultTheme].color2,
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
						expect(element.getThemeName()).to.be.equal(defaultTheme,
							'default theme name is set');
						expect(element.getTheme()).to.be.deep.equal(usedThemes[defaultTheme],
							'default theme is set');
					}
				});

				cy.get('#default').then(([el]: JQuery<ThemedElementParent>) => {
					el.globalProps<ThemeGlobalProps>().set('theme', 'second');
				});

				getDefaultThemedElements().then((elements) => {
					for (const element of elements) {
						expect(element.getThemeName()).to.be.equal('second',
							'default theme name is set');
						expect(element.getTheme()).to.be.deep.equal(usedThemes['second'],
							'default theme is set');
					}
				});
			});
			it('applies the changed theme', () => {
				getDeepThemedElements().then((elements) => {
					for (const element of elements) {
						expect(window.getComputedStyle(element.$('.text')!))
							.to.have.property('color')
							.to.be.equal(usedThemes[defaultTheme].color1,
								'color1 is used');
						expect(window.getComputedStyle(element.$('.text2')!))
							.to.have.property('color')
							.to.be.equal(usedThemes[defaultTheme].color2,
								'color2 is used');
					}
				});

				cy.get('#default').then(([el]: JQuery<ThemedElementParent>) => {
					el.globalProps<ThemeGlobalProps>().set('theme', 'second');
				});

				getDeepThemedElements().then((elements) => {
					for (const element of elements) {
						expect(window.getComputedStyle(element.$('.text')!))
							.to.have.property('color')
							.to.be.equal(usedThemes['second'].color1,
								'color1 is used');
						expect(window.getComputedStyle(element.$('.text2')!))
							.to.have.property('color')
							.to.be.equal(usedThemes['second'].color2,
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

				// Check for support
				cy.window().then((window) => {
					try { 
						new (window as any).CSSStyleSheet(); 
						return true; 
					} catch(e) { 
						return false;
					}
				}).then((supportsAdoptedStylesheets) => {
					if (!supportsAdoptedStylesheets) return;

					getDeepThemedElements().then((elements) => {
						cy.get('#separate').then((separate: JQuery<ThemedElement>) => {
							for (const element of [...elements, ...separate]) {
								expect(window.getComputedStyle(element.$('.text')!))
									.to.have.property('color')
									.to.be.equal(usedThemes[defaultTheme].color1,
										'color1 is used');
								expect(window.getComputedStyle(element.$('.text2')!))
									.to.have.property('color')
									.to.be.equal(usedThemes[defaultTheme].color2,
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
								expect(window.getComputedStyle(element.$('.text')!))
									.to.have.property('color')
									.to.be.equal(usedThemes['second'].color1,
										'color1 is used');
								expect(window.getComputedStyle(element.$('.text2')!))
									.to.have.property('color')
									.to.be.equal(usedThemes['second'].color2,
										'color2 is used');
							}
						});
					});
				});
			});
		});
	});
});
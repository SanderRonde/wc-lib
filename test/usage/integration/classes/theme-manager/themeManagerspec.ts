import {
    ThemedElement,
    ThemedElementParent,
} from './elements/themed-element.js';
import { ThemeManagerWindow } from './fixtures/invalid/theme-manager.fixture.js';
import { TestElement, TestWindow } from '../elements/test-element';
import { expectMethodExists } from '../../../lib/assertions.js';
import { SLOW } from '../../../lib/timing.js';
export interface TestTheme {
    color1: string;
    color2: string;
}
const usedThemes: {
    first: TestTheme;
    second: TestTheme;
    third: TestTheme;
} = {
    first: {
        color1: 'rgb(255, 0, 0)',
        color2: 'rgb(0, 255, 255)',
    },
    second: {
        color1: 'rgb(0, 255, 0)',
        color2: 'rgb(255, 0, 255)',
    },
    third: {
        color1: 'rgb(0, 0, 255)',
        color2: 'rgb(255, 255, 0)',
    },
};
const defaultTheme: keyof typeof usedThemes = 'first';
export interface ThemeGlobalProps {
    theme: keyof typeof usedThemes;
}
function getDefaultThemedElements() {
    return cy
        .get('themed-element-parent')
        .then((themeParent: JQuery<ThemedElementParent>) => {
            return getDeepThemedElements().then((deepThemed) => {
                return [...themeParent, ...deepThemed];
            });
        });
}
function getDeepThemedElements() {
    return cy
        .get('themed-element-parent')
        .shadowFind('themed-element')
        .then((themedDeep: JQuery<ThemedElement>) => {
            return [...themedDeep];
        });
}
export function themeManagerSpec(
    {
        invalidFixture,
        separateFixture,
        standardFixture,
    }: {
        standardFixture: string;
        invalidFixture: string;
        separateFixture: string;
    },
    globalProps: boolean = true
) {
    context('Theme Manager', function() {
        this.slow(SLOW);
        before(() => {
            cy.visit(standardFixture);
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
            it('exposes a #setTheme method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'setTheme');
                });
            });
            it('exposes a #getRenderArgs method', () => {
                cy.get('#test').then(([el]: JQuery<TestElement>) => {
                    expectMethodExists(el, 'getRenderArgs');
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
            it('returns the current theme from #getRenderArgs', () => {
                getDefaultThemedElements().then((elements) => {
                    for (const element of elements) {
                        expect(element.getRenderArgs(0)).to.have.property(
                            'theme',
                            (element as any).getTheme()
                        );
                    }
                });
            });
        });
        context('Theming', () => {
            context('Default', () => {
                it('uses the default theme name', () => {
                    getDefaultThemedElements().then((elements) => {
                        for (const element of elements) {
                            expect((element as any).getThemeName()).to.be.equal(
                                defaultTheme,
                                'default theme name is set'
                            );
                        }
                    });
                });
                it('uses the default theme', () => {
                    getDefaultThemedElements().then((elements) => {
                        for (const element of elements) {
                            expect(
                                (element as any).getTheme()
                            ).to.be.deep.equal(
                                usedThemes[defaultTheme],
                                'default theme is set'
                            );
                        }
                    });
                });
                it('uses the default theme when set separately', () => {
                    cy.visit(separateFixture);
                    getDefaultThemedElements().then((elements) => {
                        for (const element of elements) {
                            expect(
                                (element as any).getTheme()
                            ).to.be.deep.equal(
                                usedThemes[defaultTheme],
                                'default theme is set'
                            );
                        }
                    });
                });
                it('returns noTheme if no valid theme was passed', () => {
                    cy.visit(invalidFixture);
                    cy.window().then((window: ThemeManagerWindow) => {
                        getDefaultThemedElements().then((elements) => {
                            for (const element of elements) {
                                expect(
                                    (element as any).getTheme()
                                ).to.be.deep.equal(
                                    window.noTheme,
                                    'returns noTheme when invalid theme is set'
                                );
                            }
                        });
                    });
                });
                if (globalProps) {
                    it('uses the different theme name when a global theme prop is set', () => {
                        cy.visit(standardFixture);
                        cy.get('themed-element[id=different]').then(
                            ([el]: JQuery<ThemedElement>) => {
                                expect(el.getThemeName()).to.be.equal(
                                    'second',
                                    'uses different theme name'
                                );
                            }
                        );
                    });
                    it('uses the different theme when a global theme prop is set', () => {
                        cy.get('themed-element[id=different]').then(
                            ([el]: JQuery<ThemedElement>) => {
                                expect(el.getTheme()).to.be.deep.equal(
                                    usedThemes['second'],
                                    'uses different theme'
                                );
                            }
                        );
                    });
                }
                it('applies the theme', () => {
                    cy.visit(standardFixture);
                    cy.wait(250).then(() => {
                        getDeepThemedElements().then((elements) => {
                            cy.window().then((window) => {
                                for (const element of elements) {
                                    expect(
                                        window.getComputedStyle(
                                            element.$('.text')!
                                        )
                                    )
                                        .to.have.property('color')
                                        .to.be.equal(
                                            usedThemes[defaultTheme].color1,
                                            'color1 is used'
                                        );
                                    expect(
                                        window.getComputedStyle(
                                            element.$('.text2')!
                                        )
                                    )
                                        .to.have.property('color')
                                        .to.be.equal(
                                            usedThemes[defaultTheme].color2,
                                            'color2 is used'
                                        );
                                }
                            });
                        });
                    });
                });
            });
            function genChangeTests(
                ...tests: {
                    name: string;
                    test: (doChange: () => Cypress.Chainable) => any;
                }[]
            ) {
                if (globalProps) {
                    context('global prop change', () => {
                        beforeEach(() => {
                            // Change theme to default
                            cy.get('#default').then(
                                ([el]: JQuery<ThemedElementParent>) => {
                                    el.setTheme('first');
                                }
                            );
                        });
                        tests.forEach(({ name, test }) => {
                            it(name, () => {
                                test(() => {
                                    return cy
                                        .get('#default')
                                        .then(
                                            ([el]: JQuery<
                                                ThemedElementParent
                                            >) => {
                                                el.globalProps().set(
                                                    'theme',
                                                    'second'
                                                );
                                            }
                                        );
                                });
                            });
                        });
                    });
                }
                context('#setTheme', () => {
                    beforeEach(() => {
                        // Change theme to default
                        cy.get('#default').then(
                            ([el]: JQuery<ThemedElementParent>) => {
                                el.setTheme('first');
                            }
                        );
                    });
                    tests.forEach(({ name, test }) => {
                        it(name, () => {
                            test(() => {
                                return cy
                                    .get('#default')
                                    .then(
                                        ([el]: JQuery<ThemedElementParent>) => {
                                            el.setTheme('second');
                                        }
                                    );
                            });
                        });
                    });
                });
            }
            context('Changing', () => {
                beforeEach(() => {
                    cy.visit(standardFixture);
                    cy.wait(250);
                });
                genChangeTests(
                    {
                        name:
                            'changes the theme across all elements in the scope',
                        test: (doChange) => {
                            getDefaultThemedElements().then((elements) => {
                                for (const element of elements) {
                                    expect(
                                        (element as any).getThemeName()
                                    ).to.be.equal(
                                        defaultTheme,
                                        'default theme name is set'
                                    );
                                    expect(
                                        (element as any).getTheme()
                                    ).to.be.deep.equal(
                                        usedThemes[defaultTheme],
                                        'default theme is set'
                                    );
                                }

                                doChange().then(() => {
                                    getDefaultThemedElements().then(
                                        (elements) => {
                                            for (const element of elements) {
                                                expect(
                                                    (element as any).getThemeName()
                                                ).to.be.equal(
                                                    'second',
                                                    'default theme name is set'
                                                );
                                                expect(
                                                    (element as any).getTheme()
                                                ).to.be.deep.equal(
                                                    usedThemes['second'],
                                                    'default theme is set'
                                                );
                                            }
                                        }
                                    );
                                });
                            });

                            return undefined;
                        },
                    },
                    {
                        name: 'applies the changed theme',
                        test: (doChange) => {
                            getDeepThemedElements().then((elements) => {
                                for (const element of elements) {
                                    expect(
                                        window.getComputedStyle(
                                            element.$('.text')!
                                        ).color
                                    ).to.be.equal(
                                        usedThemes[defaultTheme].color1,
                                        'color1 is used'
                                    );
                                    expect(
                                        window.getComputedStyle(
                                            element.$('.text2')!
                                        ).color
                                    ).to.be.equal(
                                        usedThemes[defaultTheme].color2,
                                        'color2 is used'
                                    );
                                }

                                doChange().then(() => {
                                    getDeepThemedElements().then((elements) => {
                                        for (const element of elements) {
                                            expect(
                                                window.getComputedStyle(
                                                    element.$('.text')!
                                                ).color
                                            ).to.be.equal(
                                                usedThemes['second'].color1,
                                                'color1 is used'
                                            );
                                            expect(
                                                window.getComputedStyle(
                                                    element.$('.text2')!
                                                ).color
                                            ).to.be.equal(
                                                usedThemes['second'].color2,
                                                'color2 is used'
                                            );
                                        }
                                    });
                                });
                            });
                            return undefined;
                        },
                    },
                    {
                        name: 'applies the theme using adoptedStyleSheets',
                        test: (doChange) => {
                            // The #separate element is not part of the hierarchy
                            // and as such won't receive the change in theme.
                            // The only way for its styles to change is for an
                            // adoptedStylesheet to change the global styles
                            // for the themed-element element
                            // Check for support
                            cy.window()
                                .then((window) => {
                                    try {
                                        new (window as any).CSSStyleSheet();
                                        return true;
                                    } catch (e) {
                                        return false;
                                    }
                                })
                                .then((supportsAdoptedStylesheets) => {
                                    if (!supportsAdoptedStylesheets) return;
                                    getDeepThemedElements().then((elements) => {
                                        cy.get('#separate').then(
                                            (
                                                separate: JQuery<ThemedElement>
                                            ) => {
                                                for (const element of [
                                                    ...elements,
                                                    ...separate,
                                                ]) {
                                                    expect(
                                                        window.getComputedStyle(
                                                            element.$('.text')!
                                                        ).color
                                                    ).to.be.equal(
                                                        usedThemes[defaultTheme]
                                                            .color1,
                                                        'color1 is used'
                                                    );
                                                    expect(
                                                        window.getComputedStyle(
                                                            element.$('.text2')!
                                                        ).color
                                                    ).to.be.equal(
                                                        usedThemes[defaultTheme]
                                                            .color2,
                                                        'color2 is used'
                                                    );
                                                }

                                                doChange().then(() => {
                                                    getDeepThemedElements().then(
                                                        (elements) => {
                                                            cy.get(
                                                                '#separate'
                                                            ).then(
                                                                (
                                                                    separate: JQuery<
                                                                        ThemedElement
                                                                    >
                                                                ) => {
                                                                    for (const element of [
                                                                        ...elements,
                                                                        ...separate,
                                                                    ]) {
                                                                        expect(
                                                                            window.getComputedStyle(
                                                                                element.$(
                                                                                    '.text'
                                                                                )!
                                                                            )
                                                                                .color
                                                                        ).to.be.equal(
                                                                            usedThemes[
                                                                                'second'
                                                                            ]
                                                                                .color1,
                                                                            'color1 is used'
                                                                        );
                                                                        expect(
                                                                            window.getComputedStyle(
                                                                                element.$(
                                                                                    '.text2'
                                                                                )!
                                                                            )
                                                                                .color
                                                                        ).to.be.equal(
                                                                            usedThemes[
                                                                                'second'
                                                                            ]
                                                                                .color2,
                                                                            'color2 is used'
                                                                        );
                                                                    }
                                                                }
                                                            );
                                                        }
                                                    );
                                                });
                                            }
                                        );
                                    });
                                });
                            return undefined;
                        },
                    }
                );
                context('No constructed stylesheets', () => {
                    beforeEach(() => {
                        cy.visit(standardFixture, {
                            onBeforeLoad(win) {
                                (win as any).CSSStyleSheet = class {
                                    constructor() {
                                        throw new Error("doesn't exist");
                                    }
                                };
                            },
                        });
                        cy.wait(250);
                        cy.get('#default').then(
                            ([el]: JQuery<ThemedElementParent>) => {
                                el.setTheme('first');
                            }
                        );
                    });

                    it('applies the theme without adopted stylesheets', () => {
                        getDeepThemedElements().then((elements) => {
                            for (const element of elements) {
                                expect(
                                    window.getComputedStyle(element.$('.text')!)
                                        .color
                                ).to.be.equal(
                                    usedThemes[defaultTheme].color1,
                                    'color1 is used'
                                );
                                expect(
                                    window.getComputedStyle(
                                        element.$('.text2')!
                                    ).color
                                ).to.be.equal(
                                    usedThemes[defaultTheme].color2,
                                    'color2 is used'
                                );
                            }

                            cy.get('#default')
                                .then(([el]: JQuery<ThemedElementParent>) => {
                                    el.setTheme('second');
                                    return cy.wait(100);
                                })
                                .then(() => {
                                    getDeepThemedElements().then((elements) => {
                                        for (const element of elements) {
                                            expect(
                                                window.getComputedStyle(
                                                    element.$('.text')!
                                                ).color
                                            ).to.be.equal(
                                                usedThemes['second'].color1,
                                                'color1 is used'
                                            );
                                            expect(
                                                window.getComputedStyle(
                                                    element.$('.text2')!
                                                ).color
                                            ).to.be.equal(
                                                usedThemes['second'].color2,
                                                'color2 is used'
                                            );
                                        }
                                    });
                                });
                        });
                        return undefined;
                    });
                });
            });
        });
    });
}

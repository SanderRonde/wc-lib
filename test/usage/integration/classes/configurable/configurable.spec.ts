/// <reference types="Cypress" />

import {
    TestConfiguredWindow,
    ConfiguredElement,
} from './elements/configured-element.js';
import {
    TestExtendedWindow,
    ExtendedElement,
} from './elements/extended-element.js';
import { expectPropertyExists } from '../../../lib/assertions.js';
import { getClassFixture } from '../../../lib/testing.js';
import { TestMixinsWindow } from './elements/mixins.js';
import { SLOW } from '../../../lib/timing.js';

context('Configurable Component', function() {
    this.slow(SLOW);
    before(() => {
        cy.visit(getClassFixture('configurable'));
    });

    context('Correct Configuration', () => {
        context('@config', () => {
            it('creates and mounts the element correctly', () => {
                cy.get('#configured').then(
                    ([el]: JQuery<ConfiguredElement>) => {
                        cy.wrap(el)
                            .should('have.property', 'isMounted')
                            .and('be.equal', true);
                    }
                );
            });

            it('sets the .self property to the constructor class', () => {
                cy.get('#configured').then(
                    ([el]: JQuery<ConfiguredElement>) => {
                        cy.window().then((window: TestConfiguredWindow) => {
                            expectPropertyExists(el, 'self');
                            expect(el).to.have.property('self');
                            expect(el.self).to.be.equal(
                                window.configured.element
                            );
                        });
                    }
                );
            });
            it("sets the static .is property to the config's .is value", () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expectPropertyExists(window.configured.element, 'is');
                    expect(window.configured.element).to.have.property(
                        'is',
                        'configured-element'
                    );
                });
            });
            it("sets the static .html property to the config's .html value", () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expectPropertyExists(window.configured.element, 'html');
                    expect(window.configured.element).to.have.property(
                        'html',
                        window.configured.HTMLTemplate
                    );
                });
            });
            it("sets the static .css property to the config's .css value", () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expectPropertyExists(window.configured.element, 'css');
                    expect(window.configured.element).to.have.property(
                        'css',
                        window.configured.CSSTemplate
                    );
                });
            });
            it("sets the static .dependencies property to the config's .dependencies value", () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expectPropertyExists(
                        window.configured.element,
                        'dependencies'
                    );
                    expect(window.configured.element).to.have.property(
                        'dependencies'
                    );
                    expect(
                        window.configured.element.dependencies
                    ).to.have.members(window.configured.dependencies);
                });
            });
            it("joins the parent's dependencies with the added dependencies", () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    const classInstance =
                        window.configured.dependencyInherit.class;
                    const {
                        added,
                        parent,
                    } = window.configured.dependencyInherit;
                    expect(classInstance).to.have.property('dependencies');
                    expect(classInstance.dependencies).to.have.members([
                        ...parent,
                        ...added,
                    ]);
                });
            });
            it('filters out duplicate dependencies', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    const classInstance = window.configured.duplicates.class;
                    const { dependencies } = window.configured.duplicates;
                    expect(classInstance).to.have.property('dependencies');
                    expect(classInstance.dependencies).to.have.members(
                        dependencies
                    );
                    expect(classInstance.dependencies).to.have.length(
                        dependencies.length
                    );
                });
            });
            it("sets the static .mixins property to the config's .mixins value", () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expectPropertyExists(window.configured.element, 'mixins');
                    expect(window.configured.element).to.have.property(
                        'mixins',
                        window.configured.mixins
                    );
                });
            });
        });
        context('Extended WebComponent', () => {
            it('creates and mounts the element correctly', () => {
                cy.get('#extended').then(([el]: JQuery<ConfiguredElement>) => {
                    cy.wrap(el)
                        .should('have.property', 'isMounted')
                        .and('be.equal', true);
                });
            });

            it('sets the .self property to the constructor class', () => {
                cy.get('#extended').then(([el]: JQuery<ExtendedElement>) => {
                    cy.window().then((window: TestExtendedWindow) => {
                        expectPropertyExists(el, 'self');
                        expect(el).to.have.property('self');
                        expect(el.self).to.be.equal(window.extended.element);
                    });
                });
            });
            it("sets the static .is property to the config's .is value", () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expectPropertyExists(window.extended.element, 'is');
                    expect(window.extended.element).to.have.property(
                        'is',
                        'extended-element'
                    );
                });
            });
            it("sets the static .html property to the config's .html value", () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expectPropertyExists(window.extended.element, 'html');
                    expect(window.extended.element).to.have.property(
                        'html',
                        window.extended.HTMLTemplate
                    );
                });
            });
            it("sets the static .css property to the config's .css value", () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expectPropertyExists(window.extended.element, 'css');
                    expect(window.extended.element).to.have.property(
                        'css',
                        window.extended.CSSTemplate
                    );
                });
            });
            it("sets the static .dependencies property to the config's .dependencies value", () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expectPropertyExists(
                        window.extended.element,
                        'dependencies'
                    );
                    expect(window.extended.element).to.have.property(
                        'dependencies',
                        window.extended.dependencies
                    );
                });
            });
            it("sets the static .mixins property to the config's .mixins value", () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expectPropertyExists(window.extended.element, 'mixins');
                    expect(window.extended.element).to.have.property(
                        'mixins',
                        window.extended.mixins
                    );
                });
            });
        });
    });
    context('Missing properties', () => {
        context('@config', () => {
            it('throws an error when .is is missing', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.MissingIs.define(true);
                    }).to.throw('Component is missing static is property');
                });
            });
            it('throws an error when .is is not a string', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.NonStringIs.define(true);
                    }).to.throw('Component name is not a string');
                });
            });
            it('does throw WCLibError if development mode is false', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.NonStringIs.define(
                            false
                        );
                    }).to.not.throw('Component name is not a string');
                });
            });
            it('throws an error when .is contains no dash', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.NoDashIs.define(true);
                    }).to.throw(
                        'Webcomponent names need to contain a dash "-"'
                    );
                });
            });
            it('throws an error when .is contains an uppercase letter', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.UppercaseIs.define(true);
                    }).to.throw(
                        'Webcomponent names can not contain uppercase ASCII characters.'
                    );
                });
            });
            it('throws an error when .is starts with a number', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.NumberIs.define(true);
                    }).to.throw(
                        'Webcomponent names can not start with a digit.'
                    );
                });
            });
            it('throws an error when .is starts with a dash/hyphen', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.DashIs.define(true);
                    }).to.throw(
                        'Webcomponent names can not start with a hyphen.'
                    );
                });
            });
            it('throws an error when .html is missing', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.MissingHTML.define(true);
                    }).to.throw(
                        'Component is missing static html property (set to null to suppress)'
                    );
                });
            });
            it('does not throw an error if .html is set to null', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.UnsetHTML.define(true);
                    }).to.not.throw;
                });
            });
            it('does not throw an error if .html is set to a template that returns null', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.UnsetHTML2.define(true);
                    }).to.not.throw;
                });
            });
            it('throws an error when .html is set to a non-template', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.NonTemplateHTML.define(
                            true
                        );
                    }).to.throw(
                        "Component's html template should be an " +
                            'instance of the TemplateFn class'
                    );
                });
            });
            it('throws an error when .html is falsy', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.FalsyTemplateHTML.define(
                            true
                        );
                    }).to.throw(
                        "Component's html template should be an " +
                            'instance of the TemplateFn class'
                    );
                });
            });
            it('does not throw an error if template is a templateFn-like', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.TemplateLikeHTML.define(
                            true
                        );
                    }).to.not.throw;
                });
            });
            it('does not throw an error if .css is missing', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.MissingCSS.define(true);
                    }).to.not.throw;
                });
            });
            it('throws an error if .css is a non-template', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.NonTemplateCSS.define(
                            true
                        );
                    }).to.throw(
                        "Component's css template should be an instance of " +
                            'the TemplateFn class or an array of them'
                    );
                });
            });
            it('throws an error when .css is an array of non-templates', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.WrongArrayCSS.define(
                            true
                        );
                    }).to.throw(
                        "Component's css template should be an instance of " +
                            'the TemplateFn class or an array of them'
                    );
                });
            });
            it('throws an error when .css is an array falsy values', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.FalsyArrayCSS.define(
                            true
                        );
                    }).to.throw(
                        "Component's css template should be an instance of " +
                            'the TemplateFn class or an array of them'
                    );
                });
            });
            it('does not throw an error when .css is set to an array of templates', () => {
                cy.window().then((window: TestConfiguredWindow) => {
                    expect(() => {
                        window.configured.wrongClasses.ArrayCSS.define(true);
                    }).to.not.throw;
                });
            });
        });
        context('Extended WebComponent', () => {
            it('throws an error when .is is missing', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.MissingIs.define(true);
                    }).to.throw('Component is missing static is property');
                });
            });
            it('throws an error when .is is not a string', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.NonStringIs.define(true);
                    }).to.throw('Component name is not a string');
                });
            });
            it('does throw WCLibError if development mode is false', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.NonStringIs.define(false);
                    }).to.not.throw('Component name is not a string');
                });
            });
            it('throws an error when .is contains no dash', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.NoDashIs.define(true);
                    }).to.throw(
                        'Webcomponent names need to contain a dash "-"'
                    );
                });
            });
            it('throws an error when .is contains an uppercase letter', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.UppercaseIs.define(true);
                    }).to.throw(
                        'Webcomponent names can not contain uppercase ASCII characters.'
                    );
                });
            });
            it('throws an error when .is starts with a number', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.NumberIs.define(true);
                    }).to.throw(
                        'Webcomponent names can not start with a digit.'
                    );
                });
            });
            it('throws an error when .is starts with a dash/hyphen', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.DashIs.define(true);
                    }).to.throw(
                        'Webcomponent names can not start with a hyphen.'
                    );
                });
            });
            it('throws an error when .html is missing', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.MissingHTML.define(true);
                    }).to.throw(
                        'Component is missing static html property (set to null to suppress)'
                    );
                });
            });
            it('does not throw an error if .html is set to null', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.UnsetHTML.define(true);
                    }).to.not.throw;
                });
            });
            it('does not throw an error if .html is set to a template that returns null', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.UnsetHTML2.define(true);
                    }).to.not.throw;
                });
            });
            it('throws an error when .html is set to a non-template', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.NonTemplateHTML.define(
                            true
                        );
                    }).to.throw(
                        "Component's html template should be an " +
                            'instance of the TemplateFn class'
                    );
                });
            });
            it('throws an error when .html is falsy', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.FalsyTemplateHTML.define(
                            true
                        );
                    }).to.throw(
                        "Component's html template should be an " +
                            'instance of the TemplateFn class'
                    );
                });
            });
            it('does not throw an error if template is a templateFn-like', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.TemplateLikeHTML.define(
                            true
                        );
                    }).to.not.throw;
                });
            });
            it('does not throw an error if .css is missing', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.MissingCSS.define(true);
                    }).to.not.throw;
                });
            });
            it('throws an error if .css is a non-template', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.NonTemplateCSS.define(
                            true
                        );
                    }).to.throw(
                        "Component's css template should be an instance of " +
                            'the TemplateFn class or an array of them'
                    );
                });
            });
            it('throws an error when .css is an array of non-templates', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.WrongArrayCSS.define(true);
                    }).to.throw(
                        "Component's css template should be an instance of " +
                            'the TemplateFn class or an array of them'
                    );
                });
            });
            it('does not throw an error when .css is set to an array of templates', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.ArrayCSS.define(true);
                    }).to.not.throw;
                });
            });
            it('throws an error when .css is an array falsy values', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    expect(() => {
                        window.extended.wrongClasses.FalsyArrayCSS.define(true);
                    }).to.throw(
                        "Component's css template should be an instance of " +
                            'the TemplateFn class or an array of them'
                    );
                });
            });
            it('throws an error if the .self property is missing', () => {
                cy.window().then((window: TestExtendedWindow) => {
                    cy.document().then((document) => {
                        const onConnect = cy.stub(
                            window.extended.wrongClasses.MissingSelf,
                            'onConnected',
                            (superFn) => {
                                expect(superFn).to.throw(
                                    'Missing .self property on component'
                                );
                            }
                        );

                        const el = document.createElement('missing-self');
                        document.body.appendChild(el);

                        cy.wrap(onConnect).should('be.calledOnce');
                    });
                });
            });
        });
    });
    context('Mixins', () => {
        it('can extend the extendable mixin base', () => {
            cy.get('#manualMixin').then(([el]: JQuery<HTMLElement>) => {
                cy.wrap(el)
                    .should('have.property', 'isMounted')
                    .and('be.equal', true);
                expect(el).to.have.property('t', 1, 'outer class is used');
                expect(el).to.have.property('z', 1, 'mixin is used');
            });
        });
        it('can create a basic component when not passing any mixins', () => {
            cy.get('#basicMixin').then(([el]: JQuery<HTMLElement>) => {
                cy.wrap(el)
                    .should('have.property', 'isMounted')
                    .and('be.equal', true);
                expect(el).to.have.property('z', 1, 'outer class is used');
            });
        });
        it('can merge behavior with a single mixin', () => {
            cy.get('#singleMixin').then(([el]: JQuery<HTMLElement>) => {
                cy.wrap(el)
                    .should('have.property', 'isMounted')
                    .and('be.equal', true);
                expect(el).to.have.property('z', 1, 'outer class is used');
                expect(el).to.have.property('a', 1, 'mixin is used');
            });
        });
        it('can merge behavior with two mixins', () => {
            cy.get('#doubleMixin').then(([el]: JQuery<HTMLElement>) => {
                cy.wrap(el)
                    .should('have.property', 'isMounted')
                    .and('be.equal', true);
                expect(el).to.have.property('z', 1, 'outer class is used');
                expect(el).to.have.property('a', 1, 'mixin is used');
                expect(el).to.have.property('b', 1, 'mixin is used');
            });
        });
        it('can merge behavior with five mixins', () => {
            cy.get('#multiMixin').then(([el]: JQuery<HTMLElement>) => {
                cy.wrap(el)
                    .should('have.property', 'isMounted')
                    .and('be.equal', true);
                expect(el).to.have.property('z', 1, 'outer class is used');
                expect(el).to.have.property('a', 1, 'mixin is used');
                expect(el).to.have.property('b', 1, 'mixin is used');
                expect(el).to.have.property('c', 1, 'mixin is used');
                expect(el).to.have.property('d', 1, 'mixin is used');
                expect(el).to.have.property('e', 1, 'mixin is used');
            });
        });
        it('can extend joined mixins', () => {
            cy.get('#splitMixin').then(([el]: JQuery<HTMLElement>) => {
                cy.wrap(el)
                    .should('have.property', 'isMounted')
                    .and('be.equal', true);
                expect(el).to.have.property('z', 1, 'outer class is used');
                expect(el).to.have.property('a', 1, 'mixin is used');
                expect(el).to.have.property('b', 1, 'mixin is used');
                expect(el).to.have.property('c', 1, 'mixin is used');
                expect(el).to.have.property('d', 1, 'mixin is used');
                expect(el).to.have.property('e', 1, 'mixin is used');
            });
        });
        it('throws an error if @config is not called on a mixin', () => {
            cy.window().then((window: TestMixinsWindow) => {
                expect(() => {
                    window.mixins.UnConfiguredMixin.define(true);
                }).to.throw('Component is missing static is property');
            });
        });
        it('throws an error if an extendable component is missing properties', () => {
            cy.window().then((window: TestMixinsWindow) => {
                expect(() => {
                    window.mixins.UnextendedMixin.define(true);
                }).to.throw('Component is missing static is property');
            });
        });
    });
});

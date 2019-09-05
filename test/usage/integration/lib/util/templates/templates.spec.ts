import { Templates, CHANGE_TYPE, TemplateFn } from "../../../../../../build/es/wc-lib.js";
import { SLOW } from "../../../../lib/timing";
import { getFixture } from "../../../../lib/testing";
import { TestElement } from "../../../classes/base/elements/test-element";

context('Timeout', function() {
	this.slow(SLOW);
	before(() => {
		cy.visit(getFixture('lib/util', 'templates', 'standard'));
	});

	context('#joinTemplates', () => {
		it('can merge an empy array of templates', () => {
			cy.get('#test')
				.then(([el]: JQuery<TestElement>) => {
					const template = Templates.joinTemplates(() => {});
					expect(template.renderAsText(CHANGE_TYPE.FORCE, el)
						.replace(/\s/g, '')).to.be.equal('');
				});
		});
		it('can merge two templates', () => {
			cy.get('#test')
				.then(([el]: JQuery<TestElement>) => {
					const template = Templates.joinTemplates(() => {},
						new TemplateFn((html) => {
							return html`a`;
						}, CHANGE_TYPE.PROP, () => {}),
						new TemplateFn((html) => {
							return html`b`;
						}, CHANGE_TYPE.THEME, () => {}));
					expect(template.renderAsText(CHANGE_TYPE.FORCE, el)
						.replace(/\s/g, '')).to.be.equal('a,b');
				});
		});
		it('can merge 10 templates', () => {
			cy.get('#test')
				.then(([el]: JQuery<TestElement>) => {
					const template = Templates.joinTemplates(() => {},
						...new Array(10).fill('x').map((_, index) => {
							return new TemplateFn((html) => {
								return html`${index}`;
							}, CHANGE_TYPE.PROP, () => {});	
						}));
					expect(template.renderAsText(CHANGE_TYPE.FORCE, el)
						.replace(/\s/g, '')).to.be.equal(
							new Array(10).fill('x').map((_, i) => i).join(','));
				});
		});
		it('sets changeType to CHANGE_TYPE.PROP if passed two templates with that change type', () => {
			cy.get('#test')
				.then(([el]: JQuery<TestElement>) => {
					const template = Templates.joinTemplates(() => {},
						new TemplateFn((html) => {
							return html`a`;
						}, CHANGE_TYPE.PROP, () => {}),
						new TemplateFn((html) => {
							return html`b`;
						}, CHANGE_TYPE.PROP, () => {}));
					expect(template.renderAsText(CHANGE_TYPE.PROP, el)
						.replace(/\s/g, '')).to.be.equal('a,b');
					expect(template).to.have.property('changeOn')
						.to.be.equal(CHANGE_TYPE.PROP);
				});
		});
		it('sets changeType to CHANGE_TYPE.THEME if passed two templates with that change type', () => {
			cy.get('#test')
				.then(([el]: JQuery<TestElement>) => {
					const template = Templates.joinTemplates(() => {},
						new TemplateFn((html) => {
							return html`a`;
						}, CHANGE_TYPE.THEME, () => {}),
						new TemplateFn((html) => {
							return html`b`;
						}, CHANGE_TYPE.THEME, () => {}));
					expect(template.renderAsText(CHANGE_TYPE.THEME, el)
						.replace(/\s/g, '')).to.be.equal('a,b');
					expect(template).to.have.property('changeOn')
						.to.be.equal(CHANGE_TYPE.THEME);
				});
		});
		it('sets changeType to CHANGE_TYPE.LANG if passed two templates with that change type', () => {
			cy.get('#test')
				.then(([el]: JQuery<TestElement>) => {
					const template = Templates.joinTemplates(() => {},
						new TemplateFn((html) => {
							return html`a`;
						}, CHANGE_TYPE.LANG, () => {}),
						new TemplateFn((html) => {
							return html`b`;
						}, CHANGE_TYPE.LANG, () => {}));
					expect(template.renderAsText(CHANGE_TYPE.LANG, el)
						.replace(/\s/g, '')).to.be.equal('a,b');
					expect(template).to.have.property('changeOn')
						.to.be.equal(CHANGE_TYPE.LANG);
				});
		});
		it('sets changeType to CHANGE_TYPE.ALWAYS if passed at least one template with that change type', () => {
			cy.get('#test')
				.then(([el]: JQuery<TestElement>) => {
					const template = Templates.joinTemplates(() => {},
						new TemplateFn((html) => {
							return html`a`;
						}, CHANGE_TYPE.ALWAYS, () => {}),
						new TemplateFn((html) => {
							return html`b`;
						}, CHANGE_TYPE.ALWAYS, () => {}));
					expect(template.renderAsText(CHANGE_TYPE.ALWAYS, el)
						.replace(/\s/g, '')).to.be.equal('a,b');
					expect(template).to.have.property('changeOn')
						.to.be.equal(CHANGE_TYPE.ALWAYS);
				});
		});
		it('sets changeType to CHANGE_TYPE.NEVER if passed an empty array of templates', () => {
			cy.get('#test')
				.then(([el]: JQuery<TestElement>) => {
					const template = Templates.joinTemplates(() => {});
					expect(template.renderAsText(CHANGE_TYPE.FORCE, el)
						.replace(/\s/g, '')).to.be.equal('');
						expect(template).to.have.property('changeOn')
							.to.be.equal(CHANGE_TYPE.NEVER);
				});
		});
	});
});
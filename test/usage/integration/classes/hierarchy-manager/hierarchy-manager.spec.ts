/// <reference types="Cypress" />

import { ConfigurableWebComponent } from "../../../../../src/wclib";
import { TestGlobalProperties } from "./hierarchy-manager.fixture";
import { expectMethodExists } from "../../../lib/assertions";
import { ParentElement } from "../elements/parent-element";
import { TestElement } from "../elements/test-element";
import { RootElement } from "./elements/root-element";

function getAllElements() {
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

function assertDefaultProps(element: RootElement|TestElement|ParentElement) {
	const props = element.globalProps<TestGlobalProperties>();
	
	expect(props.all).to.be.deep.equal({
		a: 'b',
		c: 'd'
	}, 'global properties are set');

	expect(props.get('a')).to.be.equal('b',
		'prop is set');
	expect(props.get('c')).to.be.equal('d',
		'prop is set');
}

context('Hierarchy-Manager', function() {
	before(() => {
		cy.visit('http://localhost:1251/test/usage/integration/classes/hierarchy-manager/hierarchy-manager.fixture.html');
	});

	context('Properties/Methods', () => {
		it('exposes a #registerChild method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'registerChild');
			});
		});
		it('exposes a #globalProps method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'globalProps');
			});
		});
		it('exposes a #getRoot method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'getRoot');
			});
		});
		it('exposes a #runGlobalFunction method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'runGlobalFunction');
			});
		});
		it('exposes a #listenGP method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'listenGP');
			});
		});
	});
	context('Hierarchy', () => {
		it('determines root-element as the root', () => {
			cy.get('root-element').then(([el]: JQuery<RootElement>) => {
				expect(el.getRoot()).to.be.equal(el, 'root-element is the root');
			});
		});
		it('returns root-element as the root of other elements', () => {
			getAllElements().then((elements) => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					for (const el of elements) {
						expect(el.getRoot()).to.be.equal(root, 'root-element is the root');
					}
				});
			})
		});
	});
	context('Global Properties', () => {
		afterEach(() => {
			cy.get('root-element').then(([root]: JQuery<RootElement>) => {
				const props = root.globalProps<TestGlobalProperties>();
				props.set('a', 'b');
				props.set('c', 'd');
			});
		});

		it('root node contains global properties', () => {
			cy.get('root-element').then(([root]: JQuery<RootElement>) => {
				assertDefaultProps(root);
			});
		});
		it('child nodes contain global properties', () => {
			getAllElements().then((elements) => {
				for (const el of elements) {
					assertDefaultProps(el);
				}
			});
		});
		it('allows setting of global props', () => {
			cy.get('root-element').then(([root]: JQuery<RootElement>) => {
				const props = root.globalProps<TestGlobalProperties>();
				assertDefaultProps(root);

				props.set('a', 'e');
				expect(props.get('a')).to.be.equal('e',
					'prop was changed');

				props.set('a', 'b');
				expect(props.get('a')).to.be.equal('b',
					'prop was changed');
			});
		});
		it('propagates prop changes to children', () => {
			getAllElements().then((elements) => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					const props = root.globalProps<TestGlobalProperties>();
					assertDefaultProps(root);

					props.set('a', 'e');
					for (const element of elements) {
						expect(element.globalProps<TestGlobalProperties>().get('a'))
							.to.be.equal('e', 'prop was changed');
					}

					props.set('a', 'b');
					for (const element of elements) {
						expect(element.globalProps<TestGlobalProperties>().get('a'))
							.to.be.equal('b', 'prop was changed');
					}
				});
			});
		});
		it('allows children to change properties as well', () => {
			getAllElements().then((elements) => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					const props = root.globalProps<TestGlobalProperties>();
					assertDefaultProps(root);

					for (let i = 0; i < elements.length; i++) {
						const props = elements[i].globalProps<TestGlobalProperties>();
						props.set('a', i + '');

						for (const element of elements) {
							expect(element.globalProps<TestGlobalProperties>().get('a'))
								.to.be.equal(i + '', 'prop was changed');
						}
					}

					props.set('a', 'b');
					for (const element of elements) {
						expect(element.globalProps<TestGlobalProperties>().get('a'))
							.to.be.equal('b', 'prop was changed back');
					}
				});
			});
		});
		context('Listening', () => {
			it('allows for listening for global property changes', () => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					expect(() => {
						root.listenGP<TestGlobalProperties>('globalPropChange', () => {});
					}, 'listening does not throw').to.not.throw;
				});
			});
			it('fires the listener when a property is changed', () => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					const listener = cy.spy() as any;
					root.listenGP<TestGlobalProperties>('globalPropChange', listener);
					root.globalProps<TestGlobalProperties>().set('a', 'e');
					expect(listener).to.be.calledOnce;
					root.globalProps<TestGlobalProperties>().set('a', 'b');
					expect(listener).to.be.calledTwice;
				});
			});
			it('only fires the listener once if once is set to true', () => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					const listener = cy.spy() as any;
					root.listenGP<TestGlobalProperties>('globalPropChange', listener, true);
					root.globalProps<TestGlobalProperties>().set('a', 'e');
					expect(listener).to.be.calledOnce;
					root.globalProps<TestGlobalProperties>().set('a', 'b');
					expect(listener).to.be.calledOnce;
				});
			});
			it('passes the changed key and its values', () => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					let fired: number = 0;
					const listener = cy.spy((key, newVal, oldVal) => {
						fired++;

						if (fired > 1) return;
						expect(key).to.be.equal('a', 'key is a');
						expect(newVal).to.be.equal('e', 'value was changed to e');
						expect(oldVal).to.be.equal('b', 'old value was b');
					});
					root.listenGP<TestGlobalProperties>('globalPropChange', listener as any);
					root.globalProps<TestGlobalProperties>().set('a', 'e');
					expect(listener).to.be.calledOnce;
				});
			});
		});
	});
	context('Global function', () => {
		it('can make a function propagate to all components', () => {
			getAllElements().then((elements) => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					const callMap: WeakSet<ConfigurableWebComponent<any>> = new WeakSet();

					root.runGlobalFunction((el) => {
						callMap.add(el);
					});
					
					for (const element of elements) {
						expect(callMap.has(element), 
							'function was called on element').to.be.true;
					}
				});
			});
		});
		it('returns an array containing the return values', () => {
			getAllElements().then((elements) => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					const callMap: Map<ConfigurableWebComponent<any>, number> = new Map();

					const returnVal = root.runGlobalFunction((el) => {
						const num = Math.random();
						callMap.set(el, num);
						return num;
					});

					for (const element of elements) {
						expect(callMap.has(element), 
							'function was called on element').to.be.true;
					}
					
					expect(returnVal).to.have.same.members(
						[...callMap.values()],
						'return value contains all returned values');
				});
			});
		});
	});
});
/// <reference types="Cypress" />

import { TestGlobalProperties } from "./hierarchy-manager.fixture";
import { assertMethodExists } from "../../../lib/assertions";
import { ParentElement } from "./elements/parent-element";
import { TestElement } from "../elements/test-element";
import { RootElement } from "./elements/root-element";
import { ConfigurableWebComponent } from "../../../../../src/wclib";

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
				
	assert.deepEqual(props.all, {
		a: 'b',
		c: 'd'
	}, 'global properties are set');

	assert.deepEqual(props.get('a'), 'b',
		'prop is set');
	assert.deepEqual(props.get('c'), 'd',
		'prop is set');
}

context('Hierarchy-Manager', function() {
	before(() => {
		cy.server();
		cy.visit('http://localhost:1251/test/usage/integration/classes/hierarchy-manager/hierarchy-manager.fixture.html');
	});

	context('Properties/Methods', () => {
		it('exposes a `registerChild` method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'registerChild');
			});
		});
		it('exposes a `globalProps` method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'globalProps');
			});
		});
		it('exposes a `getRoot` method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'getRoot');
			});
		});
		it('exposes a `runGlobalFunction` method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'runGlobalFunction');
			});
		});
		it('exposes a `listenGP` method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'listenGP');
			});
		});
	});
	context('Hierarchy', () => {
		it('determines root-element as the root', () => {
			cy.get('root-element').then(([el]: JQuery<RootElement>) => {
				assert.strictEqual(el.getRoot(), el, 'root-element is the root');
			});
		});
		it('returns root-element as the root of other elements', () => {
			getAllElements().then((elements) => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					for (const el of elements) {
						assert.strictEqual(el.getRoot(), root,
							'root-element is the root');
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
				assert.deepEqual(props.get('a'), 'e',
					'prop was changed');

				props.set('a', 'b');
				assert.deepEqual(props.get('a'), 'b',
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
						assert.deepEqual(
							element.globalProps<TestGlobalProperties>().get('a'), 
							'e', 'prop was changed');
					}

					props.set('a', 'b');
					for (const element of elements) {
						assert.deepEqual(
							element.globalProps<TestGlobalProperties>().get('a'), 
							'b', 'prop was changed');
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
							assert.deepEqual(
								element.globalProps<TestGlobalProperties>().get('a'), 
								i + '', 'prop was changed');
						}
					}

					props.set('a', 'b');
					for (const element of elements) {
						assert.deepEqual(
							element.globalProps<TestGlobalProperties>().get('a'), 
							'b', 'prop was changed back');
					}
				});
			});
		});
		context('Listening', () => {
			it('allows for listening for global property changes', () => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					assert.doesNotThrow(() => {
						root.listenGP<TestGlobalProperties>('globalPropChange', () => {});
					}, 'listening does not throw');
				});
			});
			it('fires the listener when a property is changed', () => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					let fired: number = 0;
					root.listenGP<TestGlobalProperties>('globalPropChange', () => {
						fired++;
					});
					root.globalProps<TestGlobalProperties>().set('a', 'e');
					assert.strictEqual(fired, 1, 'listener was fired once');
					root.globalProps<TestGlobalProperties>().set('a', 'b');
					assert.strictEqual(fired, 2, 'listener was fired twice');
				});
			});
			it('only fires the listener once if once is set to true', () => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					let fired: number = 0;
					root.listenGP<TestGlobalProperties>('globalPropChange', () => {
						fired++;
					}, true);
					root.globalProps<TestGlobalProperties>().set('a', 'e');
					assert.strictEqual(fired, 1, 'listener was fired once');
					root.globalProps<TestGlobalProperties>().set('a', 'b');
					assert.strictEqual(fired, 1, 'listener was not fired again');
				});
			});
			it('passes the changed key and its values', () => {
				cy.get('root-element').then(([root]: JQuery<RootElement>) => {
					let fired: number = 0;
					root.listenGP<TestGlobalProperties>('globalPropChange', (key, newVal, oldVal) => {
						fired++;

						if (fired > 1) return;
						assert.strictEqual(key, 'a', 'key is a');
						assert.strictEqual(newVal, 'e', 'value was changed to e');
						assert.strictEqual(oldVal, 'b', 'old value was b');
					});
					root.globalProps<TestGlobalProperties>().set('a', 'e');
					assert.strictEqual(fired, 1, 'listener was fired once');
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
						assert.isTrue(callMap.has(element),
							'function was called on element');
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
						assert.isTrue(callMap.has(element),
							'function was called on element');
					}
					
					assert.sameMembers(returnVal, [...callMap.values()],
						'return value contains all returned values');
				});
			});
		});
	});
});
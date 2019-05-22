/// <reference types="Cypress" />

import { LifecycleElement } from "./elements/lifecycle-element.js";
import { assertMethodExists } from "../../../lib/assertions.js";
import { TestElement } from "../elements/test-element";

context('Component', function() {
	before(() => {
		cy.visit('http://localhost:1251/test/usage/integration/classes/component/component.fixture.html');
	});

	context('Properties/Methods', () => {
		it('exposes a #$ property/method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assert.property(el, '$', `has a $ property`);

				const value = el.$;
				assert.strictEqual(typeof value, 'function',	
					'property is a function');
			});
		});
		it('exposes a #$$ method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, '$$');
			});
		});
		it('exposes a #connectedCallback method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'connectedCallback');
			});
		});
		it('exposes a #disconnectedCallback method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'disconnectedCallback');
			});
		});
		it('exposes a #layoutMounted method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'layoutMounted');
			});
		});
		it('exposes a #mounted method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'mounted');
			});
		});
		it('exposes a #unmounted method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'unmounted');
			});
		});
		it('exposes a #listenProp method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'listenProp');
			});
		});
	});

	context('Lifecycle Events', () => {
		beforeEach(() => {
			cy.visit('http://localhost:1251/test/usage/integration/classes/component/component.fixture.html');
		});

		it('sets isMounted to true when the component is mounted', () => {
			cy.document().then((document) => {
				const el = document.createElement('test-element') as TestElement;
				
				assert.isFalse(el.isMounted, 
					'isMounted is false when not yet mounted');
				
				document.body.appendChild(el);

				cy.wrap(el).should('have.property', 'isMounted').and('be.equal', true);
			});
		});
		it('calls all disposables when the element is disconnected', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const spy = cy.spy();
				(el as any).disposables.push(spy);

				el.remove();

				expect(spy).to.be.called;
			});
		});
		it('calls #connectedCallback when created', () => {
			cy.document().then((document) => {
				const el = document.createElement('lifecycle-element') as LifecycleElement;
				document.body.appendChild(el);

				assert.strictEqual(el.lifeCycleCalls.connected, 1,
					'connectedCallback was called once');
			});
		});
		it('calls #disconnectedCallback when removed', () => {
			cy.document().then((document) => {
				const el = document.createElement('lifecycle-element') as LifecycleElement;
				document.body.appendChild(el);

				assert.strictEqual(el.lifeCycleCalls.disconnected, 0,
					'disconnectedCallback was not called yet');

				el.remove();

				assert.strictEqual(el.lifeCycleCalls.disconnected, 1,
					'disconnectedCallback was called');
			});
		});
		it('calls #layoutMounted as a part of the constructor', () => {
			cy.document().then((document) => {
				const el = document.createElement('lifecycle-element') as LifecycleElement;
				document.body.appendChild(el);

				assert.strictEqual(el.lifeCycleCalls.layoutMounted, 1,
					'layoutMounted was called');
			});
		});
		it('calls #mounted after the component has been rendered', () => {
			cy.document().then((document) => {
				const el = document.createElement('lifecycle-element') as LifecycleElement;
				document.body.appendChild(el);

				assert.strictEqual(el.lifeCycleCalls.mounted, 0,
					'mounted was not called in the constructor');

				cy.wrap(el).should('have.property', 'lifeCycleCalls')
					.and('have.property', 'mounted')
					.and('be.equal', 1, 'mounted is eventually called');
			});
		});
		it('calls #unmounted when removed', () => {
			cy.document().then((document) => {
				const el = document.createElement('lifecycle-element') as LifecycleElement;
				document.body.appendChild(el);

				assert.strictEqual(el.lifeCycleCalls.unmounted, 0,
					'unmounted was not called yet');

				el.remove();

				assert.strictEqual(el.lifeCycleCalls.unmounted, 1,
					'unmounted was called');
			});
		});
	});
	context('ListenProp', () => {
		beforeEach(() => {
			cy.visit('http://localhost:1251/test/usage/integration/classes/component/component.fixture.html');
		});

		it('allows listening for property change events', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assert.doesNotThrow(() => {
					el.listenProp('propChange', () => {});
				}, 'listener can be added');
			});
		});
		it('calls the listener with the correct arguments', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener = cy.spy((key, newValue, oldValue) => {
					assert.strictEqual(key, 'x',
						'changed value is x');
					assert.strictEqual(newValue, 2,	
						'value was changed to 2');
					assert.strictEqual(oldValue, 1,
						'value was 1');
				});

				el.listenProp('propChange', listener as any);
				el.props.x = 2;

				expect(listener).to.be.called;
			});
		});
		it('fires the beforePropChange event before the change', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener = cy.spy((key, newValue, oldValue) => {
					assert.strictEqual(el.props.x,
						1, 'prop is still set to old value');

					assert.strictEqual(key, 'x',
						'changed value is x');
					assert.strictEqual(newValue, 2,	
						'value was changed to 2');
					assert.strictEqual(oldValue, 1,
						'value was 1');
				});

				el.listenProp('beforePropChange', listener as any);
				el.props.x = 2;

				expect(listener).to.be.called;
			});
		});
		it('fires the propChange event after the change', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener = cy.spy((key, newValue, oldValue) => {
					assert.strictEqual(el.props.x,
						2, 'prop is set to new value');

					assert.strictEqual(key, 'x',
						'changed value is x');
					assert.strictEqual(newValue, 2,	
						'value was changed to 2');
					assert.strictEqual(oldValue, 1,
						'value was 1');
				});

				el.listenProp('propChange', listener as any);
				el.props.x = 2;

				expect(listener).to.be.called;
			});
		});
		it('calls the listener multiple times if the value changes multiple times', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener = cy.spy((key, newValue, oldValue) => {
					assert.isAbove(el.props.x!, 1,	
						'prop was set to higher value');
					assert.notStrictEqual(newValue,
						oldValue, 'new and old are not the same');

					assert.strictEqual(key, 'x',
						'changed value is x');
					assert.isAbove(newValue, 1,	
						'value was changed to a higher value');
				});

				el.listenProp('propChange', listener as any);
				el.props.x = 2;
				el.props.x = 3;

				expect(listener).to.be.calledTwice;
			});
		});
		it('only calls the listener once if once is set to true', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener = cy.spy((key, newValue, oldValue) => {
					assert.strictEqual(el.props.x,
						2, 'prop is set to new value');

					assert.strictEqual(key, 'x',
						'changed value is x');
					assert.strictEqual(newValue, 2,	
						'value was changed to 2');
					assert.strictEqual(oldValue, 1,
						'value was 1');
				});

				el.listenProp('propChange', listener as any, true);
				el.props.x = 2;
				el.props.x = 3;

				expect(listener).to.be.calledOnce;
			});
		});
		it('fires multiple listeners if there are more than one', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener1 = cy.spy(() => {});
				const listener2 = cy.spy(() => {});

				el.listenProp('propChange', listener1 as any, true);
				el.listenProp('propChange', listener2 as any, true);
				el.props.x = 2;

				expect(listener1).to.be.calledOnce;
				expect(listener2).to.be.calledOnce;
			});
		});
		it('does not fire the listener if the value does not change', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener = cy.spy(() => { });

				el.listenProp('propChange', listener as any);
				el.props.x = 1;

				expect(listener).to.not.be.called;
			});
		});
	});
	context('Selectors', () => {
		it('runs querySelectorAll on the local root when calling #$$', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const selectors = [
					'#divId', '.divClass', 'div',
					'#headerId', '.headerClass', 'h1',
					'div[id]', 'div[class]',
					'h1[id]', 'h1[class]',
					'*',
					'nonexistent'
				];
				for (const selector of selectors) {
					assert.sameMembers([...el.$$(selector)],
						[...el.root.querySelectorAll(selector)],
						'selectors return the same values');
				}
			});
		});
		it('runs querySelector on the local root when calling #$', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const selectors = [
					'#divId', '.divClass', 'div',
					'#headerId', '.headerClass', 'h1',
					'div[id]', 'div[class]',
					'h1[id]', 'h1[class]',
					'*',
					'nonexistent'
				];
				for (const selector of selectors) {
					assert.isTrue(
						el.$(selector) === el.root.querySelector(selector),
						'selectors return the same value');
				}
			});
		});
		context('Proxy', () => {
			it('returns element with given ID when accessed', () => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					cy.get('#test')
						.shadowFind('div').then(([div]: JQuery<HTMLDivElement>) => {
							assert.isTrue(el.$.divId === div,
								'found the correct element');
						});
				});
			});
			it('returns undefined when the element does not exist', () => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					assert.isUndefined((el.$ as any).nonexistent,
						'returns undefined');
				});
			});
		});
		context('No-Proxy', () => {
			beforeEach(() => {
				cy.visit('http://localhost:1251/test/usage/integration/classes/component/component.fixture.html', {
					onBeforeLoad(win) {
						delete (win as any).Proxy;
					}
				});
			});
			it('no longer has access to window.Proxy', () => {
				cy.window().then((window) => {
					assert.typeOf((window as any).Proxy, 'undefined',
						'proxy does not exist anymore');
				});
			});
			it('returns element with given ID when accessed', () => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					cy.get('#test')
						.shadowFind('div').then(([div]: JQuery<HTMLDivElement>) => {
							assert.isTrue(el.$.divId === div,
								'found the correct element');
						});
				});
			});
			it('returns undefined when the element does not exist', () => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					assert.isUndefined((el.$ as any).nonexistent,
						'returns undefined');
				});
			})
		})
	});
});
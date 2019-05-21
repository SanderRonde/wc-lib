/// <reference types="Cypress" />

import { assertMethodExists } from "../../../lib/assertions";
import { TestElement } from "../elements/test-element";

context('Listener', function() {
	before(() => {
		cy.visit('http://localhost:1251/test/usage/integration/classes/listener/listener.fixture.html');
	});

	context('Properties/Methods', () => {
		it('exposes a #listen method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'listen');
			});
		});
		it('exposes a #fire method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'fire');
			});
		});
		it('exposes a #clearListener method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assertMethodExists(el, 'clearListener');
			});
		});
	});

	context('Listening', () => {
		it('can be listened to', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assert.doesNotThrow(() => {
					el.listen('test', () => {});
				}, 'listening does not throw');
			});
		});
		it('fires listeners when fired', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				let testCalled: number = 0;
				
				el.listen('test', () => {
					testCalled++;
				});

				el.fire('test', 1, 2);

				assert.strictEqual(testCalled, 1, 'listener was called once');
			});
		});
		it('fires all listeners', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				let testCalled1: number = 0;
				let testCalled2: number = 0;
				
				el.listen('test', () => {
					testCalled1++;
				});
				el.listen('test', () => {
					testCalled2++;
				});


				el.fire('test', 1, 2);

				assert.strictEqual(testCalled1, 1, 'listener was called once');
				assert.strictEqual(testCalled2, 1, 'listener was called once');
			});
		});
		it('fires listeners multiple times when called multiple times', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				let testCalled: number = 0;
				
				el.listen('test', () => {
					testCalled++;
				});

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled, 1, 'listener was called once');
				el.fire('test', 1, 2);
				assert.strictEqual(testCalled, 2, 'listener was again');
			});
		});
		it('only fires a listener once if once is set to true', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				let testCalled: number = 0;
				
				el.listen('test', () => {
					testCalled++;
				}, true);

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled, 1, 'listener was called once');
				el.fire('test', 1, 2);
				assert.strictEqual(testCalled, 1, 'listener was not called again');
			});
		});
	});
	context('Clearing', () => {
		beforeEach(() => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				el.clearListener('test');
				el.clearListener('test2');
			});
		});

		it('clears a listener when passed that listener', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				let testCalled: number = 0;
				
				const listenerFn = () => {
					testCalled++;
				};
				el.listen('test', listenerFn);

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled, 1, 'listener was called once');

				el.clearListener('test', listenerFn);

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled, 1, 'listener was not called again');
			});
		});
		it('only clears the passed listener', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				let testCalled1: number = 0;
				let testCalled2: number = 0;
				
				const listenerFn = () => {
					testCalled1++;
				};
				el.listen('test', listenerFn);
				el.listen('test', () => {
					testCalled2++;
				})

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled1, 1, 'listener was called once');
				assert.strictEqual(testCalled2, 1, 'listener was called once');

				el.clearListener('test', listenerFn);

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled1, 1, 'listener was not called again');
				assert.strictEqual(testCalled2, 2, 'listener was called again');
			});
		});
		it('clears all listeners of the event type if no function is passed', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				let testCalled1: number = 0;
				let testCalled2: number = 0;
				
				el.listen('test', () => {
					testCalled1++;
				});
				el.listen('test', () => {
					testCalled2++;
				})

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled1, 1, 'listener was called once');
				assert.strictEqual(testCalled2, 1, 'listener was called once');

				el.clearListener('test');

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled1, 1, 'listener was not called again');
				assert.strictEqual(testCalled2, 1, 'listener was not called again');
			});
		});
		it('does not clear other events\' listeners', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				let testCalled1: number = 0;
				let testCalled2: number = 0;
				let testCalled3: number = 0;
				
				el.listen('test', () => {
					testCalled1++;
				});
				el.listen('test', () => {
					testCalled2++;
				})
				el.listen('test2', () => {
					testCalled3++;
					return 0;
				});

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled1, 1, 'listener was called once');
				assert.strictEqual(testCalled2, 1, 'listener was called once');
				assert.strictEqual(testCalled3, 0, 'listener was not called');
				el.fire('test2');
				assert.strictEqual(testCalled3, 1, 'listener was called once');

				el.clearListener('test');

				el.fire('test', 1, 2);
				assert.strictEqual(testCalled1, 1, 'listener was not called again');
				assert.strictEqual(testCalled2, 1, 'listener was not called again');
				el.fire('test2');
				assert.strictEqual(testCalled3, 2, 'listener was called again');
			});
		});
		it('does not throw if no listeners are defined', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				assert.doesNotThrow(() => {
					el.clearListener('test', () => {});
				}, 'clearing a non-existent listener does not throw');
			});
		});
	});
	context('Firing', () => {
		beforeEach(() => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				el.clearListener('test');
				el.clearListener('test2');
			});
		});

		it('passes the arguments to listeners', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				let testCalled: number = 0;
				
				const firstArg = Math.random();
				const secondArg = Math.random();
				el.listen('test', (arg1, arg2) => {
					testCalled++;
					assert.strictEqual(arg1, firstArg, 'arg matches');
					assert.strictEqual(arg2, secondArg, 'arg matches');
				});

				el.fire('test', firstArg, secondArg);
				assert.strictEqual(testCalled, 1, 'listener was called');
			});
		});
		it('returns the return values of the listeners', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const expectedValues = [
					Math.random(),
					Math.random(),
					Math.random(),
					Math.random(),
					Math.random()
				]
				el.listen('test2', () => expectedValues[0]);
				el.listen('test2', () => expectedValues[1]);
				el.listen('test2', () => expectedValues[2]);
				el.listen('test2', () => expectedValues[3]);
				el.listen('test2', () => expectedValues[4]);

				const retVals = el.fire('test2');
				console.log(retVals);
				assert.lengthOf(retVals, expectedValues.length,
					'retvals is the same length as the amount of listeners');
				assert.deepEqual(retVals, expectedValues,
					'return values match');
			});
		});
	});
});
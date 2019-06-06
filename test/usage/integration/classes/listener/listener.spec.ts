/// <reference types="Cypress" />

import { expectMethodExists } from "../../../lib/assertions";
import { TestElement } from "../elements/test-element";
import { getFixture } from "../../../lib/testing";

context('Listener', function() {
	before(() => {
		cy.visit(getFixture('listener'));
	});

	context('Properties/Methods', () => {
		it('exposes a #listen method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'listen');
			});
		});
		it('exposes a #fire method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'fire');
			});
		});
		it('exposes a #clearListener method', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expectMethodExists(el, 'clearListener');
			});
		});
	});

	context('Listening', () => {
		it('can be listened to', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expect(() => {
					el.listen('test', () => {});
				}, 'listening does not throw').to.not.throw;
			});
		});
		it('fires listeners when fired', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener = cy.spy() as any;
				
				el.listen('test', listener);

				el.fire('test', 1, 2);

				expect(listener).to.be.calledOnce;
			});
		});
		it('fires all listeners', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener1 = cy.spy() as any;
				const listener2 = cy.spy() as any;
				
				el.listen('test', listener1);
				el.listen('test', listener2);


				el.fire('test', 1, 2);

				expect(listener1).to.be.calledOnce;
				expect(listener2).to.be.calledOnce;
			});
		});
		it('fires listeners multiple times when called multiple times', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener = cy.spy() as any;
				
				el.listen('test', listener);

				el.fire('test', 1, 2);
				expect(listener).to.be.calledOnce;
				el.fire('test', 1, 2);
				expect(listener).to.be.calledTwice;
			});
		});
		it('only fires a listener once if once is set to true', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener = cy.spy() as any;
				
				el.listen('test', listener, true);

				el.fire('test', 1, 2);
				expect(listener).to.be.calledOnce;
				el.fire('test', 1, 2);
				expect(listener).to.be.calledOnce;
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
				const listener = cy.spy() as any;
				
				el.listen('test', listener);

				el.fire('test', 1, 2);
				expect(listener).to.be.calledOnce;

				el.clearListener('test', listener);

				el.fire('test', 1, 2);
				expect(listener).to.be.calledOnce;
			});
		});
		it('only clears the passed listener', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener1 = cy.spy() as any;
				const listener2 = cy.spy() as any;
				
				el.listen('test', listener1);
				el.listen('test', listener2);

				el.fire('test', 1, 2);
				expect(listener1).to.be.calledOnce;
				expect(listener2).to.be.calledOnce;

				el.clearListener('test', listener1);

				el.fire('test', 1, 2);
				expect(listener1).to.be.calledOnce;
				expect(listener2).to.be.calledTwice;
			});
		});
		it('clears all listeners of the event type if no function is passed', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener1 = cy.spy() as any;
				const listener2 = cy.spy() as any;
				
				el.listen('test', listener1);
				el.listen('test', listener2);

				el.fire('test', 1, 2);
				expect(listener1).to.be.calledOnce;
				expect(listener2).to.be.calledOnce;

				el.clearListener('test');

				el.fire('test', 1, 2);
				expect(listener1).to.be.calledOnce;
				expect(listener2).to.be.calledOnce;
			});
		});
		it('does not clear other events\' listeners', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				const listener1 = cy.spy() as any;
				const listener2 = cy.spy() as any;
				const listener3 = cy.spy(() => {
					return 0;
				}) as any;
				
				el.listen('test', listener1);
				el.listen('test', listener2);
				el.listen('test2', listener3);

				el.fire('test', 1, 2);
				expect(listener1).to.be.calledOnce;
				expect(listener2).to.be.calledOnce;
				expect(listener3).to.not.be.called;
				el.fire('test2');
				expect(listener3).to.be.calledOnce;

				el.clearListener('test');

				el.fire('test', 1, 2);
				expect(listener1).to.be.calledOnce;
				expect(listener2).to.be.calledOnce;
				el.fire('test2');
				expect(listener3).to.be.calledTwice;
			});
		});
		it('does not throw if no listeners are defined', () => {
			cy.get('#test').then(([el]: JQuery<TestElement>) => {
				expect(() => {
					el.clearListener('test', () => {});
				}, 'clearing a non-existent listener does not throw')
					.to.not.throw;
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
				const firstArg = Math.random();
				const secondArg = Math.random();
				const listener = cy.spy((arg1, arg2) => {
					expect(arg1).to.be.equal(firstArg, 'arg matches');
					expect(arg2).to.be.equal(secondArg, 'arg matches');
				}) as any;
				el.listen('test', listener);

				el.fire('test', firstArg, secondArg);
				expect(listener).to.be.calledOnce;
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
				expect(retVals).to.have.length(expectedValues.length,
					'retvals is the same length as the amount of listeners')
						.to.be.deep.equal(expectedValues,
							'return values match');
			});
		});
	});
});
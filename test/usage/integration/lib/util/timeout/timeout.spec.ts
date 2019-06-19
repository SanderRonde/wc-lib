import { SLOW } from "../../../../lib/timing";
import { Timeout } from "../../../../../../src/wclib";

context('Timeout', function() {
	this.slow(SLOW);

	context('#createCancellableTimeout', () => {
		it('can create a timeout', () => {
			Timeout.createCancellableTimeout({}, 'name', () => {}, 0);
		});
		it('timeout gets called after 0ms if waitTime is 0', () => {
			const fn = cy.spy();
			Timeout.createCancellableTimeout({}, 'name', fn as any, 0);
			cy.wait(0)
				.then(() => {
					cy.wrap(fn).should('be.calledOnce');
				});
		});
		it('timeout gets called after x ms if waitTime is x', () => {
			const fn = cy.spy();
			const waitTime = 15 + (Math.random() * 1000);
			Timeout.createCancellableTimeout({}, 'name', fn as any, waitTime);
			cy.wait(waitTime + 100)
				.then(() => {
					expect(fn).to.be.calledOnce;
				});
		});
		it('timeout is overridden if the same element and name are used before the timeout expires', () => {
			const fn1 = cy.spy();
			const fn2 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
			Timeout.createCancellableTimeout(element, 'name', fn2 as any, 15);

			cy.wrap(fn1).should('not.be.called');
			cy.wrap(fn2).should('be.calledOnce');
		});
		it('timeout is not overridden when using the same name if the element is different', () => {
			const fn1 = cy.spy();
			const fn2 = cy.spy();
			Timeout.createCancellableTimeout({}, 'name', fn1 as any, 15);
			Timeout.createCancellableTimeout({}, 'name', fn2 as any, 15);

			cy.wrap(fn1).should('not.be.called');
			cy.wrap(fn2).should('be.calledOnce');
		});
		it('timeout is not overridden when using the same element if the name is different', () => {
			const fn1 = cy.spy();
			const fn2 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name1', fn1 as any, 15);
			Timeout.createCancellableTimeout(element, 'name2', fn2 as any, 15);
			
			cy.wrap(fn1).should('be.calledOnce');
			cy.wrap(fn2).should('be.calledOnce');
		});
		it('the same name-element combination can be used after the previous timeout expired', () => {
			const fn1 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
			cy.wrap(fn1).should('be.calledOnce').then(() => {
				Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);

				cy.wrap(fn1).should('be.calledTwice');
			});
		});
	});
	context('#cancelTimeout', () => {
		it('does nothing if no timeout for the element exists', () => {
			const fn1 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
			Timeout.cancelTimeout({}, 'name');

			cy.wrap(fn1).should('be.calledOnce');
		});
		it('does nothing if no timeout for the name exists', () => {
			const fn1 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
			Timeout.cancelTimeout(element, 'name2');
			
			cy.wrap(fn1).should('be.calledOnce');
		});
		it('clears a timeout when one has been registered', () => {
			const fn1 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
			Timeout.cancelTimeout(element, 'name');
			
			cy.wrap(fn1).should('not.be.called');
		});
		it('does nothing the second time if the timeout is cleared twice', () => {
			const fn1 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
			Timeout.cancelTimeout(element, 'name');
			Timeout.cancelTimeout(element, 'name');
			
			cy.wrap(fn1).should('not.be.called');
		});
		it('can register the same timeout after one has been cleared', () => {
			const fn1 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
			Timeout.cancelTimeout(element, 'name');
			cy.wrap(fn1).should('not.be.called').then(() => {
				Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);

				cy.wrap(fn1).should('be.calledOnce');
			});
		});
		it('can register a different timeout after one has been cleared', () => {
			const fn1 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
			Timeout.cancelTimeout(element, 'name');
			cy.wrap(fn1).should('not.be.called').then(() => {
				const fn2 = cy.spy();
				Timeout.createCancellableTimeout({}, 'name2', fn2 as any, 15);

				cy.wrap(fn2).should('be.calledOnce');
			});
		});
		it('can re-clear a timeout if one has been registered again', () => {
			const fn1 = cy.spy();
			const element = {};
			Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
			Timeout.cancelTimeout(element, 'name');
			
			cy.wrap(fn1).should('not.be.called').then(() => {
				Timeout.createCancellableTimeout(element, 'name', fn1 as any, 15);
				Timeout.cancelTimeout(element, 'name');

				cy.wrap(fn1).should('not.be.called');
			});
		});
	});
});
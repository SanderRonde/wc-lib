import { ListenerWindow } from "./fixtures/standard/listeners.fixture";
import { TestElement } from "../../classes/elements/test-element";
import { getLibFixture } from "../../../lib/testing";
import { SLOW } from "../../../lib/timing";

context('Listeners', function() {
	this.slow(SLOW);
	beforeEach(() => {
		cy.visit(getLibFixture('listeners'));
	});

	context('#listen', () => {
		it('can add a listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					window.Listeners.listen(el, 'divId', 'click', () => {});
				});
			});
		});
		it('can add a listener with boolean settings', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					window.Listeners.listen(el, 'divId', 'click', () => {}, true);
					window.Listeners.listen(el, 'headerId', 'click', () => {}, false);
				});
			});
		});
		it('can add a listener with object settings', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					window.Listeners.listen(el, 'divId', 'click', () => {}, {
						capture: true,
						once: true,
						passive: true
					});
				});
			});
		});
		it('calls the listener when the event is fired', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listen(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
		it('does not listen to the same element twice', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listen(el, 'divId', 'click', listener as any);
					window.Listeners.listen(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('can listen to two different elements', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					window.Listeners.listen(el, 'divId', 'click', listener as any);
					window.Listeners.listen(el, 'headerId', 'click', listener2 as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#headerId')
								.shadowClick().then(() => {
									cy.wrap(listener2).should('be.calledOnce');
								});
						});
				});
			});
		});
		it('can not listen to the same element twice when the listeners are different', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					window.Listeners.listen(el, 'divId', 'click', listener as any);
					window.Listeners.listen(el, 'divId', 'click', listener2 as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('not.be.called');
							cy.wrap(listener2).should('be.calledOnce');
						});
				});
			});
		});
		it('passes the event to the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy((e: MouseEvent) => {
						expect(!!e).to.be.true;
						expect(e).to.have.property('type')
							.to.be.equal('click');
					});
					window.Listeners.listen(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('uses the base as "this" for the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy(function (this: TestElement) {
						expect(this).to.be.equal(el);
					});
					window.Listeners.listen(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('returns a function that will remove the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const remove = window.Listeners.listen(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowFind('#divId')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');
									});
							});
						});
				});
			});
		});
		it('can add the same listener after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const remove = window.Listeners.listen(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowFind('#divId')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listen(el, 'divId', 'click', listener as any);

										cy.get('#test')
											.shadowFind('#divId')
											.shadowClick().then(() => {
												cy.wrap(listener).should('be.calledTwice');
											});
									});
							});
						});
				});
			});
		});
		it('can add new listeners after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					const remove = window.Listeners.listen(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowFind('#divId')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listen(el, 'divId', 'click', listener2 as any);

										cy.get('#test')
											.shadowFind('#divId')
											.shadowClick().then(() => {
												cy.wrap(listener2).should('be.calledOnce');
											});
									});
							});
						});
				});
			});
		});
		it('also listens if passive event listeners are not supported', () => {
			cy.visit(getLibFixture('listeners'), {
				onBeforeLoad(win) {
					const originalAddEventListener = (win as any).__proto__.__proto__.__proto__.addEventListener;
					(win as any).__proto__.__proto__.__proto__.addEventListener = function<T>(
						this: T, event: string, listener: Function, options?: boolean|Object) {
							if (options && typeof options === 'object') {
								throw new Error('can\'t pass object as options arg');
							}
							originalAddEventListener.call(this, event, listener, options);
						}
				}
			});

			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listen(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
	});
	context('#listenWithIdentifier', () => {
		it('can add a listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', () => {});
				});
			});
		});
		it('can add a listener with boolean settings', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', () => {}, true);
					window.Listeners.listenWithIdentifier(el, el.$.headerId, 'id', 'click', () => {}, false);
				});
			});
		});
		it('can add a listener with object settings', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', () => {}, {
						capture: true,
						once: true,
						passive: true
					});
				});
			});
		});
		it('calls the listener when the event is fired', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
		it('does not listen to the same element with the same identifier twice', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener as any);
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('can listen to the same element twice when the identifiers are different', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener as any);
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id2', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledTwice');
						});
				});
			});
		});
		it('can not listen to the same element twice when the elements are different but the ID is the same', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener as any);
					window.Listeners.listenWithIdentifier(el, el.$.headerId, 'id', 'click', listener2 as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('not.be.called');
							cy.wrap(listener2).should('not.be.called');

							cy.get('#test')
								.shadowFind('#headerId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('not.be.called');
									cy.wrap(listener2).should('be.calledOnce');
								});
						});
				});
			});
		});
		it('can not listen to the same element twice even when the listeners are different', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener as any);
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener2 as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('not.be.called');
							cy.wrap(listener2).should('be.calledOnce');
						});
				});
			});
		});
		it('passes the event to the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy((e: MouseEvent) => {
						expect(!!e).to.be.true;
						expect(e).to.have.property('type')
							.to.be.equal('click');
					});
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('uses the base as "this" for the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy(function (this: TestElement) {
						expect(this).to.be.equal(el);
					});
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('returns a function that will remove the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy(function (this: TestElement) {
						expect(this).to.be.equal(el);
					});
					const remove = window.Listeners.listenWithIdentifier(
						el, el.$.divId, 'id', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowFind('#divId')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');
									});
							});
						});
				});
			});
		});
		it('can add the same listener after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const remove = window.Listeners.listenWithIdentifier(
						el, el.$.divId, 'id', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowFind('#divId')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listenWithIdentifier(
											el, el.$.divId, 'id', 'click', listener as any);

										cy.get('#test')
											.shadowFind('#divId')
											.shadowClick().then(() => {
												cy.wrap(listener).should('be.calledTwice');
											});
									});
							});
						});
				});
			});
		});
		it('can add new listeners after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					const remove = window.Listeners.listenWithIdentifier(
						el, el.$.divId, 'id', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowFind('#divId')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listenWithIdentifier(
											el, el.$.divId, 'id', 'click', listener2 as any);

										cy.get('#test')
											.shadowFind('#divId')
											.shadowClick().then(() => {
												cy.wrap(listener2).should('be.calledOnce');
											});
									});
							});
						});
				});
			});
		});
		it('also listens if passive event listeners are not supported', () => {
			cy.visit(getLibFixture('listeners'), {
				onBeforeLoad(win) {
					const originalAddEventListener = (win as any).__proto__.__proto__.__proto__.addEventListener;
					(win as any).__proto__.__proto__.__proto__.addEventListener = function<T>(
						this: T, event: string, listener: Function, options?: boolean|Object) {
							if (options && typeof options === 'object') {
								throw new Error('can\'t pass object as options arg');
							}
							originalAddEventListener.call(this, event, listener, options);
						}
				}
			});

			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenWithIdentifier(
						el, el.$.divId, 'id', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
	});
	context('#isNewElement', () => {
		it('returns false if no element is passed', () => {
			cy.window().then((window: ListenerWindow) => {
				expect((window.Listeners.isNewElement as any)()).to.be.equal(false);
			});
		});
		it('will return true on the first call for any element', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					expect(window.Listeners.isNewElement(el.$.divId)).to.be.equal(true);
				});
			});
		});
		it('will return false on the second call', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					expect(window.Listeners.isNewElement(el.$.divId)).to.be.equal(true);
					expect(window.Listeners.isNewElement(el.$.divId)).to.be.equal(false);
					expect(window.Listeners.isNewElement(el.$.divId)).to.be.equal(false);
				});
			});
		});
		it('will return true if a different element is passed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					expect(window.Listeners.isNewElement(el.$.divId)).to.be.equal(true);
					expect(window.Listeners.isNewElement(el.$.headerId)).to.be.equal(true);
				});
			});
		});
		it('can use a custom context', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const context = {};
					expect(window.Listeners.isNewElement(el.$.divId, context)).to.be.equal(true)
				});
			});
		});
		it('will return false if the element has already been seen in this context', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const context = {};
					expect(window.Listeners.isNewElement(el.$.divId, context)).to.be.equal(true)
					expect(window.Listeners.isNewElement(el.$.divId, context)).to.be.equal(false)
					expect(window.Listeners.isNewElement(el.$.divId, context)).to.be.equal(false)
				});
			});
		});
		it('will return true if the element is different but the context is the same', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const context = {};
					expect(window.Listeners.isNewElement(el.$.divId, context)).to.be.equal(true)
					expect(window.Listeners.isNewElement(el.$.headerId, context)).to.be.equal(true)
				});
			});
		});
		it('returns true if the context is different but the element is the same', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					expect(window.Listeners.isNewElement(el.$.divId, {})).to.be.equal(true)
					expect(window.Listeners.isNewElement(el.$.divId, {})).to.be.equal(true)
				});
			});
		});
		it('throws an error if a non-object and non-function is used as the context', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					expect(() => {
						expect(window.Listeners.isNewElement(el.$.divId, 'ctx')).to.be.equal(true)
					}).to.throw('Invalid value used as weak map key');
				});
			});
		});
	});
	context('#listenIfNew', () => {
		it('will add a listener if the element is new', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
		it('will not add another listener if the element is not new', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
		it('will still see an element as new if isNewElement was called before it', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.isNewElement(el.$.divId, el);
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
		it('can override whether the element is new to false', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any, false);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('not.be.called');
						});
				});
			});
		});
		it('can override whether the element is new to true', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);
					window.Listeners.listenIfNew(el, 'divId', 'click', listener2 as any, true);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('not.be.called');
							cy.wrap(listener2).should('be.calledOnce');
						});
				});
			});
		});
		it('passes the event to the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy((e: MouseEvent) => {
						expect(!!e).to.be.true;
						expect(e).to.have.property('type')
							.to.be.equal('click');
					});
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('uses the base as "this" for the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy(function (this: TestElement) {
						expect(this).to.be.equal(el);
					});
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('does nothing when calling the remove listener if the element was not new', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any)();
				});
			});
		});
		it('returns a function that will remove the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const remove = window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowFind('#divId')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');
									});
							});
						});
				});
			});
		});
		it('can add the same listener after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const remove = window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowFind('#divId')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listenIfNew(el, 'divId', 'click', listener as any, true);

										cy.get('#test')
											.shadowFind('#divId')
											.shadowClick().then(() => {
												cy.wrap(listener).should('be.calledTwice');
											});
									});
							});
						});
				});
			});
		});
		it('can add new listeners after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					const remove = window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowFind('#divId')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listenIfNew(el, 'divId', 'click', listener2 as any, true);

										cy.get('#test')
											.shadowFind('#divId')
											.shadowClick().then(() => {
												cy.wrap(listener2).should('be.calledOnce');
											});
									});
							});
						});
				});
			});
		});
		it('also listens if passive event listeners are not supported', () => {
			cy.visit(getLibFixture('listeners'), {
				onBeforeLoad(win) {
					const originalAddEventListener = (win as any).__proto__.__proto__.__proto__.addEventListener;
					(win as any).__proto__.__proto__.__proto__.addEventListener = function<T>(
						this: T, event: string, listener: Function, options?: boolean|Object) {
							if (options && typeof options === 'object') {
								throw new Error('can\'t pass object as options arg');
							}
							originalAddEventListener.call(this, event, listener, options);
						}
				}
			});

			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
	});
	context('#listenToComponentUnique', () => {
		it('listens to the event', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenToComponentUnique(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
		it('does not use multiple listeners for the same event', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					window.Listeners.listenToComponentUnique(el, 'click', listener as any);
					window.Listeners.listenToComponentUnique(el, 'click', listener2 as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('not.be.called');
							cy.wrap(listener2).should('be.calledOnce');
						});
				});
			});
		});
		it('does allow the same listener for different events', () => {
			cy.window().then((window: ListenerWindow) => {
				let calls: number = 0;
				const original = (window as any).__proto__.__proto__.__proto__.addEventListener;
				(window as any).__proto__.__proto__.__proto__.addEventListener = 
					function(event: string, fn: Function, options?: any) {
						if (event !== 'unload') {
							calls++;
						}
						original.call(this, event, fn, options);
					};

				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenToComponentUnique(el, 'click', listener as any);
					window.Listeners.listenToComponentUnique(el, 'focus', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
							
							cy.wrap(calls).should('be.equal', 2);
						});
				});
			});
		});
		it('passes the event to the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy((e: MouseEvent) => {
						expect(!!e).to.be.true;
						expect(e).to.have.property('type')
							.to.be.equal('click');
					});
					window.Listeners.listenToComponentUnique(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('uses the base as "this" for the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy(function (this: TestElement) {
						expect(this).to.be.equal(el);
					});
					window.Listeners.listenToComponentUnique(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('returns a function that will remove the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const remove = window.Listeners.listenToComponentUnique(
						el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');
									});
							});
						});
				});
			});
		});
		it('can add the same listener after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const remove = window.Listeners.listenToComponentUnique(
						el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listenToComponentUnique(
											el, 'click', listener as any);

										cy.get('#test')
											.shadowClick().then(() => {
												cy.wrap(listener).should('be.calledTwice');
											});
									});
							});
						});
				});
			});
		});
		it('can add new listeners after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					const remove = window.Listeners.listenToComponentUnique(
						el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listenToComponentUnique(
											el, 'click', listener2 as any);

										cy.get('#test')
											.shadowClick().then(() => {
												cy.wrap(listener2).should('be.calledOnce');
											});
									});
							});
						});
				});
			});
		});
		it('also listens if passive event listeners are not supported', () => {
			cy.visit(getLibFixture('listeners'), {
				onBeforeLoad(win) {
					const originalAddEventListener = (win as any).__proto__.__proto__.__proto__.addEventListener;
					(win as any).__proto__.__proto__.__proto__.addEventListener = function<T>(
						this: T, event: string, listener: Function, options?: boolean|Object) {
							if (options && typeof options === 'object') {
								throw new Error('can\'t pass object as options arg');
							}
							originalAddEventListener.call(this, event, listener, options);
						}
				}
			});

			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenToComponentUnique(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
	});
	context('#listenToComponent', () => {
		it('listens to the event', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenToComponent(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
		it('allows multiple listeners for the same event', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					window.Listeners.listenToComponent(el, 'click', listener as any);
					window.Listeners.listenToComponent(el, 'click', listener2 as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
							cy.wrap(listener2).should('be.calledOnce');
						});
				});
			});
		});
		it('allows the same listener for different events', () => {
			cy.window().then((window: ListenerWindow) => {
				let calls: number = 0;
				const original = (window as any).__proto__.__proto__.__proto__.addEventListener;
				(window as any).__proto__.__proto__.__proto__.addEventListener = 
					function(event: string, fn: Function, options?: any) {
						if (event !== 'unload') {
							calls++;
						}
						original.call(this, event, fn, options);
					};

				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenToComponent(el, 'click', listener as any);
					window.Listeners.listenToComponent(el, 'focus', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
							
							cy.wrap(calls).should('be.equal', 2);
						});
				});
			});
		});
		it('passes the event to the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy((e: MouseEvent) => {
						expect(!!e).to.be.true;
						expect(e).to.have.property('type')
							.to.be.equal('click');
					});
					window.Listeners.listenToComponent(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('uses the base as "this" for the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy(function (this: TestElement) {
						expect(this).to.be.equal(el);
					});
					window.Listeners.listenToComponent(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');
						});
				});
			});
		});
		it('returns a function that will remove the listener', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const remove = window.Listeners.listenToComponent(
						el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');
									});
							});
						});
				});
			});
		});
		it('can add the same listener after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const remove = window.Listeners.listenToComponent(
						el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listenToComponent(
											el, 'click', listener as any);

										cy.get('#test')
											.shadowClick().then(() => {
												cy.wrap(listener).should('be.calledTwice');
											});
									});
							});
						});
				});
			});
		});
		it('can add new listeners after one was removed', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					const listener2 = cy.spy();
					const remove = window.Listeners.listenToComponent(
						el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce').then(() => {
								remove();

								cy.get('#test')
									.shadowClick().then(() => {
										cy.wrap(listener).should('be.calledOnce');

										window.Listeners.listenToComponent(
											el, 'click', listener2 as any);

										cy.get('#test')
											.shadowClick().then(() => {
												cy.wrap(listener2).should('be.calledOnce');
											});
									});
							});
						});
				});
			});
		});
		it('also listens if passive event listeners are not supported', () => {
			cy.visit(getLibFixture('listeners'), {
				onBeforeLoad(win) {
					const originalAddEventListener = (win as any).__proto__.__proto__.__proto__.addEventListener;
					(win as any).__proto__.__proto__.__proto__.addEventListener = function<T>(
						this: T, event: string, listener: Function, options?: boolean|Object) {
							if (options && typeof options === 'object') {
								throw new Error('can\'t pass object as options arg');
							}
							originalAddEventListener.call(this, event, listener, options);
						}
				}
			});

			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenToComponent(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');
								});
						});
				});
			});
		});
	});
	context('#removeAllEventListeners', () => {
		it('does nothing if no events are being listened to', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					window.Listeners.removeAllElementListeners(el);
				});
			});
		});
		it('removes all listeners added through #listen', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listen(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');

									window.Listeners.removeAllElementListeners(el);

									cy.get('#test')
										.shadowFind('#divId')
										.shadowClick().then(() => {
											cy.wrap(listener).should('be.calledTwice');
										});
								});
						});
				});
			});
		});
		it('removes all listeners added through #listenWithIdentifier', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenWithIdentifier(el, el.$.divId, 'id', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');

									window.Listeners.removeAllElementListeners(el);

									cy.get('#test')
										.shadowFind('#divId')
										.shadowClick().then(() => {
											cy.wrap(listener).should('be.calledTwice');
										});
								});
						});
				});
			});
		});
		it('removes all listeners added through #listenIfNew', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenIfNew(el, 'divId', 'click', listener as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');

									window.Listeners.removeAllElementListeners(el);

									cy.get('#test')
										.shadowFind('#divId')
										.shadowClick().then(() => {
											cy.wrap(listener).should('be.calledTwice');
										});
								});
						});
				});
			});
		});
		it('removes all listeners added through #listenToComponentUnique', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenToComponentUnique(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');

									window.Listeners.removeAllElementListeners(el);

									cy.get('#test')
										.shadowClick().then(() => {
											cy.wrap(listener).should('be.calledTwice');
										});
								});
						});
				});
			});
		});
		it('removes all listeners added through #listenToComponent', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listener = cy.spy();
					window.Listeners.listenToComponent(el, 'click', listener as any);

					cy.get('#test')
						.shadowClick().then(() => {
							cy.wrap(listener).should('be.calledOnce');

							cy.get('#test')
								.shadowClick().then(() => {
									cy.wrap(listener).should('be.calledTwice');

									window.Listeners.removeAllElementListeners(el);

									cy.get('#test')
										.shadowClick().then(() => {
											cy.wrap(listener).should('be.calledTwice');
										});
								});
						});
				});
			});
		});
		it('removes all listeners added through multiple functions', () => {
			cy.window().then((window: ListenerWindow) => {
				cy.get('#test').then(([el]: JQuery<TestElement>) => {
					const listenListener = cy.spy().as('listen');
					const listenComponentUnique = cy.spy().as('componentUnique');
					const listenComponent = cy.spy().as('component');

					// The last one that is used will be the one that is triggered
					window.Listeners.listen(el, 'divId', 'click', listenListener as any);
					window.Listeners.listenToComponentUnique(el, 'click', listenComponentUnique as any);
					window.Listeners.listenToComponent(el, 'click', listenComponent as any);

					cy.get('#test')
						.shadowFind('#divId')
						.shadowClick().then(() => {
							cy.wrap(listenListener).should('be.calledOnce');
							cy.wrap(listenComponentUnique).should('be.calledOnce');
							cy.wrap(listenComponent).should('be.calledOnce');

							cy.get('#test')
								.shadowFind('#divId')
								.shadowClick().then(() => {
									cy.wrap(listenListener).should('be.calledTwice');
									cy.wrap(listenComponentUnique).should('be.calledTwice');
									cy.wrap(listenComponent).should('be.calledTwice');

									window.Listeners.removeAllElementListeners(el);

									cy.get('#test')
										.shadowFind('#divId')
										.shadowClick().then(() => {
											cy.wrap(listenListener).should('be.calledTwice');
											cy.wrap(listenComponentUnique).should('be.calledTwice');
											cy.wrap(listenComponent).should('be.calledTwice');
										});
								});
						});
				});
			});
		});
	});
});
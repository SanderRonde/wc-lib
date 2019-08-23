import { PropsElement, ObjEl, EmptyProps, PrivProps, MergedProps, PropsElementWindow, ReflectProps, OverriddenProp } from "./elements/props-element";
import { SLOW } from "../../../lib/timing";


export function propsSpec(basicFixture: string, noProxyFixture: string, complex: boolean = true) {
	context('Props', function () {
		this.slow(SLOW);
		beforeEach(() => {
			cy.visit(basicFixture);
			cy.wait(250);
		});
		context('Values', () => {
			context('Casing', () => {
				it('converts capital letters to dashes', () => {
					cy.get('props-element')
						.then(([el]: JQuery<PropsElement>) => {
							expect(el).to.have.property('props')
								.to.have.property('casingTest')
								.to.be.equal(true);
							expect(el).to.have.attr('casing-test');
						});
				});
				it('does not introduce unneeded dashes', () => {
					cy.get('props-element')
						.then(([el]: JQuery<PropsElement>) => {
							expect(el).to.have.property('props')
								.to.have.property('casingtest2')
								.to.be.equal(true);
							expect(el).to.have.attr('casingtest2');
						});
				});
			});
			context('Basic Props Types', () => {
				context('General', () => {
					context('Getting', () => {
						it('can get a boolean value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('boolDefault')
										.to.be.equal(true);
								});
						});
						it('can get a string value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('stringDefault')
										.to.be.equal('test');
								});
						});
						it('can get a number value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('numberDefault')
										.to.be.equal(10);
								});
						});
					});
					context('Setting', () => {
						it('can set a boolean value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('bool')
										.to.be.equal(undefined);
									el.props.bool = true;
									expect(el).to.have.property('props')
										.to.have.property('bool')
										.to.be.equal(true);
								});
						});
						it('can set a string value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('string')
										.to.be.equal(undefined);
									el.props.string = 'test';
									expect(el).to.have.property('props')
										.to.have.property('string')
										.to.be.equal('test');
								});
						});
						it('can set a number value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('number')
										.to.be.equal(undefined);
									el.props.number = 10;
									expect(el).to.have.property('props')
										.to.have.property('number')
										.to.be.equal(10);
								});
						});
						it('reflects changes to the attribute', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('string')
										.to.be.equal(undefined);
									el.props.string = 'test';
									expect(el).to.have.property('props')
										.to.have.property('string')
										.to.be.equal('test');
									expect(el.getAttribute('string')).to.be.equal('test');
								});
						});
					});
					context('Getting from Component', () => {
						it('can get a boolean value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el)
										.to.have.property('boolDefault')
										.to.be.equal(true);
									el.props.boolDefault = false;
									expect(el)
										.to.have.property('boolDefault')
										.to.be.equal(false);
								});
						});
						it('can get a string value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el)
										.to.have.property('stringDefault')
										.to.be.equal('test');
									el.props.stringDefault = 'test2';
									expect(el)
										.to.have.property('stringDefault')
										.to.be.equal('test2');
								});
						});
						it('can get a number value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(10);
									el.props.numberDefault = 20;
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(20);
								});
						});
						it('can be disabled for bools', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									el.props.noReflectBool = true;
									expect(el)
										.to.not.have.property('noReflectBool');
								});
						});
						it('can be disabled for strings', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									el.props.noReflectString = 'test';
									expect(el)
										.to.not.have.property('noReflectString');
								});
						});
						it('can be disabled for numbers', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									el.props.noReflectNumber = 10;
									expect(el)
										.to.not.have.property('noReflectNumber');
								});
						});
					});
					context('Removing', () => {
						it('can remove a boolean', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('boolDefault')
										.to.be.equal(true);
									expect(el).to.have.attr('bool-default');
									el.removeAttribute('bool-default');
									cy.wrap(stub).should('be.calledOnce');
									expect(el).to.not.have.attr('bool-default');
									expect(el)
										.to.have.property('boolDefault')
										.to.be.equal(false);
								});
						});
						it('can remove a string', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('stringDefault')
										.to.be.equal('test');
									expect(el).to.have.attr('string-default');
									el.removeAttribute('string-default');
									cy.wrap(stub).should('be.calledOnce');
									expect(el).to.not.have.attr('string-default');
									expect(el)
										.to.have.property('stringDefault')
										.to.be.equal(undefined);
								});
						});
						it('can remove a number', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(10);
									expect(el).to.have.attr('number-default');
									el.removeAttribute('number-default');
									cy.wrap(stub).should('be.calledOnce');
									expect(el).to.not.have.attr('number-default');
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(undefined);
								});
						});
						it('does not call the update function when the value was already undefined', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(10);
									expect(el).to.have.attr('number-default');
									el.props.numberDefault = undefined as any;
									cy.wrap(stub).should('be.calledOnce');
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(undefined);
									el.removeAttribute('number-default');
									cy.wrap(stub).should('be.calledOnce');
									expect(el).to.not.have.attr('number-default');
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(undefined);
								});
						});
						it('does not call the update function when the attribute is removed twice', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(10);
									expect(el).to.have.attr('number-default');
									el.removeAttribute('number-default');
									cy.wrap(stub).should('be.calledOnce');
									expect(el).to.not.have.attr('number-default');
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(undefined);
									el.removeAttribute('number-default');
									cy.wrap(stub).should('be.calledOnce');
									expect(el).to.not.have.attr('number-default');
									expect(el)
										.to.have.property('numberDefault')
										.to.be.equal(undefined);
								});
						});
					});
					context('Reflecting to attribute', () => {
						context('Enabled', () => {
							it('reflects props to the attributes', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<PrivProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										expect(el).to.have.attr('bool');
									});
							});
							it('updates the attribute when the prop is set', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<PrivProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test');
										expect(el).to.have.attr('string', 'test');
										el.props.string = 'test2';
										expect(el).to.have.attr('string', 'test2');
									});
							});
							it('updates the prop when the attribute is set', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<PrivProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('number')
											.to.be.equal(1);
										expect(el).to.have.attr('number', '1');
										el.setAttribute('number', '2');
										expect(el).to.have.attr('number', '2');
										expect(el).to.have.property('props')
											.to.have.property('number')
											.to.be.equal(2);
									});
							});
							it('updates the self-reflected value when the attribute is set', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<PrivProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test');
										expect(el).to.have.attr('string', 'test');
										expect(el).to.have.property('string')
											.to.be.equal('test');
										el.setAttribute('string', 'test2');
										expect(el).to.have.attr('string', 'test2');
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test2');
										expect(el).to.have.property('string')
											.to.be.equal('test2');
									});
							});
							it('unsets the value when removeAttribute is called', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<PrivProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test');
										expect(el).to.have.attr('string', 'test');
										el.removeAttribute('string');
										expect(el).to.not.have.attr('string');
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal(undefined);
										expect(el).to.have.property('string')
											.to.be.equal(undefined);
									});
							});
						});
						context('Disabled', () => {
							it('does not reflect values to the attributes', () => {
								cy.get('priv-props')
									.then(([el]: JQuery<PrivProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										expect(el).to.not.have.attr('bool');
									});
							});
							it('does not set the attribute when a prop is set', () => {
								cy.get('priv-props')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										expect(el).to.not.have.attr('bool');
										el.props.bool = false;
										expect(el).to.not.have.attr('bool');
									});
							});
							it('does not set the attribute when the reflected prop is changed', () => {
								cy.get('priv-props')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test');
										expect(el).to.not.have.attr('string');
										(el as any).string = 'test2';
										expect(el).to.not.have.attr('string');
									});
							});
							it('ignores removeAttribute', () => {
								cy.get('priv-props')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test');
										expect(el).to.not.have.attr('string');
										el.removeAttribute('string');
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal(undefined);
										expect(el).to.not.have.attr('string');
									});
							});
							it('can still get the value through reflection to the component', () => {
								cy.get('priv-props')
									.then(([el]: JQuery<PrivProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										expect(el).to.have.property('bool')
											.to.be.equal(true);
									});
							});
						});
					});
					context('Reflecting to self', () => {
						context('Enabled', () => {
							it('reflects values to the component', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										expect(el).to.have.property('bool')
											.to.be.equal(true);
									});
							});
							it('updates the reflected value when the props are changed', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										el.props.bool = false;
										expect(el).to.have.property('bool')
											.to.be.equal(false);
									});
							});
							it('calls update function when the value has been changed', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<ReflectProps>) => {
										const stub = cy.stub(el, 'renderToDOM');
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										(el as any).bool = false;
										expect(el).to.have.property('bool')
											.to.be.equal(false);
										cy.wrap(stub).should('be.calledOnce');
									});
							});
							it('does not call update function when the value has not been changed', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<ReflectProps>) => {
										const stub = cy.stub(el, 'renderToDOM');
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										(el as any).bool = true;
										expect(el).to.have.property('bool')
											.to.be.equal(true);
										cy.wrap(stub).should('not.be.called');
									});
							});
							it('updates the reflected value when the attribute is changed', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test');
										el.setAttribute('string', 'test2');
										expect(el).to.have.property('string')
											.to.be.equal('test2');
									});
							});
							it('can set the props through the reflected value', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test');
										(el as any).string = 'test2';
										expect(el).to.have.property('string')
											.to.be.equal('test2');
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test2');
									});
							});
							it('updates the attribute when setting the reflected value', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test');
										(el as any).string = 'test2';
										expect(el).to.have.attr('string', 'test2');
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test2');
									});
							});
							it('does not override already defined properties if they are defined before props', () => {
								cy.get('overridden-component')
									.then(([el]: JQuery<OverriddenProp>) => {
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.a('boolean')
											.to.be.equal(true);
										expect(el).to.have.property('bool')
											.to.be.a('string')
											.to.be.equal('str');
									});
							});
						});
						context('Disabled', () => {
							it('does not reflect values of the component', () => {
								cy.get('no-reflect-self')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										expect(el).to.not.have.property('bool');
									});
							});
							it('does not set the reflected value when a prop is set', () => {
								cy.get('no-reflect-self')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										expect(el).to.not.have.property('bool');
										el.props.bool = false;
										expect(el).to.not.have.property('bool');
									});
							});
							it('does not set the reflected value when the attribute is changed', () => {
								cy.get('no-reflect-self')
									.then(([el]: JQuery<ReflectProps>) => {
										expect(el).to.have.property('props')
											.to.have.property('string')
											.to.be.equal('test');
										expect(el).to.not.have.property('string');
										el.setAttribute('string', 'test2');
										expect(el).to.not.have.property('string');
									});
							});
						});
					});
				});
				context('Default Values', () => {
					it('can get a boolean value', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('boolDefault')
									.to.be.equal(true);
							});
					});
					it('can get a string value', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('stringDefault')
									.to.be.equal('test');
							});
					});
					it('can get a number value', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('numberDefault')
									.to.be.equal(10);
							});
					});
				});
				context('Strict', () => {
					it('sets the value to false if anything other than "false" is passed', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('boolStrict')
									.to.be.equal(false);
								el.setAttribute('boolStrict', 'tru');
								expect(el).to.have.property('props')
									.to.have.property('boolStrict')
									.to.be.equal(false);
							});
					});
					it('sets the value to true if "true" is passed', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('boolStrict')
									.to.be.equal(false);
								el.setAttribute('boolStrict', 'true');
								expect(el).to.have.property('props')
									.to.have.property('boolStrict')
									.to.be.equal(true);
							});
					});
				});
				context('Coerce', () => {
					it('booleans can be coerced', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('boolCoerced')
									.to.be.equal(false);
								el.props.boolCoerced = true;
								expect(el).to.have.property('props')
									.to.have.property('boolCoerced')
									.to.be.equal(true);
								el.props.boolCoerced = undefined as any;
								expect(el).to.have.property('props')
									.to.have.property('boolCoerced')
									.to.be.equal(false);
							});
					});
					it('strings can be coerced', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('stringCoerced')
									.to.be.equal('');
								el.props.stringCoerced = 'test';
								expect(el).to.have.property('props')
									.to.have.property('stringCoerced')
									.to.be.equal('test');
								el.props.stringCoerced = undefined as any;
								expect(el).to.have.property('props')
									.to.have.property('stringCoerced')
									.to.be.equal('');
							});
					});
					it('numbers can be coerced', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('numberCoerced')
									.to.be.equal(0);
								el.props.numberCoerced = 10;
								expect(el).to.have.property('props')
									.to.have.property('numberCoerced')
									.to.be.equal(10);
								el.props.numberCoerced = undefined as any;
								expect(el).to.have.property('props')
									.to.have.property('numberCoerced')
									.to.be.equal(0);
							});
					});
					it('coerced values can be removed', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('stringCoerced')
									.to.be.equal('');
								el.props.stringCoerced = 'test';
								expect(el).to.have.property('props')
									.to.have.property('stringCoerced')
									.to.be.equal('test');
								expect(el).to.have.attr('string-coerced');
								el.removeAttribute('string-coerced');
								expect(el).to.have.property('props')
									.to.have.property('stringCoerced')
									.to.be.equal('');
							});
					});
					it('non-basic types are not coerced', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el).to.have.property('props')
									.to.have.property('complexCoerced')
									.to.be.equal(undefined);
								el.props.complexCoerced = {
									a: 'b',
									c: 'd'
								};
								expect(el).to.have.property('props')
									.to.have.property('complexCoerced')
									.to.deep.equal({
										a: 'b',
										c: 'd'
									});
								el.props.complexCoerced = undefined as any;
								expect(el).to.have.property('props')
									.to.have.property('complexCoerced')
									.to.be.equal(undefined);
							});
					});
				});
				context('Watching', () => {
					it('calls renderToDOM when a watched property changes value', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								const stub = cy.stub(el, 'renderToDOM');
								expect(el).to.have.property('props')
									.to.have.property('boolDefault')
									.to.be.equal(true);
								el.props.boolDefault = false;
								cy.wrap(stub).should('be.called');
							});
					});
					it('does not call renderToDOM if the property does not change value', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								const stub = cy.stub(el, 'renderToDOM');
								expect(el).to.have.property('props')
									.to.have.property('boolDefault')
									.to.be.equal(true);
								el.props.boolDefault = true;
								cy.wrap(stub).should('not.be.called');
							});
					});
				});
				context('No Watching', () => {
					it('does not call renderToDOM on props value change if watching is disabled', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								const stub = cy.stub(el, 'renderToDOM');
								expect(el).to.have.property('props')
									.to.have.property('boolNoWatch')
									.to.be.equal(true);
								el.props.boolNoWatch = false;
								expect(el).to.have.property('props')
									.to.have.property('boolNoWatch')
									.to.be.equal(false);
								cy.wrap(stub).should('not.be.called');
							});
					});
					it('does not call renderToDOM on setAttribute value change if watching is disabled', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								const stub = cy.stub(el, 'renderToDOM');
								expect(el).to.have.property('props')
									.to.have.property('boolNoWatch')
									.to.be.equal(true);
								el.setAttribute('bool-no-watch', 'false');
								expect(el).to.have.property('props')
									.to.have.property('boolNoWatch')
									.to.be.equal(false);
								cy.wrap(stub).should('not.be.called');
							});
					});
					it('does not call renderToDOM on reflected change if watching is disabled', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								const stub = cy.stub(el, 'renderToDOM');
								expect(el).to.have.property('props')
									.to.have.property('boolNoWatch')
									.to.be.equal(true);
								(el as any).boolNoWatch = false;
								expect(el).to.have.property('props')
									.to.have.property('boolNoWatch')
									.to.be.equal(false);
								cy.wrap(stub).should('not.be.called');
							});
					});
					it('does not call renderToDOM on value removal if watching is disabled', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								const stub = cy.stub(el, 'renderToDOM');
								expect(el).to.have.property('props')
									.to.have.property('boolNoWatch')
									.to.be.equal(true);
								expect(el).to.have.attr('bool-no-watch');
								el.removeAttribute('bool-no-watch');
								cy.wrap(stub).should('not.be.called');
							});
					});
				});
			});
			context('Complex Types', () => {
				context('Default Values', () => {
					it('can be assigned a default value', () => {
						cy.get('props-element')
							.then(([el]: JQuery<PropsElement>) => {
								expect(el)
									.to.have.property('props')
									.to.have.property('complexDefault')
									.to.be.deep.equal({
										a: 'b',
										c: 'd'
									});
							});
					});

					it('assigns default if no value was passed', () => {
						cy.window().then((win: PropsElementWindow) => {
							let calls: number = 0;
							const stub = cy.stub(win.ChildEl, 'onRender', (props) => {
								if (calls) return;
								calls++;
								expect(props.noVal).to.have.property('a', 'b');
							});
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									el.forceChildElRender(0);
									cy.wrap(stub).should('be.called');
								});
						});
					});
					if (complex) {
						it('does not overwrite passed ref', () => {
							cy.window().then((win: PropsElementWindow) => {
								let calls: number = 0;
								const stub = cy.stub(win.ChildEl, 'onRender', (props) => {
									if (calls) return;
									expect(props.ref).to.have.property('e', 'f');
									calls++;
								});
								cy.get('props-element')
									.then(([el]: JQuery<PropsElement>) => {
										el.forceChildElRender(1);
										cy.wrap(stub).should('be.called');
									});
							});
						});
					}
					it('does not overwrite passed non-ref', () => {
						cy.window().then((win: PropsElementWindow) => {
							let calls: number = 0;
							const stub = cy.stub(win.ChildEl, 'onRender', (props) => {
								if (calls) return;
								expect(props.noref).to.have.property('g', 'h');
								calls++;
							});
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									el.forceChildElRender(2);
									cy.wrap(stub).should('be.called');
								});
						});
					});
				});
				context('Attribute Setting', () => {
					if (complex) {
						it('can be set through a reference initially', () => {
							cy.get('props-element')
								.shadowFind('#ref')
								.then(([receiver]: JQuery<ObjEl>) => {
									expect(receiver)
										.to.have.property('props')
										.to.have.property('complex')
										.to.be.deep.equal({
											a: 'b',
											c: 'd'
										});
								});
						});
					}
					it('can be set through JSON initially', () => {
						cy.get('props-element')
							.shadowFind('#json')
							.then(([receiver]: JQuery<ObjEl>) => {
								expect(receiver)
									.to.have.property('props')
									.to.have.property('complex')
									.to.be.deep.equal({
										a: 'b',
										c: 'd'
									});
							});
					});
					it('falls back to undefined when the JSON is invalid', () => {
						cy.get('props-element')
							.shadowFind('#invalid-json')
							.then(([receiver]: JQuery<ObjEl>) => {
								expect(receiver)
									.to.have.property('props')
									.to.have.property('complex')
									.to.be.equal(undefined);
							});
					});
					it('shows a warning when the JSON is invalid', () => {
						cy.window().then((window) => {
							cy.document().then((document) => {
								const stub = cy.stub(window.console, 'warn', (...args: any[]) => {
									expect(args[0]).to.be.equal('Failed to parse complex JSON value');
								});
								const el = document.createElement('props-element');
								document.body.appendChild(el);
								cy.wrap(stub).should('be.called');
							});
						});
					});
					if (complex) {
						it('can be set by setting the property', () => {
							cy.get('props-element')
								.shadowFind('#ref')
								.then(([receiver]: JQuery<ObjEl>) => {
									expect(receiver)
										.to.have.property('props')
										.to.have.property('complex')
										.to.be.deep.equal({
											a: 'b',
											c: 'd'
										});
									const setRef = {
										a: 'd',
										c: 'b'
									};
									receiver.props.complex = setRef;
									expect(receiver)
										.to.have.property('props')
										.to.have.property('complex')
										.to.be.deep.equal(setRef);
								});
						});
						it('sets to _ if the value can\'t be stringified', () => {
							cy.get('props-element')
								.shadowFind('#ref')
								.then(([receiver]: JQuery<ObjEl>) => {
									const unstringifiable = {} as any;
									unstringifiable.x = unstringifiable;
									receiver.props.complex = unstringifiable;
									expect(receiver)
										.to.have.attr('complex', '_');
								});
						});
					}
				});
				context('Watching', () => {
					context('Properties', () => {
						it('can watch object properties', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('props')
										.to.have.property('watchedObj')
										.to.be.deep.equal({
											a: 'b',
											c: 'd'
										});
									el.props.watchedObj.a = 'e';
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('still watches properties if "watch" is set to false', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('props')
										.to.have.property('watchedPropsNoWatchObj')
										.to.be.deep.equal({
											a: 'b',
											c: 'd'
										});
									el.props.watchedPropsNoWatchObj.a = 'e';
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('watches deletions', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('props')
										.to.have.property('watchedObj')
										.to.be.deep.equal({
											a: 'b',
											c: 'd'
										});
									delete el.props.watchedObj.a;
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('does not call the update function when a property that does not exist is deleted', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('props')
										.to.have.property('watchedObj')
										.to.be.deep.equal({
											a: 'b',
											c: 'd'
										});
									delete (el.props.watchedObj as any).b;
									cy.wrap(stub).should('not.be.called');
								});
						});
						it('ignores changing object proprerties that are not watched', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('props')
										.to.have.property('watchedObj')
										.to.be.deep.equal({
											a: 'b',
											c: 'd'
										});
									el.props.watchedObj.c = 'e';
									cy.wrap(stub).should('not.be.called');
								});
						});
						it('ignores object changes that don\'t change the value', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									expect(el)
										.to.have.property('props')
										.to.have.property('watchedObj')
										.to.be.deep.equal({
											a: 'b',
											c: 'd'
										});
									el.props.watchedObj.a = 'b';
									cy.wrap(stub).should('not.be.called');
								});
						});
						it('can watch array index changes', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchedArr[1] = 10;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchedArr[2] = 10;
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('does not call render when the value does not change', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchedArr[1] = 2;
									cy.wrap(stub).should('not.be.called').then(() => {
										el.props.watchedArr[2] = 3;
										cy.wrap(stub).should('not.be.called');
									});
								});
						});
						it('does not attempt to create a proxy when the default value is null', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('nullObj')
										.to.be.equal(null);
								});
						});
						context('No Proxy', () => {
							beforeEach(() => {
								cy.visit(noProxyFixture, {
									onBeforeLoad(win) {
										delete (win as any).Proxy;
									}
								});
								cy.wait(250);
							});
							it('will show a warning when Proxy is not supported and watching is used', () => {
								cy.document().then((document) => {
									cy.window().then((window) => {
										const stub = cy.stub(window.console, 'warn', (...args: any[]) => {
											expect(args[0]).to.be.equal('Attempted to watch object while proxy method is not supported');
										});
										document.body.appendChild(document.createElement('watched-component'));
										cy.wrap(stub).should('be.calledOnce');
									});
								});
							});
							it('will not show a warning when Proxy is not supported and watching is not used', () => {
								cy.document().then((document) => {
									cy.window().then((window) => {
										const stub = cy.stub(window.console, 'warn', (...args: any[]) => {
											expect(args[0]).to.be.equal('Attempted to watch object while proxy method is not supported');
										});
										document.body.appendChild(document.createElement('reflect-props'));
										cy.wrap(stub).should('not.be.called');
									});
								});
							});
							it('will still call update when Proxy is not supported and a basic value is changed', () => {
								cy.get('reflect-props')
									.then(([el]: JQuery<ReflectProps>) => {
										const stub = cy.stub(el, 'renderToDOM');
										expect(el).to.have.property('props')
											.to.have.property('bool')
											.to.be.equal(true);
										el.props.bool = false;
										cy.wrap(stub).should('be.called');
									});
							});
						});
					});
					context('Nested', () => {
						it('can watch simple object changes', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObj.a = { a: 'd', c: 'b' };
									cy.wrap(stub).should('not.be.called').then(() => {
										el.props.watchNestedObj.b = { a: 'd', c: 'b' };
										cy.wrap(stub).should('not.be.called').then(() => {
											el.props.watchNestedObj.c.d = { a: 'd', c: 'b' };
											cy.wrap(stub).should('be.calledOnce').then(() => {
												el.props.watchNestedObj.c = { d: { a: 'd', c: 'b' } };
												cy.wrap(stub).should('be.calledOnce');
											});
										});
									});
								});
						});
						it('watches root object changes', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObjProp.a = 'b';
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('ignores deleted properties that are not watched', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									delete el.props.watchNestedObjProp.c.e;
									cy.wrap(stub).should('not.be.called');
								});
						});
						it('on an object does not call the update function when a value is not watched', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObjProp.b = 'b';
									cy.wrap(stub).should('not.be.called').then(() => {
										el.props.watchNestedObjProp.a.b = 'c';
										cy.wrap(stub).should('not.be.called');
									});
								});
						});
						it('watches deep changes on objects', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObjProp.b.c = 2;
									cy.wrap(stub).should('be.called');
								});
						});
						it('on an object does not call the update function when a deep change is not watched', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObjProp.b.d = 2;
									cy.wrap(stub).should('not.be.called');
								});
						});
						it('watches pre-set symbol accesses on an object', () => {
							cy.window().then((window: PropsElementWindow) => {
								cy.get('props-element')
									.then(([el]: JQuery<PropsElement>) => {
										const stub = cy.stub(el, 'renderToDOM');
										el.props.watchAnyObj[window.accessSymbol] = 'b';
										cy.wrap(stub).should('be.calledOnce');
									});
							});
						});
						it('on an object does not call the update function when the value of a symbol key did not change', () => {
							cy.window().then((window: PropsElementWindow) => {
								cy.get('props-element')
									.then(([el]: JQuery<PropsElement>) => {
										const stub = cy.stub(el, 'renderToDOM');
										el.props.watchAnyObj[window.accessSymbol] = 'a';
										cy.wrap(stub).should('not.be.called');
									});
							});
						});
						it('watches newly set symbol accesses on an object', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									const newSymbol = Symbol('newSymbol');
									(el.props.watchAnyObj as any)[newSymbol] = 'b';
									cy.wrap(stub).should('be.calledOnce').then(() => {
										(el.props.watchAnyObj as any)[newSymbol] = 'c';
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('watches the removal of a symbol key on an object', () => {
							cy.window().then((window: PropsElementWindow) => {
								cy.get('props-element')
									.then(([el]: JQuery<PropsElement>) => {
										const stub = cy.stub(el, 'renderToDOM');
										delete el.props.watchAnyObj[window.accessSymbol];
										cy.wrap(stub).should('be.calledOnce');
									});
							});
						});
						it('does not proxy null or undefined values on an object', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('watchAnyObj')
										.to.have.property('g')
										.to.be.equal(undefined);
									expect(el).to.have.property('props')
										.to.have.property('watchAnyObj')
										.to.have.property('h')
										.to.be.equal(null);
								});
						});
						it('watches *.x changes on an object', () => {
							// Here *.x is *.d
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObjProp.a.d = 2;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedObjProp.b.d = 3;
										cy.wrap(stub).should('be.calledTwice').then(() => {
											el.props.watchNestedObjProp.f.d = 2;
											cy.wrap(stub).should('be.calledThrice');
										});
									});
								});
						});
						it('watches x.* changes on an object', () => {
							// Here x.* is d.*
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObjProp.d.c = 5;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedObjProp.d.d = 5;
										cy.wrap(stub).should('be.calledTwice').then(() => {
											el.props.watchNestedObjProp.d.e = 5;
											cy.wrap(stub).should('be.calledThrice');
										});
									});
								});
						});
						it('watches x.*.y changes on an object', () => {
							// Here x.*.y is a.*.d
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObjProp.a.b.d = 5;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedObjProp.a.c.d = 5;
										cy.wrap(stub).should('be.calledTwice').then(() => {
											el.props.watchNestedObjProp.d = 5;
											cy.wrap(stub).should('be.calledTwice');
										});
									});
								});
						});
						it('watches nested * changes on an object', () => {
							// Here x.*.y is a.*.d
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObjProp.f.f.f = 5;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedObjProp.c.g.f = 5;
										cy.wrap(stub).should('be.calledTwice').then(() => {
											el.props.watchNestedObjProp.f.f = 5;
											cy.wrap(stub).should('be.calledTwice').then(() => {
												el.props.watchNestedObjProp.f = 5;
												cy.wrap(stub).should('be.calledTwice');
											});
										});
									});
								});
						});
						it('merges * and regular object properties when watching an object', () => {
							// For example if the properties are 'a' and '*.d',
							// the watched values should be 'a', 'a.d' and '*.d'
							// instead of just 'a' and '*.d', which would cause *.d to
							// not be found. As such '*.d' needs to be "merged"
							// with 'a'
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedObjProp.a.d = 5;
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('can watch simple array element changes', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0].a = { a: 'd', c: 'b' };
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedArrProp[0].b = { a: 'd', c: 'b' };
										cy.wrap(stub).should('be.calledOnce').then(() => {
											el.props.watchNestedArrProp[0].c.d = { a: 'd', c: 'b' };
											cy.wrap(stub).should('be.calledTwice').then(() => {
												el.props.watchNestedArrProp[0].c = { d: { a: 'd', c: 'b' } };
												cy.wrap(stub).should('be.calledTwice');
											});
										});
									});
								});
						});
						it('watches root array changes', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0] = 'b';
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('on an array does not call the update function when a value is not watched', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0].b = 'b';
									cy.wrap(stub).should('not.be.called').then(() => {
										el.props.watchNestedArrProp[0].a.b = 'c';
										cy.wrap(stub).should('not.be.called');
									});
								});
						});
						it('watches deep changes on arrays', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0].b.c = 2;
									cy.wrap(stub).should('be.called');
								});
						});
						it('on an array does not call the update function when a deep change is not watched', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0].b.d = 2;
									cy.wrap(stub).should('not.be.called');
								});
						});
						it('watches newly set symbol accesses on an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									const newSymbol = Symbol('newSymbol');
									(el.props.watchAnyArr as any)[newSymbol] = 'b';
									cy.wrap(stub).should('be.calledOnce').then(() => {
										(el.props.watchAnyArr as any)[newSymbol] = 'c';
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('on an array does not call the update function when the value of a symbol key did not change', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									const newSymbol = Symbol('newSymbol');
									(el.props.watchAnyArr as any)[newSymbol] = 'b';
									cy.wrap(stub).should('be.calledOnce').then(() => {
										(el.props.watchAnyArr as any)[newSymbol] = 'b';
										cy.wrap(stub).should('be.calledOnce');
									});
								});
						});
						it('watches the removal of a symbol key on an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									const newSymbol = Symbol('newSymbol');
									(el.props.watchAnyArr as any)[newSymbol] = 'b';
									cy.wrap(stub).should('be.calledOnce').then(() => {
										delete (el.props.watchAnyArr as any)[newSymbol];
										cy.wrap(stub).should('be.calledOnce');
									});
								});
						});
						it('watches *.*.x changes on an array', () => {
							// Here *.*.x is *.*.d
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0].a.d = 2;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedArrProp[0].b.d = 3;
										cy.wrap(stub).should('be.calledTwice').then(() => {
											el.props.watchNestedArrProp[0].f.d = 2;
											cy.wrap(stub).should('be.calledThrice');
										});
									});
								});
						});
						it('watches *.x.* changes on an object', () => {
							// Here *.x.* is *.d.*
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0].d.c = 5;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedArrProp[0].d.d = 5;
										cy.wrap(stub).should('be.calledTwice').then(() => {
											el.props.watchNestedArrProp[0].d.e = 5;
											cy.wrap(stub).should('be.calledThrice');
										});
									});
								});
						});
						it('watches *.x.*.y changes on an array', () => {
							// Here *.x.*.y is *.a.*.d
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0].a.b.d = 5;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedArrProp[0].a.c.d = 5;
										cy.wrap(stub).should('be.calledTwice').then(() => {
											el.props.watchNestedArrProp[0].d = 5;
											cy.wrap(stub).should('be.calledTwice');
										});
									});
								});
						});
						it('watches nested * changes on an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0].f.f.f = 5;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedArrProp[0].c.g.f = 5;
										cy.wrap(stub).should('be.calledTwice').then(() => {
											el.props.watchNestedArrProp[0].f.f = 5;
											cy.wrap(stub).should('be.calledTwice').then(() => {
												el.props.watchNestedArrProp[0].f = 5;
												cy.wrap(stub).should('be.calledTwice');
											});
										});
									});
								});
						});
						it('merges * and regular object properties when watching an array', () => {
							// For example if the properties are 'a' and '*.d',
							// the watched values should be 'a', 'a.d' and '*.d'
							// instead of just 'a' and '*.d', which would cause *.d to
							// not be found. As such '*.d' needs to be "merged"
							// with 'a'
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrProp[0].a.d = 5;
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('can watch specific indices on an array as well', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrIndices[3] = 5;
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('can watch nested paths starting at indices on an array as well', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrIndices[0].a = 5;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.watchNestedArrIndices[1].b = 5;
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('does not call the update function when indices are not watched', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchNestedArrIndices[2] = 5;
									cy.wrap(stub).should('not.be.called');
								});
						});
						it('can watch an array index inside of an object index inside of an array index', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchMultipleNested[0].a[1] = 5;
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('does not call update on a different multiple nested property', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.watchMultipleNested[0].a[2] = 5;
									cy.wrap(stub).should('not.be.called');
								});
						});
					});
					context('Deep', () => {
						it('does not try to create a proxy on a null or undefined object', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchObj.d = null;
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.deepWatchObj.d = undefined;
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('watches the initial properties of an object', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchObj.a.a = 'c';
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.deepWatchObj.a = {
											a: 'b',
											c: 'd'
										};
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('calls the update function when a new property is added', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchObj.d = 'c';
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('calls the update function when a property is deleted', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									delete el.props.deepWatchObj.a;
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('does not call the update function when a property that does not exist is deleted', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									delete el.props.deepWatchObj.d;
									cy.wrap(stub).should('not.be.called');
								});
						});
						it('watches newly added properties of an object', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchObj.d = {
										a: 'b',
										c: 'd'
									};
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.deepWatchObj.d.a = 'c';
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('watches the initial indices of an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchArr[0] = {
										a: {
											a: 'b',
											c: 'd'
										},
										b: {
											a: 'b',
											c: 'd'
										},
										c: {
											d: {
												a: 'b',
												c: 'd'
											}
										}
									};
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('does not call the update function when the values do not change', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchArr[0] = el.props.deepWatchArr[0];
									cy.wrap(stub).should('not.be.called');
								});
						});
						it('calls the update function when items are added into an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchArr[2] = {
										a: {
											a: 'b',
											c: 'd'
										},
										b: {
											a: 'b',
											c: 'd'
										},
										c: {
											d: {
												a: 'b',
												c: 'd'
											}
										}
									};
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('calls the update function when items are pushed into an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchArr.push({
										a: {
											a: 'b',
											c: 'd'
										},
										b: {
											a: 'b',
											c: 'd'
										},
										c: {
											d: {
												a: 'b',
												c: 'd'
											}
										}
									});
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('calls the update function when an item is deleted from an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									delete el.props.deepWatchArr[1];
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('calls the update function when an item is spliced from an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchArr.splice(1, 1);
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('calls the update function when splice replaces an item', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchArr.splice(1, 1, {
										a: {
											a: 'b',
											c: 'd'
										},
										b: {
											a: 'b',
											c: 'd'
										},
										c: {
											d: {
												a: 'b',
												c: 'd'
											}
										}
									});
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('watches a nested object inside an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchArr[0].a.a = 'c';
									cy.wrap(stub).should('be.calledOnce');
								});
						});
						it('watches newly added properties inside the array\'s elements', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchArr[0].d = {
										a: 'b',
										c: 'd'
									};
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.deepWatchArr[0].d.a = 'c';
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('watches newly added arrays inside of objects', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchObj.d = [{
										a: 'b',
										c: 'd'
									}, {
										a: 'b',
										c: 'd'
									}];
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.deepWatchObj.d[0].a = 'c';
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('watches newly added objects inside of arrays', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									el.props.deepWatchArr.push({
										a: {
											a: 'b',
											c: 'd'
										},
										b: {
											a: 'b',
											c: 'd'
										},
										c: {
											d: {
												a: 'b',
												c: 'd'
											}
										}
									});
									cy.wrap(stub).should('be.calledOnce').then(() => {
										el.props.deepWatchArr[2].a.a = 'c';
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('does not attempt to proxy null or undefined values', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									expect(el).to.have.property('props')
										.to.have.property('watchAnyArr')
										.to.have.property('1')
										.to.be.equal(undefined);
									expect(el).to.have.property('props')
										.to.have.property('watchAnyArr')
										.to.have.property('2')
										.to.be.equal(null);
								});
						});
						it('watches newly set symbol accesses on an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									const newSymbol = Symbol('newSymbol');
									(el.props.deepWatchArr as any)[newSymbol] = 'b';
									cy.wrap(stub).should('be.calledOnce').then(() => {
										(el.props.deepWatchArr as any)[newSymbol] = 'c';
										cy.wrap(stub).should('be.calledTwice');
									});
								});
						});
						it('on an array does not call the update function when the value of a symbol key did not change', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									const newSymbol = Symbol('newSymbol');
									(el.props.deepWatchArr as any)[newSymbol] = 'b';
									cy.wrap(stub).should('be.calledOnce').then(() => {
										(el.props.deepWatchArr as any)[newSymbol] = 'b';
										cy.wrap(stub).should('be.calledOnce');
									});
								});
						});
						it('watches the removal of a symbol key on an array', () => {
							cy.get('props-element')
								.then(([el]: JQuery<PropsElement>) => {
									const stub = cy.stub(el, 'renderToDOM');
									const newSymbol = Symbol('newSymbol');
									(el.props.deepWatchArr as any)[newSymbol] = 'b';
									cy.wrap(stub).should('be.calledOnce').then(() => {
										delete (el.props.deepWatchArr as any)[newSymbol];
										cy.wrap(stub).should('be.calledOnce');
									});
								});
						});
					});
				});
			});
		});
		context('Defining', () => {
			context('Config', () => {
				it('can have an empty props object', () => {
					cy.get('empty-props')
						.then(([el]: JQuery<EmptyProps>) => {
							expect(Object.getOwnPropertyNames(el.props)).to.have.length(0);
							expect(el.attributes).to.have.length(0);
						});
				});
				it('can consist of a private config', () => {
					cy.get('priv-props')
						.then(([el]: JQuery<PrivProps>) => {
							expect(el).to.have.property('props')
								.to.have.property('bool');
							expect(el).to.have.property('props')
								.to.have.property('string');
							expect(el).to.have.property('props')
								.to.have.property('number');
							expect(el.attributes).to.have.length(0);
						});
				});
				it('can consist of a public config', () => {
					cy.get('reflect-props')
						.then(([el]: JQuery<PrivProps>) => {
							expect(el).to.have.property('props')
								.to.have.property('bool');
							expect(el).to.have.property('props')
								.to.have.property('string');
							expect(el).to.have.property('props')
								.to.have.property('number');
							expect(el).to.have.attr('bool');
							expect(el).to.have.attr('string');
							expect(el).to.have.attr('number');
						});
				});
			});
			context('Mixin', () => {
				it('can inherit props from a mixin', () => {
					cy.get('merged-props')
						.then(([el]: JQuery<MergedProps>) => {
							expect(el).to.have.property('props')
								.to.have.property('bool');
							expect(el).to.have.property('props')
								.to.have.property('string');
							expect(el).to.have.property('props')
								.to.have.property('number');
							expect(el).to.have.property('props')
								.to.have.property('mergedBool');
							expect(el).to.have.attr('bool');
							expect(el).to.have.attr('string');
							expect(el).to.have.attr('number');
							expect(el).to.have.attr('merged-bool');
						});
				});
				it('can change the extending class\'s props when the super changes its own props', () => {
					cy.get('merged-props')
						.then(([el]: JQuery<MergedProps>) => {
							expect(el).to.have.property('props')
								.to.have.property('bool');
							expect(el).to.have.property('props')
								.to.have.property('string');
							expect(el).to.have.property('props')
								.to.have.property('number');
							expect(el).to.have.property('props')
								.to.have.property('mergedBool');
							expect(el).to.have.attr('bool');
							expect(el).to.have.attr('string');
							expect(el).to.have.attr('number');
							expect(el).to.have.attr('merged-bool');
							el.setPropsSuper();
							expect(el).to.have.property('props')
								.to.have.property('bool')
								.to.be.equal(false);
							expect(el).to.have.property('props')
								.to.have.property('string')
								.to.be.equal('test2');
							expect(el).to.have.property('props')
								.to.have.property('number')
								.to.be.equal(2);
						});
				});
				it('can change the extending class\' props from the extending class', () => {
					cy.get('merged-props')
						.then(([el]: JQuery<MergedProps>) => {
							expect(el).to.have.property('props')
								.to.have.property('bool');
							expect(el).to.have.property('props')
								.to.have.property('string');
							expect(el).to.have.property('props')
								.to.have.property('number');
							expect(el).to.have.property('props')
								.to.have.property('mergedBool');
							expect(el).to.have.attr('bool');
							expect(el).to.have.attr('string');
							expect(el).to.have.attr('number');
							expect(el).to.have.attr('merged-bool');
							el.setPropsExtending();
							expect(el).to.have.property('props')
								.to.have.property('mergedBool')
								.to.be.equal(false);
						});
				});
				it('can change the super\'s inherited props from the extending class', () => {
					cy.get('merged-props')
						.then(([el]: JQuery<MergedProps>) => {
							expect(el).to.have.property('props')
								.to.have.property('bool');
							expect(el).to.have.property('props')
								.to.have.property('string');
							expect(el).to.have.property('props')
								.to.have.property('number');
							expect(el).to.have.property('props')
								.to.have.property('mergedBool');
							expect(el).to.have.attr('bool');
							expect(el).to.have.attr('string');
							expect(el).to.have.attr('number');
							expect(el).to.have.attr('merged-bool');
							el.setSuperPropsExtending();
							expect(el).to.have.property('props')
								.to.have.property('bool')
								.to.be.equal(false);
							expect(el).to.have.property('props')
								.to.have.property('string')
								.to.be.equal('test2');
							expect(el).to.have.property('props')
								.to.have.property('number')
								.to.be.equal(2);
						});
				});
				it('will throw an error if the define arg is not a Props object', (done) => {
					cy.document().then((document) => {
						cy.on('uncaught:exception', (err) => {
							expect(err.message)
								.to.include('Parent props should be a Props object');
							done();
							return false;
						});
						document.createElement('invalid-define-arg');
					});
				});
			});
		});
	});
}

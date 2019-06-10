import { ConfigurableWebComponent, TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE, ComplexType, ConfigurableMixin, mixin } from "../../../../../../src/wclib.js";
import { render } from "../../../../../../node_modules/lit-html/lit-html.js";

export interface PropsElementWindow extends Window {
	accessSymbol: typeof accessSymbol;
}

declare const window: PropsElementWindow;

export interface SomeComplexType {
	a: string;
	c: string;
}

export interface DeepObject {
	a: SomeComplexType;
	b: SomeComplexType;
	c: {
		d: SomeComplexType;
	}
	d?: any;
}

export type DeepArr = {
	a: SomeComplexType;
	b: SomeComplexType;
	c: {
		d: SomeComplexType;
	}
	d?: any;
}[];

@config({
	is: 'obj-el',
	html: new TemplateFn<ComplexReceiverElement>((html) => {
		return html``;
	}, CHANGE_TYPE.NEVER, render)
})
export class ComplexReceiverElement extends ConfigurableWebComponent {
	props = Props.define(this, {
		reflect: {
			complex: ComplexType<SomeComplexType>()
		}
	})
}

const accessSymbol = Symbol('accessSymbol');
window.accessSymbol = accessSymbol;

interface SymbolKeys {
	[accessSymbol]: string;
}

@config({
	is: 'props-element',
	html: new TemplateFn<PropsElement>(function (html) {
		return html`
			<obj-el id="ref" #complex="${{
				a: 'b',
				c: 'd'
			}}"></complex-receiver-element>
			<obj-el id="json" complex="${JSON.stringify({
				a: 'b',
				c: 'd'
			})}"></complex-receiver-element>
		`;
	}, CHANGE_TYPE.PROP, render),
	dependencies: [
		ComplexReceiverElement
	]
})
export class PropsElement extends ConfigurableWebComponent {
	props = Props.define(this, {
		reflect: {
			casingTest: {
				type: PROP_TYPE.BOOL,
				value: true
			},
			casingtest2: {
				type: PROP_TYPE.BOOL,
				value: true
			},

			bool: PROP_TYPE.BOOL,
			string: PROP_TYPE.STRING,
			number: PROP_TYPE.NUMBER,

			boolDefault: {
				type: PROP_TYPE.BOOL,
				value: true
			},
			stringDefault: {
				type: PROP_TYPE.STRING,
				value: 'test'
			},
			numberDefault: {
				type: PROP_TYPE.NUMBER,
				defaultValue: 10
			},
			complexDefault: {
				type: ComplexType<SomeComplexType>(),
				defaultValue: {
					a: 'b',
					c: 'd'
				}
			},

			noReflectBool: {
				type: PROP_TYPE.BOOL,
				reflectToSelf: false
			},
			noReflectString: {
				type: PROP_TYPE.STRING,
				reflectToSelf: false
			},
			noReflectNumber: {
				type: PROP_TYPE.NUMBER,
				reflectToSelf: false
			},

			boolStrict: {
				type: PROP_TYPE.BOOL,
				strict: true
			},

			boolCoerced: {
				type: PROP_TYPE.BOOL,
				coerce: true
			},
			stringCoerced: {
				type: PROP_TYPE.STRING,
				coerce: true
			},
			numberCoerced: {
				type: PROP_TYPE.NUMBER,
				coerce: true
			},
			complexCoerced: {
				type: ComplexType<SomeComplexType>(),
				coerce: true,
				value: undefined
			},

			boolNoWatch: {
				type: PROP_TYPE.BOOL,
				watch: false,
				value: true
			},

			nullObj: {
				type: ComplexType<SomeComplexType>(),
				watchProperties: ['a'],
				value: null
			},

			watchedObj: {
				type: ComplexType<SomeComplexType>(),
				watchProperties: ['a'] as (keyof SomeComplexType)[],
				value: {
					a: 'b',
					c: 'd'
				}
			},
			watchedPropsNoWatchObj: {
				type: ComplexType<SomeComplexType>(),
				watchProperties: ['a'] as (keyof SomeComplexType)[],
				watch: false,
				value: {
					a: 'b',
					c: 'd'
				}
			},
			watchNestedObj: {
				type: ComplexType<DeepObject>(),
				watchProperties: ['c.d'],
				value: {
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
				}
			},
			watchedArr: {
				type: ComplexType<number[]>(),
				watch: true, //True by default as well
				value: [1,2,3,4,5,6,7,8,9]
			},

			watchAnyObj: {
				type: ComplexType<DeepObject & SymbolKeys & {
					g: undefined;
					h: null;
				}>(),
				watchProperties: ['*'],
				value: {
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
					},
					g: undefined,
					h: null,
					[accessSymbol]: 'a'
				}
			},
			watchAnyArr: {
				type: ComplexType<((DeepObject & SymbolKeys)|null|undefined)[]>(),
				watchProperties: ['*'],
				value: [{
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
					},
					[accessSymbol]: 'a'
				}, undefined, null]
			},

			watchNestedObjProp: {
				type: ComplexType<any>(),
				watchProperties: ['a', 'b.c', 'd.*', '*.d', 'a.*.d', '*.*.f'],
				value: {
					a: {
						b: {
							d: 1,
							e: 2
						},
						c: {
							d: 2,
							e: 3
						},
						d: {
							e: 3
						}
					},
					b: {
						c: 1,
						d: 2,
						e: 3
					},
					c: {
						d: 1,
						e: 2,
						g: {
							f: 2
						}
					},
					d: {
						c: 1,
						d: 2,
						e: 3
					},
					f: {
						f: {
							f: 1
						}
					}
				}
			},
			watchNestedArrProp: {
				type: ComplexType<any[]>(),
				watchProperties: ['*.a', '*.b.c', '*.d.*', '*.*.d', '*.a.*.d', '*.*.*.f'],
				value: [{
					a: {
						b: {
							d: 1,
							e: 2
						},
						c: {
							d: 2,
							e: 3
						},
						d: {
							e: 3
						}
					},
					b: {
						c: 1,
						d: 2,
						e: 3
					},
					c: {
						d: 1,
						e: 2,
						g: {
							f: 2
						}
					},
					d: {
						c: 1,
						d: 2,
						e: 3
					},
					f: {
						f: {
							f: 1
						}
					}
				}]
			},
			watchNestedArrIndices: {
				type: ComplexType<any[]>(),
				watchProperties: ['0.a', '1.b', '*.c', '3'],
				value: [{
					a: 1,
					b: 2,
					c: 3
				}, {
					a: 1,
					b: 2,
					c: 3
				}, {
					a: 1,
					b: 2,
					c: 3
				}, {
					a: 1,
					b: 2,
					c: 3
				}, {
					a: 1,
					b: 2,
					c: 3
				}]
			},
			watchMultipleNested: {
				type: ComplexType<any[]>(),
				watchProperties: ['0.a.1'],
				value: [{
					a: [0,1,2,3]
				}]
			},

			deepWatchObj: {
				type: ComplexType<DeepObject>(),
				watch: true,
				watchProperties: ['**'],
				value: {
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
				}
			},
			deepWatchArr: {
				type: ComplexType<DeepArr>(),
				watch: true,
				watchProperties: ['**'],
				value: [{
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
				}, {
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
				}],
			}
		}
	});
};

@config({
	is: 'empty-props',
	html: null
})
export class EmptyProps extends ConfigurableWebComponent {
	props = Props.define(this);
}

@config({
	is: 'priv-props',
	html: null
})
export class PrivProps extends ConfigurableWebComponent {
	props = Props.define(this, {
		priv:  {
			bool: {
				type: PROP_TYPE.BOOL,
				value: true
			},
			string: {
				type: PROP_TYPE.STRING,
				value: 'test'
			},
			number: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	});
}

@config({
	is: 'reflect-props',
	html: null
})
export class ReflectProps extends ConfigurableWebComponent {
	props = Props.define(this, {
		reflect: {
			bool: {
				type: PROP_TYPE.BOOL,
				value: true
			},
			string: {
				type: PROP_TYPE.STRING,
				value: 'test'
			},
			number: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	});
}

const PropMixin = (superFn: typeof ConfigurableWebComponent) => class PropMixin extends superFn {
	props = Props.define(this, {
		reflect: {
			bool: {
				type: PROP_TYPE.BOOL,
				value: true
			},
			string: {
				type: PROP_TYPE.STRING,
				value: 'test'
			},
			number: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	})

	setPropsSuper() {
		this.props.bool = false;
		this.props.string = 'test2';
		this.props.number = 2;
	}
}

@config({
	is: 'merged-props',
	html: null
})
export class MergedProps extends mixin(ConfigurableMixin, PropMixin) {
	props = Props.define(this, {
		reflect: {
			mergedBool: {
				type: PROP_TYPE.BOOL,
				value: true
			}
		}
	}, super.props);

	setPropsExtending() {
		this.props.mergedBool = false;
	}

	setSuperPropsExtending() {
		this.props.bool = false;
		this.props.string = 'test2';
		this.props.number = 2;
	}
}

@config({
	is: 'empty-props',
	html: null
})
export class UnmergedProps extends mixin(ConfigurableMixin, PropMixin) {
	props = Props.define(this) as any;
}

@config({
	is: 'invalid-define-arg',
	html: null
})
export class InvalidDefineArg extends ConfigurableWebComponent {
	props = Props.define(this, {
		reflect: {
			mergedBool: {
				type: PROP_TYPE.BOOL,
				value: true
			}
		}
	}, 1 as any) as any;
}

@config({
	is: 'watched-component',
	html: null
})
export class WatchedComponent extends ConfigurableWebComponent {
	props = Props.define(this, {
		reflect: {
			watched: {
				type: ComplexType<DeepObject>(),
				watchProperties: ['**'],
				value: {
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
				}
			}
		}
	})
}

@config({
	is: 'overridden-component',
	html: null
})
export class OverriddenProp extends ConfigurableWebComponent {
	bool: string = 'str';

	props = Props.define(this, {
		reflect: {
			bool: {
				type: PROP_TYPE.BOOL,
				value: true
			},
			string: {
				type: PROP_TYPE.STRING,
				value: 'test'
			},
			number: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	});
}

@config({
	is: 'no-reflect-self',
	html: null
})
export class NoReflectSelf extends ConfigurableWebComponent {
	props = Props.define(this, {
		reflect: {
			bool: {
				type: PROP_TYPE.BOOL,
				value: true,
				reflectToSelf: false
			},
			string: {
				type: PROP_TYPE.STRING,
				value: 'test',
				reflectToSelf: false
			},
			number: {
				type: PROP_TYPE.NUMBER,
				value: 1,
				reflectToSelf: false
			}
		}
	});
}
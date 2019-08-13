import { TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE, ComplexType, ConfigurableMixin, mixin } from "../../../../../../../build/es/wc-lib.js";
import { render, html } from "../../../../../../../node_modules/lit-html/lit-html.js";
import { BasicWebComponent } from "../../../../../../../build/es/classes/partial.js";

export interface PropsElementWindow extends Window {
	accessSymbol: typeof accessSymbol;
	ChildEl: typeof ChildEl;
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
	html: new TemplateFn<ObjEl>(() => {
		return html``;
	}, CHANGE_TYPE.NEVER, render)
})
export class ObjEl extends BasicWebComponent {
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
	is: 'child-el',
	html: new TemplateFn<ChildEl>(function () {
		ChildEl.onRender(this.props);
		return html``;
	}, CHANGE_TYPE.PROP, render)
})
export class ChildEl extends BasicWebComponent {
	props = Props.define(this, {
		reflect: {
			noVal: {
				type: ComplexType<{}>(),
				defaultValue: { a: 'b' }
			},
			ref: {
				type: ComplexType<{}>(),
				defaultValue: { c: 'd' }
			},
			noref: {
				type: ComplexType<{}>(),
				defaultValue: { e: 'f' }
			},
		}
	})

	static onRender(_props: any) { }

	connectedCallback() {
		super.connectedCallback();
	}
}

window.ChildEl = ChildEl;

@config({
	is: 'props-element',
	html: new TemplateFn<PropsElement>(function (_, props) {
		return html`
			<obj-el id="ref"></obj-el>
			<obj-el id="json" complex="${JSON.stringify({
				a: 'b',
				c: 'd'
			})}"></obj-el>
			<obj-el id="invalid-json" complex="${JSON.stringify({
				a: 'b',
				c: 'd'
			}) + 'padding'}"></obj-el>
			${(() => {
				switch (props.childElIndex) {
					case 0:
						return html`<child-el></child-el>`;
					case 1:
						return html`<child-el #ref="${{e: 'f'}}"></child-el>`;
					case 2:
						return html`<child-el noref="${JSON.stringify({g: 'h'})}"></child-el>`;
					default: 
						return html``;
				}
			})()}
		`;
	}, CHANGE_TYPE.PROP, render),
	dependencies: [
		ObjEl,
		ChildEl
	]
})
export class PropsElement extends BasicWebComponent {
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

			childElIndex: {
				type: PROP_TYPE.NUMBER,
				value: -1
			},

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

	forceChildElRender(index: number) {
		this.props.childElIndex = index;
	}
};

@config({
	is: 'empty-props',
	html: null
})
export class EmptyProps extends BasicWebComponent {
	props = Props.define(this);
}

@config({
	is: 'priv-props',
	html: null
})
export class PrivProps extends BasicWebComponent {
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
export class ReflectProps extends BasicWebComponent {
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

const PropMixin = (superFn: typeof BasicWebComponent) => class PropMixin extends superFn {
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

const propClass = mixin(ConfigurableMixin, PropMixin) as any;

@config({
	is: 'merged-props',
	html: null
})
export class MergedProps extends propClass {
	props = Props.define(this as any, {
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
export class UnmergedProps extends propClass {
	props = Props.define(this as any) as any;
}

@config({
	is: 'invalid-define-arg',
	html: null
})
export class InvalidDefineArg extends BasicWebComponent {
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
export class WatchedComponent extends BasicWebComponent {
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
export class OverriddenProp extends BasicWebComponent {
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
export class NoReflectSelf extends BasicWebComponent {
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

PropsElement.define(true);
EmptyProps.define(true);
PrivProps.define(true);
ReflectProps.define(true);
MergedProps.define(true);
UnmergedProps.define(true);
InvalidDefineArg.define(true);
OverriddenProp.define(true);
NoReflectSelf.define(true);
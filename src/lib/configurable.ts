import { TemplateFn, WebComponentBase, CHANGE_TYPE, TemplateFnLike } from './base.js';
import { EventListenerObj } from './listener.js';
import { WebComponent } from './component.js';
import { WCLibError } from './shared.js';

/**
 * A configurable web component. This is the basic
 * component you should extend to create new
 * components. This can be annotated with an
 * `@config` decorator to define the class
 * 
 * @template ELS - The elements found in this component's HTML
 * @template E - An object map of events to its args and return value. See
 * 	`WebComponentListenable` for more info
 */
export class ConfigurableWebComponent<ELS extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
} = {
	IDS: {};
	CLASSES: {}
}, E extends EventListenerObj = {}> extends WebComponent<ELS, E> {
	/**
	 * The render method that will render this component's HTML
	 * 
	 * @readonly
	 */
	public static html: TemplateFnLike;
	/**
	 * The templates(s) that will render this component's css
	 * 
	 * @readonly
	 */
	public static css: TemplateFnLike|TemplateFnLike[];
	/**
	 * The element's constructor
	 * 
	 * @readonly
	 */
	/* istanbul ignore next */
	public get self(): (typeof ConfiguredComponent|typeof WebComponentBase) { return null as any}
	/**
	 * Components from which this component should inherit
	 * 
	 * @readonly
	 */
	public static mixins?: (MixinFn<any, any, any>)[];
}

/**
 * The configuration passed to `@configure`
 * when configuring a webcomponent
 */
export interface WebComponentConfiguration {
	/**
	 * The name of this component
	 * 
	 * @readonly
	 */
	readonly is: string;
	/**
	 * The templates(s) that will render this component's css
	 * 
	 * @readonly
	 */
	readonly css?: TemplateFnLike|TemplateFnLike[]|null;
	/**
	 * Dependencies of this component. If this
	 * component uses other components in its
	 * template, adding them to this array will
	 * make sure they are defined before this
	 * component is
	 * 
	 * @readonly
	 */
	readonly dependencies?: (typeof WebComponentBase)[];
	/**
	 * The render method that will render this component's HTML
	 * 
	 * @readonly
	 */
	readonly html: TemplateFnLike|null;
	/**
	 * Components from which this component should inherit.
	 * These are not applied by setting this value. You need
	 * to inherit from 
	 * `mixin(ConfigurableWebComponent, yourMixins)`. 
	 * Setting this property only adds some error checking.
	 * 
	 * @readonly
	 */
	readonly mixins?: (MixinFn<any, any, any>)[];
}

/**
 * A component that has been configured. 
 * **Note:** This should only be used as a type and
 * should not be directly extended from.
 * 
 * This will be the type of a configured component extended
 * from `ConfigurableWebComponent` and decorated
 * with `@configure`.
 */
export class ConfiguredComponent extends WebComponentBase {
	constructor() {
		super();
		throw new WCLibError(this, 
			'This class should not be extended directly ' +
			'and should only be used as a type in TypeScript ' +
			'Please extend ConfigurableWebComponent instead and ' +
			'decorate it with @configure');
	}

	/**
	 * The name of this component
	 * 
	 * @readonly
	 */
	static is: string;
	/**
	 * The element's constructor
	 * 
	 * @readonly
	 */
	/* istanbul ignore next */
	public get self() {
		return {} as (typeof ConfiguredComponent|typeof WebComponentBase);
	}

	/**
	 * The template(s) that will render this component's css
	 * 
	 * @readonly
	 */
	public static css: TemplateFnLike|TemplateFnLike[] = 
		new TemplateFn(null, CHANGE_TYPE.NEVER, null);
	/**
	 * The render method that will render this component's HTML
	 * 
	 * @readonly
	 */
	public static html: TemplateFnLike = 
		new TemplateFn(null, CHANGE_TYPE.NEVER, null);
	/**
	 * Dependencies of this component. If this
	 * component uses other components in its
	 * template, adding them to this array will
	 * make sure they are defined before this
	 * component is
	 * 
	 * @readonly
	 */
	static dependencies?: (typeof WebComponentBase)[]
	/**
	 * Components from which this component should inherit.
	 * You should also call
	 * 
	 * @readonly
	 */
	static mixins?: (MixinFn<any, any, any>)[];
}

/**
 * A mixin base for use with the `@config` method
 * of configuring the element
 */
export const ConfigurableMixin = (_superFn: any) => ConfigurableWebComponent;

/**
 * A class that is used as the base for the `ExtendableMixin`
 * mixin. Do not use this class directly. If you want to use
 * an extendable webcomponent, extend `WebComponent` instead.
 * If you want to use an extendable mixin call
 * `mixin(ExtendableMixin, ...mixins)`
 */
export class NonAbstractWebComponent extends WebComponent {
	/* istanbul ignore next */
	get self() { return null as any };
}
/**
 * A mixin base for use with the manual adding/extending of
 * the `.css`, `.html`, `.is` and `.self` properties
 */
export const ExtendableMixin = (_superFn: any) => NonAbstractWebComponent;

/**
 * A function that, when passed a super-class
 * extends that superclass and returns the new
 * extended class
 */
export type MixinFn<S, M, MM> = (superclass: S) => M & {
	new(...args: any[]): MM;
};

/**
 * Joins given mixins into a single merged class.
 * Be sure to pass the base class 
 * (`Mixin`, `MixinConfigured` or your
 * own class) as the first argument to make sure it
 * inherits from that as well when creating the
 * final component. If you want to merge
 * properties as well, make sure to pass `super.props`
 * as the third argument to `Props.define` when you
 * call it (see examples).
 * 
 * **Examples:**
 * ```js
 const A = (superFn) => class A extends superFn {
	 a = 0
 }
 const B = (superFn) => class B extends superFn {
	 b = 1 
 }
 const C = mixin(A, B);
 new C().a; // 0
 new C().b; // 1

 const D = (superFn) => class D extends superFn { 
	 props = Define.props(this, { 
		 d: PROP_TYPE.NUMBER 
	})} 
 }
 const E = (superFn) => class E extends superFn { 
	 props = Define.props(this, { 
		 e: PROP_TYPE.NUMBER 
	}, super.props) 
 }
 const F = mixin(D, E);
 new F().props; // { d: number, e: number }

 const Loggable = (superFn) => class Loggable extends superFn {
	log(...args) { 
		console.log(...args);
	}
 }
 @config({
	// ...
 })
 class LoggableElement extends mixin(ConfigurableMixin, Loggable) {
	constructor() {
		this.log('exists!');
	}
 }
 ```
 * 
 */

/**
 * Configures a component to make sure it can
 * be defined
 * 
 * @param {WebComponentConfiguration} config - The
 * 	configuration for this component
 */
export function config(config: WebComponentConfiguration) {
	const {
		is, html,
		css = [],
		mixins = [],
		dependencies = []
	} = config;
	return <ELS extends {
	IDS: {
		[key: string]: HTMLElement|SVGElement;
	};
	CLASSES: {
		[key: string]: HTMLElement|SVGElement;
	}
}, T, E extends EventListenerObj = {}>(target: T): T => {
		const targetComponent = <any>target as typeof WebComponent;
		class WebComponentConfig extends targetComponent<ELS, E> implements WebComponentBase {
			static is = is;
			static dependencies = dependencies
			static mixins = mixins;
			static html = html;
			static css = css || [];

			get self() {
				return <any>WebComponentConfig as typeof ConfiguredComponent;
			}
		}

		(<typeof ConfiguredComponent><any>target).mixins = mixins;
		(<typeof ConfiguredComponent><any>target).dependencies = dependencies;

		return <any>WebComponentConfig as T;
	}
}


interface DefaultClass {
	new(...args: any[]): {};
}

export type ClassToObj<C> = Pick<C, keyof C>;

export function mixin(): DefaultClass;
export function mixin<M1, MM1>(mixin1: MixinFn<DefaultClass, M1, MM1>): M1 & {
	new(...args: any[]): MM1;
};
export function mixin<M1, MM1, M2, MM2 >(
	mixin1: MixinFn<DefaultClass, M1, MM1 >, mixin2: MixinFn<M1 & {
		new(...args: any[]): MM1;
	}, M2, MM2>): ClassToObj<M1> & ClassToObj<M2> & {
		new(...args: any[]): MM1 & MM2;
	};
export function mixin<M1, MM1, M2, MM2, M3, MM3,>(
	mixin1: MixinFn<DefaultClass, M1, MM1 >, mixin2: MixinFn<M1 & {
		new(...args: any[]): MM1;
	}, M2, MM2>, mixin3: MixinFn<M1 & M2 & {
		new(...args: any[]): MM1 & MM2;
	}, M3, MM3>
	): ClassToObj<M1> & ClassToObj<M2> & ClassToObj<M3> & {
		new(...args: any[]): MM1 & MM2 & MM3;
	};
export function mixin<M1, MM1, M2, MM2, M3, MM3, M4, MM4>(
	mixin1: MixinFn<DefaultClass, M1, MM1>, mixin2: MixinFn<M1 & {
		new(...args: any[]): MM1;
	}, M2, MM2>, mixin3: MixinFn<M1 & M2 & {
		new(...args: any[]): MM1 & MM2;
	}, M3, MM3>, 
	mixin4: MixinFn<M1 & M2 & M3 & {
		new(...args: any[]): MM1 & MM2 & MM3;
	}, M4, MM4>): ClassToObj<M1> & ClassToObj<M2> & ClassToObj<M3> & ClassToObj<M4> & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4;
	};
export function mixin<M1, MM1, M2, MM2, M3, MM3 ,M4, MM4, M5 ,MM5 >(
	mixin1: MixinFn<DefaultClass, M1, MM1>, mixin2: MixinFn<M1 & {
		new(...args: any[]): MM1;
	}, M2, MM2>, mixin3: MixinFn<M1 & M2 & {
		new(...args: any[]): MM1 & MM2;
	}, M3, MM3>, 
	mixin4: MixinFn<M1 & M2 & M3 & {
		new(...args: any[]): MM1 & MM2 & MM3;
	}, M4, MM4>, mixin5: MixinFn<M1 & M2 & M3 & M4 & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4;
	}, M5, MM5>): ClassToObj<M1> & ClassToObj<M2> & ClassToObj<M3> & ClassToObj<M4> & ClassToObj<M5> & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5;
	};
export function mixin<M1, MM1, M2, MM2, M3, MM3, M4, MM4, M5, MM5, M6, MM6 >(
	mixin1: MixinFn<DefaultClass, M1, MM1>, mixin2: MixinFn<M1 & {
		new(...args: any[]): MM1;
	}, M2, MM2>, mixin3: MixinFn<M1 & M2 & {
		new(...args: any[]): MM1 & MM2;
	}, M3, MM3>, mixin4: MixinFn<M1 & M2 & M3 & {
		new(...args: any[]): MM1 & MM2 & MM3;
	}, M4, MM4>, mixin5: MixinFn<M1 & M2 & M3 & M4 & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4;
	}, M5, MM5>, mixin6: MixinFn<M1 & M2 & M3 & M4 & M5 & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5;
	}, M6, MM6>): ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6;
	};
export function mixin<M1, MM1, M2, MM2, M3, MM3, M4, MM4, M5 ,MM5, M6, MM6, M7, MM7 >(
	mixin1: MixinFn<DefaultClass, M1, MM1>, mixin2: MixinFn<M1 & {
		new(...args: any[]): MM1;
	}, M2, MM2>, mixin3: MixinFn<M1 & M2 & {
		new(...args: any[]): MM1 & MM2;
	}, M3, MM3>, mixin4: MixinFn<M1 & M2 & M3 & {
		new(...args: any[]): MM1 & MM2 & MM3;
	}, M4, MM4>, mixin5: MixinFn<M1 & M2 & M3 & M4 & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4;
	}, M5, MM5>, mixin6: MixinFn<M1 & M2 & M3 & M4 & M5 & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5;
	}, M6, MM6>, mixin7: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6;
	}, M7, MM7>): ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & {
		new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7;
	};
export function mixin<M1, MM1, M2, MM2, M3, MM3, M4, MM4, M5, MM5, M6, MM6,
	M7, MM7, M8, MM8>(
		mixin1: MixinFn<DefaultClass, M1, MM1>, mixin2: MixinFn<M1 & {
			new(...args: any[]): MM1;
		}, M2, MM2>, mixin3: MixinFn<M1 & M2 & {
			new(...args: any[]): MM1 & MM2;
		}, M3, MM3>, mixin4: MixinFn<M1 & M2 & M3 & {
			new(...args: any[]): MM1 & MM2 & MM3;
		}, M4, MM4>, mixin5: MixinFn<M1 & M2 & M3 & M4 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4;
		}, M5, MM5>, mixin6: MixinFn<M1 & M2 & M3 & M4 & M5 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5;
		}, M6, MM6>, mixin7: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6;
		}, M7, MM7>, mixin8: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & M7 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7;
		}, M8, MM8>, ): ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8;
		};
export function mixin<M1, MM1, M2, MM2, M3, MM3, M4, MM4, M5, MM5, M6, MM6,
	M7, MM7, M8, MM8, M9, MM9 >(
		mixin1: MixinFn<DefaultClass, M1, MM1>, mixin2: MixinFn<M1 & {
			new(...args: any[]): MM1;
		}, M2, MM2>, mixin3: MixinFn<M1 & M2 & {
			new(...args: any[]): MM1 & MM2;
		}, M3, MM3>, mixin4: MixinFn<M1 & M2 & M3 & {
			new(...args: any[]): MM1 & MM2 & MM3;
		}, M4, MM4>, mixin5: MixinFn<M1 & M2 & M3 & M4 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4;
		}, M5, MM5>, mixin6: MixinFn<M1 & M2 & M3 & M4 & M5 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5;
		}, M6, MM6>, mixin7: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6;
		}, M7, MM7>, mixin8: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & M7 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7;
		}, M8, MM8>, mixin9: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8;
		}, M9, MM9>, ): ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8 & MM9;
		};
export function mixin<M1, MM1, M2, MM2, M3, MM3, M4, MM4, M5, MM5, M6, MM6,
	M7, MM7, M8, MM8, M9, MM9, M10, MM10 >(
		mixin1: MixinFn<DefaultClass, M1, MM1>, mixin2: MixinFn<M1 & {
			new(...args: any[]): MM1;
		}, M2, MM2>, mixin3: MixinFn<M1 & M2 & {
			new(...args: any[]): MM1 & MM2;
		}, M3, MM3>, mixin4: MixinFn<M1 & M2 & M3 & {
			new(...args: any[]): MM1 & MM2 & MM3;
		}, M4, MM4>, mixin5: MixinFn<M1 & M2 & M3 & M4 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4;
		}, M5, MM5>, mixin6: MixinFn<M1 & M2 & M3 & M4 & M5 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5;
		}, M6, MM6>, mixin7: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6;
		}, M7, MM7>, mixin8: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & M7 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7;
		}, M8, MM8>, mixin9: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8;
		}, M9, MM9>, mixin10: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & M9 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8 & MM9;
		}, M10, MM10>): ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M10> & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8 & MM9 & MM10;
		};
export function mixin<
	M1, MM1, M2, MM2, M3, MM3, M4, MM4, M5, MM5, M6, MM6, M7, MM7, M8,
	MM8, M9, MM9, M10, MM10 >(
		mixin1?: MixinFn<DefaultClass, M1, MM1>, mixin2?: MixinFn<M1 & {
			new(...args: any[]): MM1;
		}, M2, MM2>, mixin3?: MixinFn<M1 & M2 & {
			new(...args: any[]): MM1 & MM2;
		}, M3, MM3>, mixin4?: MixinFn<M1 & M2 & M3 & {
			new(...args: any[]): MM1 & MM2 & MM3;
		}, M4, MM4>, mixin5?: MixinFn<M1 & M2 & M3 & M4 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4;
		}, M5, MM5>, mixin6?: MixinFn<M1 & M2 & M3 & M4 & M5 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5;
		}, M6, MM6>, mixin7?: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6;
		}, M7, MM7>, mixin8?: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & M7 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7;
		}, M8, MM8>, mixin9?: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8;
		}, M9, MM9>, mixin10?: MixinFn<M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & M9 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8 & MM9;
		}, M10, MM10>): ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M1> & ClassToObj<M10> & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8 & MM9 & MM10;
		} {
			let current = class {};
			const mixins = [
				mixin1, mixin2, mixin3, mixin4, mixin5,
				mixin6, mixin7, mixin8, mixin9, mixin10
			];
			for (const mixin of mixins) {
				if (!mixin) break;
				current = (mixin as MixinFn<any, any, any>)(current);
			}
			return current as any;
		}
import { TemplateFn, WebComponentBase, CHANGE_TYPE } from './base.js';
import { EventListenerObj } from './listener.js';
import { WebComponent } from './component.js';

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
	public static html: TemplateFn<any, any, any>;
	/**
	 * The templates(s) that will render this component's css
	 * 
	 * @readonly
	 */
	public static css: TemplateFn<any, any, any>|TemplateFn<any, any, any>[];
	/**
	 * The element's constructor
	 * 
	 * @readonly
	 */
	public get self(): (typeof ConfiguredComponent|typeof WebComponentBase) { return null as any}
	/**
	 * Components from which this component should inherit
	 * 
	 * @readonly
	 */
	public static mixins?: (MixinFn<any, any>)[];
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
	readonly css?: TemplateFn<any, any, any>|TemplateFn<any, any, any>[]|null;
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
	readonly html: TemplateFn<any, any, any>;
	/**
	 * Components from which this component should inherit.
	 * These are not applied by setting this value. You need
	 * to inherit from `mixin(yourMixins)`. Setting this
	 * property only adds some error checking.
	 * 
	 * @readonly
	 */
	readonly mixins?: (MixinFn<any, any>)[];
}

/**
 * A component that has been configured. This will
 * be the type of a configured component extended
 * from `ConfigurableWebComponent` and decorated
 * with `@configure`
 */
export class ConfiguredComponent extends WebComponentBase {
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
	public get self(): (typeof ConfiguredComponent|typeof WebComponentBase) { return {} as any}

	/**
	 * The template(s) that will render this component's css
	 * 
	 * @readonly
	 */
	public static css: TemplateFn<any, any, any>|TemplateFn<any, any, any>[] = 
		new TemplateFn(null, CHANGE_TYPE.NEVER, () => {});
	/**
	 * The render method that will render this component's HTML
	 * 
	 * @readonly
	 */
	public static html: TemplateFn<any, any, any> = 
		new TemplateFn(null, CHANGE_TYPE.NEVER, () => {});
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
	static mixins?: (MixinFn<any, any>)[];
}

export class Mixin extends ConfiguredComponent { }

export type MixinFn<M extends typeof Mixin, MM extends Mixin> = (<S extends typeof Mixin>(superclass: S) => M & {
	new(...args: any[]): MM;
});

export function mixin(): void;
export function mixin<M1 extends typeof Mixin, MM1 extends Mixin>(mixin1: MixinFn<M1, MM1>): M1 & {
	new(...args: any[]): MM1;
};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin
	>(
		mixin1: MixinFn<M1, MM1>, mixin2: MixinFn<M2, MM2>
		): M1 & M2 & {
			new(...args: any[]): MM1 & MM2;
		};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin, M3 extends typeof Mixin, MM3 extends Mixin,
	>(
		mixin1: MixinFn<M1, MM1>, mixin2: MixinFn<M2, MM2>, mixin3: MixinFn<M3, MM3>
		): M1 & M2 & M3 & {
			new(...args: any[]): MM1 & MM2 & MM3;
		};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin, M3 extends typeof Mixin, MM3 extends Mixin,
	M4 extends typeof Mixin, MM4 extends Mixin>(
		mixin1: MixinFn<M1, MM1>, mixin2: MixinFn<M2, MM2>, mixin3: MixinFn<M3, MM3>, 
		mixin4: MixinFn<M4, MM4>, 
		): M1 & M2 & M3 & M4 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4;
		};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin, M3 extends typeof Mixin, MM3 extends Mixin,
	M4 extends typeof Mixin, MM4 extends Mixin, M5 extends typeof Mixin,
	MM5 extends Mixin>(
		mixin1: MixinFn<M1, MM1>, mixin2: MixinFn<M2, MM2>, mixin3: MixinFn<M3, MM3>, 
		mixin4: MixinFn<M4, MM4>, mixin5: MixinFn<M5, MM5>, 
		): M1 & M2 & M3 & M4 & M5 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5;
		};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin, M3 extends typeof Mixin, MM3 extends Mixin,
	M4 extends typeof Mixin, MM4 extends Mixin, M5 extends typeof Mixin,
	MM5 extends Mixin, M6 extends typeof Mixin, MM6 extends Mixin>(
		mixin1: MixinFn<M1, MM1>, mixin2: MixinFn<M2, MM2>, mixin3: MixinFn<M3, MM3>, 
		mixin4: MixinFn<M4, MM4>, mixin5: MixinFn<M5, MM5>, mixin6: MixinFn<M6, MM6>, 
		): M1 & M2 & M3 & M4 & M5 & M6 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6;
		};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin, M3 extends typeof Mixin, MM3 extends Mixin,
	M4 extends typeof Mixin, MM4 extends Mixin, M5 extends typeof Mixin,
	MM5 extends Mixin, M6 extends typeof Mixin, MM6 extends Mixin,
	M7 extends typeof Mixin, MM7 extends Mixin>(
		mixin1: MixinFn<M1, MM1>, mixin2: MixinFn<M2, MM2>, mixin3: MixinFn<M3, MM3>, 
		mixin4: MixinFn<M4, MM4>, mixin5: MixinFn<M5, MM5>, mixin6: MixinFn<M6, MM6>, 
		mixin7: MixinFn<M7, MM7>, 
		): M1 & M2 & M3 & M4 & M5 & M6 & M7 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7;
		};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin, M3 extends typeof Mixin, MM3 extends Mixin,
	M4 extends typeof Mixin, MM4 extends Mixin, M5 extends typeof Mixin,
	MM5 extends Mixin, M6 extends typeof Mixin, MM6 extends Mixin,
	M7 extends typeof Mixin, MM7 extends Mixin, M8 extends typeof Mixin, 
	MM8 extends Mixin>(
		mixin1: MixinFn<M1, MM1>, mixin2: MixinFn<M2, MM2>, mixin3: MixinFn<M3, MM3>, 
		mixin4: MixinFn<M4, MM4>, mixin5: MixinFn<M5, MM5>, mixin6: MixinFn<M6, MM6>, 
		mixin7: MixinFn<M7, MM7>, mixin8: MixinFn<M8, MM8>, 
		): M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8;
		};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin, M3 extends typeof Mixin, MM3 extends Mixin,
	M4 extends typeof Mixin, MM4 extends Mixin, M5 extends typeof Mixin,
	MM5 extends Mixin, M6 extends typeof Mixin, MM6 extends Mixin,
	M7 extends typeof Mixin, MM7 extends Mixin, M8 extends typeof Mixin, 
	MM8 extends Mixin, M9 extends typeof Mixin, MM9 extends Mixin>(
		mixin1: MixinFn<M1, MM1>, mixin2: MixinFn<M2, MM2>, mixin3: MixinFn<M3, MM3>, 
		mixin4: MixinFn<M4, MM4>, mixin5: MixinFn<M5, MM5>, mixin6: MixinFn<M6, MM6>, 
		mixin7: MixinFn<M7, MM7>, mixin8: MixinFn<M8, MM8>, mixin9: MixinFn<M9, MM9>, 
		): M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & M9 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8 & MM9;
		};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin, M3 extends typeof Mixin, MM3 extends Mixin,
	M4 extends typeof Mixin, MM4 extends Mixin, M5 extends typeof Mixin,
	MM5 extends Mixin, M6 extends typeof Mixin, MM6 extends Mixin,
	M7 extends typeof Mixin, MM7 extends Mixin, M8 extends typeof Mixin, 
	MM8 extends Mixin, M9 extends typeof Mixin, MM9 extends Mixin,
	M10 extends typeof Mixin, MM10 extends Mixin>(
		mixin1: MixinFn<M1, MM1>, mixin2: MixinFn<M2, MM2>, mixin3: MixinFn<M3, MM3>, 
		mixin4: MixinFn<M4, MM4>, mixin5: MixinFn<M5, MM5>, mixin6: MixinFn<M6, MM6>, 
		mixin7: MixinFn<M7, MM7>, mixin8: MixinFn<M8, MM8>, mixin9: MixinFn<M9, MM9>, 
		mixin10: MixinFn<M10, MM10>): M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & M9 & M10 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8 & MM9 & MM10;
		};
export function mixin<
	M1 extends typeof Mixin, MM1 extends Mixin, M2 extends typeof Mixin, 
	MM2 extends Mixin, M3 extends typeof Mixin, MM3 extends Mixin,
	M4 extends typeof Mixin, MM4 extends Mixin, M5 extends typeof Mixin,
	MM5 extends Mixin, M6 extends typeof Mixin, MM6 extends Mixin,
	M7 extends typeof Mixin, MM7 extends Mixin, M8 extends typeof Mixin, 
	MM8 extends Mixin, M9 extends typeof Mixin, MM9 extends Mixin,
	M10 extends typeof Mixin, MM10 extends Mixin>(
		mixin1?: MixinFn<M1, MM1>, mixin2?: MixinFn<M2, MM2>, mixin3?: MixinFn<M3, MM3>, 
		mixin4?: MixinFn<M4, MM4>, mixin5?: MixinFn<M5, MM5>, mixin6?: MixinFn<M6, MM6>, 
		mixin7?: MixinFn<M7, MM7>, mixin8?: MixinFn<M8, MM8>, mixin9?: MixinFn<M9, MM9>, 
		mixin10?: MixinFn<M10, MM10>): M1 & M2 & M3 & M4 & M5 & M6 & M7 & M8 & M9 & M10 & {
			new(...args: any[]): MM1 & MM2 & MM3 & MM4 & MM5 & MM6 & MM7 & MM8 & MM9 & MM10;
		} {
			let current = Mixin;
			const mixins = [
				mixin1, mixin2, mixin3, mixin4, mixin5,
				mixin6, mixin7, mixin8, mixin9, mixin10
			];
			for (const mixin of mixins) {
				if (!mixin) break;
				current = (mixin as MixinFn<any, any>)(current);
			}
			return current as any;
		}

	
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
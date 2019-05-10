import { TemplateFn, WebComponentBase } from './base.js';
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
	public readonly html!: TemplateFn<any, any, any>;
	/**
	 * The config uses to configure this component
	 * 
	 * @readonly
	 */
	public static readonly config: WebComponentConfiguration;
	/**
	 * The config uses to configure this component
	 * 
	 * @readonly
	 */
	public readonly config!: WebComponentConfiguration;
	/**
	 * The templates(s) that will render this component's css
	 * 
	 * @readonly
	 */
	public readonly css!: TemplateFn<any, any, any>|TemplateFn<any, any, any>[];
	/**
	 * The element's constructor
	 * 
	 * @readonly
	 */
	public get self(): typeof ConfiguredComponent { return {} as any}
}

/**
 * The `component.is` property which defines the name
 * of the component and its constructor
 */
export type ComponentIs = {
	/**
	 * The name of the component
	 */
	name: string;
	/**
	 * The constructor class of this component
	 */
	component: typeof WebComponentBase;
};
function genIs(name: string, component: typeof WebComponentBase): ComponentIs {
	return {
		name,
		component
	}
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
	readonly css: TemplateFn<any, any, any>|TemplateFn<any, any, any>[];
	/**
	 * Dependencies of this component. If this
	 * component uses other components in its
	 * template, adding them to this array will
	 * make sure they are defined before this
	 * component is
	 * 
	 * @readonly
	 */
	readonly dependencies?: (typeof WebComponentBase|null)[];
	/**
	 * The render method that will render this component's HTML
	 * 
	 * @readonly
	 */
	readonly html: TemplateFn<any, any, any>;
}

/**
 * A component that has been configured. This will
 * be the type of a configured component extended
 * from `ConfigurableWebComponent` and decorated
 * with `@configure`
 */
export abstract class ConfiguredComponent extends WebComponentBase {
	/**
	 * The name of this component and its constructor
	 * 
	 * @readonly
	 */
	static is: ComponentIs;
	/**
	 * Dependencies of this component. If this
	 * component uses other components in its
	 * template, adding them to this array will
	 * make sure they are defined before this
	 * component is
	 * 
	 * @readonly
	 */
	static dependencies: (typeof WebComponentBase | null)[]
	/**
	 * The config uses to configure this component
	 * 
	 * @readonly
	 */
	static config: WebComponentConfiguration;
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
			static is = genIs(is, WebComponentConfig);
			static dependencies = dependencies
			static config = config;
			config = config;
			html = html;
			css = config.css;
			get self() {
				return <any>WebComponentConfig as typeof ConfiguredComponent;
			}
		}
		return <any>WebComponentConfig as T;
	}
}
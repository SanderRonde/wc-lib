import { TemplateFn, WebComponentBase } from './base.js';
import { EventListenerObj } from './listener.js';
import { WebComponent } from './component.js';

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
	public html!: TemplateFn<any, any, any>;
	public static config: WebComponentConfiguration;
	public config!: WebComponentConfiguration;
	public css!: TemplateFn<any, any, any>;
	public get self(): typeof ConfiguredComponent { return {} as any}
}

export declare abstract class WebComponentInterface extends WebComponent<any, any> {
	static is: ComponentIs;
	loaded: boolean;
}

export type ComponentIs = {
	name: string;
	component: typeof WebComponentBase;
};
function genIs(name: string, component: typeof WebComponentBase): ComponentIs {
	return {
		name,
		component
	}
}

export function genIsAccessor(name: string, component: () => typeof WebComponentBase): ComponentIs {
	const data: Partial<ComponentIs> = {
		name
	}
	Object.defineProperty(data, 'constructor', {
		get() {
			return component();
		}
	});
	return data as ComponentIs;
}

export interface WebComponentConfiguration {
	is: string;
	css: TemplateFn<any, any, any>|TemplateFn<any, any, any>[];
	dependencies?: (typeof WebComponentBase|null)[];
	html: TemplateFn<any, any, any>;
}
export abstract class ConfiguredComponent extends WebComponentBase {
	static is: ComponentIs;
	static dependencies: (typeof WebComponentBase | null)[]
	static config: WebComponentConfiguration;
}
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
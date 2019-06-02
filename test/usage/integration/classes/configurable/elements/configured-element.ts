import { ConfigurableWebComponent, TemplateFn, CHANGE_TYPE, config, WebComponentBase, MixinFn, TemplateFnLike, ConfiguredComponent } from '../../../../../../src/wclib.js';

export interface TestConfiguredWindow extends Window {
	configured: {
		HTMLTemplate: TemplateFn;
		CSSTemplate: TemplateFn;
		element: typeof ConfiguredElement;
		dependencies: (typeof WebComponentBase)[];
		mixins: MixinFn<any, any, any>[];

		wrongClasses: {
			MissingIs: typeof MissingIs;
			NonStringIs: typeof NonStringIs;
			InvalidIs: typeof InvalidIs;
			MissingHTML: typeof MissingHTML;
			UnsetHTML: typeof UnsetHTML;
			UnsetHTML2: typeof UnsetHTML2;
			NonTemplateHTML: typeof NonTemplateHTML;
			TemplateLikeHTML: typeof TemplateLikeHTML;
			MissingCSS: typeof MissingCSS;
			NonTemplateCSS: typeof NonTemplateCSS;
			WrongArrayCSS: typeof WrongArrayCSS;
			ArrayCSS: typeof ArrayCSS;
			WronglyConfiguredComponent: typeof WronglyConfiguredComponent;
		}
	}
}
declare const window: TestConfiguredWindow;

const HTMLTemplate = new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {});
const CSSTemplate = new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {});
const dependencies = [] as (typeof WebComponentBase)[];
const mixins = [] as (MixinFn<any, any, any>)[];

@config({
	is: 'configured-element',
	html: HTMLTemplate,
	css: CSSTemplate,
	dependencies: dependencies,
	mixins: mixins
})
export class ConfiguredElement extends ConfigurableWebComponent { }


@config({
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class MissingIs extends ConfigurableWebComponent { }

@config({
	is: 1,
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class NonStringIs extends ConfigurableWebComponent { }

@config({
	is: 'invalid',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class InvalidIs extends ConfigurableWebComponent { }

@config({
	is: 'missing-html',
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class MissingHTML extends ConfigurableWebComponent { }

@config({
	is: 'unset-html',
	html: null,
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class UnsetHTML extends ConfigurableWebComponent { }

@config({
	is: 'unset-html2',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class UnsetHTML2 extends ConfigurableWebComponent { }

@config({
	is: 'non-template-html',
	html: 3,
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class NonTemplateHTML extends ConfigurableWebComponent { }

class TemplateLike implements TemplateFnLike {
	constructor(public changeOn: number) {}

	renderAsText(_changeType: CHANGE_TYPE, _component: {
		props: any;
	}): string {
		return '';
	}
	renderTemplate(_changeType: CHANGE_TYPE, _component: {
		props: any; 
	}): any|null {
		return '';
	}
	renderSame(_changeType: CHANGE_TYPE, _component: { 
		props: any; 
	}, _templater: any): any|string|null {
		return '';
	}
	render(_template: any|null, _target: HTMLElement): void { };
	renderIfNew(_template: any|null, _target: HTMLElement): void { }
}

@config({
	is: 'template-extender',
	html: new TemplateLike(1),
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class TemplateLikeHTML extends ConfigurableWebComponent { }

@config({
	is: 'missing-css',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class MissingCSS extends ConfigurableWebComponent { }

@config({
	is: 'non-template-css',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: 3,
	dependencies: [],
	mixins: []
} as any)
class NonTemplateCSS extends ConfigurableWebComponent { }

@config({
	is: 'wrong-array-css',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: [1, 2, 3],
	dependencies: [],
	mixins: []
} as any)
class WrongArrayCSS extends ConfigurableWebComponent { }

@config({
	is: 'array-css',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: [
		new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
		new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
		new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {})
	],
	dependencies: [],
	mixins: []
} as any)
class ArrayCSS extends ConfigurableWebComponent { }

@config({
	is: 'wrong-component',
	html: null
})
class WronglyConfiguredComponent extends ConfiguredComponent {
	
}

window.configured = {
	HTMLTemplate,
	CSSTemplate,
	element: ConfiguredElement,
	dependencies,
	mixins,

	wrongClasses: {
		MissingIs,
		NonStringIs,
		InvalidIs,
		MissingHTML,
		UnsetHTML,
		UnsetHTML2,
		NonTemplateHTML,
		TemplateLikeHTML,
		MissingCSS,
		NonTemplateCSS,
		WrongArrayCSS,
		ArrayCSS,
		WronglyConfiguredComponent
	}
};
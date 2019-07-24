import { ConfigurableWebComponent, TemplateFn, CHANGE_TYPE, config, MixinFn, TemplateFnLike } from '../../../../../../src/wclib.js';
import { WebComponentDefinerMixinClass } from '../../../../../../src/classes/types.js';

export interface TestConfiguredWindow extends Window {
	configured: {
		HTMLTemplate: TemplateFn;
		CSSTemplate: TemplateFn;
		element: typeof ConfiguredElement;
		dependencies: (Pick<WebComponentDefinerMixinClass, 'define'>)[];
		mixins: MixinFn<any, any, any>[];
		dependencyInherit: {
			class: typeof DependencyInheriter;
			parent: any[];
			added: any[];
		};
		duplicates: {
			class: typeof DuplicateDependencies;
			dependencies: any[];
		}

		wrongClasses: {
			MissingIs: typeof MissingIs;
			NonStringIs: typeof NonStringIs;
			NoDashIs: typeof NoDashIs;
			UppercaseIs: typeof UppercaseIs;
			NumberIs: typeof NumberIs;
			DashIs: typeof DashIs;
			MissingHTML: typeof MissingHTML;
			UnsetHTML: typeof UnsetHTML;
			UnsetHTML2: typeof UnsetHTML2;
			NonTemplateHTML: typeof NonTemplateHTML;
			FalsyTemplateHTML: typeof FalsyTemplateHTML;
			TemplateLikeHTML: typeof TemplateLikeHTML;
			MissingCSS: typeof MissingCSS;
			NonTemplateCSS: typeof NonTemplateCSS;
			WrongArrayCSS: typeof WrongArrayCSS;
			FalsyArrayCSS: typeof FalsyArrayCSS;
			ArrayCSS: typeof ArrayCSS;
		}
	}
}
declare const window: TestConfiguredWindow;

const HTMLTemplate = new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {});
const CSSTemplate = new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {});
const dependencies = [] as (Pick<WebComponentDefinerMixinClass, 'define'>)[];
const mixins = [] as (MixinFn<any, any, any>)[];

@config({
	is: 'configured-element',
	html: HTMLTemplate,
	css: CSSTemplate,
	dependencies: dependencies,
	mixins: mixins
})
export class ConfiguredElement extends ConfigurableWebComponent { }

const parentDependencies = [{}, {}];
const addedDependencies = [{}, {}];

@config({
	is: 'parent-dependencies',
	html: null,
	css: null,
	dependencies: parentDependencies as any
})
class ParentDependencies extends ConfiguredElement { }

@config({
	is: 'dependency-inheriter',
	html: null,
	css: null,
	dependencies: addedDependencies as any
})
class DependencyInheriter extends ParentDependencies { }

const someDependencies = [{}, {}, {}];
@config({
	is: 'duplicate-dependencies',
	html: null,
	css: null,
	dependencies: [...someDependencies, ...someDependencies, ...someDependencies] as any
})
class DuplicateDependencies extends ConfiguredElement { } 

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
class NoDashIs extends ConfigurableWebComponent { }

@config({
	is: 'Uppercase-Name',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class UppercaseIs extends ConfigurableWebComponent { }

@config({
	is: '0number-name',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class NumberIs extends ConfigurableWebComponent { }

@config({
	is: '-dashname',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class DashIs extends ConfigurableWebComponent { }

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

@config({
	is: 'falsy-template-html',
	html: false,
	css: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	dependencies: [],
	mixins: []
} as any)
class FalsyTemplateHTML extends ConfigurableWebComponent { }

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
	is: 'falsy-array-css',
	html: new TemplateFn<ConfiguredElement>(null, CHANGE_TYPE.NEVER, () => {}),
	css: [false, false],
	dependencies: [],
	mixins: []
} as any)
class FalsyArrayCSS extends ConfigurableWebComponent { }

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

window.configured = {
	HTMLTemplate,
	CSSTemplate,
	element: ConfiguredElement,
	dependencies,
	dependencyInherit: {
		class: DependencyInheriter,
		parent: parentDependencies,
		added: addedDependencies
	},
	duplicates: {
		class: DuplicateDependencies,
		dependencies: someDependencies
	},
	mixins,

	wrongClasses: {
		MissingIs,
		NonStringIs,
		NoDashIs,
		UppercaseIs,
		NumberIs,
		DashIs,
		MissingHTML,
		UnsetHTML,
		UnsetHTML2,
		NonTemplateHTML,
		TemplateLikeHTML,
		FalsyTemplateHTML,
		MissingCSS,
		NonTemplateCSS,
		WrongArrayCSS,
		FalsyArrayCSS,
		ArrayCSS
	}
};
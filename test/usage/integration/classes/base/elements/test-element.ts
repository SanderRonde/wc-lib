import { ConfigurableWebComponent, TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE } from '../../../../../../src/wclib.js';
import { render, html } from '../../../../../../node_modules/lit-html/lit-html.js';

export interface RenderTestWindow extends Window {
	renderCalled: {
		never: number;
		prop: number;
		theme: number;
		lang: number;
		always: number;
		'prop-theme': number;
		'prop-lang': number;
		'theme-lang': number;
		all: number;
	}
	TestElement: typeof TestElement;
}

declare const window: RenderTestWindow;
window.renderCalled = {} as any;

const TestElementHTML = new TemplateFn<TestElement>((_, props) => {
	return html`
		<div>Test</div>
		<h1>${props.x}</h1>
	`;
}, CHANGE_TYPE.PROP, render);

const TestElementCSS = new TemplateFn<TestElement>(() => {
	return html`<style> * {color: red; } </style>`;
}, CHANGE_TYPE.NEVER, render);

export class TestElementBase extends ConfigurableWebComponent<{
	IDS: {};
	CLASSES: {};
}> {
	props = Props.define(this, {
		reflect: {
			x: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	})
}

@config({
	is: 'test-element',
	html: TestElementHTML,
	css: TestElementCSS
})
export class TestElement extends TestElementBase { }

window.renderCalled['never'] = 0;
@config({
	is: 'render-test-never',
	html: new TemplateFn<RenderTestElementNever>(() => {
		window.renderCalled['never']++;
		return html`<div></div>`;
	}, CHANGE_TYPE.NEVER, render)
})
class RenderTestElementNever extends TestElementBase { }

window.renderCalled['prop'] = 0;
@config({
	is: 'render-test-prop',
	html: new TemplateFn<RenderTestElementProp>(() => {
		window.renderCalled['prop']++;
		return html`<div></div>`;
	}, CHANGE_TYPE.PROP, render)
})
class RenderTestElementProp extends TestElementBase { }

window.renderCalled['theme'] = 0;
@config({
	is: 'render-test-theme',
	html: new TemplateFn<RenderTestElementTheme>(() => {
		window.renderCalled['theme']++;
		return html`<div></div>`;
	}, CHANGE_TYPE.THEME, render)
})
class RenderTestElementTheme extends TestElementBase { }

window.renderCalled['lang'] = 0;
@config({
	is: 'render-test-lang',
	html: new TemplateFn<RenderTestElementLang>(() => {
		window.renderCalled['lang']++;
		return html`<div></div>`;
	}, CHANGE_TYPE.LANG, render)
})
class RenderTestElementLang extends TestElementBase { }

window.renderCalled['always'] = 0;
@config({
	is: 'render-test-always',
	html: new TemplateFn<RenderTestElementAlways>(() => {
		window.renderCalled['always']++;
		return html`<div></div>`;
	}, CHANGE_TYPE.ALWAYS, render)
})
class RenderTestElementAlways extends TestElementBase { }

window.renderCalled['prop-theme'] = 0;
@config({
	is: 'render-test-prop-theme',
	html: new TemplateFn<RenderTestElementPropTheme>(() => {
		window.renderCalled['prop-theme']++;
		return html`<div></div>`;
	}, CHANGE_TYPE.PROP | CHANGE_TYPE.THEME, render)
})
class RenderTestElementPropTheme extends TestElementBase { }

window.renderCalled['prop-lang'] = 0;
@config({
	is: 'render-test-prop-lang',
	html: new TemplateFn<RenderTestElementPropLang>(() => {
		window.renderCalled['prop-lang']++;
		return html`<div></div>`;
	}, CHANGE_TYPE.PROP | CHANGE_TYPE.LANG, render)
})
class RenderTestElementPropLang extends TestElementBase { }

window.renderCalled['theme-lang'] = 0;
@config({
	is: 'render-test-theme-lang',
	html: new TemplateFn<RenderTestElementThemeLang>(() => {
		window.renderCalled['theme-lang']++;
		return html`<div></div>`;
	}, CHANGE_TYPE.THEME | CHANGE_TYPE.LANG, render)
})
class RenderTestElementThemeLang extends TestElementBase { }

window.renderCalled['all'] = 0;
@config({
	is: 'render-test-all',
	html: new TemplateFn<RenderTestElementAll>(() => {
		window.renderCalled['all']++;
		return html`<div></div>`;
	}, CHANGE_TYPE.PROP | CHANGE_TYPE.THEME | CHANGE_TYPE.LANG, render)
})
class RenderTestElementAll extends TestElementBase { }

window.TestElement = TestElement;

TestElement.define();
RenderTestElementNever.define();
RenderTestElementProp.define();
RenderTestElementTheme.define();
RenderTestElementLang.define();
RenderTestElementAlways.define();
RenderTestElementPropTheme.define();
RenderTestElementPropLang.define();
RenderTestElementThemeLang.define();
RenderTestElementAll.define();
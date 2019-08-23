import { TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE } from '../../../../../../../src/wclib.js';
import { render, html } from '../../../../../../../node_modules/lit-html/lit-html.js';
import { ThemingWebComponent } from "../../../../../../../src/classes/partial.js";
import { TestTheme } from "../../../../classes/theme-manager/themeManagerspec.js";

const TestElementHTML = new TemplateFn<TestElement>((_, props) => {
	return html`
		<div class="divClass" id="divId">Test</div>
		<h1 id="headerId" class="headerClass">${props.x}</h1>
	`;
}, CHANGE_TYPE.PROP, render);

const TestElementCSS = new TemplateFn<TestElement>(() => {
	return html`<style> * {color: red; } </style>`;
}, CHANGE_TYPE.NEVER, render);

@config({
	is: 'test-element',
	html: TestElementHTML,
	css: TestElementCSS
})
export class TestElement extends ThemingWebComponent<{
	IDS: {
		divId: HTMLDivElement;
		headerId: HTMLHeadingElement;
	};
	CLASSES: {
		divClass: HTMLDivElement;
		headerClass: HTMLHeadingElement;
	};
}, {
	test: {
		args: [number, number];
	}
	test2: {
		args: [];
		returnType: number;
	}
}> {
	props = Props.define(this, {
		reflect: {
			x: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	});
}

export interface TestWindow extends Window {
	TestElement: typeof TestElement;
}
declare const window: TestWindow;
window.TestElement = TestElement;
TestElement.define();

export const usedThemes: {
	[key: string]: TestTheme;
} = {
	first: {
		color1: 'rgb(255, 0, 0)',
		color2: 'rgb(0, 255, 255)'
	},
	second: {
		color1: 'rgb(0, 255, 0)',
		color2: 'rgb(255, 0, 255)'
	},
	third: {
		color1: 'rgb(0, 0, 255)',
		color2: 'rgb(255, 255, 0)'
	}
};
export const defaultTheme = 'first';

@config({
	is: 'themed-element',
	html: new TemplateFn<ThemedElement>(() => {
		return html`
			<div class="text">test</div>
			<div class="text2">test2</div>
		`;
	}, CHANGE_TYPE.NEVER, render),
	css: new TemplateFn<ThemedElement, TestTheme>((_html, _prop, theme) => {
		return html`<style>
				.text {
					color: ${theme.color1};
				}

				.text2 {
					color: ${theme.color2};
				}
			</style>`
	}, CHANGE_TYPE.THEME, render)
})
export class ThemedElement extends ThemingWebComponent {

}

@config({
	is: 'themed-element-parent',
	html: new TemplateFn<ThemedElementParent>(() => {
		return html`
			<themed-element></themed-element>
			<themed-element></themed-element>
			<themed-element></themed-element>
			<themed-element></themed-element>
			<themed-element></themed-element>
		`;
	}, CHANGE_TYPE.NEVER, render),
	css: null,
	dependencies: [
		ThemedElement
	]
})
export class ThemedElementParent extends ThemingWebComponent {

}
ThemedElementParent.define();

ThemingWebComponent.initTheme({
	theme: usedThemes
});
ThemingWebComponent.setDefaultTheme(defaultTheme);
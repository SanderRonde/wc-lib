import { ConfigurableWebComponent, TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE } from '../../../../../src/wclib.js';
import { render, html } from 'lit-html';

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

@config({
	is: 'test-element',
	html: TestElementHTML,
	css: TestElementCSS
})
export class TestElement extends ConfigurableWebComponent<{
	IDS: {};
	CLASSES: {};
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
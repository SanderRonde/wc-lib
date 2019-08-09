import { ConfigurableWebComponent, TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE } from '../../../../../build/es/wclib.js';
import { TestGlobalProperties } from '../hierarchy-manager/fixtures/standard/hierarchy-manager.fixture.js';
import { render, html } from '../../../../../node_modules/lit-html/lit-html.js';
import { TestElement } from './test-element.js';

export interface TestParentWindow extends Window {
	ParentElement: typeof ParentElement;
}
declare const window: TestParentWindow;

const ParentElementHTML = new TemplateFn<ParentElement>(() => {
	return html`
		<test-element></test-element>
	`;
}, CHANGE_TYPE.NEVER, render);

const ParentElementCSS = new TemplateFn<ParentElement>(() => {
	return html`<style> * {color: red; } </style>`;
}, CHANGE_TYPE.NEVER, render);

@config({
	is: 'parent-element',
	html: ParentElementHTML,
	css: ParentElementCSS,
	dependencies: [
		TestElement
	]
})
export class ParentElement extends ConfigurableWebComponent<{
	events: {
		test: {
			args: [number, number];
		}
		test2: {
			args: [];
			returnType: number;
		}
	}
	globalProps: TestGlobalProperties;
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

window.ParentElement = ParentElement;
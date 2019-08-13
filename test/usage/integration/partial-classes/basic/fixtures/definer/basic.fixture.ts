import { TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE, DefineMetadata } from '../../../../../../../build/es/wc-lib.js';
import { render, html } from '../../../../../../../node_modules/lit-html/lit-html.js';
import { BasicWebComponent } from '../../../../../../../build/es/classes/partial.js';

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
export class TestElement extends BasicWebComponent<{
	selectors: {
		IDS: {
			divId: HTMLDivElement;
			headerId: HTMLHeadingElement;
		};
		CLASSES: {
			divClass: HTMLDivElement;
			headerClass: HTMLHeadingElement;
		};
	};
	events: {
		test: {
			args: [number, number];
		}
		test2: {
			args: [];
			returnType: number;
		}
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

export interface TestParentWindow extends Window {
	ParentElement: typeof ParentElement;
	TestElement: typeof TestElement;
	DefineMetadata: typeof DefineMetadata;
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
export class ParentElement extends BasicWebComponent<{
	events: {
		test: {
			args: [number, number];
		}
		test2: {
			args: [];
			returnType: number;
		}
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

window.ParentElement = ParentElement;
window.TestElement = TestElement;
window.DefineMetadata = DefineMetadata;
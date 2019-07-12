import { TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE } from '../../../../../../../src/wclib.js';
import { render, html } from '../../../../../../../node_modules/lit-html/lit-html.js';
import { I18NWebComponent } from "../../../../../../../src/classes/partial.js";

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
export class TestElement extends I18NWebComponent<{
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


@config({
	is: 'lifecycle-element',
	html: new TemplateFn<LifecycleElement>(() => {
		return html`<div></div>`;
	}, CHANGE_TYPE.NEVER, render)
})
export class LifecycleElement extends I18NWebComponent {
	lifeCycleCalls: {
		connected: number;
		disconnected: number;
		layoutMounted: number;
		mounted: number;
		unmounted: number;
	} = {
		connected: 0,
		disconnected: 0,
		layoutMounted: 0,
		mounted: 0,
		unmounted: 0
	}

	connectedCallback() {
		super.connectedCallback();
		this.lifeCycleCalls.connected++;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.lifeCycleCalls.disconnected++;
	}

	layoutMounted() {
		this.lifeCycleCalls.layoutMounted++;
	}

	mounted() {
		this.lifeCycleCalls.mounted++;
	}

	unmounted() {
		this.lifeCycleCalls.unmounted++;
	}
}
LifecycleElement.define();
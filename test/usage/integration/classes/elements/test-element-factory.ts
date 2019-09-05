import { TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE } from '../../../../../build/es/wc-lib.js';
import { render, html } from '../../../../../node_modules/lit-html/lit-html.js';

export const TestElementFactory = (base: {
	define(isRoot?: boolean): void;
	new(...args: any[]): {};
}) => {
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
	class TestElement extends base {
		props = Props.define(this as any, {
			reflect: {
				x: {
					type: PROP_TYPE.NUMBER,
					value: 1
				}
			}
		});
	}

	(window as any).TestElement = TestElement;
	return TestElement;
}
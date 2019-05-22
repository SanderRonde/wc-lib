import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE } from "../../../../../../src/wclib.js";
import { render } from "../../../../../../node_modules/lit-html/lit-html.js";
import { TestElement } from "../../elements/test-element.js";

@config({
	is: 'custom-css-element',
	html: new TemplateFn<CustomCSSElement>((html) => {
		return html`
			<test-element custom-css="${
				new TemplateFn<CustomCSSElement>((html) => {
					return html`<style> * { color: blue!important; } </style>`;
				}, CHANGE_TYPE.NEVER, render)
			}"></test-element>
		`;
	}, CHANGE_TYPE.NEVER, render),
	dependencies: [
		TestElement
	]
})
export class CustomCSSElement extends ConfigurableWebComponent {

}
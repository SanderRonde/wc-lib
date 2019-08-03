import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE } from '../../src/wclib.js';
import { render, html } from '../../node_modules/lit-html/lit-html.js';

@config({
	is: 'hello-world',
	html: new TemplateFn<HelloWorld>(() => {
		return html`
			<div>Hello world</div>
		`;
	}, CHANGE_TYPE.NEVER, render),
	css: null
})
export class HelloWorld extends ConfigurableWebComponent { }


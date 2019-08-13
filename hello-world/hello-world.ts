import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE } from '../modules/wc-lib/wc-lib.js';
import { render, html } from '../modules/lit-html/lit-html.js';

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


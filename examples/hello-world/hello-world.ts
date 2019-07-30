import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { render, html } from 'lit-html';

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


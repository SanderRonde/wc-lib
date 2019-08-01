import { ConfigurableWebComponent, Props, config } from '../../src/wclib';
import { TypedHtmlHTML } from './typed-html.html.js';
import { TypedHtmlCSS } from './typed-html.css.js';

@config({
	is: 'typed-html',
	css: TypedHtmlCSS,
	html: TypedHtmlHTML
})
export class TypedHtml extends ConfigurableWebComponent {
	props = Props.define(this, {
		// ...
	});

	mounted() {
		// ...
	}

	firstRender() {
		// ...
	}
}
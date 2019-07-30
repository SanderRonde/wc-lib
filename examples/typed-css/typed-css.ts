import { ConfigurableWebComponent, Props, PROP_TYPE, config } from '../../src/wclib';
import { TypedCssHTML } from './typed-css.html.js';
import { TypedCssCSS } from './typed-css.css.js';

@config({
	is: 'typed-css',
	css: TypedCssCSS,
	html: TypedCssHTML
})
export class TypedCss extends ConfigurableWebComponent {
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
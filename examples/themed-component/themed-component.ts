import { ConfigurableWebComponent, Props, PROP_TYPE, config } from '../../src/wclib';
import { ThemedComponentHTML } from './themed-component.html.js';
import { ThemedComponentCSS } from './themed-component.css.js';

@config({
	is: 'themed-component',
	css: ThemedComponentCSS,
	html: ThemedComponentHTML
})
export class ThemedComponent extends ConfigurableWebComponent {
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
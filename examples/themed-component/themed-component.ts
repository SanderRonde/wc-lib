import { ConfigurableWebComponent, config } from '../../src/wclib';
import { ThemedComponentHTML } from './themed-component.html.js';
import { ThemedComponentCSS } from './themed-component.css.js';

const theme = {
	// Theme can contain any values that are valid in CSS
	light: {
		background: '#FFFFFF',
		primary: 'blue',
		secondary: 'red',
		regular: 'rgb(0, 0, 0)'
	},
	dark: {
		background: '#000000',
		primary: 'yellow',
		secondary: 'purple',
		regular: 'rgb(255, 255, 255)'
	}
}

@config({
	is: 'themed-component',
	css: ThemedComponentCSS,
	html: ThemedComponentHTML
})
export class ThemedComponent extends ConfigurableWebComponent<{
	themes: typeof theme;
}> { }
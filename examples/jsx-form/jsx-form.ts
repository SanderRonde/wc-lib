import { ConfigurableWebComponent, config } from '../../src/wclib';
import { JsxFormHTML } from './jsx-form.html.js';
import { JsxInput } from './jsx-input';

@config({
	is: 'jsx-form',
	css: null,
	html: JsxFormHTML,
	dependencies: [
		JsxInput
	]
})
export class JsxForm extends ConfigurableWebComponent { }
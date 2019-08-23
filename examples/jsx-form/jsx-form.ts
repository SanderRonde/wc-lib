import { ConfigurableWebComponent, config } from '../../build/es/wc-lib.js';
import { JsxFormHTML } from './jsx-form.html.js';
import { JsxInput } from './jsx-input.js';

@config({
	is: 'jsx-form',
	css: null,
	html: JsxFormHTML,
	dependencies: [
		JsxInput
	]
})
export class JsxForm extends ConfigurableWebComponent { }
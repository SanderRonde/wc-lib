import { render } from '../modules/lit-html-bundled/lit-html.js';
import { TemplateFn, CHANGE_TYPE } from '../../build/es/wc-lib.js';
import { JsxInput } from './jsx-input.js';
import { JsxForm } from './jsx-form.js';

declare global {
	namespace JSX {
		interface IntrinsicElements {
			h1: {};
			button: {
				type?: string;
			}
		}
		interface ElementAttributesProperty {
			jsxProps: 'jsxProps';
		}
	}
}

export const JsxFormHTML = new TemplateFn<JsxForm>(function (html) {
	return (
		<div id="form">
			<h1>Login form</h1>
			<JsxInput type="text" name="username" placeholder="username" />
			<JsxInput type="password" name="password" placeholder="password" />
			<button type="submit">Submit</button>
		</div>
	)
}, CHANGE_TYPE.PROP, render);

import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { JsxInput } from './jsx-input.js';
import { JsxForm } from './jsx-form.js';
import { render } from 'lit-html';

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

import { TemplateFn, CHANGE_TYPE } from '../../src/wclib';
import { I18nComponent } from './i18n-component.js';
import { html, render } from 'lit-html';

export const I18nComponentHTML = new TemplateFn<I18nComponent>(function () {
	return html`
		<div>${this.__('what_is_your_name')}</div>
		<div>
			<span>My name is</span>
			<input style="display: inline-block">
		</div>
		<br />
		<button>Set lang to english</button>
		<button>Set lang to german</button>
		<button>Set lang to spanish</button>
	`
}, CHANGE_TYPE.LANG, render);

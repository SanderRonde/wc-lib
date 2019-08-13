import { directive, Part, html, render } from '../../../../../../../node_modules/lit-html/lit-html.js';
import { config, TemplateFn, CHANGE_TYPE } from '../../../../../../../build/es/wc-lib.js';
import { I18NWebComponent } from '../../../../../../../build/es/classes/partial.js';

const awaitPromise = directive((key: string, value: Promise<any>|string) => (part: Part) => {
	if (typeof value === 'string') {
		part.setValue(value);
		part.commit();	
		return;
	}
	part.setValue(`{{${key}}}`);
	value.then((str) => {
		part.setValue(str);
		part.commit();
	});
});

const placeholder = directive((key: string, value: Promise<any>|string) => (part: Part) => {
	if (typeof value === 'string') {
		part.setValue(value);
		part.commit();	
		return;
	}
	part.setValue(`{{${key}}}`);
	part.commit();
	value.then((str) => {
		part.setValue(str);
		part.commit();
	});
});

@config({
	is: 'lang-element',
	html: new TemplateFn<LangElement>(function() {
		return html`
			<div id="placeholdertest">${placeholder('test', this.__prom('test'))}</div>
			<div id="promiseTest">${awaitPromise('test', this.__prom('test'))}</div>
			<div id="returnerTest">${this.__('test')}</div>
			<div id="nonexistent">
				${placeholder('nonexistent', this.__prom('nonexistent'))}
			</div>

			<div id="returnerValues">${this.__('values', '1', '2', '3')}</div>
			<div id="placeholderValues">
				${placeholder('values', this.__prom('values', '1', '2', '3'))}
			</div>

			<div id="msgAsValue">
				${this.__('values', this.__prom('test'), '2', this.__prom('test'))}
			</div>
		`;
	}, CHANGE_TYPE.LANG, render),
	css: null
})
export class LangElement extends I18NWebComponent<{
	langs: 'en'|'nl';
	i18n: {
		test: string;
		nonexistent: string;
		values: string;
	}
}> { }

I18NWebComponent.initI18N({
	urlFormat: '/test/usage/fixtures/i18n/$LANG$.json',
	defaultLang: 'en'
});

(window as any).WebComponent = I18NWebComponent;
LangElement.define();
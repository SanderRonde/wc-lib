import { TemplateFn, CHANGE_TYPE, config } from '../../../../../../build/es/wc-lib.all.js';
import { render, html, directive, Part } from '../../../../../../node_modules/lit-html/lit-html.js';

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

export const LangElement = (superFn: any) => {
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
	class LangElement extends superFn<{
		langs: 'en'|'nl';
		i18n: {
			test: string;
			nonexistent: string;
			values: string;
		}
	}> { }
	return LangElement;
}
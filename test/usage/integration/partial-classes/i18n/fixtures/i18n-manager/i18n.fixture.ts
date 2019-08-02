import { TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE } from '../../../../../../../src/wclib.js';
import { render, html, directive, Part } from '../../../../../../../node_modules/lit-html/lit-html.js';
import { I18NWebComponent } from '../../../../../../../src/classes/partial.js';

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

const TestElementHTML = new TemplateFn<TestElement>((_, props) => {
	return html`
		<div class="divClass" id="divId">Test</div>
		<h1 id="headerId" class="headerClass">${props.x}</h1>
	`;
}, CHANGE_TYPE.PROP, render);

const TestElementCSS = new TemplateFn<TestElement>(() => {
	return html`<style> * {color: red; } </style>`;
}, CHANGE_TYPE.NEVER, render);

@config({
	is: 'test-element',
	html: TestElementHTML,
	css: TestElementCSS
})
export class TestElement extends I18NWebComponent<{
	selectors: {
		IDS: {
			divId: HTMLDivElement;
			headerId: HTMLHeadingElement;
		};
		CLASSES: {
			divClass: HTMLDivElement;
			headerClass: HTMLHeadingElement;
		};
	}
	events: {
		test: {
			args: [number, number];
		}
		test2: {
			args: [];
			returnType: number;
		}
	};
}> {
	props = Props.define(this, {
		reflect: {
			x: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	});
}

export interface TestWindow extends Window {
	TestElement: typeof TestElement;
	ParentElement: typeof ParentElement;
}
declare const window: TestWindow;
window.TestElement = TestElement;

export interface TestParentWindow extends Window {
	ParentElement: typeof ParentElement;
}

const ParentElementHTML = new TemplateFn<ParentElement>(() => {
	return html`
		<test-element></test-element>
	`;
}, CHANGE_TYPE.NEVER, render);

const ParentElementCSS = new TemplateFn<ParentElement>(() => {
	return html`<style> * {color: red; } </style>`;
}, CHANGE_TYPE.NEVER, render);

@config({
	is: 'parent-element',
	html: ParentElementHTML,
	css: ParentElementCSS,
	dependencies: [
		TestElement
	]
})
export class ParentElement extends I18NWebComponent<{
	events: {
		test: {
			args: [number, number];
		}
		test2: {
			args: [];
			returnType: number;
		}
	};
}> {
	props = Props.define(this, {
		reflect: {
			x: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	});
}

window.ParentElement = ParentElement;

const RootElementHTML = new TemplateFn<RootElement>(() => {
	return html`
		<test-element></test-element>
		<parent-element></parent-element>
		<parent-element></parent-element>
		<test-element></test-element>
	`;
}, CHANGE_TYPE.NEVER, render);

const RootElementCSS = new TemplateFn<RootElement>(() => {
	return html`<style> * {color: red; } </style>`;
}, CHANGE_TYPE.NEVER, render);

@config({
	is: 'root-element',
	html: RootElementHTML,
	css: RootElementCSS,
	dependencies: [
		ParentElement,
		TestElement
	]
})
export class RootElement extends I18NWebComponent<{
	events: {
		test: {
			args: [number, number];
		}
		test2: {
			args: [];
			returnType: number;
		}
	};
}> {
	props = Props.define(this, {
		reflect: {
			x: {
				type: PROP_TYPE.NUMBER,
				value: 1
			}
		}
	});
}

interface LangFile {
	test: {
		message: string;
	}
	values: {
		message: string;
	}
}

function applyMarker<F>(fn: F): F {
	(fn as any).___marker = true;
	return fn;
}

I18NWebComponent.initI18N({
	urlFormat: '/test/usage/fixtures/i18n/$LANG$.json',
	defaultLang: 'en',
	returner: directive((promise: Promise<any>, placeholder: string) => applyMarker((part: Part) => {
		part.setValue(placeholder);
		promise.then((str) => {
			part.setValue(str);
			part.commit();
		});
	})),
	async getMessage(langFile: LangFile, key, values) {
		if (!(key in langFile)) {
			return 'not found';
		}

		values = await Promise.all(values);
		const item = langFile[key as keyof typeof langFile];
		if (values.length === 0) return item.message;

		let word = item.message;
		for (let i = 0; i < values.length; i++) {
			word = word.replace(new RegExp(`\\$${i + 1}\\$`, 'gi'),
				values[i]);
		}
		return word;
	}
});

(window as any).WebComponent = I18NWebComponent;
TestElement.define();
LangElement.define();
RootElement.define();
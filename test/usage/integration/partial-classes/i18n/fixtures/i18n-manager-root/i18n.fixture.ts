import { directive, Part, html, render } from '../../../../../../../node_modules/lit-html/lit-html.js';
import { config, TemplateFn, CHANGE_TYPE, Props, PROP_TYPE } from '../../../../../../../build/es/wc-lib.js';
import { I18NWebComponent } from '../../../../../../../build/es/classes/partial.js';

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
RootElement.define();
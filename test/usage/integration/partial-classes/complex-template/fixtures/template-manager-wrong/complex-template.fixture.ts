import { TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE, ComplexType } from '../../../../../../../build/es/wc-lib.js';
import { render, html, directive, Part } from '../../../../../../../node_modules/lit-html/lit-html.js';
import { ComplexTemplatingWebComponent } from "../../../../../../../build/es/classes/partial.js";

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
export class TestElement extends ComplexTemplatingWebComponent<{
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
}
declare const window: TestWindow;
window.TestElement = TestElement;

@config({
	is: 'event-triggering-element',
	html: new TemplateFn<EventTriggeringElement>(() => {
		return html``;
	}, CHANGE_TYPE.NEVER, render)
})
export class EventTriggeringElement extends ComplexTemplatingWebComponent<{
	events: {
		ev: {
			args: [number];
		}
	}
}> { }

@config({
	is: 'complex-receiver-element',
	html: new TemplateFn<ComplexReceiverElement>(() => {
		return html``;
	}, CHANGE_TYPE.NEVER, render)
})
export class ComplexReceiverElement extends ComplexTemplatingWebComponent {
	props = Props.define(this, {
		reflect: {
			parent: ComplexType<ComplexElement>()
		}
	})
}

@config({
	is: 'boolean-element',
	html: new TemplateFn<EventTriggeringElement>(() => {
		return html``;
	}, CHANGE_TYPE.NEVER, render)
})
export class BooleanElement extends ComplexTemplatingWebComponent {
	props = Props.define(this, {
		reflect: {
			bool: PROP_TYPE.BOOL
		}
	});
}

const resolveDirectiveWith = directive(<T>(value: T) => (part: Part) => {
	part.setValue(value);
	part.commit();
});

const changeValueDirective = directive(<T>(val1: T, val2: T, time: number = 250) => (part: Part) => {
	part.setValue(val1);
	part.commit();

	window.setTimeout(() => {
		part.setValue(val2);
		part.commit();
	}, time);
})

@config({
	is: 'complex-element',
	html: new TemplateFn<ComplexElement>(function (html) {
		return html`
			<test-element id="eventTest" @click="${() => {
				// Done so the function can be stubbed
				this.clickHandler();
			}}"></test-element>
			<test-element id="eventDirective" @click="${resolveDirectiveWith(() => {
				// Done so the function can be stubbed
				this.clickHandler();
			})}"></test-element>
			<event-triggering-element id="customEventTest" @@ev="${(arg: number) => {
				// Done so the function can be stubbed
				return this.customClickHandler(arg);
			}}"></event-triggering-element>
			<event-triggering-element id="customEventDirective" @@ev="${resolveDirectiveWith((arg: number) => {
				// Done so the function can be stubbed
				return this.customClickHandler(arg);
			})}"></event-triggering-element>
			<event-triggering-element id="customEventReplaced" @@ev="${changeValueDirective((arg: number) => {
				// Done so the function can be stubbed
				return this.customClickHandler(arg + 1);
			}, (arg: number) => {
				// Done so the function can be stubbed
				return this.customClickHandler(arg + 2);
			})}"></event-triggering-element>
			<event-triggering-element id="customEventRemoved" @@ev="${changeValueDirective((arg: number) => {
				// Done so the function can be stubbed
				return this.customClickHandler(arg);
			}, null)}"></event-triggering-element>
			<event-triggering-element id="customEventDefined" @@ev="${changeValueDirective(null, (arg: number) => {
				// Done so the function can be stubbed
				return this.customClickHandler(arg);
			})}"></event-triggering-element>
			<!-- {} is truthy -->
			<boolean-element id="booleanTestTrue" ?bool="${{}}"></boolean-element>
			<!-- '' is false -->
			<boolean-element id="booleanTestFalse" ?bool="${''}"></boolean-element>
			<div id="classTestObj" class="${{
				a: true,
				b: false
			}}"></div>
			<div id="classTestString" class="${'a b c'}"></div>
			<div id="classTestArr" class="${[{
				a: true,
				b: false
			}, 'c', 'd', {
				e: true,
				f: false
			}]}"></div>
			<div id="classDirective" class="${resolveDirectiveWith('a b c')}"></div>
			<complex-receiver-element id="refTest" #parent="${this}"></complex-receiver-element>
			<complex-receiver-element id="refDirective" #parent="${resolveDirectiveWith(this)}"></complex-receiver-element>
			<test-element id="refTest2" #parent="${this}"></test-element>
			<test-element id="regular" :key="${'value'}"></test-element>
		`;
	}, CHANGE_TYPE.PROP, render),
	dependencies: [
		TestElement,
		EventTriggeringElement,
		ComplexReceiverElement,
		BooleanElement
	]
})
export class ComplexElement extends ComplexTemplatingWebComponent {
	clickHandler(_arg?: any) { 
		// Will be stubbed
	}

	customClickHandler(_num: number) {
		// Will be stubbed
	}
}


@config({
	is: 'wrong-element-listen',
	html: new TemplateFn<WrongElementListen>((html) => {
		return html`
			<div id="customEventDirective" @@ev="${(() => {})}"></div>
			`;
	}, CHANGE_TYPE.PROP, render)
})
export class WrongElementListen extends ComplexTemplatingWebComponent {

}

TestElement.define(true);
(window as any).ComplexElement = ComplexElement;
ComplexElement.define(true);
WrongElementListen.define(true);
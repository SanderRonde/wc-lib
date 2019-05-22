import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE, Props, ComplexType, PROP_TYPE } from "../../../../../../src/wclib.js";
import { render, html } from "../../../../../../node_modules/lit-html/lit-html.js";
import { TestElement } from "../../elements/test-element.js";

@config({
	is: 'event-triggering-element',
	html: new TemplateFn<EventTriggeringElement>(() => {
		return html``;
	}, CHANGE_TYPE.NEVER, render)
})
export class EventTriggeringElement extends ConfigurableWebComponent<{
	IDS: {};
	CLASSES: {};
}, {
	ev: {
		args: [number];
	}
}> { }

@config({
	is: 'complex-receiver-element',
	html: new TemplateFn<EventTriggeringElement>(() => {
		return html``;
	}, CHANGE_TYPE.NEVER, render)
})
export class ComplexReceiverElement extends ConfigurableWebComponent {
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
export class BooleanElement extends ConfigurableWebComponent {
	props = Props.define(this, {
		reflect: {
			bool: PROP_TYPE.BOOL
		}
	});
}

@config({
	is: 'complex-element',
	html: new TemplateFn<ComplexElement>(function (html) {
		return html`
			<test-element id="eventTest" @click="${() => {
				// Done so the function can be stubbed
				this.clickHandler();
			}}"></test-element>
			<event-triggering-element id="customEventTest" @@ev="${(arg: number) => {
				// Done so the function can be stubbed
				return this.customClickHandler(arg);
			}}"></event-triggering-element>
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
			<complex-receiver-element id="refTest" #parent="${this}"></complex-receiver-element>
			<test-element id="refTest2" #parent="${this}"></test-element>
		`;
	}, CHANGE_TYPE.PROP, render),
	dependencies: [
		TestElement,
		EventTriggeringElement,
		ComplexReceiverElement,
		BooleanElement
	]
})
export class ComplexElement extends ConfigurableWebComponent {
	clickHandler() { 
		// Will be stubbed
	}

	customClickHandler(_num: number) {
		// Will be stubbed
	}
}
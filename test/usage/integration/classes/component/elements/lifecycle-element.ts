import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE } from "../../../../../../build/es/wclib.js";
import { render, html } from '../../../../../../node_modules/lit-html/lit-html.js';

@config({
	is: 'lifecycle-element',
	html: new TemplateFn<LifecycleElement>(() => {
		return html`<div></div>`;
	}, CHANGE_TYPE.NEVER, render)
})
export class LifecycleElement extends ConfigurableWebComponent {
	lifeCycleCalls: {
		connected: number;
		disconnected: number;
		layoutMounted: number;
		mounted: number;
		unmounted: number;
	} = {
		connected: 0,
		disconnected: 0,
		layoutMounted: 0,
		mounted: 0,
		unmounted: 0
	}

	connectedCallback() {
		super.connectedCallback();
		this.lifeCycleCalls.connected++;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.lifeCycleCalls.disconnected++;
	}

	layoutMounted() {
		this.lifeCycleCalls.layoutMounted++;
	}

	mounted() {
		this.lifeCycleCalls.mounted++;
	}

	unmounted() {
		this.lifeCycleCalls.unmounted++;
	}
}
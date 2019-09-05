import { config, TemplateFn, CHANGE_TYPE, ConfigurableWebComponent } from "../../../../../../build/es/wc-lib.js";
import { render, html } from '../../../../../../node_modules/lit-html/lit-html.js';

export declare class LifecycleElement extends ConfigurableWebComponent {
	lifeCycleCalls: {
		connected: number;
		disconnected: number;
		layoutMounted: number;
		mounted: number;
		unmounted: number;
	}
}

export const LifecycleElementFactory = (base: any) => {
	@config({
		is: 'lifecycle-element',
		html: new TemplateFn<_LifecycleElement>(() => {
			return html`<div></div>`;
		}, CHANGE_TYPE.NEVER, render) as any
	})
	class _LifecycleElement extends base {
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
	return _LifecycleElement as typeof LifecycleElement;
}
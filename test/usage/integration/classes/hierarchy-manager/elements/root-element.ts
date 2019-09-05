import { TemplateFn, CHANGE_TYPE, config, Props, PROP_TYPE } from '../../../../../../build/es/wc-lib.js';
import { TestGlobalProperties } from '../fixtures/standard/hierarchy-manager.fixture.js';
import { render, html } from '../../../../../../node_modules/lit-html/lit-html.js';
import { ParentElement } from '../../elements/parent-element.js';
import { TestElement } from '../../elements/test-element.js';

export const RootElement = (superFn: any) => {
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
	class RootElement extends superFn<{
		events: {
			test: {
				args: [number, number];
			}
			test2: {
				args: [];
				returnType: number;
			}
		}
		root: RootElement;
		globalProps: TestGlobalProperties;
	}> {
		props = Props.define(this as any, {
			reflect: {
				x: {
					type: PROP_TYPE.NUMBER,
					value: 1
				}
			}
		});
	}
	return RootElement;
}
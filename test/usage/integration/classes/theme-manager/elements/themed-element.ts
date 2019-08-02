import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE } from "../../../../../../src/wclib.js";
import { render, html } from '../../../../../../node_modules/lit-html/lit-html.js';
import { TestTheme } from "../themeManagerspec";

export const usedThemes: {
	[key: string]: TestTheme;
} = {
	first: {
		color1: 'rgb(255, 0, 0)',
		color2: 'rgb(0, 255, 255)'
	},
	second: {
		color1: 'rgb(0, 255, 0)',
		color2: 'rgb(255, 0, 255)'
	},
	third: {
		color1: 'rgb(0, 0, 255)',
		color2: 'rgb(255, 255, 0)'
	}
};
export const defaultTheme = 'first';

@config({
	is: 'themed-element',
	html: new TemplateFn<ThemedElement>(() => {
		return html`
			<div class="text">test</div>
			<div class="text2">test2</div>
		`;
	}, CHANGE_TYPE.NEVER, render),
	css: new TemplateFn<ThemedElement>((_html, _prop, theme) => {
		return html`<style>
				.text {
					color: ${theme.color1};
				}

				.text2 {
					color: ${theme.color2};
				}
			</style>`
	}, CHANGE_TYPE.THEME, render)
})
export class ThemedElement extends ConfigurableWebComponent<{
	themes: typeof usedThemes;
}> {

}

@config({
	is: 'themed-element-parent',
	html: new TemplateFn<ThemedElementParent>(() => {
		return html`
			<themed-element></themed-element>
			<themed-element></themed-element>
			<themed-element></themed-element>
			<themed-element></themed-element>
			<themed-element></themed-element>
		`;
	}, CHANGE_TYPE.NEVER, render),
	css: null,
	dependencies: [
		ThemedElement
	]
})
export class ThemedElementParent extends ConfigurableWebComponent {

}
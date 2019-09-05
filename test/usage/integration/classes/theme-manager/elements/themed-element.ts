import { ConfigurableWebComponent, config, TemplateFn, CHANGE_TYPE } from "../../../../../../build/es/wc-lib.js";
import { render, html } from '../../../../../../node_modules/lit-html/lit-html.js';
import { TestTheme, ThemeGlobalProps } from "../themeManagerspec";

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

export declare class ThemedElement extends ConfigurableWebComponent<{
	themes: typeof usedThemes;
}> { }

export declare class ThemedElementParent extends ConfigurableWebComponent<{
	globalProps: ThemeGlobalProps;
}> { }

export const ThemedElementFactory = (base: any) => {
	@config({
		is: 'themed-element',
		html: new TemplateFn<_ThemedElement>(() => {
			return html`
				<div class="text">test</div>
				<div class="text2">test2</div>
			`;
		}, CHANGE_TYPE.NEVER, render),
		css: new TemplateFn<_ThemedElement>((_html, _prop, theme) => {
			return html`<style>
					.text {
						color: ${(theme as unknown as TestTheme).color1};
					}

					.text2 {
						color: ${(theme as unknown as TestTheme).color2};
					}
				</style>`
		}, CHANGE_TYPE.THEME, render)
	})
	class _ThemedElement extends base<{
		themes: typeof usedThemes;
	}> {

	}

	@config({
		is: 'themed-element-parent',
		html: new TemplateFn<_ThemedElementParent>(() => {
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
			_ThemedElement
		] as any
	})
	class _ThemedElementParent extends base<{
		globalProps: ThemeGlobalProps;
	}> {

	}

	return {
		ThemedElement: _ThemedElement as typeof ThemedElement,
		ThemedElementParent: _ThemedElementParent as typeof ThemedElementParent
	}
}
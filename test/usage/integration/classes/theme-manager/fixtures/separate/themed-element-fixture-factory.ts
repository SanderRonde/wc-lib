import { ThemedElement, usedThemes, defaultTheme } from "../../elements/themed-element.js";
import { WebComponent } from "../../../../../../../build/es/wc-lib.js";
import { TestElementFactory } from "../../../elements/test-element-factory.js";

export function themedElementSeparateFixtureFactory(base: any) {
	WebComponent.initTheme({
		theme: usedThemes
	});
	WebComponent.setDefaultTheme(defaultTheme);

	const { ThemedElementParent } = ThemedElement(base);
	TestElementFactory(base).define(true);
	ThemedElementParent.define(true);
}
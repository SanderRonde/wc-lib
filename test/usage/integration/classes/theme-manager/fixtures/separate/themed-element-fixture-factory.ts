import { ThemedElementFactory, usedThemes, defaultTheme } from "../../elements/themed-element.js";
import { TestElementFactory } from "../../../elements/test-element-factory.js";

export function themedElementSeparateFixtureFactory(base: any) {
	base.initTheme({
		theme: usedThemes
	});
	base.setDefaultTheme(defaultTheme);

	const { ThemedElementParent } = ThemedElementFactory(base);
	TestElementFactory(base).define(true);
	ThemedElementParent.define(true);
}
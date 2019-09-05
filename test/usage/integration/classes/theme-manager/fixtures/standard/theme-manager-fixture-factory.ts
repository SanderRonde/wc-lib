import { ThemedElement, usedThemes, defaultTheme } from "../../elements/themed-element.js";
import { TestElementFactory } from "../../../elements/test-element-factory.js";

export function themeManagerStandardFixtureFactory(base: any) {
	base.initTheme({
		theme: usedThemes,
		defaultTheme: defaultTheme
	});

	const { ThemedElementParent } = ThemedElement(base);

	TestElementFactory(base).define(true);
	ThemedElementParent.define(true);
}
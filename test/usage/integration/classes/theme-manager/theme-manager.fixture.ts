import { ThemedElementParent, usedThemes, defaultTheme } from "./elements/themed-element.js";
import { WebComponentThemeManger } from "../../../../../src/wclib.js";
import { TestElement } from "../elements/test-element.js";

WebComponentThemeManger.initTheme({
	theme: usedThemes,
	defaultTheme: defaultTheme
});

TestElement.define();
ThemedElementParent.define();
import { ThemedElementParent, usedThemes, defaultTheme } from "./elements/themed-element.js";
import { TestThemeManagerWindow } from "./theme-manager.spec.js";
import { WebComponentThemeManger } from "../../../../../src/wclib.js";
import { TestElement } from "../elements/test-element.js";

declare const window: TestThemeManagerWindow;
window.TestElement = TestElement;

WebComponentThemeManger.initTheme({
	theme: usedThemes,
	defaultTheme: defaultTheme
});

TestElement.define();
ThemedElementParent.define();
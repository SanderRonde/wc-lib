import { ThemedElementParent, usedThemes } from "../../elements/themed-element.js";
import { WebComponent, noTheme } from "../../../../../../../src/wclib.js";
import { TestElement } from "../../../elements/test-element.js";

export interface ThemeManagerWindow extends Window {
	noTheme: typeof noTheme;
}
declare const window: ThemeManagerWindow;

WebComponent.initTheme({
	theme: usedThemes,
	defaultTheme: 'nonexistent-theme'
});

TestElement.define();
ThemedElementParent.define();

window.noTheme = noTheme;
import { ThemedElementParent, usedThemes, defaultTheme } from "../../elements/themed-element.js";
import { WebComponent } from "../../../../../../../src/wclib.js";
import { TestElement } from "../../../elements/test-element.js";

WebComponent.initTheme({
	theme: usedThemes,
	defaultTheme: defaultTheme
});

TestElement.define();
ThemedElementParent.define();
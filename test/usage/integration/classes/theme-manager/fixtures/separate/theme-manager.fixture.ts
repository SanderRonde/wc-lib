import { ThemedElementParent, usedThemes, defaultTheme } from "../../elements/themed-element.js";
import { WebComponent } from "../../../../../../../build/es/wclib.js";
import { TestElement } from "../../../elements/test-element.js";

WebComponent.initTheme({
	theme: usedThemes
});
WebComponent.setDefaultTheme(defaultTheme);

TestElement.define();
ThemedElementParent.define();
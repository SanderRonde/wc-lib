import { ThemedElementParent, usedThemes, defaultTheme } from "../../elements/themed-element.js";
import { WebComponent } from "../../../../../../../build/es/wc-lib.js";
import { TestElement } from "../../../elements/test-element.js";

WebComponent.initTheme({
	theme: usedThemes
});
WebComponent.setDefaultTheme(defaultTheme);

TestElement.define(true);
ThemedElementParent.define(true);
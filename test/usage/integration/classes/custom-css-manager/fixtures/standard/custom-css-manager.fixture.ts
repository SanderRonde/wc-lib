import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../node_modules/lit-html/lit-html.js";
import { CustomCSSElement, WrongCustomCSSElement } from "../../elements/custom-css-element.js";
import { WebComponent } from "../../../../../../../build/es/wclib.js";
import { TestElement } from "../../../elements/test-element.js";

WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});
TestElement.define();
CustomCSSElement.define();
WrongCustomCSSElement.define();
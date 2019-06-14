import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../../node_modules/lit-html/lit-html.js";
import { WebComponentTemplateManager } from "../../../../../../../../src/wclib.js";
import { TestElement } from "../../../../../classes/elements/test-element.js";

WebComponentTemplateManager.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});
TestElement.define();
import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../../node_modules/lit-html/lit-html.js";
import { TestElement } from "../../../../../classes/elements/test-element.js";
import { WebComponent } from "../../../../../../../../build/es/wc-lib.js";

WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});
TestElement.define();
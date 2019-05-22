import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../node_modules/lit-html/lit-html.js";
import { WebComponentTemplateManager } from "../../../../../src/wclib.js";
import { ComplexElement } from "./elements/complex-element.js";
import { TestElement } from "../elements/test-element.js";

TestElement.define();
WebComponentTemplateManager.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});
(window as any).ComplexElement = ComplexElement;
ComplexElement.define();
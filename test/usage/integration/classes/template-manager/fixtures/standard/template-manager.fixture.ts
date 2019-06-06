import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../node_modules/lit-html/lit-html.js";
import { ComplexElement, WrongElementListen } from "../../elements/complex-element.js";
import { WebComponentTemplateManager } from "../../../../../../../src/wclib.js";
import { TestElement } from "../../../elements/test-element.js";

TestElement.define();
WebComponentTemplateManager.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});
(window as any).ComplexElement = ComplexElement;
ComplexElement.define();
WrongElementListen.define();
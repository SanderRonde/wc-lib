import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../node_modules/lit-html/lit-html.js";
import { ComplexElement, WrongElementListen } from "../../elements/complex-element.js";
import { WebComponent } from "../../../../../../../build/es/wc-lib.js";
import { TestElement } from "../../../elements/test-element.js";

TestElement.define();
WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});
(window as any).ComplexElement = ComplexElement;
ComplexElement.define();
WrongElementListen.define();
import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../node_modules/lit-html/lit-html.js";
import { complexElementFactory } from "../../elements/complex-element.js";
import { TestElementFactory } from "../../../elements/test-element-factory.js";

export function templateManagerDefaultFixtureFactory(base: any) {
	TestElementFactory(base).define(true);
	base.initComplexTemplateProvider({
		TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
		AttributeCommitter, NodePart, isDirective, noChange
	});
	const { ComplexElement, WrongElementListen } = complexElementFactory(base);
	(window as any).ComplexElement = ComplexElement;
	ComplexElement.define(true);
	WrongElementListen.define(true);
}
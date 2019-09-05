import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../node_modules/lit-html/lit-html.js";
import { PropsElementFixtureFactory } from '../../elements/props-element.js';

export function propsFixtureFactory(base: any, supportsTemplates: boolean) {
	if (supportsTemplates) {
		base.initComplexTemplateProvider({
			TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
			AttributeCommitter, NodePart, isDirective, noChange
		});
	}
	
	const { 
		PropsElement, EmptyProps, PrivProps, 
		ReflectProps, MergedProps, UnmergedProps, 
		InvalidDefineArg, OverriddenProp, NoReflectSelf 
	} = PropsElementFixtureFactory(base, supportsTemplates);
	PropsElement.define(true);
	EmptyProps.define(true);
	PrivProps.define(true);
	ReflectProps.define(true);
	MergedProps.define(true);
	UnmergedProps.define(true);
	InvalidDefineArg.define(true);
	OverriddenProp.define(true);
	NoReflectSelf.define(true);
}
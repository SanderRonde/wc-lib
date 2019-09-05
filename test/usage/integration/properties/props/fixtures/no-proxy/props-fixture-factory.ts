import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from "../../../../../../../node_modules/lit-html/lit-html.js";
import { PropsElementFixtureFactory } from '../../elements/props-element.js';

export function propsNoProxyFixtureFactory(base: any) {
	base.initComplexTemplateProvider({
		TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
		AttributeCommitter, NodePart, isDirective, noChange
	});
	
	const { 
		ReflectProps, WatchedComponent
	} = PropsElementFixtureFactory(base);
	ReflectProps.define(true);
	WatchedComponent.define(true);
}